
// import React from 'react'
import RegisterLogin from './pages/RegisterLogin'
import { useContext } from 'react'
import { UserContext } from './UserContext'
import AppPage from './pages/ChatPage'


function Routes() {
    const { username, id } = useContext(UserContext)

    if (username) {
        return (
            <>
                <AppPage />
            </>
        )
    }
    return (
        <>
            <RegisterLogin />
        </>
    )
}

export default Routes
