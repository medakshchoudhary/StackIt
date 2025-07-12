import React, { useReducer, useEffect } from 'react';
import { AuthContext } from './AuthContextProvider';
import { getToken, getUser, setToken, setUser, removeToken, removeUser } from '../utils/helpers';

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: true
  });

  useEffect(() => {
    const token = getToken();
    const user = getUser();
    
    if (token && user) {
      dispatch({
        type: 'LOGIN',
        payload: { user, token }
      });
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const login = (userData, token) => {
    setToken(token);
    setUser(userData);
    dispatch({
      type: 'LOGIN',
      payload: { user: userData, token }
    });
  };

  const logout = () => {
    removeToken();
    removeUser();
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};
