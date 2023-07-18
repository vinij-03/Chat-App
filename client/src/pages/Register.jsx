import axios from 'axios';
import { useState, useContext } from 'react';
import { UserContext } from '../UserContext.jsx';

function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { setUsername : setLoggedUser, setId } = useContext(UserContext);



    async function register(ev) {
        ev.preventDefault();
        const { data } = await axios.post("/register", { username, email, password })
        setLoggedUser(username);
        setId(data.id)
    }
    return (
        <div className=" bg-red-100 h-screen flex flex-col items-center justify-center " >
            <h1 className="text-2xl font-bold mb-4">Chat-App</h1>
            <form className="w-64 mx-auto " onSubmit={register} >
                <input value={username} onChange={ev => setUsername(ev.target.value)} type="text" placeholder="username" className="block w-full p-4  mb-1 rounded-md" />
                <input value={email} onChange={ev => setEmail(ev.target.value)} type="text" placeholder="email" className="block w-full p-4 mb-1 rounded-md" />
                <input value={password} onChange={ev => setPassword(ev.target.value)} type="password" placeholder="password" className="block w-full p-4 mb-1 rounded-md" />
                {/* <button className=" bg-blue-500   p-4 mb-1 rounded-md w-1/2 ">Login</button> */}
                <div className="flex justify-center">
                    forgot password? / login 
                    <button type="submit" className="bg-green-200 p-4 rounded-md w-1/2">
                        Register
                    </button>
                </div>
            </form>
        </div>
    );
}

export default Register;
