const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const MealLog = require('../models/MealLog');
const MealPlan = require('../models/MealPlan');
const vectorStore = require('../utils/vectorStore');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ─── AI Infrastructure ─────────────────────────────────────────────

function getGenAI() {
    const key = process.env.GEMINI_API_KEY || process.env.gemini_key;
    if (!key) throw new Error('GEMINI_API_KEY not configured');
    return new GoogleGenerativeAI(key);
}

const attemptGeneration = async (modelName, messages, retries = 1) => {
    try {
        const genAI = getGenAI();
        const model = genAI.getGenerativeModel({
            model: modelName,
            systemInstruction: messages.find(m => m.role === 'system')?.content || '',
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 16384,
                thinkingConfig: { thinkingBudget: 1024 }
            }
        });

        const userPrompt = messages.find(m => m.role === 'user')?.content || '';
        const result = await model.generateContent(userPrompt);
        const text = result.response.text();
        if (!text) throw new Error('Empty response');
        return text;
    } catch (error) {
        if (retries > 0 && !error.message?.includes('429') && !error.message?.includes('quota')) {
            await sleep(2000);
            return attemptGeneration(modelName, messages, retries - 1);
        }
        throw error;
    }
};

const attemptOpenRouter = async (modelName, messages) => {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error('OPENROUTER_API_KEY not configured');

    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
        model: modelName,
        messages
    }, {
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': 'http://localhost:5001',
            'X-Title': 'FuelIQ'
        }
    });

    const text = response.data?.choices?.[0]?.message?.content;
    if (!text) throw new Error('Empty response from OpenRouter');
    return text;
};

const tryModels = async (models, messages) => {
    for (let i = 0; i < models.length; i++) {
        try {
            if (models[i].startsWith('openrouter:')) {
                return await attemptOpenRouter(models[i].split('openrouter:')[1], messages);
            } else {
                return await attemptGeneration(models[i], messages, 1);
            }
        } catch (e) {
            console.warn(`[AI] ${models[i]} failed${i < models.length - 1 ? ', trying next...' : ''}`);
        }
    }
    return null;
};

const FAST_MODELS = ['gemini-2.5-flash', 'openrouter:meta-llama/llama-3.3-70b-instruct'];
const LITE_MODELS = ['gemini-2.5-flash', 'openrouter:google/gemini-flash-1.5-8b'];

const extractJSON = (content) => {
    if (!content) return null;
    try { return JSON.parse(content); } catch (e) { /* continue */ }

    const clean = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    const first = clean.indexOf('{');
    const last = clean.lastIndexOf('}');

    if (first !== -1 && last !== -1) {
        // Also try array
        const firstArr = clean.indexOf('[');
        const lastArr = clean.lastIndexOf(']');

        // If array comes before object, try array first
        if (firstArr !== -1 && firstArr < first) {
            try { return JSON.parse(clean.substring(firstArr, lastArr + 1)); } catch (e) { /* continue */ }
        }

        try { return JSON.parse(clean.substring(first, last + 1)); } catch (e) { /* continue */ }
    }

    // Try array standalone
    const firstArr = clean.indexOf('[');
    const lastArr = clean.lastIndexOf(']');
    if (firstArr !== -1 && lastArr !== -1) {
        try { return JSON.parse(clean.substring(firstArr, lastArr + 1)); } catch (e) { /* continue */ }
    }

    return null;
};

// ─── Hinglish Food Parser ───────────────────────────────────────────

// @desc    Parse natural language food input & log meal
// @route   POST /api/nutrition/log
// @access  Private
const logMeal = asyncHandler(async (req, res) => {
    const { text, mealType } = req.body;
    if (!text) {
        res.status(400);
        throw new Error('Food description is required');
    }

    const user = await User.findById(req.user._id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Step 1: Parse Hinglish input with LLM
    const parsePrompt = `You are an Indian food NLP parser. Parse this food input into structured data.
Handle Hinglish (Hindi-English mix), common misspellings, and Indian food names.

RULES:
- Identify each distinct food item
- Extract quantity (default to 1 serving if not specified)
- Detect portion context: "ghar ka" = home, "restaurant" = restaurant, "dhaba" = dhaba, "dabba" = dabba/tiffin
- Handle transliteration variants: dal/daal/dhal, roti/chapati/chapatti, etc.
- If quantity is vague ("thoda", "half bowl"), estimate in grams

Return ONLY valid JSON array:
[
  {
    "foodName": "standardized food name in English",
    "originalText": "what user typed for this item",
    "quantity": "human readable quantity",
    "quantityGrams": estimated_weight_in_grams,
    "portionTier": "home|restaurant|dhaba|street|dabba|generic"
  }
]`;

    const parseMessages = [
        { role: 'system', content: parsePrompt },
        { role: 'user', content: `Parse this: "${text}"` }
    ];

    const parseResult = await tryModels(LITE_MODELS, parseMessages);
    let parsedItems = extractJSON(parseResult);

    if (!parsedItems || !Array.isArray(parsedItems)) {
        // Fallback: treat entire input as single item
        parsedItems = [{
            foodName: text,
            originalText: text,
            quantity: '1 serving',
            quantityGrams: 200,
            portionTier: 'generic'
        }];
    }

    // Step 2: RAG lookup for each food item
    const enrichedItems = [];
    let needsClarification = false;
    let clarificationQuestion = null;

    for (const item of parsedItems) {
        let ragResult = null;
        let confidenceScore = 0;

        try {
            const results = await vectorStore.retrieveContext(item.foodName, 3);
            if (results.length > 0) {
                ragResult = results[0];
                confidenceScore = ragResult.score || 0;
            }
        } catch (err) {
            console.warn('[RAG] Lookup failed for:', item.foodName, err.message);
        }

        // If confidence < 0.70, we should ask a clarifying question
        if (ragResult && confidenceScore < 0.70 && confidenceScore > 0.40) {
            needsClarification = true;
            clarificationQuestion = `I found "${ragResult.text?.split('\n')[0] || item.foodName}" — was this a home-cooked or restaurant portion?`;
        }

        enrichedItems.push({
            foodName: item.foodName,
            quantity: item.quantity,
            quantityGrams: item.quantityGrams,
            portionTier: item.portionTier,
            ragSourceId: ragResult?.id || null,
            confidenceScore: confidenceScore
        });
    }

    // Step 3: Get accurate macros using RAG context + LLM
    const ragContextParts = [];
    for (const item of enrichedItems) {
        if (item.ragSourceId) {
            try {
                const docs = await vectorStore.retrieveContext(item.foodName, 1);
                if (docs.length > 0) ragContextParts.push(docs[0].text);
            } catch (e) { /* continue without RAG */ }
        }
    }

    const macroPrompt = `You are an Indian nutrition expert. Calculate accurate macros for these food items.
${ragContextParts.length > 0 ? `\nUSE THIS VERIFIED NUTRITIONAL DATA:\n${ragContextParts.join('\n---\n')}\n` : ''}
IMPORTANT: Use ICMR/NIN Indian nutritional guidelines. Account for Indian cooking methods (oil, ghee, tempering).

For each item, return calories, protein, carbs, fats, and fibre in grams.
Return ONLY valid JSON array:
[
  { "foodName": "name", "calories": 0, "protein": 0, "carbs": 0, "fats": 0, "fibre": 0 }
]`;

    const macroMessages = [
        { role: 'system', content: macroPrompt },
        { role: 'user', content: `Calculate macros for: ${enrichedItems.map(i => `${i.quantity} ${i.foodName} (${i.portionTier} portion, ~${i.quantityGrams}g)`).join(', ')}` }
    ];

    const macroResult = await tryModels(FAST_MODELS, macroMessages);
    const macroData = extractJSON(macroResult);

    // Merge macro data into enriched items
    const finalItems = enrichedItems.map((item, idx) => {
        const macros = Array.isArray(macroData) && macroData[idx] ? macroData[idx] : {};
        return {
            foodName: item.foodName,
            quantity: item.quantity,
            quantityGrams: item.quantityGrams,
            portionTier: item.portionTier,
            calories: macros.calories || 0,
            protein: macros.protein || 0,
            carbs: macros.carbs || 0,
            fats: macros.fats || 0,
            fibre: macros.fibre || 0,
            ragSourceId: item.ragSourceId,
            confidenceScore: item.confidenceScore
        };
    });

    // Step 4: Save to database
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const mealLog = await MealLog.create({
        userId: req.user._id,
        date: today,
        mealType: mealType || inferMealType(),
        rawInput: text,
        parsedItems: finalItems
    });

    // Update streak
    await updateStreak(req.user._id);

    res.status(201).json({
        mealLog,
        needsClarification,
        clarificationQuestion
    });
});

// Helper: infer meal type from current time
function inferMealType() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) return 'breakfast';
    if (hour >= 11 && hour < 15) return 'lunch';
    if (hour >= 15 && hour < 18) return 'snack';
    return 'dinner';
}

// Helper: update user's streak
async function updateStreak(userId) {
    const user = await User.findById(userId);
    if (!user) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastLog = user.streak?.lastLogDate;
    if (lastLog) {
        const lastDate = new Date(lastLog);
        lastDate.setHours(0, 0, 0, 0);

        const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            // Already logged today, no streak change
            return;
        } else if (diffDays === 1) {
            // Consecutive day — increment
            user.streak.count += 1;
        } else {
            // Streak broken — reset to 1
            user.streak.count = 1;
        }
    } else {
        user.streak.count = 1;
    }

    user.streak.lastLogDate = today;
    await user.save();
}

// @desc    Get meal logs for a date
// @route   GET /api/nutrition/logs?date=YYYY-MM-DD
// @access  Private
const getMealLogs = asyncHandler(async (req, res) => {
    const dateStr = req.query.date;
    const date = dateStr ? new Date(dateStr) : new Date();
    date.setHours(0, 0, 0, 0);

    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    const logs = await MealLog.find({
        userId: req.user._id,
        date: { $gte: date, $lt: nextDay }
    }).sort({ createdAt: -1 });

    // Calculate daily totals
    const dailyTotals = {
        calories: logs.reduce((sum, log) => sum + log.totalCalories, 0),
        protein: logs.reduce((sum, log) => sum + log.totalProtein, 0),
        carbs: logs.reduce((sum, log) => sum + log.totalCarbs, 0),
        fats: logs.reduce((sum, log) => sum + log.totalFats, 0),
        fibre: logs.reduce((sum, log) => sum + log.totalFibre, 0)
    };

    // Get user's targets for comparison
    const user = await User.findById(req.user._id);
    const targets = user?.getMacroTargets(true) || null;

    res.json({
        date: date.toISOString().split('T')[0],
        logs,
        dailyTotals,
        targets
    });
});

// @desc    Get weekly macro summary
// @route   GET /api/nutrition/logs/weekly
// @access  Private
const getWeeklyLogs = asyncHandler(async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const logs = await MealLog.find({
        userId: req.user._id,
        date: { $gte: weekAgo, $lte: today }
    });

    // Group by day
    const dailyMap = {};
    for (let i = 0; i < 7; i++) {
        const d = new Date(weekAgo);
        d.setDate(d.getDate() + i);
        const key = d.toISOString().split('T')[0];
        dailyMap[key] = { date: key, calories: 0, protein: 0, carbs: 0, fats: 0, mealCount: 0 };
    }

    logs.forEach(log => {
        const key = new Date(log.date).toISOString().split('T')[0];
        if (dailyMap[key]) {
            dailyMap[key].calories += log.totalCalories;
            dailyMap[key].protein += log.totalProtein;
            dailyMap[key].carbs += log.totalCarbs;
            dailyMap[key].fats += log.totalFats;
            dailyMap[key].mealCount += 1;
        }
    });

    const user = await User.findById(req.user._id);
    const targets = user?.getMacroTargets(true) || null;

    res.json({
        weekly: Object.values(dailyMap),
        targets
    });
});

// @desc    Delete a meal log
// @route   DELETE /api/nutrition/logs/:id
// @access  Private
const deleteMealLog = asyncHandler(async (req, res) => {
    const log = await MealLog.findOne({ _id: req.params.id, userId: req.user._id });
    if (!log) {
        res.status(404);
        throw new Error('Meal log not found');
    }

    await MealLog.findByIdAndDelete(req.params.id);
    res.json({ message: 'Meal log deleted' });
});

// ─── Meal Plan Engine ────────────────────────────────────────────────

// @desc    Generate today's AI meal plan
// @route   POST /api/mealplan/generate
// @access  Private
const generateMealPlan = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    const profile = user.profile || {};
    const macroTargets = user.getMacroTargets(req.body.isTrainingDay !== false);

    if (!macroTargets) {
        res.status(400);
        throw new Error('Please complete your profile first to get accurate meal plans');
    }

    // Check last 3 days for anti-repetition
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const recentPlans = await MealPlan.find({
        userId: req.user._id,
        date: { $gte: threeDaysAgo }
    });

    const recentFoods = recentPlans.flatMap(p => p.meals.map(m => m.foodName)).join(', ');

    // RAG: find candidate meals matching preferences
    let ragContext = '';
    try {
        const cuisine = profile.regionalCuisine || 'no_preference';
        const diet = profile.dietaryProfile || 'non_vegetarian';
        const query = `${cuisine} ${diet} meals high protein Indian food`;
        const docs = await vectorStore.retrieveContext(query, 5);
        if (docs.length > 0) {
            ragContext = vectorStore.formatContextForPrompt(docs);
        }
    } catch (e) {
        console.warn('[RAG] Context retrieval failed:', e.message);
    }

    const cuisineMap = {
        north_indian: 'North Indian (Punjabi, Delhi-style)',
        south_indian: 'South Indian (Tamil, Kerala, Karnataka)',
        bengali: 'Bengali',
        gujarati: 'Gujarati',
        no_preference: 'Pan-Indian'
    };

    const budgetMap = {
        '150': 'Rs 150/day (very budget — dal, rice, eggs, seasonal vegetables)',
        '300': 'Rs 300/day (moderate — paneer, chicken, variety)',
        '500': 'Rs 500/day (comfortable — variety proteins, fruits)',
        'no_constraint': 'No budget constraint'
    };

    const systemPrompt = `You are FuelIQ's AI meal plan engine — India's most accurate nutrition planner.
${ragContext ? `\nVERIFIED NUTRITIONAL REFERENCE DATA:\n${ragContext}\n` : ''}
Create a 4-meal daily plan (breakfast, lunch, snack, dinner).

CONSTRAINTS:
- Total calories: ~${macroTargets.calories} kcal
- Total protein: ~${macroTargets.protein}g
- Cuisine: ${cuisineMap[profile.regionalCuisine] || 'Pan-Indian'}
- Diet: ${profile.dietaryProfile || 'non_vegetarian'}
- Budget: ${budgetMap[profile.budgetTier] || 'moderate'}
- Training: ${req.body.isTrainingDay !== false ? 'Training day (higher carbs)' : 'Rest day (lower carbs)'}
${recentFoods ? `- AVOID repeating: ${recentFoods}` : ''}

RULES:
- Use real Indian foods people actually eat, not obscure health foods
- Include practical cooking suggestions
- Each meal must have realistic macro counts
- Distribute protein across all 4 meals (minimum 15g per meal)

Return ONLY valid JSON:
{
  "meals": [
    { "mealType": "breakfast", "foodName": "name", "description": "detailed suggestion with quantities", "calories": 0, "protein": 0, "carbs": 0, "fats": 0 },
    { "mealType": "lunch", "foodName": "name", "description": "...", "calories": 0, "protein": 0, "carbs": 0, "fats": 0 },
    { "mealType": "snack", "foodName": "name", "description": "...", "calories": 0, "protein": 0, "carbs": 0, "fats": 0 },
    { "mealType": "dinner", "foodName": "name", "description": "...", "calories": 0, "protein": 0, "carbs": 0, "fats": 0 }
  ]
}`;

    const userPrompt = `Generate a ${req.body.isTrainingDay !== false ? 'training day' : 'rest day'} meal plan for:
${profile.age || 25}yo ${profile.gender || 'Male'}, ${profile.height || 170}cm, ${profile.weight || 70}kg
Goal: ${profile.goal || 'maintenance'}
Target: ${macroTargets.calories} kcal, ${macroTargets.protein}g protein`;

    const content = await tryModels(FAST_MODELS, [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
    ]);

    let planData = extractJSON(content);

    if (!planData || !planData.meals || planData.meals.length === 0) {
        // Fallback plan
        planData = {
            meals: [
                { mealType: 'breakfast', foodName: 'Moong Dal Chilla with Curd', description: '2 moong dal chilla (30g protein powder optional) with 100g curd and green chutney', calories: Math.round(macroTargets.calories * 0.25), protein: Math.round(macroTargets.protein * 0.25), carbs: 35, fats: 12 },
                { mealType: 'lunch', foodName: 'Chicken/Paneer Curry with Rice', description: '150g chicken breast or 100g paneer with 1 cup rice, dal, and salad', calories: Math.round(macroTargets.calories * 0.35), protein: Math.round(macroTargets.protein * 0.35), carbs: 55, fats: 18 },
                { mealType: 'snack', foodName: 'Protein Shake & Fruits', description: '1 scoop whey protein with banana and 10 almonds', calories: Math.round(macroTargets.calories * 0.15), protein: Math.round(macroTargets.protein * 0.20), carbs: 25, fats: 8 },
                { mealType: 'dinner', foodName: 'Egg Bhurji with Roti', description: '3 egg bhurji with 2 multigrain rotis and green vegetables', calories: Math.round(macroTargets.calories * 0.25), protein: Math.round(macroTargets.protein * 0.20), carbs: 40, fats: 15 }
            ]
        };
    }

    // Save to DB
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Upsert — replace any existing plan for today
    const mealPlan = await MealPlan.findOneAndUpdate(
        { userId: req.user._id, date: today },
        {
            userId: req.user._id,
            date: today,
            targetCalories: macroTargets.calories,
            targetProtein: macroTargets.protein,
            targetCarbs: macroTargets.carbs,
            targetFats: macroTargets.fats,
            meals: planData.meals,
            isTrainingDay: req.body.isTrainingDay !== false,
            regionalCuisine: profile.regionalCuisine,
            budgetTier: profile.budgetTier,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
        },
        { upsert: true, new: true }
    );

    res.json(mealPlan);
});

// @desc    Get today's cached meal plan
// @route   GET /api/mealplan/today
// @access  Private
const getTodayPlan = asyncHandler(async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const plan = await MealPlan.findOne({
        userId: req.user._id,
        date: { $gte: today, $lt: tomorrow }
    });

    if (!plan) {
        return res.json({ plan: null, message: 'No plan generated for today yet' });
    }

    res.json({ plan });
});

// @desc    Regenerate a single meal in the plan
// @route   POST /api/mealplan/regenerate-meal
// @access  Private
const regenerateMeal = asyncHandler(async (req, res) => {
    const { mealIndex } = req.body;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const plan = await MealPlan.findOne({
        userId: req.user._id,
        date: { $gte: today, $lt: tomorrow }
    });

    if (!plan || !plan.meals || mealIndex === undefined || !plan.meals[mealIndex]) {
        res.status(400);
        throw new Error('No plan found or invalid meal index');
    }

    const currentMeal = plan.meals[mealIndex];
    const user = await User.findById(req.user._id);
    const profile = user?.profile || {};

    // PRD constraint: ±50 kcal, ±5g protein of replaced meal
    const targetCal = currentMeal.calories;
    const targetProtein = currentMeal.protein;

    const systemPrompt = `Regenerate a single ${currentMeal.mealType} meal for an Indian nutrition plan.

CONSTRAINTS:
- Must be DIFFERENT from: ${currentMeal.foodName}
- Calories: ${targetCal - 50} to ${targetCal + 50} kcal
- Protein: ${targetProtein - 5} to ${targetProtein + 5}g
- Diet: ${profile.dietaryProfile || 'non_vegetarian'}
- Cuisine: ${profile.regionalCuisine || 'no_preference'}
- Budget: ${profile.budgetTier || '300'}

Return ONLY valid JSON:
{ "mealType": "${currentMeal.mealType}", "foodName": "name", "description": "detailed suggestion", "calories": 0, "protein": 0, "carbs": 0, "fats": 0 }`;

    const content = await tryModels(FAST_MODELS, [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Generate a new ${currentMeal.mealType} different from ${currentMeal.foodName}` }
    ]);

    let newMeal = extractJSON(content);

    if (!newMeal) {
        newMeal = {
            mealType: currentMeal.mealType,
            foodName: currentMeal.mealType === 'breakfast' ? 'Poha with Peanuts & Veggies' :
                currentMeal.mealType === 'lunch' ? 'Rajma Chawal with Raita' :
                    currentMeal.mealType === 'snack' ? 'Roasted Makhana & Green Tea' :
                        'Palak Paneer with Roti',
            description: 'Healthy alternative (AI generation was incomplete — try again)',
            calories: targetCal,
            protein: targetProtein,
            carbs: currentMeal.carbs || 30,
            fats: currentMeal.fats || 10
        };
    }

    newMeal.regenerateCount = (currentMeal.regenerateCount || 0) + 1;

    // Update the specific meal in the plan
    plan.meals[mealIndex] = newMeal;
    plan.markModified('meals');
    await plan.save();

    res.json({ meal: newMeal, plan });
});

module.exports = {
    logMeal, getMealLogs, getWeeklyLogs, deleteMealLog,
    generateMealPlan, getTodayPlan, regenerateMeal
};
