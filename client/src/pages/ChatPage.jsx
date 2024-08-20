import { useEffect, useState, useContext } from 'react';
import Avatar from '../components/Avatar';
import { UserContext } from '../UserContext';
import {uniqBy} from 'lodash';
function ChatPage() {
  const [ws, setWs] = useState(null);
  const [onlinePeople, setOnlinePeople] = useState({});
  const [selectedUserId, setSelectedUserId] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [message, setMessage] = useState([]);

  const { username, id } = useContext(UserContext);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3000');
    setWs(ws);

    ws.addEventListener('message', handleMessage);

    
  }, []);

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

      setMessage(prev => [...prev, { ...messageData }]);
    }
  }

  function sendMessage(e) {
    e.preventDefault();
    ws.send(JSON.stringify({
      recepient: selectedUserId,
      
      text: newMessage
    }));
    setNewMessage('');
    setMessage(prev => [...prev, {
       text: newMessage,
        sender:id,
        recepient: selectedUserId,
       }]);
  }

  const excludeself = { ...onlinePeople };
  delete excludeself[id];

  const noDupMsg = uniqBy(message, 'id');
  return (
    <>
      <div className="flex h-screen bg-[#f6f4e8] text-[#2f2f2f] font-mono">
        {/* Contacts List */}
        <div className="w-1/4 bg-[#ece5c7] p-4 border-r border-[#b5b09c]">
          <h2 className="text-xl font-semibold mb-4">Contacts</h2>
          <div className="space-y-2">
            {Object.keys(excludeself).map((userId) => (
              <div
                onClick={() => selectedUserId ? setSelectedUserId('') : setSelectedUserId(userId)}
                key={userId}
                className={
                  "p-2 flex items-center cursor-pointer rounded " +
                  (userId === selectedUserId ? 'bg-[#d4cea1] text-[#2f2f2f]' : 'bg-[#ece5c7] text-[#2f2f2f]')
                }
                style={{ border: '1px solid #b5b09c' }}
              >
                <div className="flex items-center gap-2 py-2 pl-4">
                  <Avatar username={onlinePeople[userId]} userId={userId} />
                  <span>{onlinePeople[userId]}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="w-3/4 p-2 flex flex-col">
          <div className="flex-1 overflow-y-auto bg-[#f6f4e8] p-4 rounded-lg" style={{ border: '1px solid #b5b09c' }}>
            <div className="space-y-6">
              {selectedUserId && (
                <div className="flex flex-col">
                  {noDupMsg.map((messages, index) => (
                    <div
                      key={index}
                      className={`p-3 mt-2 rounded max-w-lg break-words ${messages.sender === id ? 'bg-[#d1e8c1] text-[#2f2f2f] self-end' : 'bg-[#ece5c7] text-[#2f2f2f] self-start'}`}
                      style={{ border: '1px solid #b5b09c' }}
                    >
                      sender:{messages.sender}<br/>
                      my id: {id}<br/>
                      {messages.text}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {!!selectedUserId && (
            <form onSubmit={sendMessage} className="mt-4 flex items-center">
              <input
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-grow p-2 bg-[#ece5c7] text-[#2f2f2f] rounded h-12 max-h-36 resize-none overflow-y-auto"
                style={{ border: '1px solid #b5b09c' }}
              />
              <button
                type="submit"
                className="ml-4 px-4 py-2 bg-[#d1e8c1] text-[#2f2f2f] rounded hover:bg-[#c6dfaf] transition"
                style={{ border: '1px solid #b5b09c' }}
              >
                Send
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}

export default ChatPage;
