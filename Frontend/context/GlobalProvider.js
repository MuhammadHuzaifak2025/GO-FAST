import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { Redirect, router } from "expo-router";
import { navigator } from "expo";
import { setAuthHeaders } from "../utils/expo-store";
const GlobalContext = createContext();

export const useGlobalContext = () => useContext(GlobalContext);

const GlobalProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {

    const checkUser = async () => {
      setIsLoading(true);
      try{
        await setAuthHeaders(axios)
        const response = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_URL}/gofast/api/user`, {withCredentials: true} );

        if(response.status === 200){
          setUser(response.data);
          setIsAuthenticated(true);
          router.replace('/find-ride');
        }
        else {
          throw new Error(response);
        }
      }
      catch (error){
        console.log(error);
        setIsAuthenticated(false);
        router.replace('/');
      }
      setIsLoading(false);
    }

    checkUser();

    }, [router]);

  return (
    <GlobalContext.Provider value={{ user, setUser, isAuthenticated,setIsAuthenticated,isLoading }}>
      {children}
    </GlobalContext.Provider>
  );
}

export default GlobalProvider;