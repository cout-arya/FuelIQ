import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem('fueliq_user'));
        if (userInfo) {
            setUser(userInfo);
            // Set default auth header
            axios.defaults.headers.common['Authorization'] = `Bearer ${userInfo.token}`;
        }
        setLoading(false);

        // Global 401 Interceptor
        const interceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response && error.response.status === 401) {
                    logout();
                }
                return Promise.reject(error);
            }
        );

        return () => axios.interceptors.response.eject(interceptor);
    }, []);

    const login = async (email, password) => {
        const { data } = await axios.post('/auth/login', { email, password });
        localStorage.setItem('fueliq_user', JSON.stringify(data));
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        setUser(data);
        return data;
    };

    const register = async (name, email, password) => {
        const { data } = await axios.post('/auth/register', { name, email, password });
        localStorage.setItem('fueliq_user', JSON.stringify(data));
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        setUser(data);
        return data;
    };

    const logout = () => {
        localStorage.removeItem('fueliq_user');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
    };

    const updateUser = (userData) => {
        const merged = { ...user, ...userData };
        localStorage.setItem('fueliq_user', JSON.stringify(merged));
        setUser(merged);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, updateUser, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
