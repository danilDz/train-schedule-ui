import React, { useEffect, useState } from "react";
import { redirect, useNavigate } from "react-router-dom";
import cookies from "js-cookie";
import { ApiService } from "../../services/api.service";
import "./Account.scss";
import { Spinner } from "../spinner/Spinner";
import { Error } from "../error/Error";
import { IUserInfo } from "./interfaces/user-info.interface";

export const Account: React.FunctionComponent = () => {
  const [userInfo, setUserInfo] = useState({} as IUserInfo);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    async function getUserInfo() {
      setIsLoading(true);
      setIsError(false);
      const user = await ApiService.getUserInfo();
      if (user.statusCode) {
        setIsLoading(false);
        if (user.statusCode === 403) {
          logout();
        }
        setIsError(true);
        return;
      }
      setUserInfo({ ...user });
      setIsLoading(false);
    }

    getUserInfo();
  }, []);

  async function logout() {
    await ApiService.signout();
    cookies.remove("jwt");
    navigate("/signin");
  }

  if (isError) return <Error />;
  if (isLoading) return <Spinner />;

  return (
    <div className="mainDivAccount">
      <div className="user">
        <div className="image">
          <img src="profile.png" alt="userImage" />
        </div>
        <div className="contactInfo">
          <p>First name: {userInfo.firstName}</p>
          <p>Last name: {userInfo.lastName}</p>
          <p>Email address: {userInfo.email}</p>
          <button className="submit" onClick={logout}>
            Log out
          </button>
        </div>
      </div>
    </div>
  );
};
