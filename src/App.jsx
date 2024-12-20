import Routes from './Routes';
import axios from 'axios';
import { UserContextProvider } from './UserContext'


function App() {

  axios.defaults.baseURL = 'https://chat-app-six-kappa-63.vercel.app';

  axios.defaults.withCredentials = true;

  return (
    <>
      <UserContextProvider>
        <Routes />
      </UserContextProvider>
    </>
  )
}

export default App