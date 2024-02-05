import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./Train.scss";
import { ITrain } from "./interfaces/train.interface";
import { ApiService } from "../../services/api.service";
import { useLogout } from "../../utils/logout";
import { Error } from "../error/Error";
import { Spinner } from "../spinner/Spinner";

export const Train: React.FunctionComponent = () => {
  const { trainId } = useParams();
  const [trainInfo, setTrainInfo] = useState<ITrain>({} as ITrain);
  const [isAdmin, setIsAdmin] = useState<boolean>(null!);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const logout = useLogout();

  useEffect(() => {
    async function fetchTrainInfo() {
      const loadedTrainInfo = await ApiService.getTrainInfoById(trainId!);
      const user = await ApiService.getUserInfo();
      if (loadedTrainInfo.statusCode || user.statusCode) {
        setIsLoading(false);
        if (loadedTrainInfo.statusCode === 403 || user.statusCode === 403) {
          logout();
        }
        setIsError(true);
        return;
      }
      setIsAdmin(user.isAdmin);
      setTrainInfo(loadedTrainInfo);
      setIsLoading(false);
    }

    fetchTrainInfo();
  }, []);

  if (isError) return <Error />;
  if (isLoading) return <Spinner />;

  return (
    <div className="mainTrainInfoDiv">
      <Link to="/">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24">
          <path
            d="m12.718 4.707-1.413-1.415L2.585 12l8.72 8.707 1.413-1.415L6.417 13H20v-2H6.416l6.302-6.293z"
            fill="rgba(240, 141, 242)"
          />
        </svg>
        Go Back
      </Link>
      <div className="departureArrival">
        <div>
          <p>Departure</p>
          <p>
            {new Date(trainInfo.departureDate)
              .toDateString()
              .split(" ")
              .slice(1)
              .join(" ") +
              ", " +
              new Date(trainInfo.departureDate)
                .toTimeString()
                .split(":")
                .slice(0, 2)
                .join(":")}
          </p>
          <p>{trainInfo.departureCity}</p>
        </div>
        <span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 25">
            <path
              fill="rgba(240, 141, 242)"
              d="m17.5 5.999-.707.707 5.293 5.293H1v1h21.086l-5.294 5.295.707.707L24 12.499l-6.5-6.5z"
              data-name="Right"
            />
          </svg>
        </span>
        <div>
          <p>Arrival</p>
          <p>
            {new Date(trainInfo.arrivalDate)
              .toDateString()
              .split(" ")
              .slice(1)
              .join(" ") +
              ", " +
              new Date(trainInfo.arrivalDate)
                .toTimeString()
                .split(":")
                .slice(0, 2)
                .join(":")}
          </p>
          <p>{trainInfo.arrivalCity}</p>
        </div>
      </div>
      <p>Available seats: {trainInfo.availableSeats}</p>
      <p>Price: ${trainInfo.price}</p>
      {isAdmin ? (
        <div className="controlsDiv">
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <a className="controlBtn">Delete Train</a>
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <a className="controlBtn">Edit Train</a>
        </div>
      ) : null}
    </div>
  );
};
