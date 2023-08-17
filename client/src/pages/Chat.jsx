import { useContext, useEffect, useState } from "react"
import Avatar from "../components/Avatar";
import { UserContext } from "../UserContext";
function Chat() {
  const [onlinePeople, setOnlinePeople] = useState({});
  const [ws,setWs]= useState(null);
  const[selectedUserId, setSelectedUserId] = useState('');
  const[newMessage, setNewMessage] = useState('');
  const[messages,setMessages] = useState([]);

  const {username  , id }=useContext(UserContext);
  useEffect (()=>{
   const ws = new WebSocket("ws://localhost:4000");
   setWs(ws);
   ws.addEventListener('message', handleMessage)
  }, []);

  function showOnline(peopleArray){
    const people = {};
    peopleArray.forEach(({userId,username})=>{
      people[userId] = username;
    })
    // console.log(peopleArray);
    setOnlinePeople(people);
  }

  function handleMessage(ev){
    // console.log('message',e)
   const messageData = JSON.parse(ev.data);
   console.log(ev ,messageData);
    if('online'in messageData){
      showOnline(messageData.online);
      // console.log(messageData.online);  
    }
    else {
      setMessages(prev => [...prev, {text:messageData.text, isOur:false}])
    }
  }

  function sendMessage(ev){
    ev.preventDefault();
    ws.send(JSON.stringify({
      
        recipientId : selectedUserId,
        text : newMessage
      
    }))
    setNewMessage('');
    setMessages(prev => [...prev, {text:newMessage, isOur:true}])
  }

  const excludeself = { ...onlinePeople };
  delete excludeself[id]; 


 
  return (
    <div className="flex h-screen">
      <div className="bg-green-100 w-1/3">
        <div className="flex bg-green-500 p-2 item-center ">
          <div className="m-2"><svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 20 20" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd"></path></svg></div>
          <div className="text-lg font-medium"> {username} Chat</div>
                </div>

                {Object.keys(excludeself).map( userId => (
                  <div onClick={() => setSelectedUserId(userId)} key={userId} className= {"flex items-center  font-medium border-b border-gray-100 " + (userId===selectedUserId? 'bg-green-300': '')}>
                    {userId === selectedUserId && (
                      <div className="w-1 bg-green-500 h-12"></div>
                    )}
                    <div className="flex items-center gap-2 py-2 pl-4">
                      <Avatar username={onlinePeople[userId]} userId={userId} />
                      <span className="">{onlinePeople[userId]}</span>
                    </div>
                  </div> 
                ))}
              </div>
              <div className="bg-green-300 w-2/3 flex flex-col">
                <div className="chat flex-grow">
                  {!selectedUserId && (
                    <div className=" flex items-center justify-center h-full ">
                    <div className="text-lg font-bold text-gray-500">No user selected</div>
                    </div>
                  )}
                </div>
                {selectedUserId && (
                  <div>
                    { messages.map( message => (
                      <div key={message}>
                        {message.text}
                      </div>
                    ))}
                  </div>
                )}
                {!!selectedUserId &&(
                <form className="chat-area flex " onSubmit={sendMessage}>
                  <input onChange={ev => setNewMessage(ev.target.value)}value={newMessage} type="text" className=" bg-white hover:bg-gray-100 border rounded  p-2 flex-grow  m-2" placeholder="Message" />
                  <button type="submit" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded m-2">
                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><g><path fill="none" d="M0 0h24v24H0z"></path><path d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z"></path></g></svg>
                    </button>
                </form>
                )}
              </div>
            </div>
          )
        }
        export default Chat

