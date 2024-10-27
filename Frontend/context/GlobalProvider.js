import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { Redirect, router } from "expo-router";
import { setAuthHeaders, resetSecureStore } from "../utils/expo-store";

const GlobalContext = createContext();

export const useGlobalContext = () => useContext(GlobalContext);

const GlobalProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false); // New state to track initial auth check

  useEffect(() => {
    // Set up an interceptor to handle token expiration
    const interceptor = axios.interceptors.response.use(
      response => response,
      async (error) => {
        if ((error.response && error.response.status === 401) || error.response.status === 500) {
          await resetSecureStore(axios);
          setIsAuthenticated(false);
          if (router.currentPath !== '/')
            router.replace('/'); // Redirects to login on unauthorized access
        }
        return Promise.reject(error);
      }
    );

    const checkUser = async () => {
      setIsLoading(true);
      try {
        await setAuthHeaders(axios);
        const response = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_URL}/gofast/api/user`, { withCredentials: true });

        if (response.status === 200) {
          setUser(response.data);
          setIsAuthenticated(true);
          if (router.currentPath !== '/find-ride') { // Only redirect if not already on `/find-ride`
            router.replace('/find-ride');
          }
        } else {
          throw new Error("Unauthorized");
        }
      } catch (error) {
        console.log(error);
        setIsAuthenticated(false);
        if (router.currentPath !== '/') { // Only redirect if not already on `/`
          router.replace('/');
        }
      } finally {
        setIsLoading(false);
        setHasCheckedAuth(true); // Set auth check as complete
      }
    };

    if (!hasCheckedAuth) { // Check user only once during initial load
      checkUser();
    }

    // Cleanup the interceptor on component unmount
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [hasCheckedAuth]);

  return (
    <GlobalContext.Provider value={{ user, setUser, isAuthenticated, setIsAuthenticated, isLoading }}>
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;
