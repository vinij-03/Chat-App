import { useEffect, useState } from "react"

function Chat() {

  const [ws,setWs]= useState(null);
  useEffect (()=>{
   const ws = new WebSocket("ws://localhost:4000");
   setWs(ws);
   ws.addEventListener('message', handleMessage)
  }, []);

  function handleMessage(e){
    console.log('message',e)
  }
  return (
    <div className="flex h-screen">
      <div className="bg-red-100 w-1/3">contact</div>
      <div className="bg-green-300 w-2/3 flex flex-col">
        <div className="chat flex-grow">Chats</div>
        <div className="chat-area flex ">
          <input type="text" className=" bg-white hover:bg-gray-100 border rounded  p-2 flex-grow  m-2" placeholder="Message" />
          <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded m-2">
            <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><g><path fill="none" d="M0 0h24v24H0z"></path><path d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z"></path></g></svg>
            </button>
        </div>
      </div>
    </div>
  )
}

export default Chat