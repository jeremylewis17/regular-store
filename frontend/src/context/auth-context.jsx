import { createContext, useContext, useState, useEffect } from "react";
import { 
    fetchUser as apiFetchUser,
    updateUser as apiUpdateUser,
    loginUser as apiLoginUser,
    registerUser as apiRegisterUser,
    logoutUser as apiLogoutUser
} from "../apis/user";


export const AuthContext = createContext(null);


export const AuthContextProvider = (props) => {
    const [currentUser, setCurrentUser] = useState();
    const [loading, setLoading] = useState(true);



    async function getUser(user_id) {
        try {
            const user = await apiFetchUser(user_id);
            
        } catch (error) {
            console.error("Error fetching current user: ", error);
        }
    }

    async function registerUser(username, password) {
        try{
            await apiRegisterUser(username, password);
        } catch (error) {
            console.error("Error registering user: ", error);
        }
    };

    async function loginUser(username, password) {
        try{
            const user = await apiLoginUser(username, password);
            setCurrentUser(user);
        } catch (error) {
            console.error("Error logging in: ", error);
        }
    };

    async function logoutUser() {
        try{
            await apiLogoutUser();
            setCurrentUser(null);
        } catch (error) {
            console.error("Error logging out: ", error);
        }
    };

    const contextValue = {
        currentUser,
        registerUser,
        loginUser,
        logoutUser
      };

    return (
        <AuthContext.Provider value={contextValue}>
          {props.children}
        </AuthContext.Provider>
      );
};