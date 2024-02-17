import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "./TrainsList.scss";
import { ITrain } from "../train/interfaces/train.interface";
import { ApiService } from "../../services/api.service";
import { Error } from "../error/Error";
import { Spinner } from "../spinner/Spinner";
import { TrainItem } from "../trainItem/TrainItem";
import { useLogout } from "../../utils/logout";
import { statusCodesForLogout } from "../../variables";

export const Trains: React.FunctionComponent = () => {
  const [trainsList, setTrainsList] = useState<ITrain[]>([] as ITrain[]);
  const limit = 3;
  const [offset, setOffset] = useState(0);
  const [trainsEnded, setTrainsEnded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isMoreLoading, setIsMoreLoading] = useState(false);

  const logout = useLogout();

  useEffect(() => {
    window.addEventListener("scroll", windowScrollHandler);
    loadContent(false);

    return () => {
      window.removeEventListener("scroll", windowScrollHandler);
    };
  }, []);

  function windowScrollHandler() {
    const button = document.querySelector<HTMLButtonElement>(".toTopBtn")!;
    if (window.scrollY >= 200) {
      button.style.visibility = "visible";
      button.style.opacity = "1";
    } else {
      button.style.visibility = "hidden";
      button.style.opacity = "0";
    }
  }

  function scrollToTopHandler() {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }

  async function loadContent(loadMore: boolean) {
    if (loadMore) setIsMoreLoading(true);
    const loadedTrainsList = await ApiService.getAllTrains(limit, offset);
    if (loadedTrainsList.statusCode) {
      setIsLoading(false);
      setIsMoreLoading(false);
      if (statusCodesForLogout.includes(loadedTrainsList.statusCode)) {
        logout();
      }
      toast.error("Something went wrong!");
      setIsError(true);
      return;
    }
    setTrainsList((prevState) => [...prevState, ...loadedTrainsList]);
    if (loadedTrainsList.length < limit) setTrainsEnded(true);
    setOffset((prevState) => prevState + limit);
    setIsMoreLoading(false);
    setIsLoading(false);
  }

  if (isError) return <Error />;
  if (isLoading) return <Spinner />;

  return (
    <div className="mainDivTrains">
      {!trainsList.length ? (
        <p className="emptyTrainsList">For now the list of trains is empty.</p>
      ) : (
        <>
          <div className="trainsList">
            {trainsList.map((train) => {
              const departureDate = new Date(train.departureDate);
              const arrivalDate = new Date(train.arrivalDate);
              const departureDatetime =
                departureDate.toDateString().split(" ").slice(1).join(" ") +
                ", " +
                train.departureDate.slice(11, 16);
              const arrivalDatetime =
                arrivalDate.toDateString().split(" ").slice(1).join(" ") +
                ", " +
                train.arrivalDate.slice(11, 16);

              return (
                <TrainItem
                  key={train.id}
                  id={train.id}
                  departureDate={departureDatetime}
                  departureCity={train.departureCity}
                  arrivalDate={arrivalDatetime}
                  arrivalCity={train.arrivalCity}
                />
              );
            })}
            {isMoreLoading ? <Spinner /> : null}
          </div>
          <button
            style={{ display: trainsEnded || isMoreLoading ? "none" : "block" }}
            disabled={isMoreLoading}
            onClick={() => loadContent(true)}
            className="loadMoreBtn"
          >
            Load more
          </button>
          <button className="toTopBtn" onClick={scrollToTopHandler}>
            <svg
              data-name="1-Arrow Up"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 32 32"
              height="30px"
            >
              <path
                d="m26.71 10.29-10-10a1 1 0 0 0-1.41 0l-10 10 1.41 1.41L15 3.41V32h2V3.41l8.29 8.29z"
                fill="rgba(240, 141, 242)"
              />
            </svg>
          </button>
        </>
      )}
    </div>
  );
};
