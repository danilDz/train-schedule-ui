import React, {
  ChangeEvent,
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import _ from "lodash";
import "./EditCreateTrain.scss";
import { ApiService } from "../../services/api.service";
import { useLogout } from "../../utils/logout";
import { Error } from "../error/Error";
import { Spinner } from "../spinner/Spinner";
import { RouteBuilder } from "./RouteBuilder";
import { IRouteStop } from "./interfaces/input-train.interface";
import { statusCodesForLogout } from "../../variables";

interface StationOption {
  id: string;
  name: string;
  city: string;
  code: string;
}

interface CityAutocompleteProps {
  id: string;
  displayValue: string;
  onInputChange: (text: string) => void;
  onSelect: (station: StationOption) => void;
  suggestions: StationOption[];
}

const CityAutocomplete: React.FC<CityAutocompleteProps> = ({
  id,
  displayValue,
  onInputChange,
  onSelect,
  suggestions,
}) => (
  <div className="cityAutocomplete">
    <input
      id={id}
      type="text"
      autoComplete="off"
      value={displayValue}
      onChange={(e) => onInputChange(e.target.value)}
    />
    {suggestions.length > 0 && (
      <ul className="citySuggestionsList">
        {suggestions.map((s) => (
          <li key={s.id} onMouseDown={() => onSelect(s)}>
            <span className="csName">{s.name}</span>
            <span className="csCity"> — {s.city}</span>
          </li>
        ))}
      </ul>
    )}
  </div>
);

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
  const [stops, setStops] = useState<IRouteStop[]>([]);
  const [originalStopIds, setOriginalStopIds] = useState<string[]>([]);

  const [departureCityInput, setDepartureCityInput] = useState("");
  const [departureSuggestions, setDepartureSuggestions] = useState<
    StationOption[]
  >([]);
  const [arrivalCityInput, setArrivalCityInput] = useState("");
  const [arrivalSuggestions, setArrivalSuggestions] = useState<StationOption[]>(
    [],
  );
  const debounceDepCity = useRef<ReturnType<typeof setTimeout>>();
  const debounceArrCity = useRef<ReturnType<typeof setTimeout>>();

  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [fetchedTrainInfo, setFetchedTrainInfo] = useState(initialInputState);

  const logout = useLogout();
  const navigate = useNavigate();

  useEffect(
    () => () => {
      clearTimeout(debounceDepCity.current);
      clearTimeout(debounceArrCity.current);
    },
    [],
  );

  useEffect(() => {
    async function fetchUser(value?: boolean) {
      const user = await ApiService.getUserInfo();
      if (statusCodesForLogout.includes(user?.statusCode)) logout();
      const userRole = user.role ?? (user.isAdmin ? "ADMIN" : "PASSENGER");
      if (userRole !== "ADMIN")
        navigate("/notfound");
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
        if (statusCodesForLogout.includes(fetchedTrain.statusCode)) {
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
      setDepartureCityInput(fetchedTrain.departureCity);
      setArrivalCityInput(fetchedTrain.arrivalCity);
      if (Array.isArray(fetchedTrain.stops)) {
        const mapped: IRouteStop[] = fetchedTrain.stops.map((s: any) => ({
          id: s.id,
          stationId: s.stationId,
          stationName: s.station?.name ?? "",
          arrivalTime: s.arrivalTime ?? "",
          departureTime: s.departureTime ?? "",
          platform: s.platform ?? undefined,
          stopOrder: s.stopOrder,
        }));
        setStops(mapped);
        setOriginalStopIds(mapped.map((s) => s.id!).filter(Boolean));
      }
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
        method,
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
      if (statusCodesForLogout.includes(train.statusCode)) logout();
      toast.error(train.message);
      setIsError(true);
    } else {
      // Sync stops after train is saved
      await syncStops(
        train.id ?? trainId!,
        stops,
        trainId ? originalStopIds : [],
      );
      toast.success(`Train was ${trainId ? "updated" : "created"}!`);
      setIsLoading(false);
      navigate("/");
    }
  }

  async function syncStops(
    trainId: string,
    currentStops: IRouteStop[],
    prevStopIds: string[],
  ) {
    const currentIds = currentStops
      .map((s) => s.id)
      .filter(Boolean) as string[];

    // Delete stops removed from the list
    for (const origId of prevStopIds) {
      if (!currentIds.includes(origId)) {
        await ApiService.deleteTrainStop(origId);
      }
    }

    // Create or update stops
    for (const stop of currentStops) {
      if (!stop.stationId) continue; // skip incomplete stops
      const payload = {
        stationId: stop.stationId,
        arrivalTime: stop.arrivalTime || undefined,
        departureTime: stop.departureTime || undefined,
        stopOrder: stop.stopOrder,
        platform: stop.platform || undefined,
      };
      if (stop.id) {
        await ApiService.updateTrainStop(stop.id, payload);
      } else {
        await ApiService.addTrainStop(trainId, payload);
      }
    }
  }

  function validateInputs(): string[] {
    let arr = [] as string[];
    if (
      inputTrainInfo.departureCity.length < 3 ||
      inputTrainInfo.departureCity.length > 30
    ) {
      document.querySelector("#departureCity")?.classList.add("invalidInput");
      arr.push("Please select a departure city from the station suggestions!");
    }
    if (
      inputTrainInfo.arrivalCity.length < 3 ||
      inputTrainInfo.arrivalCity.length > 30
    ) {
      document.querySelector("#arrivalCity")?.classList.add("invalidInput");
      arr.push("Please select an arrival city from the station suggestions!");
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
    for (const key of Object.keys(inputTrainInfo)) {
      document.querySelector(`#${key}`)?.classList.remove("invalidInput");
    }
  }

  function searchCityStations(
    query: string,
    setSuggestions: React.Dispatch<React.SetStateAction<StationOption[]>>,
    debounceRef: React.MutableRefObject<
      ReturnType<typeof setTimeout> | undefined
    >,
  ) {
    clearTimeout(debounceRef.current);
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      const res = await ApiService.searchStations(query);
      setSuggestions(Array.isArray(res?.data) ? res.data : []);
    }, 300);
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
              <CityAutocomplete
                id="departureCity"
                displayValue={departureCityInput}
                suggestions={departureSuggestions}
                onInputChange={(text) => {
                  setDepartureCityInput(text);
                  setInputTrainInfo((p) => ({ ...p, departureCity: "" }));
                  searchCityStations(
                    text,
                    setDepartureSuggestions,
                    debounceDepCity,
                  );
                }}
                onSelect={(station) => {
                  setDepartureCityInput(station.name);
                  setInputTrainInfo((p) => ({
                    ...p,
                    departureCity: station.name,
                  }));
                  setDepartureSuggestions([]);
                }}
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
              <CityAutocomplete
                id="arrivalCity"
                displayValue={arrivalCityInput}
                suggestions={arrivalSuggestions}
                onInputChange={(text) => {
                  setArrivalCityInput(text);
                  setInputTrainInfo((p) => ({ ...p, arrivalCity: "" }));
                  searchCityStations(
                    text,
                    setArrivalSuggestions,
                    debounceArrCity,
                  );
                }}
                onSelect={(station) => {
                  setArrivalCityInput(station.name);
                  setInputTrainInfo((p) => ({
                    ...p,
                    arrivalCity: station.name,
                  }));
                  setArrivalSuggestions([]);
                }}
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

          <div className="routeSection">
            <h3 className="routeSectionTitle">Route Stops</h3>
            <p className="routeSectionHint">
              Add intermediate stops, set arrival/departure times and drag to
              reorder.
            </p>
            <RouteBuilder stops={stops} onChange={setStops} />
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
