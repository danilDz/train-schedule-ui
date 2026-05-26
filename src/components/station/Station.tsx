import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import "./Station.scss";
import { IStation } from "./interfaces/station.interface";
import { ApiService } from "../../services/api.service";
import { Spinner } from "../spinner/Spinner";
import { Error } from "../error/Error";
import { ConfirmModal } from "../shared/ConfirmModal";
import { useAuth } from "../../hooks/useAuth";
import { useLogout } from "../../utils/logout";
import { statusCodesForLogout } from "../../variables";

export const Station: React.FC = () => {
  const { stationId } = useParams();
  const [station, setStation] = useState<IStation>({} as IStation);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const { isAdmin } = useAuth();
  const logout = useLogout();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchStation() {
      const data = await ApiService.getStationById(stationId!);
      if (data.statusCode) {
        setIsLoading(false);
        if (statusCodesForLogout.includes(data.statusCode)) logout();
        toast.error("Failed to load station.");
        setIsError(true);
        return;
      }
      setStation(data);
      setIsLoading(false);
    }
    fetchStation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onDelete() {
    setShowDelete(false);
    setIsLoading(true);
    const res = await ApiService.deleteStationById(stationId!);
    if (res.statusCode) {
      setIsLoading(false);
      if (statusCodesForLogout.includes(res.statusCode)) logout();
      toast.error("Failed to delete station.");
      return;
    }
    toast.success("Station deleted!");
    navigate("/stations");
  }

  if (isError) return <Error />;
  if (isLoading) return <Spinner />;

  return (
    <>
      <div className="stationDetailDiv">
        <Link to="/stations" className="backLink">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24">
            <path
              d="m12.718 4.707-1.413-1.415L2.585 12l8.72 8.707 1.413-1.415L6.417 13H20v-2H6.416l6.302-6.293z"
              fill="rgba(240, 141, 242)"
            />
          </svg>
          Back to Stations
        </Link>

        <div className="stationCard">
          <div className="stationCardHeader">
            <h2>{station.name}</h2>
            <span className="stationCodeBig">{station.code}</span>
          </div>

          <div className="stationFields">
            <div className="stationField">
              <span className="fieldLabel">City</span>
              <span className="fieldValue">{station.city}</span>
            </div>
            <div className="stationField">
              <span className="fieldLabel">Platforms</span>
              <span className="fieldValue">{station.platformCount}</span>
            </div>
            <div className="stationField">
              <span className="fieldLabel">Latitude</span>
              <span className="fieldValue">{station.latitude}</span>
            </div>
            <div className="stationField">
              <span className="fieldLabel">Longitude</span>
              <span className="fieldValue">{station.longitude}</span>
            </div>
          </div>

          {isAdmin && (
            <div className="stationControls">
              <Link
                to={`/stations/edit/${stationId}`}
                className="stationBtn stationBtn--edit"
              >
                Edit Station
              </Link>
              <button
                className="stationBtn stationBtn--delete"
                onClick={() => setShowDelete(true)}
              >
                Delete Station
              </button>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={showDelete}
        message={`Delete station "${station.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        isDanger
        onConfirm={onDelete}
        onClose={() => setShowDelete(false)}
      />
    </>
  );
};
