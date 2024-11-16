import { useEffect, useState, useContext, useRef } from 'react';
import { UserContext } from '../UserContext';
import { uniqBy } from 'lodash';
import axios from 'axios';

function ChatPage() {
  const [ws, setWs] = useState(null);
  const [onlinePeople, setOnlinePeople] = useState({});
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [message, setMessage] = useState([]);
  const messageEndRef = useRef(null);

  const { username, id } = useContext(UserContext);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3000');
    setWs(ws);

    ws.addEventListener('message', handleMessage);

    return () => {
      ws.removeEventListener('message', handleMessage);
      ws.close();
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [message]);

  function scrollToBottom() {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  useEffect(() => {
    if (selectedUserId) {
      axios.get('/messages/' + selectedUserId).then((res) => { });
    }
  }, [selectedUserId]);

  function showOninePeople(peopleArray) {
    const people = {};
    peopleArray.forEach(({ userId, username }) => {
      people[userId] = username;
    });
    setOnlinePeople(people);
  }

  function handleMessage(e) {
    const messageData = JSON.parse(e.data);
    if ('online' in messageData) {
      showOninePeople(messageData.online);
    } else if ('text' in messageData) {
      setMessage((prev) => [...prev, { ...messageData }]);
    }
  }

  function sendMessage(e) {
    e.preventDefault();
    ws.send(
      JSON.stringify({
        recepient: selectedUserId,
        text: newMessage,
      })
    );
    setNewMessage('');
    setMessage((prev) => [
      ...prev,
      {
        text: newMessage,
        sender: id,
        recepient: selectedUserId,
        id: Date.now(),
      },
    ]);
  }

  const excludeself = { ...onlinePeople };
  delete excludeself[id];

  const noDupMsg = uniqBy(message, 'id');

  return (
    <div className="flex h-screen bg-[#1a1c23] text-white font-mono">
      {/* Contacts List */}
      <div className="w-1/4 bg-[#252836] p-4 border-r border-[#3b3f51]">
        <h2 className="text-xl font-semibold mb-4 text-[#a6a8b9]">Contacts</h2>
        <div className="space-y-2">
          {Object.keys(excludeself).map((userId) => (
            <div
              onClick={() => selectedUserId ? setSelectedUserId('') : setSelectedUserId(userId)}
              key={userId}
              className={`p-2 flex items-center cursor-pointer rounded-md transition-all duration-150 ${userId === selectedUserId
                  ? 'bg-[#3b82f6] text-white'
                  : 'bg-[#2e3140] text-[#a6a8b9]'
                } hover:bg-[#343746] hover:text-white`}
            >
              <span className="text-sm">{onlinePeople[userId]}</span>
            </div>
          ))}
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
                    {messages.text}
                  </div>
                ))}
                <div ref={messageEndRef} />
              </div>
            )}
          </div>
        </div>

        {!!selectedUserId && (
          <form onSubmit={sendMessage} className="mt-4 flex items-center">
            <input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-grow p-2 bg-[#2e3140] text-white rounded-lg h-12 focus:ring-2 focus:ring-[#3b82f6] transition-all duration-150"
            />
            <button
              type="submit"
              className="ml-4 px-4 py-2 bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb] transition-all duration-150"
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
