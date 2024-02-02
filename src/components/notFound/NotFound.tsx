import React from "react";
import { Link } from "react-router-dom";
import "./NotFound.scss";
import { Error } from "../error/Error";

export const NotFound: React.FunctionComponent = () => {
  return (
    <div className="divNotFound">
      <Error/>
      <h2>This page wasn't found!</h2>
      <p>Link to home page: <Link to="/">link</Link></p>
    </div>
  );
};
