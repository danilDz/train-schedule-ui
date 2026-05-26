import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import "./StationsList.scss";
import { IStation } from "../station/interfaces/station.interface";
import { ApiService } from "../../services/api.service";
import { Spinner } from "../spinner/Spinner";
import { useAuth } from "../../hooks/useAuth";
import { useLogout } from "../../utils/logout";
import { statusCodesForLogout } from "../../variables";

export const StationsList: React.FC = () => {
  const [stations, setStations] = useState<IStation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [cities, setCities] = useState<string[]>([]);
  const [sortField, setSortField] = useState<keyof IStation>("name");
  const [sortAsc, setSortAsc] = useState(true);
  const [ended, setEnded] = useState(false);
  const [offset, setOffset] = useState(0);
  const [isMoreLoading, setIsMoreLoading] = useState(false);
  const limit = 10;

  const { isAdmin } = useAuth();
  const logout = useLogout();

  useEffect(() => {
    loadContent(false, 0, "", "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadContent(
    loadMore: boolean,
    currentOffset: number,
    currentSearch: string,
    currentCity: string,
  ) {
    if (loadMore) setIsMoreLoading(true);
    else {
      setIsLoading(true);
      setStations([]);
      setEnded(false);
    }

    const data = await ApiService.getAllStations(
      limit,
      loadMore ? currentOffset : 0,
      currentSearch || undefined,
      currentCity || undefined,
    );

    if (data.statusCode) {
      setIsLoading(false);
      setIsMoreLoading(false);
      if (statusCodesForLogout.includes(data.statusCode)) {
        logout();
        return;
      }
      // Non-auth error (e.g. empty DB, endpoint not ready) — show empty state
      setStations([]);
      setEnded(true);
      setIsLoading(false);
      return;
    }

    const list: IStation[] = Array.isArray(data.data) ? data.data : [];
    setStations((prev) => (loadMore ? [...prev, ...list] : list));
    setEnded(list.length < limit);
    setOffset(loadMore ? currentOffset + limit : limit);

    if (!loadMore) {
      const seen = new Set<string>();
      const uniqCities = list
        .map((s) => s.city)
        .filter((c) => (seen.has(c) ? false : seen.add(c) && true))
        .sort();
      setCities(uniqCities);
    }

    setIsMoreLoading(false);
    setIsLoading(false);

    console.log(stations);
  }

  function handleSearch() {
    setOffset(0);
    setEnded(false);
    loadContent(false, 0, search, cityFilter);
  }

  function toggleSort(field: keyof IStation) {
    if (sortField === field) setSortAsc((p) => !p);
    else {
      setSortField(field);
      setSortAsc(true);
    }
  }

  const sorted = [...stations].sort((a, b) => {
    const va = a[sortField] ?? "";
    const vb = b[sortField] ?? "";
    if (va < vb) return sortAsc ? -1 : 1;
    if (va > vb) return sortAsc ? 1 : -1;
    return 0;
  });

  const arrow = (field: keyof IStation) => {
    if (sortField !== field) return "";
    return sortAsc ? " ▲" : " ▼";
  };

  if (isLoading) return <Spinner />;

  return (
    <div className="stationsListDiv">
      <div className="stationsHeader">
        <h2>Stations</h2>
        {isAdmin && (
          <Link to="/stations/create" className="createStationBtn">
            + New Station
          </Link>
        )}
      </div>

      <div className="stationsFilters">
        <input
          type="text"
          placeholder="Search by name or code…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <select
          value={cityFilter}
          onChange={(e) => {
            setCityFilter(e.target.value);
          }}
        >
          <option value="">All cities</option>
          {cities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
        <button className="filterBtn" onClick={handleSearch}>
          Search
        </button>
      </div>

      {!sorted.length ? (
        <p className="emptyMsg">No stations found.</p>
      ) : (
        <div className="stationsTable">
          <div className="tableHeader">
            <span className="sortable" onClick={() => toggleSort("name")}>
              Name{arrow("name")}
            </span>
            <span className="sortable" onClick={() => toggleSort("code")}>
              Code{arrow("code")}
            </span>
            <span className="sortable" onClick={() => toggleSort("city")}>
              City{arrow("city")}
            </span>
            <span
              className="sortable"
              onClick={() => toggleSort("platformCount")}
            >
              Platforms{arrow("platformCount")}
            </span>
            <span>Actions</span>
          </div>

          {sorted.map((station) => (
            <div key={station.id} className="tableRow">
              <span>{station.name}</span>
              <span className="codeTag">{station.code}</span>
              <span>{station.city}</span>
              <span>{station.platformCount}</span>
              <div className="rowActions">
                <Link to={`/stations/${station.id}`} className="actionLink">
                  View
                </Link>
                {isAdmin && (
                  <Link
                    to={`/stations/edit/${station.id}`}
                    className="actionLink"
                  >
                    Edit
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!ended &&
        stations.length > 0 &&
        (isMoreLoading ? (
          <Spinner />
        ) : (
          <button
            className="loadMoreBtn"
            onClick={() => loadContent(true, offset, search, cityFilter)}
          >
            Load More
          </button>
        ))}
    </div>
  );
};
