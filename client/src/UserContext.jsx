import { createContext, useEffect, useState } from 'react'
import PropTypes from 'prop-types';
import axios from 'axios';

export const UserContext = createContext({});

export function UserContextProvider({ children }) {
    const [username, setUsername] = useState(null);
    const [id, setId] = useState(null);

    useEffect(() => {
        axios.get('/profile').then(response => {
            setId(response.data.userId);
            setUsername(response.data.username);
            // console.log(response.data)
            
        });
    }, []);
    // console.log(id)
    // console.log(username)
    // console.log(response.data)
    return (
        <UserContext.Provider value={{ username, setUsername, id, setId }}>
            {children}
        </UserContext.Provider>
    );
}

UserContextProvider.propTypes = {
    children: PropTypes.node.isRequired,
};
