import {
  createContext, FC, ReactNode, useContext,
} from 'react';

export const HeadContext = /* @__PURE__ */ createContext<ReactNode[] | undefined>(undefined);

const Head: FC = ({ children }) => {
  const context = useContext(HeadContext);

  if (context) {
    context.push(children);
  }

  return null;
};

export default Head;
