import React, { FormEvent, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./EditCreateTrain.scss";
import { ITrain } from "../train/interfaces/train.interface";
import { ApiService } from "../../services/api.service";
import { useLogout } from "../../utils/logout";
import { Error } from "../error/Error";
import { Spinner } from "../spinner/Spinner";

export const EditCreateTrain: React.FunctionComponent = () => {
  const { trainId } = useParams();
  const [trainInfo, setTrainInfo] = useState({} as ITrain);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const logout = useLogout();

  useEffect(() => {
    async function fetchTrainInfo() {
      const fetchedTrain = await ApiService.getTrainInfoById(trainId!);
      if (fetchedTrain.statusCode) {
        setIsLoading(false);
        if (fetchedTrain.statusCode === 403) {
          logout();
        }
        setIsError(true);
        return;
      }
      setTrainInfo(fetchedTrain);
      setIsLoading(false);
    }

    if (trainId) fetchTrainInfo();
    else {
      setIsLoading(false);
      setTrainInfo({} as ITrain);
    }
  }, [trainId]);

  function onSubmitForm(event: FormEvent) {
    event.preventDefault();
    console.log(event);
  }

  if (isError) return <Error />;
  if (isLoading) return <Spinner />;

  let arrivalDate = "";
  let departureDate = "";
  if (trainId) {
    arrivalDate =
      new Date(trainInfo.arrivalDate).toISOString().slice(0, 10) +
      "T" +
      new Date(trainInfo.arrivalDate)
        .toLocaleString()
        .split(", ")[1]
        .slice(0, 5);
    departureDate =
      new Date(trainInfo.departureDate).toISOString().slice(0, 10) +
      "T" +
      new Date(trainInfo.departureDate)
        .toLocaleString()
        .split(", ")[1]
        .slice(0, 5);
  }

  return (
    <div className="mainEditCreateTrainDiv">
      <div className="formDiv">
        <form onSubmit={onSubmitForm}>
          <div className="formSubDiv">
            <div>
              <label htmlFor="departureCity">Departure City</label>
              <input
                type="text"
                name="departureCity"
                id="departureCity"
                defaultValue={trainId ? trainInfo.departureCity : ""}
              />
              <label htmlFor="departureDate">Departure Date</label>
              <input
                type="datetime-local"
                name="departureDate"
                id="departureDate"
                defaultValue={trainId ? departureDate : ""}
                min={new Date().toISOString().slice(0, 10) + "T00:00"}
              />
            </div>
            <div>
              <label htmlFor="arrivalCity">Arrival City</label>
              <input
                type="text"
                name="arrivalCity"
                id="arrivalCity"
                defaultValue={trainId ? trainInfo.arrivalCity : ""}
              />
              <label htmlFor="arrivalDate">Arrival Date</label>
              <input
                type="datetime-local"
                name="arrivalDate"
                id="arrivalDate"
                defaultValue={trainId ? arrivalDate : ""}
                min={new Date().toISOString().slice(0, 10) + "T00:00"}
              />
            </div>
            <div>
              <label htmlFor="availableSeats">Available Seats</label>
              <input
                type="number"
                name="availableSeats"
                id="availableSeats"
                defaultValue={trainId ? trainInfo.availableSeats : ""}
              />
              <label htmlFor="price">Price ($)</label>
              <input
                type="number"
                name="price"
                id="price"
                defaultValue={trainId ? trainInfo.price : ""}
              />
            </div>
          </div>
          <div className="formSubDiv">
            <button type="submit" className="submit">
              {trainId ? "Update Train" : "Create Train"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
