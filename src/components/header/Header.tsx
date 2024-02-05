import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { Navigation } from "../navigation/Navigation";
import "./Header.scss";
import { AdminContext } from "../../AdminContext";

export const Header: React.FunctionComponent = () => {
  const isAdmin = useContext(AdminContext);
  console.log(isAdmin);
  if (isAdmin === null) return <Navigate to="/signin" />;
  
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
