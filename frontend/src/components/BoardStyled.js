import styled, { keyframes, css } from 'styled-components';

const rollAnimation = keyframes`
  0% {
    transform: translateY(0) rotateX(0) rotateY(0) rotateZ(0);
    animation-timing-function: cubic-bezier(0.2, 0.8, 0.8, 0.2);
  }
  20% {
    transform: translateY(-30px) rotateX(180deg) rotateY(180deg) rotateZ(90deg);
    animation-timing-function: cubic-bezier(0.1, 0.3, 0.7, 0.1);
  }
  40% {
    transform: translateY(0) rotateX(360deg) rotateY(360deg) rotateZ(180deg);
    animation-timing-function: cubic-bezier(0.2, 0.8, 0.8, 0.2);
  }
  60% {
    transform: translateY(-15px) rotateX(540deg) rotateY(540deg) rotateZ(270deg);
    animation-timing-function: cubic-bezier(0.1, 0.3, 0.7, 0.1);
  }
  80% {
    transform: translateY(0) rotateX(720deg) rotateY(720deg) rotateZ(360deg);
    animation-timing-function: cubic-bezier(0.2, 0.8, 0.8, 0.2);
  }
  100% {
    transform: translateY(0) rotateX(900deg) rotateY(900deg) rotateZ(450deg);
  }
`;

// Hiệu ứng nảy khi kết thúc
const bounceAnimation = keyframes`
  0%, 20%, 50%, 80%, 100% {transform: translateY(0);}
  40% {transform: translateY(-20px);}
  60% {transform: translateY(-10px);}
`;

export const DiceDisplayArea = styled.div`
  display: flex;
  gap: 25px;
  margin-bottom: 30px;
  justify-content: center;
  perspective: 1000px;
`;

export const DiceVisual = styled.div`
  width: 80px;
  height: 80px;
  position: relative;
  transform-style: preserve-3d;
  
  ${({ isRolling, value }) => isRolling 
    ? css`
        animation: ${rollAnimation} 1.5s cubic-bezier(0.68, -0.55, 0.27, 1.55) forwards;
      ` 
    : css`
        transform: ${getFinalTransform(value)};
        animation: ${bounceAnimation} 0.8s ease;
      `
  }
`;

export const DiceFace = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(145deg, #ffffff, #f0f0f0);
  border: 2px solid #7a0a0a;
  border-radius: 12px;
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  backface-visibility: hidden;
  box-shadow: 
    inset 2px 2px 5px rgba(0,0,0,0.1),
    inset -2px -2px 5px rgba(255,255,255,0.8),
    0 3px 8px rgba(0,0,0,0.2);
  
  ${({ face }) => {
    switch (face) {
      case 1: return `transform: translateZ(40px);`;
      case 2: return `transform: rotateY(90deg) translateZ(40px);`;
      case 3: return `transform: rotateY(-90deg) translateZ(40px);`;
      case 4: return `transform: rotateX(90deg) translateZ(40px);`;
      case 5: return `transform: rotateX(-90deg) translateZ(40px);`;
      case 6: return `transform: rotateY(180deg) translateZ(40px);`;
      default: return '';
    }
  }}
`;

export const Dot = styled.span`
  width: 16px;
  height: 16px;
  background: radial-gradient(circle at 30% 30%, #ff4d4d, #b30000);
  border-radius: 50%;
  position: absolute;
  transform: translate(-50%, -50%);
  box-shadow: 
    0 1px 3px rgba(0,0,0,0.3),
    inset 1px 1px 2px rgba(255,255,255,0.4);
`;

export const getFinalTransform = (value) => {
  switch (value) {
    case 1: return `rotateX(0deg) rotateY(0deg)`;
    case 2: return `rotateY(-90deg)`;
    case 3: return `rotateY(90deg)`;
    case 4: return `rotateX(-90deg)`;
    case 5: return `rotateX(90deg)`;
    case 6: return `rotateY(180deg)`;
    default: return `rotateX(0deg) rotateY(0deg)`;
  }
};


const DiceFaceContent = ({ value }) => {
    const dotPositions = {
        1: [{ top: '50%', left: '50%' }],
        2: [{ top: '25%', left: '25%' }, { top: '75%', left: '75%' }],
        3: [{ top: '25%', left: '25%' }, { top: '50%', left: '50%' }, { top: '75%', left: '75%' }],
        4: [{ top: '25%', left: '25%' }, { top: '25%', left: '75%' }, { top: '75%', left: '25%' }, { top: '75%', left: '75%' }],
        5: [{ top: '25%', left: '25%' }, { top: '25%', left: '75%' }, { top: '50%', left: '50%' }, { top: '75%', left: '25%' }, { top: '75%', left: '75%' }],
        6: [
            { top: '25%', left: '25%' }, { top: '25%', left: '50%' }, { top: '25%', left: '75%' },
            { top: '75%', left: '25%' }, { top: '75%', left: '50%' }, { top: '75%', left: '75%' }
        ]
    };

    return (
        <>
            {value > 0 && dotPositions[value]?.map((pos, index) => (
                <Dot key={index} style={{ top: pos.top, left: pos.left }} />
            ))}
        </>
    );
};

export const Dice = ({ value, isRolling }) => {
    return (
        <DiceVisual className="dice-visual" isRolling={isRolling} value={value}>
            {[1, 2, 3, 4, 5, 6].map(face => (
                <DiceFace key={face} face={face}>
                    <DiceFaceContent value={value === face ? value : 0} />
                </DiceFace>
            ))}
        </DiceVisual>
    );
};