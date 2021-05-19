import React from "react";
import { useEffect } from "react";

export default function CSRError() {
  useEffect(() => {
    throw new Error('hit!');
  }, []);

  return <h1>This will error</h1>;
}