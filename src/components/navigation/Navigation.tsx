import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Navigation.scss";
import { ApiService } from "../../services/api.service";

export const Navigation: React.FunctionComponent = () => {
  const [isAdmin, setIsAdmin] = useState<boolean>(null!);

  useEffect(() => {
    async function fetchUser() {
      const user = await ApiService.getUserInfo();
      setIsAdmin(user.isAdmin);
    }
    fetchUser();
  }, []);

  return (
    <nav>
      <Link to="/">Home Page</Link>
      {isAdmin ? <Link to="/trains/create">Add new train</Link> : null}
      <Link to="/account">Account Page</Link>
    </nav>
  );
};
