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
    const [currentUser, setCurrentUser] = useState(null);
    const [loginRegistrationError, setLoginRegistrationError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem('jwtToken');
        if (storedToken) {
            // Token exists, set currentUser or perform token validation here
        }
        setLoading(false);
    }, [currentUser]);

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
        try {
            const response = await apiLoginUser(username, password);
            if (response.status === 200) {
                const jwtToken = response.data.accessToken;
                localStorage.setItem('jwtToken', jwtToken);
                setCurrentUser({user_id: response.data.user_id, username: response.data.username});
            } else {
                setLoginRegistrationError('Unsuccessful Login');
            };
        } catch (error) {
            console.error("Error logging in: ", error);
        }
    };

    async function logoutUser() {
        try {
            await apiLogoutUser();
            localStorage.removeItem('jwtToken'); // Remove the JWT token
            setCurrentUser(null); // Clear the user state
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