import React from 'react';
import styled from 'styled-components';

const BaseButton = styled.button`
  font-family: 'TextFont' !important;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 1.5em;
  font-size: 1.2em;
  font-weight: bold;
  border-radius: 1em;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
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
  background: #b8860b;
  color: #8b0000;
  border: 2px solid #8b0000;
  background-size: fit-content;
`;

const RedControlButton = styled(BaseButton)`
  background: #8b0000;
  color: #b8860b;
  border: 2px solid #8b0000;
  background-size: fit-content;
`;

const InfoButton = styled(BaseButton)`
  background: #8b0000;
  color: #b8860b;
  border: 2px solid #8b0000;
  justify-content: space-between;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(255, 0, 0, 0.4);
  }
`;

const Label = styled.span`
  font-weight: bold;
  margin-right: auto;
`;

const Value = styled.span`
  font-weight: bold;
`;

export const Button = ({ variant = 'control', label, value, icon: Icon, children, ...props }) => {
  if (variant === 'info') {
    return (
      <InfoButton {...props}>
        {Icon}
        <Label>{label}</Label>
        <Value>{value}</Value>
      </InfoButton>
    );
  }

  return (
    <ControlButton {...props}>
      {Icon}
      {children}
    </ControlButton>
  );
};

export const RedButton = ({ children, onClick, ...props }) => {
  return (
    <RedControlButton onClick={onClick} {...props}>
      {children}
    </RedControlButton>
  );
}