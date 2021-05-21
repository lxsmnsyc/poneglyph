import React, { FC, useEffect, useState } from 'react';

const ClientOnly: FC = ({ children }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);
  }, []);

  if (show) {
    return <>{children}</>;
  }
  return null;
};

export default ClientOnly;
