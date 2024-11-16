import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "expo-router";
import { setAuthHeaders, resetSecureStore } from "../utils/expo-store";

const GlobalContext = createContext();

export const useGlobalContext = () => useContext(GlobalContext);

const GlobalProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  const router = useRouter();

  // Axios response interceptor for error handling
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response && [401, 500].includes(error.response.status)) {
          await resetSecureStore(axios); // Clear secure storage
          setIsAuthenticated(false);
          if (router.pathname !== '/') {
            router.replace('/'); // Redirect to login on unauthorized access
          }
        }
        return Promise.reject(error);
      }
    );

    // Cleanup the interceptor on unmount
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [router]);

  // Check user authentication
  useEffect(() => {
    const checkUser = async () => {
      setIsLoading(true);
      try {
        await setAuthHeaders(axios); // Set authentication headers
        const response = await axios.get(
          `${process.env.EXPO_PUBLIC_BACKEND_URL}/gofast/api/user`,
          { withCredentials: true }
        );

        if (response.status === 200) {
          console.log("User authenticated:", response.data);
          setUser(response.data.data);
          setIsAuthenticated(true);

          if (router.pathname !== '/find-ride') {
            if (response.data.data.admin) {

              router.replace('/dashboard'); // Redirect to dashboard
            }
            else
              router.replace('/find-ride'); // Redirect to dashboard
          }
        }
      } catch (error) {
        console.error("Authentication error:", error);
        setIsAuthenticated(false);
        if (router.pathname !== '/') {
          router.replace('/'); // Redirect to login
        }
      } finally {
        setIsLoading(false);
        setHasCheckedAuth(true); // Mark authentication check complete
      }
    };

    if (!hasCheckedAuth) {
      checkUser();
    }
  }, [hasCheckedAuth, router]);

  return (
    <GlobalContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated,
        setIsAuthenticated,
        isLoading,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;
