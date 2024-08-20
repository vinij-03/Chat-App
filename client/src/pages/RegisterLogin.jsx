import { useContext, useState } from 'react';
import { UserContext } from '../UserContext';
import axios from 'axios';

function RegisterLogin() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isRegisterOrLogin, setIsRegisterOrLogin] = useState('register');

    const { setUsername: setLoggedInUsername, setId, id } = useContext(UserContext);

    async function Register(ev) {
        const url = isRegisterOrLogin === 'register' ? '/register' : '/login';
        ev.preventDefault();
        try {
            const { data } = await axios.post(url, { username, password });
            // console.log(data)
            setLoggedInUsername(username);
            setId(data.id);
            // console.log(id)
            
        } catch (error) {
            console.error("An error occurred during registration or login:", error);
        }
    }

    return (
        <>
            <div className="bg-[#fefaee] h-screen flex items-center justify-center">
                <form
                    className="bg-[#FED766] rounded px-8 pt-6 pb-8 mb-4"
                    onSubmit={Register}
                >
                    <input
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="appearance-none block w-full bg-[#fefaee] text-[#1e1801] border border-gray-300 rounded py-3 px-4 mb-3 leading-tight focus:outline-none"
                        type="text"
                        placeholder="username"
                    />
                    <input
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="appearance-none block w-full bg-[#fefaee] text-[#1e1801] border border-gray-300 rounded py-3 px-4 mb-3 leading-tight focus:outline-none"
                        type="password"
                        placeholder="password"
                    />
                    <div className="flex flex-col w-full space-y-2 justify-center">
                        <button
                            className={`font-bold py-2 px-4 rounded focus:outline-none ${isRegisterOrLogin === 'register' ? 'bg-[#FF5964] hover:bg-[#d04f55]' : 'bg-[#009FB7] hover:bg-[#007a8d]'
                                } text-[#fefaee]`}
                            type="submit"
                        >
                            {isRegisterOrLogin === 'register' ? 'Register' : 'Log In'}
                        </button>
                        <div>
                            {isRegisterOrLogin === 'register' && (
                                <button
                                    className="bg-[#009FB7] w-full hover:bg-[#007a8d] text-[#fefaee] font-bold py-2 px-4 rounded focus:outline-none"
                                    type="button"
                                    onClick={() => setIsRegisterOrLogin('Log In')}
                                >
                                    Log In
                                </button>
                            )}
                            {isRegisterOrLogin === 'Log In' && (
                                <button
                                    className="bg-[#FF5964] w-full hover:bg-[#d04f55] text-[#fefaee] font-bold py-2 px-4 rounded focus:outline-none"
                                    type="button"
                                    onClick={() => setIsRegisterOrLogin('register')}
                                >
                                    Register
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}

export default RegisterLogin;
