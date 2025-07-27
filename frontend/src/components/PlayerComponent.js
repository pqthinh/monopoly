import styled, { css } from 'styled-components';

// Base button styles
const BaseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px 24px;
  font-size: 1.2em;
  font-weight: bold;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  border: none;
  width: ${props => props.fullWidth ? '100%' : 'auto'};

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  svg {
    width: 24px;
    height: 24px;
  }
`;

const ControlButton = styled(BaseButton)`
  background: #FFD700;
  color: #FF0000;
  border: 2px solid #FFD700;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(255, 215, 0, 0.4);
  }

  svg {
    color: #FF0000;
  }
`;

const InfoButton = styled(BaseButton)`
  background: #FF0000;
  color: #FFD700;
  border: 2px solid #FF0000;
  justify-content: space-between;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(255, 0, 0, 0.4);
  }

  svg {
    color: #FFD700;
  }
`;

const Label = styled.span`
  font-weight: bold;
  margin-right: auto;
`;

const Value = styled.span`
  font-weight: bold;
`;

const PlayerComponent = ({ name, amount, avatar, ...props }) => {
  
  return (
    <div className="player-header">
        <span className="player-name">{player.name}</span>
        <span className="player-money">${player.money}</span>
        </div>
  );
};

export default PlayerComponent;