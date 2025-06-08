import React, { useState, useEffect, useContext } from 'react';
import { MyContext } from '../../App';
import { fetchDataFromApi, putData, postData2 } from '../../utils/api';
import { FaArrowLeft, FaPaperPlane, FaImage, FaSmile  } from 'react-icons/fa';
import { useRef } from 'react';
import { io } from 'socket.io-client';
import EmojiPicker from 'emoji-picker-react';

export default function AdminChat() {
  const { user } = useContext(MyContext);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const socketRef = useRef();
  const [imageFile, setImageFile] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const endRef = useRef();

  const isSameDay = (d1, d2) =>
    d1.getFullYear()===d2.getFullYear() &&
    d1.getMonth()===d2.getMonth() &&
    d1.getDate()===d2.getDate();

  const formatDateHeader = date => {
    const dd = String(date.getDate()).padStart(2,'0');
    const mm = String(date.getMonth()+1).padStart(2,'0');
    const yyyy = date.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  const formatTime = date =>
    date.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}); 


  useEffect(() => {
    socketRef.current = io(process.env.REACT_APP_BASE_URL, {
      query: { userId: user.userId },
    });

    // 2) Lắng nghe event newMessage
    socketRef.current.on('newMessage', msg => {
      // chỉ thêm nếu message từ đúng client đang chat
      if (selectedClient && msg.senderId === selectedClient._id) {
        setMessages(m => [...m, msg]);
      }
      const idx = clients.findIndex(c => c._id===msg.senderId);
      if (idx > -1 && msg.senderRole==='client' && (!selectedClient || msg.senderId!==selectedClient._id)) {
        setClients(clients.map((c,i) => i===idx
          ? {...c, unreadCount: (c.unreadCount||0)+1} 
          : c
        ));
      }
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [user.userId, selectedClient, clients]);
  
  // 1) Lấy danh sách các client đã chat với admin
  useEffect(() => {

    fetchDataFromApi('/api/messages/users')
      .then(async data => {
          // nạp unreadCount cho từng client
          const withBadge = await Promise.all(data?.map(async c => {
            const { unreadCount } = await fetchDataFromApi(
              `/api/messages/count/unread-admin/${c._id}`
            );
            return {...c, unreadCount};
          }));
          setClients(withBadge);
        })
      .catch(console.error);
      // .then(data => setClients(data))
      // .catch(err => console.error('Error fetching clients:', err));
  }, []);
  
  // 2) Khi chọn client, load history
  useEffect(() => {
    if (!selectedClient) return;
    fetchDataFromApi(`/api/messages/${selectedClient._id}`)
      .then(msgs => setMessages(msgs))
      .catch(err => console.error('Error fetching history:', err));
    putData(`/api/messages/count/markread-admin/${selectedClient._id}`, {})
      .catch(console.error);

    setClients(clients.map(c =>
      c._id===selectedClient._id ? {...c, unreadCount:0} : c
    ));
    
  }, [selectedClient]);

  useEffect(() => {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
  // 3) Gửi tin nhắn

  const sendMessage = async () => {
    if (!draft.trim() && !imageFile) return;
    const form = new FormData();

    form.append('text', draft);
    if (imageFile) form.append('image', imageFile);
    console.log(Object.fromEntries(form.entries()))

    try {
      // const payload = { text: draft };
      // endpoint: POST http://localhost:8000/api/messages/send/:id
      const msg = await postData2(`/api/messages/send/${selectedClient._id}`, form);
      setMessages(m => [...m, msg]);
      setDraft('');
      setImageFile(null);
      setShowEmojiPicker(false);
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const onImageChange = e => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
    }
  };

  const onEmojiClick = (emojiData) => {
    setDraft(d => d + emojiData.emoji);
  };
  
  return (
    <div style={{
      height: 'calc(100vh - 64px)',
      display: 'flex',
      marginTop: '64px',
      overflow: 'hidden'   }}>
      {/* Sidebar client list */}


        <div style={{
          width: 280, borderRight: '1px solid #ddd',
          overflowY: 'auto', padding: 16
        }}>
          <h4>Clients</h4>
          <ul style={{listStyle:'none',padding:0}}>
            {clients?.map(c => (
              <li key={c._id}
                  onClick={()=>setSelectedClient(c)}
                  style={{
                    display:'flex',
                    justifyContent:'space-between',
                    padding:'8px',
                    cursor:'pointer',
                    background:selectedClient?._id===c._id? '#f0f0f0':'transparent',
                    fontWeight:c.unreadCount>0?'bold':'normal'
                  }}>
                <span>{c.name} {c.email}</span>
                {c.unreadCount>0 && (
                  <span style={{
                    background:'red', color:'white',
                    borderRadius:'50%',width:20,height:20,
                    display:'flex',alignItems:'center',
                    justifyContent:'center',fontSize:12
                  }}>{c.unreadCount}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
    
        {/* Chat area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden'}}>
          {!selectedClient ?(
            <div style={{ margin: 'auto', color: '#888', fontStyle: 'italic' }}>Chọn một client để xem tin nhắn</div>
          ) : (
            <>
              <div style={{
                padding: '12px 16px',
                borderBottom: '1px solid #ddd',
                display: 'flex',
                alignItems: 'center',
                flex: '0 0 auto'
              }}>
                <button onClick={() => setSelectedClient(null)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          marginRight: 12
                        }}>
                  <FaArrowLeft size={18} />
                </button>
                <h4 style={{ textAlign: 'center', margin: 0  }}>
                  {selectedClient.name}
                </h4>
              </div>
                
    
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '16px',
              }}>
                {messages?.map((m, i) => {
                  const msgDate = new Date(m.createdAt);
                  const prev = i>0 ? new Date(messages[i-1].createdAt) : null;
                  const showDate = i===0 || !isSameDay(msgDate,prev);
                  
                  return(
                    <React.Fragment key={m._id||i}>
                      {showDate && (
                        <div style={{
                          textAlign:'center', margin:'12px 0',
                          color:'#666',fontSize:'0.85em'
                        }}>
                          {formatDateHeader(msgDate)}
                        </div>
                      )}
                      <div style={{
                        display:'flex',
                        justifyContent: ['mainAdmin', 'storeAdmin','staff'].includes(m.senderRole)?'flex-end':'flex-start',
                        margin:'6px 0'
                      }}>
                        <div style={{
                          background:['mainAdmin', 'storeAdmin','staff'].includes(m.senderRole)?'#6A1B9A':'#eee',
                          color:['mainAdmin', 'storeAdmin','staff'].includes(m.senderRole)?'white':'black',
                          padding:'8px 12px', borderRadius:16,
                          maxWidth:'70%',wordBreak:'break-word'
                        }}>
                          {m.text}
                          {m.image && (
                            <img
                              src={m.image}
                              alt=""
                              style={{
                                display:'block',maxWidth:'100%',
                                borderRadius:8,marginTop:6
                              }}
                            />
                          )}
                          <div style={{
                            textAlign:'right',fontSize:'0.75em',
                            marginTop:4,
                            color:['mainAdmin', 'storeAdmin','staff'].includes(m.senderRole)
                              ?'rgba(255,255,255,0.7)':'#999'
                          }}>
                            {formatTime(msgDate)}
                          </div>
                        </div>
                      </div>
                    </React.Fragment>
                  );     
                  })}
                  <div ref={endRef} />
                </div>
      
                {/* Input */}
                <div style={{
                  padding: '12px 16px',
                  borderTop: '1px solid #ddd',
                  flex: '0 0 auto',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  {/* <div style={{ position: 'relative', marginRight:8 }}> */}
                    <button
                      onClick={() => setShowEmojiPicker(v => !v)}
                      style={{
                        width: 32, height: 32,
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'none',
                        border: 'none',  
                        cursor: 'pointer',
                        flexShrink: 0,
                        transform: 'translateY(-4px)',
                      }}
                    ><FaSmile size={20} color="#6A1B9A" /></button>
                    {showEmojiPicker && (
                      <div style={{
                        position: 'absolute',
                        bottom: '120%',
                        right: -50,
                        zIndex: 1000
                      }}>
                        <EmojiPicker
                          onEmojiClick={onEmojiClick}
                          disableAutoFocus
                          native
                          pickerStyle={{ boxShadow: '0 2px 8px rgba(0,0,0,0.15)', maxHeight:250, overflowY:'auto' }}
                        />
                      </div>
                    )}
                  {/* </div> */}
                  <label style={{width: 32, height: 32, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, padding: 0, }}>
                    <FaImage size={20} color="#6A1B9A" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={onImageChange}
                      style={{ display: 'none' }}
                    />
                  </label>
                  <textarea
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder="Type a message..."
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: 20,
                      border: '1px solid #ccc',
                      resize: 'none',
                      maxHeight: 100,
                      lineHeight: 1.4,
                      overflowY: 'auto',  
                    }}
                  />
                  <button
                    onClick={sendMessage}
                    style={{
                      width: 32, height: 32,
                      background: '#6A1B9A',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 16,
                      padding: 0,
                      color: 'white',
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                  >
                    <FaPaperPlane size={16}/>
                  </button>
                </div>
                {imageFile && (
                  <div style={{
                    padding: '0 16px 12px', display: 'flex', alignItems: 'center'
                  }}>
                    <img
                      src={URL.createObjectURL(imageFile)}
                      alt="preview"
                      style={{ maxHeight: 60, borderRadius: 8, marginRight: 8 }}
                    />
                    <button
                      onClick={() => setImageFile(null)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#f44336',
                        cursor: 'pointer'
                      }}
                    >×</button>
                  </div>
              )}
            </>
          )}
        </div>
    </div>
  );
}

