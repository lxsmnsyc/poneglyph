import {
  createContext, FC, ReactNode, useContext,
} from 'react';

export const TailContext = createContext<ReactNode[] | undefined>(undefined);

const Tail: FC = ({ children }) => {
  const context = useContext(TailContext);

  if (context) {
    context.push(children);
  }

  return null;
};

export default Tail;
