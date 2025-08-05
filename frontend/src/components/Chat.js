import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, X, Users } from 'lucide-react';
import '../styles/Chat.css';

const Chat = ({ player, socket }) => {
    const [showChat, setShowChat] = useState(false);
    const [chatMessage, setChatMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([]);

    useEffect(() => {
        if (socket) {
            // Listen for incoming chat messages
            socket.on('chatMessage', (message) => {
                setChatHistory(prev => [...prev, {
                    id: message.id,
                    player: message.playerName,
                    message: message.message,
                    timestamp: message.timestamp,
                    isMe: message.playerId === socket.id
                }]);
            });

            // Cleanup socket listeners on unmount
            return () => {
                socket.off('chatMessage');
            };
        }
    }, [socket]);

    const handleSendMessage = () => {
        if (chatMessage.trim() && socket) {
            // Send message through socket
            socket.emit('sendChatMessage', {
                message: chatMessage.trim()
            });
            setChatMessage('');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    return (
        <div className="chat-container">
            <button 
                className="chat-toggle-button"
                onClick={() => setShowChat(!showChat)}
            >
                <MessageCircle size={16} />
                <span>Thảo luận</span>
                {chatHistory.length > 0 && (
                    <span className="chat-badge">{chatHistory.length}</span>
                )}
            </button>
            
            {showChat && (
                <div className="chat-panel">
                    <div className="chat-header">
                        <div className="chat-title">
                            <Users size={16} />
                            <span>Thảo luận</span>
                        </div>
                        <button 
                            className="chat-close-button"
                            onClick={() => setShowChat(false)}
                        >
                            <X size={16} />
                        </button>
                    </div>
                    
                    <div className="chat-messages">
                        {chatHistory.length === 0 ? (
                            <div className="no-messages">
                                <MessageCircle size={24} />
                                <p>Chưa có tin nhắn nào...</p>
                                <small>Hãy bắt đầu cuộc trò chuyện!</small>
                            </div>
                        ) : (
                            chatHistory.map((msg) => (
                                <div key={msg.id} className={`chat-message ${msg.isMe ? 'my-message' : ''}`}>
                                    <div className="message-header">
                                        <strong className="player-name">{msg.player}</strong>
                                        <span className="message-time">{msg.timestamp}</span>
                                    </div>
                                    <div className="message-content">{msg.message}</div>
                                </div>
                            ))
                        )}
                    </div>
                    
                    <div className="chat-input">
                        <input
                            type="text"
                            placeholder="Nhập tin nhắn..."
                            value={chatMessage}
                            onChange={(e) => setChatMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            maxLength={200}
                        />
                        <button 
                            className="send-button"
                            onClick={handleSendMessage}
                            disabled={!chatMessage.trim()}
                        >
                            <Send size={14} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chat;