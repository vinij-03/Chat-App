import Routes from './Routes';
import axios from 'axios';
import { UserContextProvider } from './UserContext'


function App() {

  axios.defaults.baseURL = 'https://psychological-issy-vineetjana-6c8595a2.koyeb.app';

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