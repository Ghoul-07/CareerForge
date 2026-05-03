import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function tryRefresh() {
      try {
        const response = await axios.post(
          "http://localhost:3000/api/auth/refresh-token",
          {}, // url, request body, headers or withCredential
          {
            withCredentials: true,
          },
        );
        setAccessToken(response.data.accessToken);

        const me = await axios.get("http://localhost:3000/api/auth/getme", {
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

  const login = (userData, token) => {
    setUser(userData);
    setAccessToken(token);
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
  };

  // dont render if user is not logged in
  if (loading) return null;

  return (
    <AuthContext.Provider value={{ user, accessToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
