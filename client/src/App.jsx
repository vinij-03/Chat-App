import Register from "./pages/Register"
import './index.css'
import axios from 'axios'
function App() {
  axios.defaults.baseURL = "http://localhost:4000";
  axios.defaults.withCredentials = true;


  return (
    <>
      <Register />
    </>
  )
}

export default App
