const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const nock = require('nock');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  
  await mongoose.connect(mongoUri);
});

beforeEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => {
    return {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue('OK'),
      setex: jest.fn().mockResolvedValue('OK'),
      del: jest.fn().mockResolvedValue(1),
      quit: jest.fn().mockResolvedValue('OK'),
    };
  });
}, { virtual: true });

beforeEach(() => {
  // Catch both generateContent and embedContent dynamically
  nock('https://generativelanguage.googleapis.com')
    .persist()
    .post(/models\/.*:generateContent/)
    .reply(200, {
      candidates: [{
        content: {
          parts: [{
            text: JSON.stringify({
              foodName: "Mocked Food",
              calories: 300,
              protein: 15,
              carbs: 40,
              fats: 10,
              meals: [
                { mealType: "breakfast", foodName: "Meal 1", calories: 400, protein: 20, carbs: 50, fats: 10 },
                { mealType: "lunch", foodName: "Meal 2", calories: 600, protein: 40, carbs: 60, fats: 15 }
              ]
            })
          }]
        }
      }]
    })
    .post(/models\/.*:embedContent/)
    .reply(200, {
      embedding: { values: Array(1536).fill(0.1) }
    });
});

afterEach(() => {
  nock.cleanAll();
  jest.clearAllMocks();
});
