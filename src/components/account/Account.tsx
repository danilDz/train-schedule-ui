import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "./Account.scss";
import profileImageSrc from "../../resources/img/profile.png";
import { ApiService } from "../../services/api.service";
import { Spinner } from "../spinner/Spinner";
import { Error } from "../error/Error";
import { IUserInfo } from "./interfaces/user-info.interface";
import { useLogout } from "../../utils/logout";
import { statusCodesForLogout } from "../../variables";

export const Account: React.FunctionComponent = () => {
  const [userInfo, setUserInfo] = useState({} as IUserInfo);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const logout = useLogout();

  useEffect(() => {
    async function getUserInfo() {
      const user = await ApiService.getUserInfo();
      if (user.statusCode) {
        setIsLoading(false);
        if (statusCodesForLogout.includes(user.statusCode)) {
          logout();
        }
        toast.error("Something went wrong!");
        setIsError(true);
        return;
      }
      setUserInfo({ ...user });
      setIsLoading(false);
    }

    getUserInfo();
  }, []);

  if (isError) return <Error />;
  if (isLoading) return <Spinner />;

  return (
    <div className="mainDivAccount">
      <div className="user">
        <div className="image">
          <img src={profileImageSrc} alt="userImage" />
        </div>
        <div className="contactInfo">
          <p>First name: {userInfo.firstName}</p>
          <p>Last name: {userInfo.lastName}</p>
          <p>Email address: {userInfo.email}</p>
          {userInfo.isAdmin ? <p>You are admin!</p> : null}
          <button className="submit" onClick={logout}>
            Log out
          </button>
        </div>
      </div>
    </div>
  );
};
