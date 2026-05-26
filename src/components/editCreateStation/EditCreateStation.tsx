import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import _ from "lodash";
import "./EditCreateStation.scss";
import { IInputStation } from "./interfaces/input-station.interface";
import { ApiService } from "../../services/api.service";
import { useLogout } from "../../utils/logout";
import { Error } from "../error/Error";
import { Spinner } from "../spinner/Spinner";
import { statusCodesForLogout } from "../../variables";

const initialState: IInputStation = {
  name: "",
  city: "",
  code: "",
  platformCount: "",
  latitude: "",
  longitude: "",
};

export const EditCreateStation: React.FC = () => {
  const location = useLocation();
  const { stationId } = useParams();
  const [input, setInput] = useState<IInputStation>(initialState);
  const [fetched, setFetched] = useState<IInputStation>(initialState);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const logout = useLogout();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchStation() {
      const user = await ApiService.getUserInfo();
      if (statusCodesForLogout.includes(user?.statusCode)) logout();
      if (!user.isAdmin && user.role !== "ADMIN") {
        navigate("/notfound");
        return;
      }
      if (stationId) {
        const data = await ApiService.getStationById(stationId);
        if (data.statusCode) {
          setIsLoading(false);
          if (statusCodesForLogout.includes(data.statusCode)) logout();
          toast.error("Failed to load station.");
          setIsError(true);
          return;
        }
        const mapped: IInputStation = {
          name: data.name,
          city: data.city,
          code: data.code,
          platformCount: data.platformCount,
          latitude: data.latitude,
          longitude: data.longitude,
        };
        setInput(mapped);
        setFetched(mapped);
      }
      setIsLoading(false);
    }
    fetchStation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  function removeInvalid() {
    document
      .querySelectorAll(".invalidInput")
      .forEach((el) => el.classList.remove("invalidInput"));
  }

  function validate(): string[] {
    const errors: string[] = [];
    if (!input.name.toString().trim() || input.name.toString().length < 2) {
      document.querySelector("#stName")?.classList.add("invalidInput");
      errors.push("Station name must be at least 2 characters.");
    }
    if (!input.city.toString().trim()) {
      document.querySelector("#stCity")?.classList.add("invalidInput");
      errors.push("City is required.");
    }
    if (!input.code.toString().trim() || input.code.toString().length < 2) {
      document.querySelector("#stCode")?.classList.add("invalidInput");
      errors.push("Station code must be at least 2 characters.");
    }
    const pc = Number(input.platformCount);
    if (isNaN(pc) || pc < 1 || pc > 50) {
      document.querySelector("#stPlatformCount")?.classList.add("invalidInput");
      errors.push("Platform count must be between 1 and 50.");
    }
    const lat = Number(input.latitude);
    if (isNaN(lat) || lat < -90 || lat > 90) {
      document.querySelector("#stLatitude")?.classList.add("invalidInput");
      errors.push("Latitude must be between -90 and 90.");
    }
    const lon = Number(input.longitude);
    if (isNaN(lon) || lon < -180 || lon > 180) {
      document.querySelector("#stLongitude")?.classList.add("invalidInput");
      errors.push("Longitude must be between -180 and 180.");
    }
    return errors;
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    removeInvalid();
    const errors = validate();
    if (errors.length) {
      errors.forEach((e) => toast.error(e));
      return;
    }
    if (stationId && _.isEqual(fetched, input)) {
      toast.success("Station updated!");
      navigate(`/stations/${stationId}`);
      return;
    }
    setIsLoading(true);
    const payload: IInputStation = {
      ...input,
      platformCount: Number(input.platformCount),
      latitude: Number(input.latitude),
      longitude: Number(input.longitude),
    };
    let res;
    if (stationId) {
      res = await ApiService.updateStationById(payload, stationId, "PUT");
    } else {
      res = await ApiService.createStation(payload);
    }
    if (res.statusCode) {
      setIsLoading(false);
      if (statusCodesForLogout.includes(res.statusCode)) logout();
      toast.error(res.message ?? "Operation failed.");
      return;
    }
    toast.success(`Station ${stationId ? "updated" : "created"}!`);
    navigate("/stations");
  }

  function onChange(e: ChangeEvent<HTMLInputElement>, key: keyof IInputStation) {
    setInput((prev) => ({ ...prev, [key]: e.target.value }));
  }

  if (isError) return <Error />;
  if (isLoading) return <Spinner />;

  return (
    <div className="editStationDiv">
      <div className="editStationForm">
        <h2>{stationId ? "Edit Station" : "New Station"}</h2>
        <form onSubmit={onSubmit}>
          <div className="stFieldsGrid">
            <div className="stField">
              <label htmlFor="stName">Station Name</label>
              <input
                id="stName"
                type="text"
                value={input.name}
                onChange={(e) => onChange(e, "name")}
                placeholder="e.g. Kyiv-Pasazhyrskyi"
              />
            </div>
            <div className="stField">
              <label htmlFor="stCity">City</label>
              <input
                id="stCity"
                type="text"
                value={input.city}
                onChange={(e) => onChange(e, "city")}
                placeholder="e.g. Kyiv"
              />
            </div>
            <div className="stField">
              <label htmlFor="stCode">Station Code</label>
              <input
                id="stCode"
                type="text"
                value={input.code}
                onChange={(e) => onChange(e, "code")}
                placeholder="e.g. KYV"
              />
            </div>
            <div className="stField">
              <label htmlFor="stPlatformCount">Number of Platforms</label>
              <input
                id="stPlatformCount"
                type="number"
                value={input.platformCount}
                onChange={(e) => onChange(e, "platformCount")}
                min={1}
                max={50}
              />
            </div>
            <div className="stField">
              <label htmlFor="stLatitude">Latitude</label>
              <input
                id="stLatitude"
                type="number"
                step="any"
                value={input.latitude}
                onChange={(e) => onChange(e, "latitude")}
                placeholder="e.g. 50.4501"
              />
            </div>
            <div className="stField">
              <label htmlFor="stLongitude">Longitude</label>
              <input
                id="stLongitude"
                type="number"
                step="any"
                value={input.longitude}
                onChange={(e) => onChange(e, "longitude")}
                placeholder="e.g. 30.5234"
              />
            </div>
          </div>

          <button type="submit" className="submitBtn">
            {stationId ? "Update Station" : "Create Station"}
          </button>
        </form>
      </div>
    </div>
  );
};
