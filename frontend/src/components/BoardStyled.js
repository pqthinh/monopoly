import { styled } from 'styled-components';

export const DiceDisplayArea = styled.div`
            display: flex;
            gap: 20px;
            margin-bottom: 20px;
        `;

const DiceVisual = styled.div`
            width: 80px;
            height: 80px;
            position: relative;
            transform-style: preserve-3d;
            transition: transform 0.2s ease-out;
            ${({ isRolling, value }) => isRolling ? `
                animation: roll 1s cubic-bezier(0.68, -0.55, 0.27, 1.55) infinite;
            ` : `
                transform: ${getFinalTransform(value)};
            `}
        `;

const DiceFace = styled.div`
            width: 80px;
            height: 80px;
            background-color: white;
            border: 2px solid #8b0000;
            border-radius: 10px;
            position: absolute;
            display: flex;
            justify-content: center;
            align-items: center;
            backface-visibility: hidden;
            ${({ face }) => {
        switch (face) {
            case 1: return `transform: translateZ(50px);`;
            case 2: return `transform: rotateY(90deg) translateZ(50px);`;
            case 3: return `transform: rotateY(-90deg) translateZ(50px);`;
            case 4: return `transform: rotateX(90deg) translateZ(50px);`;
            case 5: return `transform: rotateX(-90deg) translateZ(50px);`;
            case 6: return `transform: rotateY(180deg) translateZ(50px);`;
        }
    }}
        `;

const Dot = styled.span`
            width: 16px;
            height: 16px;
            background-color: #8b0000;
            border-radius: 50%;
            position: absolute;
            transform: translate(-50%, -50%);
        `;

const getFinalTransform = (value) => {
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