import React, { useEffect, useState } from "react";
import cookies from "js-cookie";
import "./TrainsList.scss";
import { ITrain } from "./interfaces/trains-list.interface";
import { ApiService } from "../../services/api.service";
import { Error } from "../error/Error";
import { Spinner } from "../spinner/Spinner";
import { useNavigate } from "react-router-dom";

export const Trains: React.FunctionComponent = () => {
  const [trainsList, setTrainsList] = useState<ITrain[]>([] as ITrain[]);
  // const limit = 3;
  // const [offset, setOffset] = useState(0);
  // const [trainsEnded, setTrainsEnded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  // const [isMoreLoading, setIsMoreLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchTrainsList() {
      setIsLoading(true);
      setIsError(false);
      const loadedTrainsList = await ApiService.getAllTrains();
      if (loadedTrainsList.statusCode) {
        setIsLoading(false);
        if (loadedTrainsList.statusCode === 403) {
          await ApiService.signout();
          cookies.remove("jwt");
          navigate("/signin");
        }
        setIsError(true);
        return;
      }
      setTrainsList(loadedTrainsList);
      setIsLoading(false);
    }

    fetchTrainsList();
  }, []);

  function onTrainClick(event: React.MouseEvent<HTMLDivElement>) {
    console.log(event);
  }

  if (isError) return <Error />;
  if (isLoading) return <Spinner />;

  return (
    <div className="mainDivTrains">
      {!trainsList.length ? (
        <p className="emptyTrainsList">For now the list of trains is empty.</p>
      ) : (
        <div className="trainsList">
          {trainsList.map((train) => {
            const departureDate = new Date(train.departureDate);
            const arrivalDate = new Date(train.arrivalDate);
            const departureDatetime =
              departureDate.toDateString().split(" ").slice(1).join(" ") +
              ", " +
              departureDate.toTimeString().split(":").slice(0, 2).join(":");
            const arrivalDatetime =
              arrivalDate.toDateString().split(" ").slice(1).join(" ") +
              ", " +
              arrivalDate.toTimeString().split(":").slice(0, 2).join(":");

            return (
              <div key={train.id} className="train" onClick={onTrainClick}>
                <div className="trainPlain">
                  <div>
                    <p>{departureDatetime}</p>
                    <p>{train.departureCity}</p>
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
                    <p>{arrivalDatetime}</p>
                    <p>{train.arrivalCity}</p>
                  </div>
                </div>
                <div className="trainHover">Details</div>
              </div>
            );
          })}
          {/* {isMoreLoading ? <Spinner /> : null}
          <button
            style={{ display: trainsEnded ? "none" : "block" }}
            disabled={isMoreLoading}
            onClick={loadContent}
          >
            Load more
          </button> */}
        </div>
      )}
    </div>
  );
};
