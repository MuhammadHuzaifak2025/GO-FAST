import { createContext, useContext, useEffect, useState } from "react";


// Create the AuthContext
export const AuthContext = createContext({
    isAuthenticated: false,
    setisAuthenticated: () => { },
    loading: true,
    setLoading: () => { },
    authenticate: async () => { },
    user : {},
    setUser: () => { }
});

export const AuthProvider = AuthContext.Provider;


export default function useAuth() {
    return useContext(AuthContext);
}
