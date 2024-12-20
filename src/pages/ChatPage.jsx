import { useEffect, useState, useContext, useRef } from 'react';
import { UserContext } from '../UserContext';
import { uniqBy } from 'lodash';
import axios from 'axios';
import OnlineInd from '../components/OnlineInd';

function ChatPage() {
  const [ws, setWs] = useState(null);
  const [onlinePeople, setOnlinePeople] = useState({});
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [message, setMessage] = useState([]);
  const messageEndRef = useRef(null);
  const [offlinePeople, setOfflinePeople] = useState({});


  const { username,  id , setId, setUsername } = useContext(UserContext);

  useEffect(() => {
    connectToWs();
  }, [selectedUserId]);
  function connectToWs() {
    const ws = new WebSocket('ws://localhost:3000');
    setWs(ws);
    ws.addEventListener('message', handleMessage);
    ws.addEventListener('close', () => {
      setTimeout(() => {
        console.log('Disconnected. Trying to reconnect.');
        connectToWs();
      }, 1000);
    });
  }

  useEffect(() => {
    scrollToBottom();
  }, [message]);

  function scrollToBottom() {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  useEffect(() => {
    if (selectedUserId) {
      axios.get('/messages/' + selectedUserId).then(res => {
        // console.log(res.data)
        setMessage(res.data);
      })
    }
  }, [selectedUserId]);

  function showOninePeople(peopleArray) {
    const people = {};
    peopleArray.forEach(({ userId, username }) => {
      people[userId] = username;
    });
    setOnlinePeople(people);
  }

  useEffect(() => { 
    axios.get('/people').then (res => {
      const offlinePeopleArr = res.data.filter(p => p._id !== id).filter(p => !onlinePeople[p._id]);
      const offlinePeople = {};
      offlinePeopleArr.forEach(p => {
        offlinePeople[p._id] = p.username;
      });
      setOfflinePeople(offlinePeople);
      
    })
  }, [onlinePeople]);


  function handleMessage(ev) {
    const messageData = JSON.parse(ev.data);
    if ('online' in messageData) {
      showOninePeople(messageData.online);
    } else if ('text' in messageData) {
      setMessage(prev => ([...prev, { ...messageData }]));
    }
  }

  function sendMessage(e,file= null) {
    if(e) e.preventDefault();    
    ws.send(
      JSON.stringify({
        recipient: selectedUserId,
        text: newMessage,
        file
      })
    );
    setNewMessage('');
    setMessage((prev) => [
      ...prev,
      {
        text: newMessage,
        sender: id,
        recipient: selectedUserId,
        id: Date.now(),
      },
    ]);
    if(file){
      axios.get('/messages/' + selectedUserId).then(res => {
        // console.log(res.data)
        setMessage(res.data);
      })
    }else{
      setNewMessage('');
      setMessage((prev) => [
        ...prev,
        {
          text: newMessage,
          sender: id,
          recipient: selectedUserId,
          id: Date.now(),
        },
      ]);
    }
  }
  function sendfile(ev) {
    const reader = new FileReader();
    reader.readAsDataURL(ev.target.files[0]);
    reader.onload = function () {
      sendMessage(null, {
        name: ev.target.files[0].name,
        data: reader.result,
      })
    }
  }
  

  function logout() {
    axios.post('/logout')
      .then(() => {
        setId(null);
        setUsername(null);
      })
      .catch((error) => {
        console.error("Logout failed", error);
        // Optionally handle logout failure
      });
  }
  const excludeself = { ...onlinePeople };
  delete excludeself[id];

  const noDupMsg = uniqBy(message, '_id');

  return (
    <div className="flex h-screen bg-[#1a1c23] text-white font-mono">
      {/* Contacts List */}
      <div className="w-1/4 bg-[#252836] p-4 border-r border-[#3b3f51] flex flex-col justify-between">
        <div>
          <h2 className="text-xl font-semibold mb-4 text-[#a6a8b9]">Contacts</h2>
          <div className="space-y-2">
            {/* Online People */}
            {Object.keys(excludeself).map((userId) => (
              <div
                onClick={() =>
                  selectedUserId ? setSelectedUserId('') : setSelectedUserId(userId)
                }
                key={userId}
                className={`p-2 flex items-center cursor-pointer rounded-md transition-all duration-150 ${userId === selectedUserId
                    ? 'bg-[#3b82f6] text-white'
                    : 'bg-[#2e3140] text-[#a6a8b9]'
                  } hover:bg-[#343746] hover:text-white`}
              >
                <OnlineInd online={true} />
                <span className="text-sm ml-4">{onlinePeople[userId]}</span>
              </div>
            ))}

            {/* Offline People */}
            {Object.keys(offlinePeople).map((userId) => (
              <div
                onClick={() =>
                  selectedUserId ? setSelectedUserId('') : setSelectedUserId(userId)
                }
                key={userId}
                className={`p-2 flex items-center cursor-pointer rounded-md transition-all duration-150 ${userId === selectedUserId
                    ? 'bg-[#3b82f6] text-white'
                    : 'bg-[#2e3140] text-[#a6a8b9]'
                  } hover:bg-[#343746] hover:text-white`}
              >
                <OnlineInd online={false} />
                <span className="text-sm ml-4">{offlinePeople[userId]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Username and Logout Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-[#2e3140] rounded-md mt-4 space-y-2 sm:space-y-0">
          <span className="text-sm text-[#a6a8b9] mb-2 sm:mb-0">{username}</span>
          <button
            onClick={logout}
            className="w-full sm:w-auto bg-[#3b82f6] text-white text-sm px-4 py-2 rounded-md hover:bg-[#2e6bd0] transition-all duration-150"
          >
            Logout
          </button>
        </div>
      </div>
    

      {/* Chat Area */}
      <div className="w-3/4 p-4 flex flex-col">
        <div className="flex-1 overflow-y-auto bg-[#252836] p-6 rounded-md shadow-md">
          <div className="space-y-4">
            {selectedUserId && (
              <div className="flex flex-col">
                {noDupMsg.map((messages, index) => (
                  <div
                    key={index}
                    className={`p-3 mt-2 rounded-lg max-w-[75%] break-words transition-all duration-150 ${messages.sender === id
                        ? 'bg-[#3b82f6] text-white self-end animate-slide-in-right'
                        : 'bg-[#2e3140] text-[#a6a8b9] self-start animate-slide-in-left'
                      }`}
                  >
                    {/* {console.log(message.sender)} */}
                    {messages.text}
                    {messages.file && (
                      <div className="mt-2 flex items-center space-x-2">
                        {/* Link to open file in a new tab */}
                        <a
                          href={axios.defaults.baseURL + '/uploads/' + messages.file}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-[#] hover:underline"
                        >
                          {messages.file}
                        </a>

                        {/* Button to download the file */}
                        <button
                          className="bg-[#3b82f6] text-white px-2 py-1 rounded-md hover:bg-[#2563eb] transition-all duration-150 flex items-center justify-center"
                          onClick={() => {
                            // Create a temporary anchor element
                            const link = document.createElement('a');
                            link.href = axios.defaults.baseURL + '/uploads/' + messages.file;
                            // Add download attribute with the filename
                            link.setAttribute('download', messages.file);
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                        >
                          <svg stroke="currentColor" fill="none" stroke-width="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path></svg>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messageEndRef} />
              </div>
            )}
          </div>
        </div>

        {!!selectedUserId && (
          <form onSubmit={sendMessage} className="mt-4 flex items-center space-x-2">
            <label htmlFor="fileUpload" className="cursor-pointer">
              <div className="bg-[#2e3140] text-white p-2 rounded-lg hover:bg-[#3b82f6] transition-all duration-150 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <input
                type="file"
                id="fileUpload"
                className="hidden"
                onChange={sendfile}
              />
            </label>

            <input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-grow p-2 bg-[#2e3140] text-white rounded-lg h-12 focus:ring-2 focus:ring-[#3b82f6] transition-all duration-150"
            />

            <button
              type="submit"
              className="px-4 py-2 bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb] transition-all duration-150"
            >
              Send
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ChatPage;
