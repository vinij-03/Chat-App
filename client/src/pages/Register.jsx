import axios from 'axios';
import { useState } from 'react';
import { useContext } from 'react';
import { UserContext } from '../UserContext';

function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const {setUsername : setLogedinUsername ,setId}=  useContext(UserContext) ; 


    async function register(ev){
        ev.preventDefault();
        await axios.post("/register", { username, email, password })
    }
    return (
        <div className=" bg-blue-100 h-screen flex items-center" >
            <form className="w-64 mx-auto" onSubmit={register}>
                <input value={username} onChange={ev => setUsername(ev.target.value)} type="text" placeholder="username" className="block w-full p-4  mb-1 rounded-md" />
                <input value={email} onChange={ev => setEmail(ev.target.value)} type="text" placeholder="email" className="block w-full p-4 mb-1 rounded-md" />
                <input value={password} onChange={ev => setPassword(ev.target.value)} type="password" placeholder="password" className="block w-full p-4 mb-1 rounded-md" />
                {/* <button className=" bg-blue-500   p-4 mb-1 rounded-md w-1/2 ">Login</button> */}
                <button type="submit" className=" bg-blue-500   p-4  rounded-md w-1/2 ">Register</button>
            </form>
        </div>
    );
}

export default Register;
