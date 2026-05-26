import React, { FormEvent, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import "./JourneySearch.scss";
import { TrainStatus } from "../train/interfaces/train.interface";
import { ApiService } from "../../services/api.service";
import { Spinner } from "../spinner/Spinner";
import { StatusBadge } from "../shared/StatusBadge";
import { Link } from "react-router-dom";

// ─── Types ────────────────────────────────────────────────────────────────────

interface StationOption {
  id: string;
  name: string;
  city: string;
  code: string;
}

interface JourneyStop {
  stopOrder: number;
  station: StationOption;
  arrivalTime: string | null;
  departureTime: string | null;
  platform: string | null;
}

interface JourneyResult {
  train: {
    id: string;
    trainNumber: string | null;
    departureCity: string;
    arrivalCity: string;
    availableSeats: number;
    price: number;
    status: TrainStatus;
    delayMinutes: number;
  };
  fromStation: StationOption;
  toStation: StationOption;
  departureDate: string | null;
  arrivalDate: string | null;
  durationMinutes: number | null;
  departurePlatform: string | null;
  arrivalPlatform: string | null;
  stops: JourneyStop[];
}

type FilterStatus = TrainStatus | "ALL";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtTime(t: string | null): string {
  if (!t) return "—";
  // ISO: "2024-05-26T14:30:00.000Z" → slice after T
  const idx = t.indexOf("T");
  return idx !== -1 ? t.slice(idx + 1, idx + 6) : t.slice(0, 5);
}

function fmtDate(t: string | null): string {
  if (!t) return "—";
  const d = new Date(t);
  if (isNaN(d.getTime())) return t.slice(0, 10);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function computeDuration(jr: JourneyResult): number | null {
  if (jr.durationMinutes !== null && jr.durationMinutes > 0)
    return jr.durationMinutes;
  if (!jr.departureDate || !jr.arrivalDate) return null;
  const dep = new Date(jr.departureDate);
  const arr = new Date(jr.arrivalDate);
  if (isNaN(dep.getTime()) || isNaN(arr.getTime())) return null;
  return Math.round((arr.getTime() - dep.getTime()) / 60000);
}

function durationLabel(minutes: number | null): string {
  if (minutes === null || minutes <= 0) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

// ─── Station Autocomplete Field ───────────────────────────────────────────────

interface StationAutocompleteProps {
  id: string;
  label: string;
  value: string;
  onChange: (text: string) => void;
  onSelect: (station: StationOption) => void;
  suggestions: StationOption[];
}

const StationAutocomplete: React.FC<StationAutocompleteProps> = ({
  id,
  label,
  value,
  onChange,
  onSelect,
  suggestions,
}) => (
  <div className="searchField stationAutocomplete">
    <label htmlFor={id}>{label}</label>
    <input
      id={id}
      type="text"
      placeholder="City or station…"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      autoComplete="off"
    />
    {suggestions.length > 0 && (
      <ul className="suggestionsList">
        {suggestions.map((s) => (
          <li key={s.id} onMouseDown={() => onSelect(s)}>
            <span className="suggName">{s.name}</span>
            <span className="suggCity"> — {s.city}</span>
          </li>
        ))}
      </ul>
    )}
  </div>
);

// ─── Component ────────────────────────────────────────────────────────────────

export const JourneySearch: React.FC = () => {
  const [fromInput, setFromInput] = useState("");
  const [fromStationId, setFromStationId] = useState<string | null>(null);
  const [fromSuggestions, setFromSuggestions] = useState<StationOption[]>([]);

  const [toInput, setToInput] = useState("");
  const [toStationId, setToStationId] = useState<string | null>(null);
  const [toSuggestions, setToSuggestions] = useState<StationOption[]>([]);

  const [date, setDate] = useState("");
  const [results, setResults] = useState<JourneyResult[]>([]);
  const [searched, setSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("ALL");
  const [filterMaxHours, setFilterMaxHours] = useState("");

  const debounceFrom = useRef<ReturnType<typeof setTimeout>>();
  const debounceTo = useRef<ReturnType<typeof setTimeout>>();

  useEffect(
    () => () => {
      clearTimeout(debounceFrom.current);
      clearTimeout(debounceTo.current);
    },
    [],
  );

  function searchStation(
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
      console.log("Station search results for", query, res);
      // Backend returns { data: Station[], total: number }
      setSuggestions(Array.isArray(res?.data) ? res.data : []);
    }, 300);
  }

  function onFromChange(text: string) {
    setFromInput(text);
    setFromStationId(null);
    searchStation(text, setFromSuggestions, debounceFrom);
  }

  function onToChange(text: string) {
    setToInput(text);
    setToStationId(null);
    searchStation(text, setToSuggestions, debounceTo);
  }

  function selectFrom(station: StationOption) {
    setFromInput(station.name);
    setFromStationId(station.id);
    setFromSuggestions([]);
  }

  function selectTo(station: StationOption) {
    setToInput(station.name);
    setToStationId(station.id);
    setToSuggestions([]);
  }

  async function onSearch(e: FormEvent) {
    e.preventDefault();
    if (!fromStationId) {
      toast.error("Please select a departure station from the dropdown.");
      return;
    }
    if (!toStationId) {
      toast.error("Please select an arrival station from the dropdown.");
      return;
    }
    if (!date) {
      toast.error("Please select a departure date.");
      return;
    }
    if (fromStationId === toStationId) {
      toast.error("Departure and arrival stations must be different.");
      return;
    }
    setIsLoading(true);
    setSearched(false);

    const data = await ApiService.searchJourneys(
      fromStationId,
      toStationId,
      date,
    );
    setIsLoading(false);
    setSearched(true);
    if (data.statusCode) {
      toast.error(data.message ?? "Search failed. Please try again.");
      setResults([]);
      return;
    }
    setResults(Array.isArray(data) ? data : []);
  }

  const filtered = results.filter((jr) => {
    if (filterStatus !== "ALL" && jr.train.status !== filterStatus)
      return false;
    if (filterMaxHours && jr.durationMinutes !== null) {
      if (jr.durationMinutes > Number(filterMaxHours) * 60) return false;
    }
    return true;
  });

  return (
    <div className="searchDiv">
      <h2 className="searchTitle">Find a Journey</h2>

      <form className="searchForm" onSubmit={onSearch}>
        <div className="searchInputs">
          <StationAutocomplete
            id="sfrom"
            label="From"
            value={fromInput}
            onChange={onFromChange}
            onSelect={selectFrom}
            suggestions={fromSuggestions}
          />
          <div className="searchArrow">→</div>
          <StationAutocomplete
            id="sto"
            label="To"
            value={toInput}
            onChange={onToChange}
            onSelect={selectTo}
            suggestions={toSuggestions}
          />
          <div className="searchField">
            <label htmlFor="sdate">Date</label>
            <input
              id="sdate"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>
        <button type="submit" className="searchBtn" disabled={isLoading}>
          {isLoading ? "Searching…" : "Search"}
        </button>
      </form>

      {searched && results.length > 0 && (
        <div className="searchFilters">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
          >
            <option value="ALL">All statuses</option>
            <option value="ON_TIME">On Time</option>
            <option value="DELAYED">Delayed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <input
            type="number"
            placeholder="Max duration (hours)"
            min={1}
            value={filterMaxHours}
            onChange={(e) => setFilterMaxHours(e.target.value)}
          />
        </div>
      )}

      {isLoading && <Spinner />}

      {searched && !isLoading && (
        <>
          {!filtered.length ? (
            <p className="searchEmpty">
              No journeys found matching your criteria.
            </p>
          ) : (
            <div className="resultsList">
              {filtered.map((jr) => (
                <div key={jr.train.id} className="resultCard">
                  <div className="resultCardTop">
                    <div className="resultRoute">
                      <div className="routeEndpoint">
                        <span className="epTime">
                          {fmtTime(jr.departureDate)}
                        </span>
                        <span className="epCity">{jr.fromStation.name}</span>
                        <span className="epDate">
                          {fmtDate(jr.departureDate)}
                        </span>
                      </div>
                      <div className="routeMiddle">
                        <div className="durationLine">
                          <span className="durationDot" />
                          <span className="durationTrack" />
                          <span className="durationDot" />
                        </div>
                        <span className="durationLabel">
                          {durationLabel(computeDuration(jr))}
                        </span>
                        {jr.stops.length && (
                          <span className="stopsCount">
                            {jr.stops.length} intermediate stop
                            {jr.stops.length > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                      <div className="routeEndpoint">
                        <span className="epTime">
                          {fmtTime(jr.arrivalDate)}
                        </span>
                        <span className="epCity">{jr.toStation.name}</span>
                        <span className="epDate">
                          {fmtDate(jr.arrivalDate)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="resultCardBottom">
                    <div className="resultMeta">
                      {jr.train.trainNumber && (
                        <span className="trainNum">
                          Train #{jr.train.trainNumber}
                        </span>
                      )}
                      <span className="seatCount">
                        {jr.train.availableSeats} seats · ${jr.train.price}
                      </span>
                    </div>
                    <div className="resultActions">
                      <StatusBadge
                        status={jr.train.status}
                        delayMinutes={jr.train.delayMinutes}
                      />
                      <Link
                        to={`/trains/${jr.train.id}`}
                        className="detailsLink"
                      >
                        Details →
                      </Link>
                    </div>
                  </div>

                  {jr.stops.length && (
                    <div className="intermediateStops">
                      <span className="stopsLabel">Via: </span>
                      {jr.stops
                        .map((s, i, arr) => (
                          <span key={s.station.id} className="stopChip">
                            {s.station.name}
                            {i < arr.length - 1 ? " · " : ""}
                          </span>
                        ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
