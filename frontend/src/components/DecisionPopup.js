// src/components/DecisionPopup.js
import React from 'react';
import '../styles/Popup.css'; // Tạo file CSS mới cho popup

const DecisionPopup = ({ info, onDecision, onClose }) => {
    if (!info) return null;

    const renderContent = () => {
        switch (info.phase) {
            case 'teleport':
                return (
                    <div>
                        <h3>Ô Ngựa Ô!</h3>
                        <p>Chọn một ô để di chuyển đến:</p>
                        <select onChange={(e) => onDecision({ type: 'teleportTo', payload: { squareId: parseInt(e.target.value) } })}>
                            <option>Chọn điểm đến</option>
                            {info.options.map(sq => <option key={sq.id} value={sq.id}>{sq.name}</option>)}
                        </select>
                    </div>
                );
            case 'festival':
                // Tương tự cho lễ hội, cho phép chọn 1 khu đất sở hữu
                return <div>Lựa chọn cho Lễ Hội...</div>;
            default:
                return null;
        }
    };

    return (
        <div className="popup-overlay">
            <div className="popup-content">
                {renderContent()}
                <button onClick={onClose}>Đóng</button>
            </div>
        </div>
    );
};

export default DecisionPopup;