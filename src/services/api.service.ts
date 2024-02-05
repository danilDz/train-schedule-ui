import { SignupDto } from "./dto/signup.dto";
import { SigninDto } from "./dto/signin.dto";
import Cookies from "js-cookie";

export class ApiService {
  private static url = process.env.REACT_APP_SERVER_URL!;

  static async signup(userInfo: SignupDto) {
    const response = await fetch(`${this.url}/api/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...userInfo, isAdmin: true }),
    });
    if (response.status === 201) return await response.text();
    return await response.json();
  }

  static async signin(userInfo: SigninDto) {
    const response = await fetch(`${this.url}/api/auth/signin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...userInfo }),
    });
    if (response.status === 201) return await response.text();
    return await response.json();
  }

  static async signout() {
    const response = await fetch(`${this.url}/api/auth/signout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Cookies.get("jwt")}`,
      },
    });
    return await response.json();
  }

  static async getUserInfo() {
    const response = await fetch(`${this.url}/api/auth/check`, {
      headers: {
        Authorization: `Bearer ${Cookies.get("jwt")}`,
      },
    });
    return await response.json();
  }

  static async getAllTrains() {
    const response = await fetch(`${this.url}/api/trains`, {
      headers: {
        Authorization: `Bearer ${Cookies.get("jwt")}`,
      },
    });
    return await response.json();
  }

  static async getTrainInfoById(id: string) {
    const response = await fetch(`${this.url}/api/trains/${id}`, {
      headers: {
        Authorization: `Bearer ${Cookies.get("jwt")}`
      }
    });
    return await response.json();
  }
}
