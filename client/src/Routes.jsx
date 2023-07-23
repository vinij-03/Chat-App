import { useContext } from "react"
import AuthCheck from "./pages/AuthCheck";
import { UserContext } from "./UserContext";
    
    function Routes() {
        const {username, id}=useContext(UserContext);
        // console.log(id) ;

        if(username){
            return 'logged in'
        }
      return (
        <AuthCheck/>
        )
    }
    
    export default Routes 