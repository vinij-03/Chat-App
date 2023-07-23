import { createContext, useEffect, useState } from 'react'
import PropTypes from 'prop-types';
import axios from 'axios';

export const UserContext = createContext({});

export function UserContextProvider({ children }) {
    const [username, setUsername] = useState(null);
    const [id, setId] = useState(null);

    useEffect(() => {
        axios.get("/profile", {credentials: true}).then(response =>{
            setId(response.data.id);
            setUsername(response.data.username);
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
