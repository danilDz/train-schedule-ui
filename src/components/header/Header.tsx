import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import cookies from "js-cookie";
import "./Header.scss";
import { Navigation } from "../navigation/Navigation";

export const Header: React.FunctionComponent = () => {
  if (!cookies.get("jwt")) return <Navigate to="/signin" />;
  
  return (
    <>
      <header>
        <div className="appTitle">
          <h2>Train Schedule Application</h2>
        </div>
        <Navigation />
      </header>
      <Outlet />
    </>
  );
};
