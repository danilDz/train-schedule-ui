import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
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

  const navigate = useNavigate();
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
        toast.error("Something went wrong!");
        setIsError(true);
        return;
      }
      setIsAdmin(user.isAdmin);
      setTrainInfo(loadedTrainInfo);
      setIsLoading(false);
    }

    fetchTrainInfo();
  }, []);

  function changeModalVisibility(value: string) {
    const modal = document.querySelector<HTMLDivElement>(".modalWrapper")!;
    modal.style.display = value;
  }

  function onModalOpen() {
    changeModalVisibility("flex");
  }

  function onModalClose(event: React.MouseEvent<Element, MouseEvent>) {
    if (
      (event.target as HTMLElement).id === "cancel" ||
      (event.target as HTMLElement).className === "modalWrapper"
    ) {
      changeModalVisibility("none");
    }
  }

  async function onDeleteTrain() {
    changeModalVisibility("none");
    setIsLoading(true);
    const response = await ApiService.deleteTrainById(trainId!);
    if (response.statusCode) {
      setIsLoading(false);
      if (response.statusCode === 403) {
        logout();
      }
      toast.error("Something went wrong!");
      setIsError(true);
      return;
    }
    toast.success("Train was deleted!");
    setIsLoading(false);
    navigate("/");
  }

  if (isError) return <Error />;
  if (isLoading) return <Spinner />;

  const arrivalDate =
    new Date(trainInfo.arrivalDate)
      .toDateString()
      .split(" ")
      .slice(1)
      .join(" ") +
    ", " +
    trainInfo.arrivalDate.slice(11, 16);
  const departureDate =
    new Date(trainInfo.departureDate)
      .toDateString()
      .split(" ")
      .slice(1)
      .join(" ") +
    ", " +
    trainInfo.departureDate.slice(11, 16);

  return (
    <>
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
            <p>{departureDate}</p>
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
            <p>{arrivalDate}</p>
            <p>{trainInfo.arrivalCity}</p>
          </div>
        </div>
        <p>Available seats: {trainInfo.availableSeats}</p>
        <p>Price: ${trainInfo.price}</p>
        {isAdmin ? (
          <div className="controlsDiv">
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <a className="controlBtn" onClick={onModalOpen}>
              Delete Train
            </a>
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <Link to={`/trains/edit/${trainId}`} className="controlBtn">
              Edit Train
            </Link>
          </div>
        ) : null}
      </div>
      <div className="modalWrapper" onClick={onModalClose}>
        <div className="modalWindow">
          <p>Are you sure?</p>
          <div className="modalControlsDiv">
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <a className="modalControlBtn cancel" id="cancel">
              Cancel
            </a>
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <a className="modalControlBtn delete" onClick={onDeleteTrain}>
              Delete
            </a>
          </div>
        </div>
      </div>
    </>
  );
};
