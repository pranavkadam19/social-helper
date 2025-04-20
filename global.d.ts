import "react";

declare global {
  namespace React {
    interface ReactPortal {
      children?: React.ReactNode;
    }
  }
}

export {};
