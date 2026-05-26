import { useState, useEffect } from "react";
import { ApiService } from "../services/api.service";
import {
  IUserInfo,
  UserRole,
} from "../components/account/interfaces/user-info.interface";
import { useLogout } from "../utils/logout";
import { statusCodesForLogout } from "../variables";

export function useAuth() {
  const [userInfo, setUserInfo] = useState<IUserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const logout = useLogout();

  useEffect(() => {
    async function fetchUser() {
      const user = await ApiService.getUserInfo();
      if (user.statusCode) {
        if (statusCodesForLogout.includes(user.statusCode)) logout();
        setLoading(false);
        return;
      }
      setUserInfo(user);
      setLoading(false);
    }
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const role: UserRole =
    userInfo?.role ?? (userInfo?.isAdmin ? "ADMIN" : "PASSENGER");
  const isAdmin = role === "ADMIN";
  const isDispatcher = role === "DISPATCHER" || role === "ADMIN";

  return { userInfo, role, isAdmin, isDispatcher, loading };
}
