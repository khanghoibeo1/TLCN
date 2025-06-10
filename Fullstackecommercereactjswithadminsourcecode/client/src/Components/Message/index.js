import React, { useState, useEffect, useContext, useRef } from 'react';
import { io } from 'socket.io-client';
import EmojiPicker from 'emoji-picker-react'
import { MyContext } from '../../App';  // Import MyContext từ App.js
import { fetchDataFromApi, postData, postData2, putData } from "../../utils/api"
import { FaImage, FaPaperPlane, FaArrowLeft, FaSmile} from 'react-icons/fa';  // Dùng icon hình ảnh và icon mũi tên gửi tin nhắn từ thư viện react-icons
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
  const [unreadCount, setUnreadCount] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);
  
   useEffect(() => {
    fetchDataFromApi('/api/messages/admin-info')
      .then(info => {
        console.log(info)
        setAdmin(info)})
      .catch(console.error);
  }, []); 
  useEffect(() => {
    if (!isLogin) return;
    fetchDataFromApi('/api/messages/count/unread')
      .then(data => setUnreadCount(data.unreadCount))
      .catch(console.error);
  }, [isLogin]);

  useEffect(() => {
    if (!isLogin) return;
    socketRef.current = io(process.env.REACT_APP_API_URL, {
      query: { userId: user.userId }
    });

    socketRef.current.on("newMessage", newMsg => {
      // nếu tin nhắn từ admin gửi tới client và hộp chat đang đóng
      if (['mainAdmin', 'storeAdmin','staff'].includes(newMsg.senderRole) && !isChatOpen) {
        setUnreadCount(c => c + 1);
      }
      // cập nhật message list (giữ như cũ)
      setMessages(prev => [...prev, newMsg]);
    });

    socketRef.current.on("transfer_to_admin", () => {
      alert("AI đang gặp vấn đề. Bạn được chuyển sang chat với Admin");
      setIsAI(false);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [user.userId, isLogin, isChatOpen]);

  useEffect(() => {
    setIsAI(null);
    setMessages([]);
    // // (tự động fetch lại admin-info cho user mới)
    // fetchDataFromApi('/api/messages/admin-info')
    //   .then(info => setAdmin(info))
    //   .catch(console.error);
  }, [user.userId]);
  useEffect(() => {
    if (isAI === false && admin) {
      // Chat với admin
      fetchDataFromApi(`/api/messages/${admin._id}`)  
        .then(msgs => setMessages(msgs))
        .catch(console.error);
    } else if (isAI === true) {
      // Chat với AI: có thể lấy history từ /api/messages/ai-id hoặc ko cần
      fetchDataFromApi(`/api/messages/bot-history`)  // tùy backend
        .then(msgs => setMessages(msgs))
        .catch(console.error);
    }
  }, [isAI, admin]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSelectAdmin = () => {
    setIsAI(false);
    // đánh dấu đã đọc
    putData('/api/messages/count/mark-read', {})
      .then(() => setUnreadCount(0))
      .catch(console.error);
  };

  const toggleChat = () => {
    setIsChatOpen(o => !o);
  };

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
        const res = await postData2(`/api/messages/sendBot`, formData);
        const { status, ok, data } = res;
        if (status === 400) {
          // thiếu nội dung
          alert(data.error);
          return;
        }
        if (status === 403) {
          // hết lượt hỏi AI
          alert(data.error);
          setIsAI(false);
          return;
        }
        if (!ok) {
          // lỗi khác
          alert(data.error || "Có lỗi xảy ra, thử lại sau.");
          return;
        }

        newMsg = data;
        
      } else {
        const res = await postData2(`/api/messages/send/${admin._id}`, formData);
        newMsg = res.data
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

  const onEmojiClick = (emojiObject) => {
    setMessage(msg => msg + emojiObject.emoji);
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
    setIsChatOpen(false);
  };

  const isSameDay = (d1, d2) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const formatDateHeader = (date) => {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };
  const formatTime = date => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const initialAIGreeting = `Xin chào! Mình là trợ lý AI của bạn tại FRUITOPIA. Mình đang phát triển nên không phải lúc nào cũng đúng. 
  Bạn có thể phản hồi để giúp mình cải thiện tốt hơn.

  Mình sẵn sàng giúp bạn với câu hỏi về chính sách và tìm kiếm sản phẩm. Hôm nay bạn cần mình hỗ trợ gì hông?`;

  const initialAdminGreeting = "Admin sẽ hỗ trợ các yêu cầu của bạn.";

  return (
    <div>
      
      {isLogin && (
        <div
          onClick={toggleChat}
          style={{
            position:'fixed', bottom:'20px', right:'20px',
            backgroundColor:'#6A1B9A', color:'white', padding:10,
            borderRadius:'50%', fontSize:24, cursor:'pointer', zIndex:999
          }}
        >
          🗨️
          {unreadCount > 0 && (
            <span style={{
              position:'absolute', top:-5, right:-5,
              background:'red', color:'white',
              width:20, height:20, borderRadius:'50%',
              display:'flex', alignItems:'center',
              justifyContent:'center', fontSize:12
            }}>
              {unreadCount}
            </span>
          )}
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
                top: '15px',
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
            <span style={{ fontWeight: 'bold' }}>FRUITOPIA</span> 
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
                onClick={handleSelectAdmin} 
                style={{
                  backgroundColor: isAI === false ? '#4CAF50' : '#fff',  // Chọn nút Admin sẽ có màu xanh lá
                  fontWeight: unreadCount > 0 ? 'bold' : 'normal',
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
              <div className="chat-box-messages" style={{ height: '300px', overflowY: 'auto', marginBottom: '10px' }} >
                
                {messages?.length === 0 && (
                  <div style={{
                    backgroundColor: isAI ? '#eee' : '#eee',
                    color: '#333',
                    padding: '8px 12px',
                    borderRadius: 16,
                    maxWidth: '80%',
                    margin: isAI ? '0 auto 12px' : '0  auto 12px',
                    fontStyle: 'italic',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {isAI ? initialAIGreeting : initialAdminGreeting}
                  </div>
                )}
                {messages?.map((msg, idx) => {
                  const msgDate = new Date(msg.createdAt);
                  const prevMsgDate = idx > 0 ? new Date(messages[idx - 1].createdAt) : null;
                  const showDateHeader = idx === 0 || !isSameDay(msgDate, prevMsgDate);
                  const isClientMsg = msg.senderRole === 'client';

                  return (
                    <React.Fragment key={msg._id}>
                    {showDateHeader && (
                      <div
                        style={{
                          textAlign: 'center',
                          margin: '12px 0',
                          color: '#666',
                          fontSize: '0.85em'
                        }}
                      >
                        {formatDateHeader(msgDate)}
                      </div>
                    )}
                    <div
                      
                      style={{
                        display: 'flex',
                        justifyContent: isClientMsg ? 'flex-end' : 'flex-start',
                        margin: '6px 0'
                      }}
                    >
                      <div
                        style={{
                          backgroundColor: isClientMsg ? '#6A1B9A' : '#f1f0f0',
                          color: isClientMsg ? 'white' : 'black',
                          padding: '8px 12px',
                          borderRadius: 16,
                          maxWidth: '70%',
                          wordBreak: 'break-word'
                        }}
                      >
                        {msg.text}
                        {msg.image && (
                          <img
                            src={msg.image}
                            alt=""
                            style={{ width: '100%', borderRadius: 8, marginTop: 6 }}
                          />
                        )}

                        <div style={{
                          textAlign: 'right',
                          fontSize: '0.75em',
                          marginTop: 4,
                          color: isClientMsg ? 'rgba(255,255,255,0.7)' : '#999'
                        }}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                    </React.Fragment>
                  );
                })}
                <div ref={messagesEndRef} />
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

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative' }}>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={e => {
                    if (e.key === 'Enter') {
                        e.preventDefault();       // ngăn đừng xuống dòng
                        handleSendMessage();     // gửi tin
                      }
                    }}
                    onInput={e => {
                      // auto-grow
                      e.target.style.height = 'auto';
                      e.target.style.height = `${e.target.scrollHeight}px`;
                    }}
                    placeholder="Type a message..."
                    style={{ flex: 1,
                      padding: '8px 12px',
                      borderRadius: 5,
                      border: '1px solid #ccc',
                      resize: 'none',
                      maxHeight: 100,
                      lineHeight: 1.4,
                      overflowY: 'auto', }}
                  />

                  {/* Nút emoji */}
                  <button
                    onClick={() => setShowEmojiPicker(open => !open)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '1.2rem',
                      transform: 'translateY(0px)',
                    }}
                  >
                    <FaSmile color="#6A1B9A" />
                  </button>

                  {/* Emoji Picker */}
                  {showEmojiPicker && (
                    <div style={{
                      position: 'absolute',
                      bottom: 'calc(100% + 10px)',
                      right: 40,
                      zIndex: 10000,
                    }}>
                      <EmojiPicker
                        onEmojiClick={onEmojiClick}
                        disableAutoFocus={true}
                        native
                        pickerStyle={{ boxShadow: '0 2px 8px rgba(0,0,0,0.15)', maxHeight: '250px', overflowY: 'auto', width: '320px' }}
                      />
                    </div>
                  )}

                  {/* 2. Nút chọn file */}
                  <label htmlFor="image-upload" style={{ cursor: 'pointer', padding: '6px 10px', display: 'flex',alignItems: 'center',justifyContent: 'center' , transform: 'translateY(6px)'}}>
                    <FaImage size={20} color="#6A1B9A" />
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
                      padding: '6px 10px',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transform: 'translateY(4px)',
                    }}
                  >
                    <FaPaperPlane size={18} />
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
