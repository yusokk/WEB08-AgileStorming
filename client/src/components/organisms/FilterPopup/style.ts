import styled from '@emotion/styled';

export const FilterMenuHeader = styled.div`
  ${(props) => props.theme.flex.rowCenter};
  gap: 1rem;
  margin-top: 0.3rem;
  font-weight: bold;
  line-height: 0.8;
  color: ${({ theme }) => theme.color.gray1};

  span {
    cursor: pointer;
  }

  .selected {
    color: ${({ theme }) => theme.color.black};
    text-decoration: underline;
    text-underline-position: under;
  }
`;

export const FilterItem = styled.div`
  font-weight: bold;
  padding: 0.3rem 0.1rem;
  border-radius: 0.2rem;
  cursor: pointer;

  :hover {
    color: ${({ theme }) => theme.color.black};
    background-color: ${({ theme }) => theme.color.gray4};
  }
`;

export const FilterButton = styled.div`
  ${({ theme }) => theme.flex.center};
  padding: 0.1rem 0;
  margin-top: 0.1rem;
  border: 2px dotted ${({ theme }) => theme.color.black};
  border-radius: 0.5rem;
  cursor: pointer;

  :hover {
    color: ${({ theme }) => theme.color.black};
    background-color: ${({ theme }) => theme.color.gray4};
  }
`;

export const SprintItem = styled.div`
  display: grid;
  grid-template-columns: 7.5% 32.5% 60%;
  span {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
`;
