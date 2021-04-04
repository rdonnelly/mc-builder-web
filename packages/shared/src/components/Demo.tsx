import React from 'react';
import styled from 'styled-components/native';

const Demo = () => {
  return <DemoText>Demo Component</DemoText>;
};

const DemoText = styled.Text`
  font-size: 24px;
  font-weight: ${({ theme }) => theme.fontWeight.black};
  text-align: center;
`;

export default Demo;
