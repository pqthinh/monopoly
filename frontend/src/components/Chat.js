import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, X, Users } from 'lucide-react';
import '../styles/Chat.css';

const Chat = ({ socket, player }) => {
    const [showChat, setShowChat] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        const handleMessage = (message) => {
            setMessages(prev => [...prev, {
                id: message.id,
                player: message.playerName,
                message: message.message,
                timestamp: message.timestamp,
                isMe: message.playerId === socket.id
            }]);
        };

        const handleError = (error) => {
            console.error('Socket error:', error);
            // Show error to user if needed
        };

        socket.on('message', handleMessage);
        socket.on('error', handleError);

        // Cleanup socket listeners on unmount
        return () => {
            socket.off('message', handleMessage);
            socket.off('error', handleError);
        };
    }, [socket]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            socket.emit('message', {
                playerId: socket.id,
                playerName: player.name,
                message: newMessage.trim(),
                timestamp: new Date().toLocaleTimeString()
            });
            setNewMessage('');
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            sendMessage(e);
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
                {messages.length > 0 && (
                    <span className="chat-badge">{messages.length}</span>
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
                        {messages.length === 0 ? (
                            <div className="no-messages">
                                <MessageCircle size={24} />
                                <p>Chưa có tin nhắn nào...</p>
                                <small>Hãy bắt đầu cuộc trò chuyện!</small>
                            </div>
                        ) : (
                            messages.map((msg) => (
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
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            maxLength={200}
                        />
                        <button 
                            className="send-button"
                            onClick={sendMessage}
                            disabled={!newMessage.trim()}
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