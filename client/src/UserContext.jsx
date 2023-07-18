import { createContext, useEffect, useState } from 'react'
import PropTypes from 'prop-types';
import axios from 'axios';

export const UserContext = createContext({});

export function UserContextProvider({ children }) {
    const [username, setUsername] = useState("");
    const [id, setId] = useState("");

    useEffect(() => {
        axios.get("/profile", {credentials: true}).then(response=>{
            console.log(response.data); 
        })
    })

    return (
        <UserContext.Provider value={{ username, setUsername, id, setId }}>
            {children}
        </UserContext.Provider>
    );
}

UserContextProvider.propTypes = {
    children: PropTypes.node.isRequired,
};
