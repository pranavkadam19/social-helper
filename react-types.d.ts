import "react";

declare module "react" {
  interface ReactPortal {
    children?: React.ReactNode;
  }
}
