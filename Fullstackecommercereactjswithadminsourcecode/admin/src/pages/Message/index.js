// import React, { useState, useEffect, useContext } from 'react';
// import { MyContext } from '../../App';  // Để lấy thông tin user
// import { fetchDataFromApi } from "../../utils/api";  // Hàm gọi API
// import { FaArrowLeft } from 'react-icons/fa';
// import { io } from 'socket.io-client'  // Icon quay lại

// function AdminChat() {
//   const { user } = useContext(MyContext); // Lấy thông tin người dùng (admin)
//   const [clients, setClients] = useState([]);  // Danh sách các client
//   const [selectedClient, setSelectedClient] = useState(null);  // Client được chọn
//   const [messages, setMessages] = useState([]);  // Lịch sử tin nhắn
//   const [message, setMessage] = useState('');  // Tin nhắn gửi đi
//   const [socket, setSocket] = useState(null);

//   useEffect(() => {
//     // Kết nối với server qua socket.io
//     const socketConnection = io("http://localhost:8000", {
//       query: { userId: user.userId }, // Gửi thông tin người dùng vào socket
//     });
//     setSocket(socketConnection);

//     // Lắng nghe sự kiện "newMessage" từ server
//     socketConnection.on("newMessage", (newMessage) => {
//       setMessages((prevMessages) => [...prevMessages, newMessage]);
//     });

//     return () => {
//       socketConnection.disconnect(); // Ngắt kết nối khi component unmount
//     };
//   }, [user.userId]);
//   // Lấy danh sách các client đã chat với admin
//   useEffect(() => {
//     const getClients = async () => {
//       try {
//         const response = await fetchDataFromApi("/api/messages/users");
//         setClients(response);  // Cập nhật danh sách client
//       } catch (error) {
//         console.error("Error fetching clients:", error);
//       }
//     };

//     getClients();
//   }, []);

//   // Lấy lịch sử tin nhắn của client được chọn
//   useEffect(() => {
//     if (selectedClient) {
//       const getMessages = async () => {
//         try {
//           const response = await fetchDataFromApi(`/api/messages/${selectedClient._id}`);
//           setMessages(response);  // Cập nhật tin nhắn
//         } catch (error) {
//           console.error("Error fetching messages:", error);
//         }
//       };

//       getMessages();
//     }
//   }, [selectedClient]);

//   // Xử lý gửi tin nhắn
//   const handleSendMessage = async () => {
//     if (message.trim()) {
//       try {
//         const response = await fetch('/api/chat/send/' + selectedClient._id, {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({
//             text: message,
//           }),
//         });

//         const newMessage = await response.json();
//         setMessages((prevMessages) => [...prevMessages, newMessage]);  // Cập nhật tin nhắn
//         setMessage('');  // Reset input message
//       } catch (error) {
//         console.error("Error sending message:", error);
//       }
//     }
//   };

//   return (
//     <div className="admin-chat">
//       {/* Danh sách client */}
//       <div className="client-list" style={{ width: '300px', float: 'left' }}>
//         <h3>Clients</h3>
//         <ul>
//           {clients.map((client) => (
//             <li key={client._id} onClick={() => setSelectedClient(client)}>
//               {client.name}
//             </li>
//           ))}
//         </ul>
//       </div>

//       {/* Khung chat */}
//       {selectedClient && (
//         <div className="chat-box" style={{ marginLeft: '320px', padding: '20px' }}>
//           <button onClick={() => setSelectedClient(null)}>
//             <FaArrowLeft /> Back
//           </button>
//           <h4>Chat with {selectedClient.name}</h4>

//           <div className="messages" style={{ height: '300px', overflowY: 'scroll', marginBottom: '20px' }}>
//             {messages.map((msg, index) => (
//               <div key={index}>
//                 <strong>{msg.senderRole === 'admin' ? 'Admin' : selectedClient.name}:</strong>
//                 <p>{msg.text}</p>
//               </div>
//             ))}
//           </div>

//           <div className="message-input">
//             <input
//               type="text"
//               value={message}
//               onChange={(e) => setMessage(e.target.value)}
//               placeholder="Type a message..."
//             />
//             <button onClick={handleSendMessage}>Send</button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default AdminChat;
// src/pages/Message/AdminChat.jsx
import React, { useState, useEffect, useContext } from 'react';
import { MyContext } from '../../App';
import { fetchDataFromApi, postData } from '../../utils/api';
import { FaArrowLeft } from 'react-icons/fa';
import { useRef } from 'react';
import { io } from 'socket.io-client';

export default function AdminChat() {
  const { user, baseUrl } = useContext(MyContext);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const socketRef = useRef();

  useEffect(() => {
    socketRef.current = io("http://localhost:8000", {
      // nếu REACT_APP_API_URL = http://localhost:8000/api thì ta cắt /api ra
      query: { userId: user.userId },
    });

    // 2) Lắng nghe event newMessage
    socketRef.current.on('newMessage', msg => {
      // chỉ thêm nếu message từ đúng client đang chat
      if (selectedClient && msg.senderId === selectedClient._id) {
        setMessages(m => [...m, msg]);
      }
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [user.userId, selectedClient]);
  
  // 1) Lấy danh sách các client đã chat với admin
  useEffect(() => {

    fetchDataFromApi('/api/messages/users')
      .then(data => setClients(data))
      .catch(err => console.error('Error fetching clients:', err));
  }, []);
  
  // 2) Khi chọn client, load history
  useEffect(() => {
    if (!selectedClient) return;
    fetchDataFromApi(`/api/messages/${selectedClient._id}`)
      .then(msgs => setMessages(msgs))
      .catch(err => console.error('Error fetching history:', err));
  }, [selectedClient]);
  
  // 3) Gửi tin nhắn
  const sendMessage = async () => {
    if (!draft.trim()) return;
    try {
      const payload = { text: draft };
      // endpoint: POST http://localhost:8000/api/messages/send/:id
      const msg = await postData(`/api/messages/send/${selectedClient._id}`, payload);
      setMessages(m => [...m, msg]);
      setDraft('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };
  
  return (
    <div style={{ display: 'flex', height: '100%' }}>
      {/* Sidebar client list */}
      <div style={{
        width: 300, borderRight: '1px solid #ddd', padding: 16, overflowY: 'auto'
      }}>
        <h4>Clients</h4>
        {clients.length === 0
          ? <p>No clients yet.</p>
          : <ul style={{ listStyle: 'none', padding: 0 }}>
              {clients.map(c => (
                <li key={c._id} style={{
                  padding: '8px', cursor: 'pointer',
                  background: selectedClient?._id === c._id ? '#f0f0f0' : 'transparent'
                }}
                    onClick={() => setSelectedClient(c)}>
                  {c.name} ({c.email})
                </li>
              ))}
            </ul>
        }
      </div>
  
      {/* Chat area */}
      <div style={{ flexGrow: 1, padding: 16, position: 'relative' }}>
        {!selectedClient
          ? <p style={{ color: '#888' }}>Chọn một client để xem tin nhắn</p>
          : <>
              <button onClick={() => setSelectedClient(null)}
                      style={{
                        position: 'absolute', top: 16, left: 16,
                        border: 'none', background: 'none', cursor: 'pointer'
                      }}>
                <FaArrowLeft /> Back
              </button>
              <h4 style={{ textAlign: 'center' }}>
                Chat with {selectedClient.name}
              </h4>
  
              <div style={{
                marginTop: 48, height: 'calc(100% - 130px)',
                overflowY: 'auto', padding: '0 16px'
              }}>
                {messages.map((m, i) => (
                  <div key={i} style={{
                    textAlign: m.senderRole==='mainAdmin' ? 'right' : 'left',
                    margin: '8px 0'
                  }}>
                    <div style={{
                      display: 'inline-block',
                      background: m.senderRole==='mainAdmin' ? '#6A1B9A' : '#eee',
                      color: m.senderRole==='mainAdmin' ? 'white' : 'black',
                      padding: '8px 12px', borderRadius: 16,
                      maxWidth: '70%'
                    }}>
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>
  
              {/* Input */}
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                display: 'flex', padding: 16, borderTop: '1px solid #ddd'
              }}>
                <input
                  type="text"
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  placeholder="Type a message..."
                  style={{
                    flexGrow: 1, padding: '8px 12px',
                    borderRadius: 20, border: '1px solid #ccc'
                  }}
                />
                <button onClick={sendMessage}
                        style={{
                          marginLeft: 8, padding: '8px 16px',
                          background: '#6A1B9A', color: 'white',
                          border: 'none', borderRadius: 20, cursor: 'pointer'
                        }}>
                  Send
                </button>
              </div>
            </>
        }
      </div>
    </div>
  );
}

