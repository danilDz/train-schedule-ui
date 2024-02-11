import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import _ from "lodash";
import "./EditCreateTrain.scss";
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
  const [fetchedTrainInfo, setFetchedTrainInfo] = useState(initialInputState);

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
        toast.error("Something went wrong!");
        setIsError(true);
        return;
      }
      setInputTrainInfo({
        ...fetchedTrain,
        departureDate: fetchedTrain.departureDate.slice(0, 16),
        arrivalDate: fetchedTrain.arrivalDate.slice(0, 16),
      });
      setFetchedTrainInfo({
        ...fetchedTrain,
        departureDate: fetchedTrain.departureDate.slice(0, 16),
        arrivalDate: fetchedTrain.arrivalDate.slice(0, 16),
      });
      setIsLoading(false);
    }

    if (trainId) fetchTrainInfo();
    else fetchUser(true);
  }, [location.pathname]);

  async function onSubmitForm(event: FormEvent) {
    event.preventDefault();
    removeInvalidClass();

    const validationResult = validateInputs();
    if (validationResult.length) {
      for (const err of validationResult) {
        toast.error(err);
      }
      return;
    }

    if (_.isEqual(fetchedTrainInfo, inputTrainInfo)) {
      toast.success("Train was updated!");
      navigate("/");
      return;
    }
    setIsLoading(true);
    let train;
    if (trainId) {
      let counter = 0;
      for (let i = 1; i < Object.values(fetchedTrainInfo).length; i++) {
        if (
          Object.values(fetchedTrainInfo)[i] ===
          Object.values(inputTrainInfo)[i]
        )
          counter++;
      }
      let method = "PATCH";
      if (!counter) method = "PUT";
      train = await ApiService.updateTrainById(
        {
          ...inputTrainInfo,
          price: parseInt(inputTrainInfo.price),
          availableSeats: parseInt(inputTrainInfo.availableSeats),
        },
        trainId,
        method
      );
    } else {
      train = await ApiService.createTrain({
        ...inputTrainInfo,
        price: parseInt(inputTrainInfo.price),
        availableSeats: parseInt(inputTrainInfo.availableSeats),
      });
    }
    if (train.statusCode) {
      setIsLoading(false);
      if (train.statusCode === 403) logout();
      toast.error(train.message);
      setIsError(true);
    } else {
      toast.success(`Train was ${trainId ? "updated" : "created"}!`);
      setIsLoading(false);
      navigate("/");
    }
  }

  function validateInputs(): string[] {
    let arr = [] as string[];
    if (
      inputTrainInfo.departureCity.length < 3 ||
      inputTrainInfo.departureCity.length > 30
    ) {
      document.querySelector("#departureCity")?.classList.add("invalidInput");
      arr.push("Departure City length must be between 3 and 30 symbols!");
    }
    if (
      inputTrainInfo.arrivalCity.length < 3 ||
      inputTrainInfo.arrivalCity.length > 30
    ) {
      document.querySelector("#arrivalCity")?.classList.add("invalidInput");
      arr.push("Arrival City length must be between 3 and 30 symbols!");
    }
    if (
      !inputTrainInfo.availableSeats.toString().length ||
      parseInt(inputTrainInfo.availableSeats) < 1 ||
      parseInt(inputTrainInfo.availableSeats) > 300
    ) {
      document.querySelector("#availableSeats")?.classList.add("invalidInput");
      arr.push("Available Seats number must be between 1 and 300!");
    }
    if (
      !inputTrainInfo.price.toString().length ||
      parseInt(inputTrainInfo.price) < 1 ||
      parseInt(inputTrainInfo.price) > 1000
    ) {
      document.querySelector("#price")?.classList.add("invalidInput");
      arr.push("Price number must be between 1 and 1000!");
    }
    if (!inputTrainInfo.arrivalDate.length) {
      document.querySelector("#arrivalDate")?.classList.add("invalidInput");
      arr.push("Arrival Date is not set!");
    }
    if (!inputTrainInfo.departureDate.length) {
      document.querySelector("#departureDate")?.classList.add("invalidInput");
      arr.push("Departure Date is not set!");
    }
    if (
      new Date(inputTrainInfo.arrivalDate) <=
      new Date(inputTrainInfo.departureDate)
    ) {
      document.querySelector("#arrivalDate")?.classList.add("invalidInput");
      document.querySelector("#departureDate")?.classList.add("invalidInput");
      arr.push("Arrival Date must be greater that Departure Date!");
    }
    return arr;
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
