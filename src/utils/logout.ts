import { useNavigate } from "react-router-dom";
import cookies from "js-cookie";
import { ApiService } from "../services/api.service";

export function useLogout() {
  const navigate = useNavigate();
  return async function logout() {
    await ApiService.signout();
    cookies.remove("jwt");
    navigate("/signin");
  };
}
