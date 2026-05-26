import { SignupDto } from "./dto/signup.dto";
import { SigninDto } from "./dto/signin.dto";
import Cookies from "js-cookie";
import { IInputTrain } from "../components/editCreateTrain/interfaces/input-train.interface";
import { IInputStation } from "../components/editCreateStation/interfaces/input-station.interface";

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

  // ── Status ────────────────────────────────────────────────────────────────
  static async updateTrainStatus(
    trainId: string,
    status: string,
    delayMinutes?: number
  ) {
    const response = await fetch(`${this.url}/api/trains/${trainId}/status`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${Cookies.get("jwt")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status, delayMinutes }),
    });
    return await response.json();
  }

  // ── Stations ──────────────────────────────────────────────────────────────
  static async getAllStations(
    limit: number,
    offset: number,
    name?: string,
    city?: string
  ) {
    let url = `${this.url}/api/stations?limit=${limit}&offset=${offset}`;
    if (name) url += `&name=${encodeURIComponent(name)}`;
    if (city) url += `&city=${encodeURIComponent(city)}`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${Cookies.get("jwt")}` },
    });
    return await response.json();
  }

  static async getStationById(id: string) {
    const response = await fetch(`${this.url}/api/stations/${id}`, {
      headers: { Authorization: `Bearer ${Cookies.get("jwt")}` },
    });
    return await response.json();
  }

  static async createStation(stationInfo: IInputStation) {
    const response = await fetch(`${this.url}/api/stations`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Cookies.get("jwt")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(stationInfo),
    });
    return await response.json();
  }

  static async updateStationById(
    stationInfo: Partial<IInputStation>,
    stationId: string,
    method: string
  ) {
    const response = await fetch(`${this.url}/api/stations/${stationId}`, {
      method,
      headers: {
        Authorization: `Bearer ${Cookies.get("jwt")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(stationInfo),
    });
    return await response.json();
  }

  static async deleteStationById(id: string) {
    const response = await fetch(`${this.url}/api/stations/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${Cookies.get("jwt")}` },
    });
    return await response.json();
  }

  static async searchStations(query: string) {
    const response = await fetch(
      `${this.url}/api/stations?name=${encodeURIComponent(query)}&limit=8&offset=0`,
      { headers: { Authorization: `Bearer ${Cookies.get("jwt")}` } }
    );
    return await response.json();
  }

  // ── Journey Search ────────────────────────────────────────────────────────
  static async searchJourneys(
    fromStationId: string,
    toStationId: string,
    departureDate: string
  ) {
    const response = await fetch(
      `${this.url}/api/journeys/search?fromStationId=${encodeURIComponent(fromStationId)}&toStationId=${encodeURIComponent(toStationId)}&departureDate=${encodeURIComponent(departureDate)}`,
      { headers: { Authorization: `Bearer ${Cookies.get("jwt")}` } }
    );
    return await response.json();
  }

  // ── Train Stops ───────────────────────────────────────────────────────────
  static async addTrainStop(trainId: string, stop: {
    stationId: string;
    arrivalTime?: string;
    departureTime?: string;
    stopOrder: number;
    platform?: string;
  }) {
    const response = await fetch(`${this.url}/api/trains/${trainId}/stops`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Cookies.get("jwt")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(stop),
    });
    return await response.json();
  }

  static async updateTrainStop(stopId: string, stop: {
    stationId?: string;
    arrivalTime?: string;
    departureTime?: string;
    stopOrder?: number;
    platform?: string;
  }) {
    const response = await fetch(`${this.url}/api/train-stops/${stopId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${Cookies.get("jwt")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(stop),
    });
    return await response.json();
  }

  static async deleteTrainStop(stopId: string) {
    const response = await fetch(`${this.url}/api/train-stops/${stopId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${Cookies.get("jwt")}` },
    });
    if (response.status === 204) return {};
    return await response.json();
  }

  // ── Dashboard ─────────────────────────────────────────────────────────────
  static async getDashboardStats() {
    const response = await fetch(`${this.url}/api/dashboard/stats`, {
      headers: { Authorization: `Bearer ${Cookies.get("jwt")}` },
    });
    return await response.json();
  }

  // ── Seats / Carriages ─────────────────────────────────────────────────────
  static async getTrainSeats(trainId: string) {
    const response = await fetch(
      `${this.url}/api/trains/${trainId}/seats`,
      { headers: { Authorization: `Bearer ${Cookies.get("jwt")}` } }
    );
    return await response.json();
  }

  static async getTrainCarriages(trainId: string) {
    const response = await fetch(
      `${this.url}/api/trains/${trainId}/carriages`,
      { headers: { Authorization: `Bearer ${Cookies.get("jwt")}` } }
    );
    return await response.json();
  }

  static async createCarriage(
    trainId: string,
    data: { carriageNumber: number; type: string; totalSeats: number }
  ) {
    const response = await fetch(`${this.url}/api/trains/${trainId}/carriages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Cookies.get("jwt")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return await response.json();
  }

  static async updateCarriage(
    id: string,
    data: { carriageNumber?: number; type?: string; totalSeats?: number }
  ) {
    const response = await fetch(`${this.url}/api/carriages/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${Cookies.get("jwt")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return await response.json();
  }

  static async deleteCarriage(id: string) {
    const response = await fetch(`${this.url}/api/carriages/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${Cookies.get("jwt")}` },
    });
    if (response.status === 204) return {};
    return await response.json();
  }

  // ── Bookings ──────────────────────────────────────────────────────────────
  static async reserveSeat(seatId: string) {
    const response = await fetch(`${this.url}/api/bookings/reserve`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Cookies.get("jwt")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ seatId }),
    });
    return await response.json();
  }

  static async getMyBookings(page = 1, limit = 5) {
    const response = await fetch(
      `${this.url}/api/bookings/my?page=${page}&limit=${limit}`,
      { headers: { Authorization: `Bearer ${Cookies.get("jwt")}` } },
    );
    return await response.json();
  }

  static async getBookingById(id: string) {
    const response = await fetch(`${this.url}/api/bookings/${id}`, {
      headers: { Authorization: `Bearer ${Cookies.get("jwt")}` },
    });
    return await response.json();
  }

  static async cancelBooking(id: string) {
    const response = await fetch(`${this.url}/api/bookings/${id}/cancel`, {
      method: "POST",
      headers: { Authorization: `Bearer ${Cookies.get("jwt")}` },
    });
    return await response.json();
  }

  // ── Payments ──────────────────────────────────────────────────────────────
  static async createCheckoutSession(bookingId: string) {
    const response = await fetch(
      `${this.url}/api/payments/create-checkout-session`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${Cookies.get("jwt")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bookingId }),
      }
    );
    return await response.json();
  }

  // ── Tickets ───────────────────────────────────────────────────────────────
  static async getTicketByBookingId(bookingId: string) {
    const response = await fetch(
      `${this.url}/api/tickets/booking/${bookingId}`,
      { headers: { Authorization: `Bearer ${Cookies.get("jwt")}` } }
    );
    return await response.json();
  }
}

