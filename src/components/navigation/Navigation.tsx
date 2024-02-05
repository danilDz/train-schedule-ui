import React from "react";
import { Link } from "react-router-dom";
import "./Navigation.scss";

export const Navigation: React.FunctionComponent = () => {
  return (
    <nav>
      <Link to="/">Home Page</Link>
      <Link to="/account">Account Page</Link>
    </nav>
  );
};
