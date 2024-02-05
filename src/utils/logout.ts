import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import cookies from "js-cookie";
import { ApiService } from "../services/api.service";
import { AdminDispatchContext } from "../AdminContext";

export function useLogout() {
  const navigate = useNavigate();
  const dispatch = useContext(AdminDispatchContext);
  return async function logout() {
    await ApiService.signout();
    dispatch({value: null!});
    cookies.remove("jwt");
    navigate("/signin");
  };
}
