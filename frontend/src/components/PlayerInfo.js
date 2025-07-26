import React from 'react';
import '../styles/PlayerInfo.css'; // We will create this new CSS file

const PlayerInfo = ({ players, currentPlayerId }) => {
  return (
    <div className="player-info-container">
      <h2>Players</h2>
      {players.map(player => (
        <div
          key={player.id}
          className={`player-card ${player.id === currentPlayerId ? 'active' : ''}`}
          style={{ '--player-color': player.color }}
        >
          <div className="player-header">
            <span className="player-name">{player.name}</span>
            <span className="player-money">${player.money}</span>
          </div>
          <div className="player-properties">
            <strong>Properties owned:</strong>
            {player.properties.length > 0 ? (
                <small> Tile IDs: {player.properties.join(', ')}</small>
            ) : (
                <p><small>No properties</small></p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PlayerInfo;