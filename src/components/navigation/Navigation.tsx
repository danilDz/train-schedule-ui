import React from "react";
import { Link } from "react-router-dom";
import "./Navigation.scss";

export const Navigation: React.FunctionComponent = () => {
  return (
    <nav>
      {/* <div> */}
        <Link to="/">Home Page</Link>
      {/* </div> */}
      {/* <div> */}
        <Link to="/account">Account Page</Link>
      {/* </div> */}
    </nav>
  );
};
