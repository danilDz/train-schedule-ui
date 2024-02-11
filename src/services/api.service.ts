import { SignupDto } from "./dto/signup.dto";
import { SigninDto } from "./dto/signin.dto";
import Cookies from "js-cookie";
import { IInputTrain } from "../components/editCreateTrain/interfaces/input-train.interface";

export class ApiService {
  private static url = process.env.REACT_APP_SERVER_URL!;

  static async signup(userInfo: SignupDto) {
    const response = await fetch(`${this.url}/api/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...userInfo, isAdmin: false }),
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

  static async getAllTrains(limit: number, offset: number) {
    const response = await fetch(
      `${this.url}/api/trains?limit=${limit}&offset=${offset}`,
      {
        headers: {
          Authorization: `Bearer ${Cookies.get("jwt")}`,
        },
      }
    );
    return await response.json();
  }

  static async getTrainInfoById(id: string) {
    const response = await fetch(`${this.url}/api/trains/${id}`, {
      headers: {
        Authorization: `Bearer ${Cookies.get("jwt")}`,
      },
    });
    return await response.json();
  }

  static async deleteTrainById(id: string) {
    const response = await fetch(`${this.url}/api/trains/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${Cookies.get("jwt")}`,
      },
    });
    return await response.json();
  }

  static async createTrain(trainInfo: IInputTrain) {
    const response = await fetch(`${this.url}/api/trains`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Cookies.get("jwt")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(trainInfo),
    });
    return await response.json();
  }

  static async updateTrainById(
    trainInfo: Partial<IInputTrain>,
    trainId: string,
    method: string
  ) {
    const response = await fetch(`${this.url}/api/trains/${trainId}`, {
      method,
      headers: {
        Authorization: `Bearer ${Cookies.get("jwt")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(trainInfo),
    });
    return await response.json();
  }
}
