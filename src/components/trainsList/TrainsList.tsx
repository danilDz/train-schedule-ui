import React, { useEffect, useState } from "react";
import "./TrainsList.scss";
import { ITrain } from "../train/interfaces/train.interface";
import { ApiService } from "../../services/api.service";
import { Error } from "../error/Error";
import { Spinner } from "../spinner/Spinner";
import { TrainItem } from "../trainItem/TrainItem";
import { useLogout } from "../../utils/logout";

///
/// FR - Add a pagination
///

export const Trains: React.FunctionComponent = () => {
  const [trainsList, setTrainsList] = useState<ITrain[]>([] as ITrain[]);
  // const limit = 3;
  // const [offset, setOffset] = useState(0);
  // const [trainsEnded, setTrainsEnded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  // const [isMoreLoading, setIsMoreLoading] = useState(false);

  const logout = useLogout();

  useEffect(() => {
    async function fetchTrainsList() {
      const loadedTrainsList = await ApiService.getAllTrains();
      if (loadedTrainsList.statusCode) {
        setIsLoading(false);
        if (loadedTrainsList.statusCode === 403) {
          logout();
        }
        setIsError(true);
        return;
      }
      setTrainsList(loadedTrainsList);
      setIsLoading(false);
    }

    fetchTrainsList();
  }, []);

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
