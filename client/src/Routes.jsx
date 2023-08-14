import { useContext } from "react"
import AuthCheck from "./pages/AuthCheck";
import { UserContext } from "./UserContext";
import Chat from "./pages/Chat";
    
    function Routes() {
        const {username, id}=useContext(UserContext);
        // console.log(id) ;

        if(username){
            return (<Chat/>)
        }
      return (
        <AuthCheck/>
        )
    }
    
    export default Routes 