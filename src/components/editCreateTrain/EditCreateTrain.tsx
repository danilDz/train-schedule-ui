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

type CarriageType = "ECONOMY" | "BUSINESS" | "FIRST_CLASS";

interface CarriageRow {
  localId: string;
  id?: string;
  carriageNumber: number;
  type: CarriageType;
  totalSeats: number;
}

let localIdCounter = 0;
function newLocalId() {
  return `local-${++localIdCounter}`;
}

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
  price: "",
};

export const EditCreateTrain: React.FunctionComponent = () => {
  const location = useLocation();
  const { trainId } = useParams();
  const [inputTrainInfo, setInputTrainInfo] = useState(initialInputState);
  const [stops, setStops] = useState<IRouteStop[]>([]);
  const [originalStopIds, setOriginalStopIds] = useState<string[]>([]);

  const [carriages, setCarriages] = useState<CarriageRow[]>([]);
  const [originalCarriages, setOriginalCarriages] = useState<CarriageRow[]>([]);
  const [deletedCarriageIds, setDeletedCarriageIds] = useState<string[]>([]);

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
  const [showStopErrors, setShowStopErrors] = useState(false);

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
      if (userRole !== "ADMIN" && userRole !== "DISPATCHER")
        navigate("/notfound");
      if (value) {
        setIsLoading(false);
        setInputTrainInfo(initialInputState);
      }
    }

    async function fetchTrainInfo() {
      await fetchUser();
      const [fetchedTrain, fetchedCarriages] = await Promise.all([
        ApiService.getTrainInfoById(trainId!),
        ApiService.getTrainCarriages(trainId!),
      ]);
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
        availableSeats: undefined,
      });
      setFetchedTrainInfo({
        ...fetchedTrain,
        departureDate: fetchedTrain.departureDate.slice(0, 16),
        arrivalDate: fetchedTrain.arrivalDate.slice(0, 16),
        availableSeats: undefined,
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
          stationPlatformCount: s.station?.platformCount ?? undefined,
        }));
        setStops(mapped);
        setOriginalStopIds(mapped.map((s) => s.id!).filter(Boolean));
      }
      if (Array.isArray(fetchedCarriages) && !(fetchedCarriages as any).statusCode) {
        const mappedC: CarriageRow[] = fetchedCarriages.map((c: any) => ({
          localId: newLocalId(),
          id: c.id,
          carriageNumber: c.carriageNumber,
          type: c.type as CarriageType,
          totalSeats: c.totalSeats,
        }));
        setCarriages(mappedC);
        setOriginalCarriages(mappedC);
      }
      setIsLoading(false);
    }

    if (trainId) fetchTrainInfo();
    else fetchUser(true);
  }, [location.pathname]);

  // ── Carriage helpers ───────────────────────────────────────────────────
  const totalCarriageSeats = carriages.reduce(
    (sum, c) => sum + (Number(c.totalSeats) || 0),
    0,
  );

  function addCarriage() {
    const nextNum =
      carriages.length > 0
        ? Math.max(...carriages.map((c) => c.carriageNumber)) + 1
        : 1;
    setCarriages((prev) => [
      ...prev,
      { localId: newLocalId(), carriageNumber: nextNum, type: "ECONOMY", totalSeats: 50 },
    ]);
  }

  function removeCarriage(localId: string) {
    const c = carriages.find((r) => r.localId === localId);
    if (c?.id) setDeletedCarriageIds((prev) => [...prev, c.id!]);
    setCarriages((prev) => prev.filter((r) => r.localId !== localId));
  }

  function updateCarriageField<K extends keyof CarriageRow>(
    localId: string,
    field: K,
    value: CarriageRow[K],
  ) {
    setCarriages((prev) =>
      prev.map((c) => (c.localId === localId ? { ...c, [field]: value } : c)),
    );
  }

  async function syncCarriages(tId: string) {
    for (const id of deletedCarriageIds) {
      const res = await ApiService.deleteCarriage(id);
      if (res.statusCode) toast.error(`Failed to remove carriage: ${res.message}`);
    }
    for (const c of carriages) {
      if (!c.id) {
        const res = await ApiService.createCarriage(tId, {
          carriageNumber: c.carriageNumber,
          type: c.type,
          totalSeats: Number(c.totalSeats),
        });
        if (res.statusCode)
          toast.error(`Failed to add carriage ${c.carriageNumber}: ${res.message}`);
      } else {
        const orig = originalCarriages.find((o) => o.id === c.id);
        if (
          orig &&
          (orig.type !== c.type ||
            orig.totalSeats !== Number(c.totalSeats) ||
            orig.carriageNumber !== c.carriageNumber)
        ) {
          const res = await ApiService.updateCarriage(c.id, {
            carriageNumber: c.carriageNumber,
            type: c.type,
            totalSeats: Number(c.totalSeats),
          });
          if (res.statusCode)
            toast.error(`Failed to update carriage ${c.carriageNumber}: ${res.message}`);
        }
      }
    }
  }
  // ───────────────────────────────────────────────────────────────────────

  async function onSubmitForm(event: FormEvent) {
    event.preventDefault();
    removeInvalidClass();
    setShowStopErrors(false);

    const validationResult = validateInputs();
    if (validationResult.length) {
      for (const err of validationResult) {
        toast.error(err);
      }
      return;
    }

    if (_.isEqual(fetchedTrainInfo, inputTrainInfo) && !trainId) {
      toast.success("Train was updated!");
      navigate("/");
      return;
    }
    setIsLoading(true);
    let train: any;
    if (trainId) {
      // If only carriages/stops changed, skip basic train update
      if (!_.isEqual(fetchedTrainInfo, inputTrainInfo)) {
        let counter = 0;
        for (let i = 1; i < Object.values(fetchedTrainInfo).length; i++) {
          if (
            Object.values(fetchedTrainInfo)[i] ===
            Object.values(inputTrainInfo)[i]
          )
            counter++;
        }
        const method = counter ? "PATCH" : "PUT";
        train = await ApiService.updateTrainById(
          {
            ...inputTrainInfo,
            price: parseInt(inputTrainInfo.price),
            availableSeats: totalCarriageSeats,
          },
          trainId,
          method,
        );
        if (train.statusCode) {
          setIsLoading(false);
          if (statusCodesForLogout.includes(train.statusCode)) logout();
          toast.error(train.message);
          setIsError(true);
          return;
        }
      }
      await syncStops(trainId, stops, originalStopIds);
      await syncCarriages(trainId);
    } else {
      train = await ApiService.createTrain({
        ...inputTrainInfo,
        price: parseInt(inputTrainInfo.price),
        availableSeats: totalCarriageSeats,
        carriages:
          carriages.map((c) => ({
            carriageNumber: c.carriageNumber,
            type: c.type,
            totalSeats: Number(c.totalSeats),
          })),
      });
      if (train.statusCode) {
        setIsLoading(false);
        if (statusCodesForLogout.includes(train.statusCode)) logout();
        toast.error(train.message);
        setIsError(true);
        return;
      }
      await syncStops(train.id, stops, []);
    }
    toast.success(`Train was ${trainId ? "updated" : "created"}!`);
    setIsLoading(false);
    navigate("/");
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
    if (carriages.length === 0) {
      arr.push("At least one carriage is required. Please add a carriage before saving.");
    } else {
      if (carriages.some((c) => Number(c.totalSeats) < 1 || Number(c.totalSeats) > 100)) {
        arr.push("Each carriage must have between 1 and 100 seats.");
      }
      const nums = carriages.map((c) => c.carriageNumber);
      if (new Set(nums).size !== nums.length) {
        arr.push("Carriage numbers must be unique.");
      }
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
    // Validate stops
    if (stops.length > 0) {
      let hasStopErrors = false;
      stops.forEach((stop, i) => {
        const num = i + 1;
        if (!stop.stationId) {
          arr.push(`Stop ${num}: please select a station from the suggestions.`);
          hasStopErrors = true;
        }
        if (!stop.arrivalTime) {
          arr.push(`Stop ${num}: arrival time is required.`);
          hasStopErrors = true;
        }
        if (!stop.departureTime) {
          arr.push(`Stop ${num}: departure time is required.`);
          hasStopErrors = true;
        }
        if (!stop.platform) {
          arr.push(`Stop ${num}: platform is required.`);
          hasStopErrors = true;
        } else if (
          stop.stationPlatformCount &&
          parseInt(stop.platform) > stop.stationPlatformCount
        ) {
          arr.push(
            `Stop ${num}: platform ${stop.platform} exceeds the maximum of ${stop.stationPlatformCount} for this station.`,
          );
          hasStopErrors = true;
        }
      });
      if (hasStopErrors) setShowStopErrors(true);
    }
    if (
      inputTrainInfo.arrivalDate.length &&
      inputTrainInfo.departureDate.length &&
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

          {/* ── Carriage Builder ──────────────────────────────────── */}
          <div className="carriageSection">
            <div className="carriageSectionHeader">
              <div>
                <h3 className="carriageSectionTitle">Train Carriages</h3>
                <p className="carriageSectionHint">
                  Define carriages and seat counts. Seats are auto-generated.
                </p>
              </div>
              {carriages.length > 0 && (
                <div className="carriageTotalBadge">
                  Total seats: <strong>{totalCarriageSeats}</strong>
                </div>
              )}
            </div>
            <div className="carriageList">
              {carriages.map((carriage) => (
                <div key={carriage.localId} className="carriageRow">
                  <div className="carriageRowField">
                    <label>Carriage #</label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={carriage.carriageNumber}
                      onChange={(e) =>
                        updateCarriageField(
                          carriage.localId,
                          "carriageNumber",
                          parseInt(e.target.value) || 1,
                        )
                      }
                    />
                  </div>
                  <div className="carriageRowField">
                    <label>Class</label>
                    <select
                      value={carriage.type}
                      onChange={(e) =>
                        updateCarriageField(
                          carriage.localId,
                          "type",
                          e.target.value as CarriageType,
                        )
                      }
                    >
                      <option value="ECONOMY">Economy</option>
                      <option value="BUSINESS">Business</option>
                      <option value="FIRST_CLASS">First Class</option>
                    </select>
                  </div>
                  <div className="carriageRowField">
                    <label>Seats</label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={carriage.totalSeats}
                      onChange={(e) =>
                        updateCarriageField(
                          carriage.localId,
                          "totalSeats",
                          parseInt(e.target.value) || 1,
                        )
                      }
                    />
                  </div>
                  <button
                    type="button"
                    className="carriageRemoveBtn"
                    onClick={() => removeCarriage(carriage.localId)}
                    title="Remove carriage"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="addCarriageBtn"
              onClick={addCarriage}
            >
              + Add Carriage
            </button>
          </div>

          <div className="routeSection">
            <h3 className="routeSectionTitle">Route Stops</h3>
            <p className="routeSectionHint">
              Add intermediate stops, set arrival/departure times and drag to
              reorder.
            </p>
            <RouteBuilder stops={stops} onChange={setStops} showErrors={showStopErrors} />
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
