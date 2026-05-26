import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navigation.scss";
import { ApiService } from "../../services/api.service";
import { UserRole } from "../account/interfaces/user-info.interface";

export const Navigation: React.FunctionComponent = () => {
  const [role, setRole] = useState<UserRole | null>(null);
  const location = useLocation();

  useEffect(() => {
    async function fetchUser() {
      const user = await ApiService.getUserInfo();
      if (!user.statusCode) {
        const r: UserRole =
          user.role ?? (user.isAdmin ? "ADMIN" : "PASSENGER");
        setRole(r);
      }
    }
    fetchUser();
  }, []);

  const isAdmin = role === "ADMIN";

  function active(path: string) {
    return location.pathname === path ? "navLinkActive" : "";
  }

  return (
    <nav>
      <Link to="/dashboard" className={active("/dashboard")}>
        Dashboard
      </Link>
      <Link to="/" className={active("/")}>
        Trains
      </Link>
      <Link to="/stations" className={active("/stations")}>
        Stations
      </Link>
      <Link to="/search" className={active("/search")}>
        Search
      </Link>
      {isAdmin && (
        <Link to="/trains/create" className={active("/trains/create")}>
          Add Train
        </Link>
      )}
      <Link to="/account" className={active("/account")}>
        Account
      </Link>
    </nav>
  );
};

