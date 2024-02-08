import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "./EditCreateTrain.scss";
import "../../App.scss";
import { ApiService } from "../../services/api.service";
import { useLogout } from "../../utils/logout";
import { Error } from "../error/Error";
import { Spinner } from "../spinner/Spinner";

const initialInputState = {
  departureDate: "",
  departureCity: "",
  arrivalDate: "",
  arrivalCity: "",
  availableSeats: "",
  price: "",
};

export const EditCreateTrain: React.FunctionComponent = () => {
  const location = useLocation();
  const { trainId } = useParams();
  const [inputTrainInfo, setInputTrainInfo] = useState(initialInputState);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const logout = useLogout();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchUser(value?: boolean) {
      const user = await ApiService.getUserInfo();
      if (!user.isAdmin) navigate("/notfound");
      if (value) {
        setIsLoading(false);
        setInputTrainInfo(initialInputState);
      }
    }

    async function fetchTrainInfo() {
      await fetchUser();
      const fetchedTrain = await ApiService.getTrainInfoById(trainId!);
      if (fetchedTrain.statusCode) {
        setIsLoading(false);
        if (fetchedTrain.statusCode === 403) {
          logout();
        }
        setIsError(true);
        return;
      }
      setInputTrainInfo({
        ...fetchedTrain,
        departureDate: fetchedTrain.departureDate.slice(0, 16),
        arrivalDate: fetchedTrain.arrivalDate.slice(0, 16),
      });
      setIsLoading(false);
    }

    if (trainId) fetchTrainInfo();
    else fetchUser(true);
  }, [location.pathname]);

  function onSubmitForm(event: FormEvent) {
    event.preventDefault();
    removeInvalidClass();
    if (!validateInputs()) return;
    if (trainId) {
      console.log("Edit");
    } else {
      console.log("Create");
    }
  }

  function validateInputs(): boolean {
    let flag = true;
    return flag;
  }

  function removeInvalidClass() {
    for (const [key, value] of Object.entries(inputTrainInfo)) {
      document.querySelector(`#${key}`)?.classList.remove("invalidInput");
    }
  }

  function changeInputTrainInfo(event: ChangeEvent, type: string) {
    setInputTrainInfo((prevState) => ({
      ...prevState,
      [type]: (event.target as HTMLInputElement).value,
    }));
  }

  if (isError) return <Error />;
  if (isLoading) return <Spinner />;

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
                onChange={(event) =>
                  changeInputTrainInfo(event, "departureCity")
                }
                value={inputTrainInfo.departureCity}
              />
              <label htmlFor="departureDate">Departure Date</label>
              <input
                type="datetime-local"
                name="departureDate"
                id="departureDate"
                onChange={(event) =>
                  changeInputTrainInfo(event, "departureDate")
                }
                value={inputTrainInfo.departureDate}
                min={new Date().toISOString().slice(0, 10) + "T00:00"}
              />
            </div>
            <div>
              <label htmlFor="arrivalCity">Arrival City</label>
              <input
                type="text"
                name="arrivalCity"
                id="arrivalCity"
                onChange={(event) => changeInputTrainInfo(event, "arrivalCity")}
                value={inputTrainInfo.arrivalCity}
              />
              <label htmlFor="arrivalDate">Arrival Date</label>
              <input
                type="datetime-local"
                name="arrivalDate"
                id="arrivalDate"
                onChange={(event) => changeInputTrainInfo(event, "arrivalDate")}
                value={inputTrainInfo.arrivalDate}
                min={new Date().toISOString().slice(0, 10) + "T00:00"}
              />
            </div>
            <div>
              <label htmlFor="availableSeats">Available Seats</label>
              <input
                type="number"
                name="availableSeats"
                id="availableSeats"
                onChange={(event) =>
                  changeInputTrainInfo(event, "availableSeats")
                }
                value={inputTrainInfo.availableSeats}
              />
              <label htmlFor="price">Price ($)</label>
              <input
                type="number"
                name="price"
                id="price"
                onChange={(event) => changeInputTrainInfo(event, "price")}
                value={inputTrainInfo.price}
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
