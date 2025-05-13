import React, { useState, useEffect, useContext, useRef } from 'react';
import { io } from 'socket.io-client';
import { MyContext } from '../../App';  // Import MyContext từ App.js
import { fetchDataFromApi, postData } from "../../utils/api"
import { FaImage, FaPaperPlane, FaArrowLeft } from 'react-icons/fa';  // Dùng icon hình ảnh và icon mũi tên gửi tin nhắn từ thư viện react-icons
import { TbRuler } from 'react-icons/tb';

function ClientChat() {
  const { user, isLogin } = useContext(MyContext); // Get user info and login status from MyContext
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAI, setIsAI] = useState(null);           // null | true(ai) | false(admin)
  const [messages, setMessages] = useState([]);      // mảng tin nhắn
  const [message, setMessage] = useState('');        // input text
  const [image, setImage] = useState(null);          // file ảnh
  const [admin, setAdmin] = useState(null);          // thông tin admin
  const socketRef = useRef(); 
  
   useEffect(() => {
    fetchDataFromApi('/api/messages/admin-info')
      .then(info => {
        console.log(info)
        setAdmin(info)})
      .catch(console.error);
  }, []); 

  useEffect(() => {
    socketRef.current = io("http://localhost:8000", {
      query: { userId: user.userId }
    });

    socketRef.current.on("newMessage", newMsg => {
      setMessages(prev => [...prev, newMsg]);
    });

    socketRef.current.on("transfer_to_admin", () => {
      alert("Bạn đã hết lượt hỏi AI, chuyển sang chat với Admin");
      setIsAI(false);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [user.userId]);

  useEffect(() => {
    setIsAI(null);
    setMessages([]);
    // (tự động fetch lại admin-info cho user mới)
    fetchDataFromApi('/api/messages/admin-info')
      .then(info => setAdmin(info))
      .catch(console.error);
  }, [user.userId]);
  useEffect(() => {
    if (isAI === false && admin) {
      // Chat với admin
      fetchDataFromApi(`/api/messages/${admin._id}`)  
        .then(msgs => setMessages(msgs))
        .catch(console.error);
    } else if (isAI === true) {
      // Chat với AI: có thể lấy history từ /api/messages/ai-id hoặc ko cần
      fetchDataFromApi(`/api/messages/${user.userId}`)  // tùy backend
        .then(msgs => setMessages(msgs))
        .catch(console.error);
    }
  }, [isAI, admin, user.userId]);

  // Send the message using POST /send/:id
  const handleSendMessage = async () => {
    if (!isLogin) {
    alert("Bạn phải đăng nhập mới được nhắn tin");
    return;
  }
    if (!message.trim() && !image) return;

      const formData = new FormData();
      formData.append("text", message);
      if (image) formData.append("image", image);

      console.log(Object.fromEntries(formData.entries()));

      try {
        let newMsg;
        if (isAI) {
          newMsg = await postData(`/api/messages/sendBot`, formData);
          
        } else {
          newMsg = await postData(`/api/messages/send/${admin._id}`, formData);
          console.log(newMsg)
        }
        setMessages(prev => [...prev, newMsg]);
        socketRef.current.emit("sendMessage", newMsg);
        setMessage('');
        setImage(null);
      } catch (err) {
        console.error("Send error:", err);
      }
};

  const handleImageUpload = e => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setImage(file);
    } else {
      alert("Vui lòng chọn file ảnh.");
    }
  };

  // 6) Quay về chọn AI/Admin
  const handleBack = () => {
    setIsAI(null);
    setMessages([]);
  };

//   const handleSendMessageToBot = async () => {
//   const formData = new FormData();
//   formData.append("text", message);
//   if (image) {
//     formData.append("image", image);
//   }

//   try {
//     const response = await postData(
//       `/api/messages/sendBot`,  // Gọi API sendBot
//       formData
//     );

//     setMessages((prevMessages) => [...prevMessages, response.data]); // Cập nhật tin nhắn
//     socket.emit("sendMessage", { text: message, image }); // Gửi qua socket

//     setMessage(''); // Reset message
//     setImage(null); // Reset image
//   } catch (error) {
//     console.error("Error sending message to bot:", error);
//   }
// };

  // Go back to choose between AI or Admin chat
    // const handleBack = () => {
    //   setIsChatOpen(true);  // Close the chat container
    //   setIsAI(null);  // Reset chat mode
    // };

  return (
    <div>
      {/* Biểu tượng tin nhắn ở góc phải */}
      {isLogin && (
      <div 
        className="message-icon" 
        onClick={() => setIsChatOpen(open => !open)}
        style={{
          position: 'fixed', 
          bottom: '20px', 
          right: '20px', 
          cursor: 'pointer',
          backgroundColor: '#6A1B9A', // Màu tím cho nền của biểu tượng chat
          color: 'white', // Màu của icon
          padding: '10px',
          borderRadius: '50%',
          fontSize: '24px',
          zIndex: 99999,
          cursor:'pointer', // Đảm bảo biểu tượng nằm trên cùng
        }}
      >
        🗨️
      </div>
      )}
      {/* Chatbox */}
      {isChatOpen && (
        <div 
          className="chatbox" 
          style={{
            position: 'fixed', 
            bottom: '70px', 
            right: '20px', 
            width: '350px', 
            height: '500px', 
            background: '#fff', 
            border: '1px solid #ccc', 
            padding: '10px',
            borderRadius: '10px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            display: 'flex', 
            flexDirection: 'column',
            zIndex: 99999,  // Đảm bảo khung chat nổi lên trên các phần tử khác
            maxHeight: '100vh',  // Đảm bảo khung chat không bị che khuất nếu trang có quá nhiều nội dung
            overflow: 'auto',    // Cho phép cuộn khi nội dung chat quá dài
          }}
        >
          {/* Nút quay lại ở góc trái */}
          {isAI !== null && (
            <button 
              onClick={handleBack}
              style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                padding: '5px',
                borderRadius: '5px',
                border: 'none',
                backgroundColor: '#f44336', 
                color: 'white',
                cursor: 'pointer',
              }}
            >
              <FaArrowLeft size={16} /> {/* Biểu tượng quay lại */}
            </button>
          )}

          {/* Chat Header */}
          <div 
            className="chat-header"
            style={{
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              padding: '10px', 
              backgroundColor: '#6A1B9A',  // Màu tím cho header
              borderRadius: '5px', 
              marginBottom: '10px',
              color: 'white', // Chữ màu trắng
            }}
          >
            <span style={{ fontWeight: 'bold' }}>Shopify</span> {/* Tên trang chủ Shopify */}
          </div>

          {/* Chat Options */}
          {isAI === null && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <button 
                onClick={() => setIsAI(true)} 
                style={{
                  backgroundColor: isAI === true ? '#4CAF50' : '#fff',  // Chọn nút AI sẽ có màu xanh lá
                  padding: '8px',
                  border: 'none',
                  borderRadius: '5px',
                  color: isAI === true ? 'white' : 'black', // Đổi màu chữ khi chọn
                  cursor: 'pointer',
                  width: '100%', // Giãn rộng nút theo chiều dọc
                }}
              >
                Chat with AI
              </button>
              <button 
                onClick={() => setIsAI(false)} 
                style={{
                  backgroundColor: isAI === false ? '#4CAF50' : '#fff',  // Chọn nút Admin sẽ có màu xanh lá
                  padding: '8px',
                  border: 'none',
                  borderRadius: '5px',
                  color: isAI === false ? 'white' : 'black',  // Đổi màu chữ khi chọn
                  cursor: 'pointer',
                  width: '100%', // Giãn rộng nút theo chiều dọc
                }}
              >
                Chat with Admin
              </button>
            </div>
          )}

          {/* Chat Container: only appears when user selects "Chat with AI" or "Chat with Admin" */}
          {isAI !== null && (
            <div>
              <div className="chat-box-messages" style={{ height: '300px', overflowY: 'scroll', marginBottom: '10px' }} >
                {messages.map((msg, index) => (
                  <div key={index} style={{ marginBottom: '10px' }}>
                    <strong>{msg.sender}: </strong>{msg.text}
                    {msg.image && <img src={msg.image} alt="uploaded" style={{ width: '100px', marginTop: '5px' }} />}
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              
              <div style={{ display: 'flex', flexDirection: 'column', padding: 10, gap: 8 }}>
  {/* 1. Preview ảnh nếu đã chọn */}
  {image && (
    <div style={{ position: 'relative', width: 100 }}>
      <img
        src={URL.createObjectURL(image)}
        alt="preview"
        style={{ width: '100%', borderRadius: 5, objectFit: 'cover' }}
      />
      {/* Nút xóa preview */}
      <button
        onClick={() => setImage(null)}
        style={{
          position: 'absolute',
          top: 2,
          right: 2,
          background: 'rgba(0,0,0,0.5)',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: 20,
          height: 20,
          cursor: 'pointer',
        }}
      >
        ×
      </button>
    </div>
  )}

  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
    <input
      type="text"
      value={message}
      onChange={(e) => setMessage(e.target.value)}
      placeholder="Type a message..."
      style={{ flex: 1, padding: 8, borderRadius: 5, border: '1px solid #ccc' }}
    />

    {/* 2. Nút chọn file */}
    <label htmlFor="image-upload" style={{ cursor: 'pointer' }}>
      <FaImage size={24} color="#6A1B9A" />
    </label>
    <input
      id="image-upload"
      type="file"
      accept="image/*"
      onChange={handleImageUpload}
      style={{ display: 'none' }}  // vẫn ẩn input
    />

    <button
      onClick={handleSendMessage}
      style={{
        background: '#6A1B9A',
        color: 'white',
        border: 'none',
        padding: '8px 12px',
        borderRadius: 5,
        cursor: 'pointer',
      }}
    >
      <FaPaperPlane size={20} />
    </button>
  </div>
</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ClientChat;
