import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { Redirect } from "expo-router";
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
        const response = await axios.get(`${process.env.ip}/gofast/api/user`, {withCredentials: true} );

        if(response.status === 200){
          setUser(response.data);
          setIsAuthenticated(true);
        }
        else {
          throw new Error(response);
        }
      }
      catch (error){
        console.log(error);
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    }

    checkUser();

    }, []);

  return (
    <GlobalContext.Provider value={{ user, setUser, isAuthenticated,setIsAuthenticated,isLoading }}>
      {children}
    </GlobalContext.Provider>
  );
}

export default GlobalProvider;