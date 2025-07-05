// src/components/Popup.js
import React from 'react';

const Popup = ({ message }) => {
    if (!message) return null;

    return (
        <div className="game-message-popup">
            {message.split('\n').map((line, i) => <p key={i}>{line}</p>)}
        </div>
    );
};

export default Popup;