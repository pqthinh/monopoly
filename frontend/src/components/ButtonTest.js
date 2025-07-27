import React from 'react';
import styled from 'styled-components';

const FantasyButtonStyled = styled.button`
  isolation: isolate;
  position: relative;
  box-sizing: border-box;
  background: transparent;
  outline: none;
  border: none;
  --s: ${(props) => (props.scale ? props.scale / 4.5 : 1 / 4.5)};
  font-size: calc(60px * var(--s));
  font-family: serif;
  min-width: calc(280px * var(--s));
  min-height: calc(200px * var(--s));
  padding-inline: calc(95px * var(--s));
  padding-block: calc(51px * var(--s));
  cursor: pointer;

  --text-color: #aa9b79;
  --text-shadow: calc(1.5px * var(--scale) / 4.5) calc(-1.5px * var(--scale) / 4.5) calc(1.5px * var(--scale) / 4.5) #fffcf2,
    calc(-1.5px * var(--scale) / 4.5) calc(1.5px * var(--scale) / 4.5) calc(1.5px * var(--scale) / 4.5) #160500;
  --border-bg: linear-gradient(to bottom, #bdab8c, #aa9b79 49%, #735b41 51%, #766652);
  --inlay-hover-opacity: 0.75;
  --border-hover-opacity: 0.75;
  --border-focus-bg: repeating-conic-gradient(#bdab8c 0deg 30deg, #766652 30deg 60deg);
  --inlay-bg: radial-gradient(at center 150%, #fffcf2, transparent 35%) 50% 0% / 150% 25% no-repeat,
    radial-gradient(at center -25%, #501608, transparent 35%) 50% 100% / 150% 25% no-repeat,
    linear-gradient(to bottom, #2c201b, #895648 24%, #422419 26% 49%, #291208 49% 74%, #160500 76%, #1a0801);

  color: var(--text-color);
  text-shadow: var(--text-shadow);

  &::before,
  &::after {
    content: "";
    position: absolute;
    inset: 0px;
    box-sizing: border-box;
    pointer-events: none;
    z-index: -1;
  }

  &::before {
    background: var(--inlay-bg);
    opacity: 1;
    clip-path: polygon(
      calc(50px * var(--s)) calc(82px * var(--s)),
      calc(114px * var(--s)) calc(18px * var(--s)),
      calc(100% - 114px * var(--s)) calc(18px * var(--s)),
      calc(100% - 50px * var(--s)) calc(82px * var(--s)),
      calc(100% - 50px * var(--s)) calc(100% - 82px * var(--s)),
      calc(100% - 114px * var(--s)) calc(100% - 18px * var(--s)),
      calc(114px * var(--s)) calc(100% - 18px * var(--s)),
      calc(50px * var(--s)) calc(100% - 82px * var(--s))
    );
    transition: opacity 0.3s ease;
  }

  &::after {
    background: var(--border-bg);
    opacity: 1;
    clip-path: polygon(
      calc(37px * var(--s)) calc(44px * var(--s)),
      calc(52px * var(--s)) calc(29px * var(--s)),
      calc(61px * var(--s)) calc(18px * var(--s)),
      calc(82.5px * var(--s)) calc(39.5px * var(--s)),
      calc(61px * var(--s)) calc(61px * var(--s)),
      0px 0px,
      calc(77px * var(--s)) 0px,
      calc(90px * var(--s)) calc(13px * var(--s)),
      calc(103px * var(--s)) 0px,
      calc(100% - 103px * var(--s)) 0px,
      calc(100% - 90px * var(--s)) calc(13px * var(--s)),
      calc(100% - 77px * var(--s)) 0px,
      100% 0px,
      calc(100% - 61px * var(--s)) calc(61px * var(--s)),
      calc(100% - 82.5px * var(--s)) calc(39.5px * var(--s)),
      calc(100% - 61px * var(--s)) calc(18px * var(--s)),
      calc(100% - 52px * var(--s)) calc(29px * var(--s)),
      calc(100% - 37px * var(--s)) calc(44px * var(--s)),
      calc(100% - 24.5px * var(--s)) calc(56.5px * var(--s)),
      calc(100% - 32.5px * var(--s)) calc(64.5px * var(--s)),
      calc(100% - 32.5px * var(--s)) calc(100% - 64.5px * var(--s)),
      calc(100% - 24.5px * var(--s)) calc(100% - 56.5px * var(--s)),
      calc(100% - 37px * var(--s)) calc(100% - 44px * var(--s)),
      calc(100% - 52px * var(--s)) calc(100% - 29px * var(--s)),
      calc(100% - 61px * var(--s)) calc(100% - 18px * var(--s)),
      calc(100% - 82.5px * var(--s)) calc(100% - 39.5px * var(--s)),
      calc(100% - 61px * var(--s)) calc(100% - 61px * var(--s)),
      100% 100%,
      calc(100% - 77px * var(--s)) 100%,
      calc(100% - 90px * var(--s)) calc(100% - 13px * var(--s)),
      calc(100% - 103px * var(--s)) 100%,
      calc(103px * var(--s)) 100%,
      calc(90px * var(--s)) calc(100% - 13px * var(--s)),
      calc(77px * var(--s)) 100%,
      0px 100%,
      calc(61px * var(--s)) calc(100% - 61px * var(--s)),
      calc(82.5px * var(--s)) calc(100% - 39.5px * var(--s)),
      calc(61px * var(--s)) calc(100% - 18px * var(--s)),
      calc(52px * var(--s)) calc(100% - 29px * var(--s)),
      calc(37px * var(--s)) calc(100% - 44px * var(--s)),
      calc(24.5px * var(--s)) calc(100% - 56.5px * var(--s)),
      calc(32.5px * var(--s)) calc(100% - 64.5px * var(--s)),
      calc(32.5px * var(--s)) calc(64.5px * var(--s)),
      calc(24.5px * var(--s)) calc(56.5px * var(--s)),
      calc(37px * var(--s)) calc(44px * var(--s)),
      calc(45px * var(--s)) calc(52px * var(--s)),
      calc(41px * var(--s)) calc(56px * var(--s)),
      calc(50px * var(--s)) calc(66px * var(--s)),
      calc(40.5px * var(--s)) calc(75.5px * var(--s)),
      calc(40.5px * var(--s)) calc(100% - 75.5px * var(--s)),
      calc(50px * var(--s)) calc(100% - 66px * var(--s)),
      calc(41px * var(--s)) calc(100% - 56px * var(--s)),
      calc(45px * var(--s)) calc(100% - 52px * var(--s)),
      calc(37px * var(--s)) calc(100% - 44px * var(--s)),
      calc(52px * var(--s)) calc(100% - 29px * var(--s)),
      calc(59.5px * var(--s)) calc(100% - 36.5px * var(--s)),
      calc(61px * var(--s)) calc(100% - 35px * var(--s)),
      calc(65.5px * var(--s)) calc(100% - 39.5px * var(--s)),
      calc(61px * var(--s)) calc(100% - 44px * var(--s)),
      calc(25px * var(--s)) calc(100% - 8px * var(--s)),
      calc(72.5px * var(--s)) calc(100% - 8px * var(--s)),
      calc(90px * var(--s)) calc(100% - 25.5px * var(--s)),
      calc(107.5px * var(--s)) calc(100% - 8px * var(--s)),
      calc(100% - 107.5px * var(--s)) calc(100% - 8px * var(--s)),
      calc(100% - 90px * var(--s)) calc(100% - 25.5px * var(--s)),
      calc(100% - 72.5px * var(--s)) calc(100% - 8px * var(--s)),
      calc(100% - 25px * var(--s)) calc(100% - 8px * var(--s)),
      calc(100% - 61px * var(--s)) calc(100% - 44px * var(--s)),
      calc(100% - 65.5px * var(--s)) calc(100% - 39.5px * var(--s)),
      calc(100% - 61px * var(--s)) calc(100% - 35px * var(--s)),
      calc(100% - 59.5px * var(--s)) calc(100% - 36.5px * var(--s)),
      calc(100% - 52px * var(--s)) calc(100% - 29px * var(--s)),
      calc(100% - 37px * var(--s)) calc(100% - 44px * var(--s)),
      calc(100% - 45px * var(--s)) calc(100% - 52px * var(--s)),
      calc(100% - 41px * var(--s)) calc(100% - 56px * var(--s)),
      calc(100% - 50px * var(--s)) calc(100% - 66px * var(--s)),
      calc(100% - 40.5px * var(--s)) calc(100% - 75.5px * var(--s)),
      calc(100% - 40.5px * var(--s)) calc(75.5px * var(--s)),
      calc(100% - 50px * var(--s)) calc(66px * var(--s)),
      calc(100% - 41px * var(--s)) calc(56px * var(--s)),
      calc(100% - 45px * var(--s)) calc(52px * var(--s)),
      calc(100% - 37px * var(--s)) calc(44px * var(--s)),
      calc(100% - 52px * var(--s)) calc(29px * var(--s)),
      calc(100% - 59.5px * var(--s)) calc(36.5px * var(--s)),
      calc(100% - 61px * var(--s)) calc(35px * var(--s)),
      calc(100% - 65.5px * var(--s)) calc(39.5px * var(--s)),
      calc(100% - 61px * var(--s)) calc(44px * var(--s)),
      calc(100% - 25px * var(--s)) calc(8px * var(--s)),
      calc(100% - 72.5px * var(--s)) calc(8px * var(--s)),
      calc(100% - 90px * var(--s)) calc(25.5px * var(--s)),
      calc(100% - 107.5px * var(--s)) calc(8px * var(--s)),
      calc(107.5px * var(--s)) calc(8px * var(--s)),
      calc(90px * var(--s)) calc(25.5px * var(--s)),
      calc(72.5px * var(--s)) calc(8px * var(--s)),
      calc(25px * var(--s)) calc(8px * var(--s)),
      calc(61px * var(--s)) calc(44px * var(--s)),
      calc(65.5px * var(--s)) calc(39.5px * var(--s)),
      calc(61px * var(--s)) calc(35px * var(--s)),
      calc(59.5px * var(--s)) calc(36.5px * var(--s)),
      calc(52px * var(--s)) calc(29px * var(--s)),
      calc(37px * var(--s)) calc(44px * var(--s))
    );
    transition: background 0.3s ease, opacity 0.3s ease;
  }

  &:hover::before {
    opacity: var(--inlay-hover-opacity);
  }

  &:hover::after {
    opacity: var(--border-hover-opacity);
    background: var(--border-focus-bg);
  }

  &:active::before {
    opacity: 0.5;
  }

  &:active::after {
    opacity: 0.5;
    background: var(--border-bg);
  }
`;

const FantasyButton = ({ children, onClick, scale = 1 }) => {
  return (
    <FantasyButtonStyled onClick={onClick} scale={scale}>
      {children}
    </FantasyButtonStyled>
  );
};

export default FantasyButton;