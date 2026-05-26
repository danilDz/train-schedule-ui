import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import "./Dashboard.scss";
import { ApiService } from "../../services/api.service";
import { Spinner } from "../spinner/Spinner";
import { useLogout } from "../../utils/logout";
import { statusCodesForLogout } from "../../variables";

interface IDashboardStats {
  totalTrains: number;
  totalStations: number;
  delayedTrains: number;
  cancelledTrains: number;
  activeRoutes: number;
}

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<IDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const logout = useLogout();

  useEffect(() => {
    async function fetchStats() {
      const data = await ApiService.getDashboardStats();
      if (data.statusCode || typeof data !== "object" || data === null) {
        if (data?.statusCode && statusCodesForLogout.includes(data.statusCode)) logout();
        // Endpoint unavailable or empty DB — show zeros rather than an error
        setStats({ totalTrains: 0, totalStations: 0, delayedTrains: 0, cancelledTrains: 0, activeRoutes: 0 });
        setIsLoading(false);
        return;
      }
      setStats(data);
      setIsLoading(false);
    }
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) return <Spinner />;

  return (
    <div className="dashboardDiv">
      <h2 className="dashboardTitle">Dashboard</h2>

      <div className="statsGrid">
        <div className="statCard">
          <span className="statValue">{stats?.totalTrains ?? "—"}</span>
          <span className="statLabel">Total Trains</span>
        </div>
        <div className="statCard">
          <span className="statValue">{stats?.totalStations ?? "—"}</span>
          <span className="statLabel">Total Stations</span>
        </div>
        <div className="statCard statCard--delayed">
          <span className="statValue">{stats?.delayedTrains ?? "—"}</span>
          <span className="statLabel">Delayed Trains</span>
        </div>
        <div className="statCard statCard--cancelled">
          <span className="statValue">{stats?.cancelledTrains ?? "—"}</span>
          <span className="statLabel">Cancelled</span>
        </div>
        <div className="statCard">
          <span className="statValue">{stats?.activeRoutes ?? "—"}</span>
          <span className="statLabel">Active Routes</span>
        </div>
      </div>

      <div className="dashboardLinks">
        <Link to="/" className="dashboardLinkCard">
          <span className="linkIcon">🚂</span>
          <span>All Trains</span>
        </Link>
        <Link to="/stations" className="dashboardLinkCard">
          <span className="linkIcon">🏢</span>
          <span>Stations</span>
        </Link>
        <Link to="/search" className="dashboardLinkCard">
          <span className="linkIcon">🔍</span>
          <span>Search Journeys</span>
        </Link>
      </div>

    </div>
  );
};
