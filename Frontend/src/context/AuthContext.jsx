import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import api from "../api/api.js";

const AuthContext = createContext(null);
const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = async () => {
    try {
      await axios.post(
        `${BASE_URL}/auth/logout`,
        {},
        {
          withCredentials: true,
        },
      );
    } catch (err) {
      console.log("Logout error ", err);
    } finally {
      setUser(null);
      setAccessToken(null);
      delete api.defaults.headers.common.Authorization;
    }
  };

  useEffect(() => {
    async function tryRefresh() {
      try {
        const response = await axios.post(
          `${BASE_URL}/auth/refresh-token`,
          {}, // url, request body, headers or withCredential
          {
            withCredentials: true,
          },
        );
        const newToken = response.data.accessToken;
        setAccessToken(newToken);
        api.defaults.headers.common.Authorization = `Bearer ${newToken}`;

        const me = await axios.get(`${BASE_URL}/auth/getme`, {
          withCredentials: true,
          headers: { Authorization: `Bearer ${response.data.accessToken}` },
        });
        setUser(me.data.user);
      } catch {
        setUser(null);
        setAccessToken(null);
      } finally {
        setLoading(false);
      }
    }

    tryRefresh();
  }, []);

  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use((config) => {
      if (!config.headers.Authorization && accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }

      return config;
    });

    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshResponse = await axios.post(
              `${BASE_URL}/auth/refresh-token`,
              {},
              { withCredentials: true },
            );

            const newToken = refreshResponse.data.accessToken;

            setAccessToken(newToken);

            api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
            {
              /* setAccessToken is async so it takes time to update, so this helps prevent race condition*/
            }

            originalRequest.headers.Authorization = `Bearer ${newToken}`;

            return await api(originalRequest);
          } catch (refreshErr) {
            await logout();
            return Promise.reject(refreshErr);
          }
        }

        return Promise.reject(error);
      },
    );

    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [accessToken]);

  const login = (userData, token) => {
    setUser(userData);
    setAccessToken(token);
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  };

  // dont render if user is not logged in
  if (loading) return null;

  return (
    <AuthContext.Provider value={{ user, accessToken, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
