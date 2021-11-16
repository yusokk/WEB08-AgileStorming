import styled from '@emotion/styled';

export const Wrapper = styled.div`
  background-color: ${({ theme }) => theme.color.bgWhite};
  width: 100%;
  height: 80px;
  ${({ theme }) => theme.flex.row}
  overflow: scroll;
  gap: 1rem;
  align-items: center;
  font-size: 2rem;
  position: relative;
`;

export const IconWrapper = styled.div``;
