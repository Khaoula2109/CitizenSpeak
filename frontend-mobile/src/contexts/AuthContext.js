import React, { createContext, useState, useEffect } from 'react';
import AuthService from '../services/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            setIsLoading(true);

            const isAuth = await AuthService.isAuthenticated();

            if (isAuth) {
                const userData = await AuthService.getCurrentUser();
                setUser(userData);
                setIsAuthenticated(true);
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            setIsLoading(true);
            const result = await AuthService.login(email, password);
            setUser(result.user);
            setIsAuthenticated(true);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (name, email, phone, password, address) => {
        try {
            setIsLoading(true);
            await AuthService.register(name, email, phone, password, address);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            setIsLoading(true);
            await AuthService.logout();
            setUser(null);
            setIsAuthenticated(false);
            return { success: true };
        } catch (error) {
            console.error('Logout error:', error);
            return { success: false, error: error.message };
        } finally {
            setIsLoading(false);
        }
    };

    const updateUser = (userData) => {
        setUser(prevUser => ({ ...prevUser, ...userData }));
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated,
                login,
                register,
                logout,
                updateUser,
                refreshUserData: loadUserData
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};