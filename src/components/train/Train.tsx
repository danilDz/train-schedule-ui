import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import "./Train.scss";
import { ITrain, TrainStatus } from "./interfaces/train.interface";
import { ApiService } from "../../services/api.service";
import { useLogout } from "../../utils/logout";
import { Error } from "../error/Error";
import { Spinner } from "../spinner/Spinner";
import { StatusBadge } from "../shared/StatusBadge";
import { ConfirmModal } from "../shared/ConfirmModal";
import { statusCodesForLogout } from "../../variables";

export const Train: React.FunctionComponent = () => {
  const { trainId } = useParams();
  const [trainInfo, setTrainInfo] = useState<ITrain>({} as ITrain);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isDispatcher, setIsDispatcher] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<TrainStatus>("ON_TIME");
  const [delayMinutes, setDelayMinutes] = useState("");

  const navigate = useNavigate();
  const logout = useLogout();

  useEffect(() => {
    async function fetchTrainInfo() {
      const [loadedTrainInfo, user] = await Promise.all([
        ApiService.getTrainInfoById(trainId!),
        ApiService.getUserInfo(),
      ]);
      if (loadedTrainInfo.statusCode || user.statusCode) {
        setIsLoading(false);
        if (
          statusCodesForLogout.includes(loadedTrainInfo.statusCode) ||
          statusCodesForLogout.includes(user.statusCode)
        ) {
          logout();
        }
        toast.error("Something went wrong!");
        setIsError(true);
        return;
      }
      const role = user.role ?? (user.isAdmin ? "ADMIN" : "PASSENGER");
      setIsAdmin(role === "ADMIN");
      setIsDispatcher(role === "ADMIN" || role === "DISPATCHER");
      setTrainInfo(loadedTrainInfo);
      setIsLoading(false);
    }
    fetchTrainInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onDeleteTrain() {
    setShowDeleteModal(false);
    setIsLoading(true);
    const response = await ApiService.deleteTrainById(trainId!);
    if (response.statusCode) {
      setIsLoading(false);
      if (statusCodesForLogout.includes(response.statusCode)) logout();
      toast.error("Something went wrong!");
      return;
    }
    toast.success("Train was deleted!");
    navigate("/");
  }

  async function onStatusChange() {
    setShowStatusModal(false);
    const res = await ApiService.updateTrainStatus(
      trainId!,
      pendingStatus,
      pendingStatus === "DELAYED" && delayMinutes
        ? Number(delayMinutes)
        : undefined
    );
    if (res.statusCode) {
      if (statusCodesForLogout.includes(res.statusCode)) logout();
      toast.error("Failed to update status.");
      return;
    }
    setTrainInfo((prev) => ({
      ...prev,
      status: pendingStatus,
      delayMinutes:
        pendingStatus === "DELAYED" ? Number(delayMinutes) : undefined,
    }));
    toast.success("Train status updated!");
  }

  if (isError) return <Error />;
  if (isLoading) return <Spinner />;

  const arrivalDate =
    new Date(trainInfo.arrivalDate)
      .toDateString()
      .split(" ")
      .slice(1)
      .join(" ") +
    ", " +
    trainInfo.arrivalDate.slice(11, 16);
  const departureDate =
    new Date(trainInfo.departureDate)
      .toDateString()
      .split(" ")
      .slice(1)
      .join(" ") +
    ", " +
    trainInfo.departureDate.slice(11, 16);

  return (
    <>
      <div className="mainTrainInfoDiv">
        <Link to="/" className="backLink">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24">
            <path
              d="m12.718 4.707-1.413-1.415L2.585 12l8.72 8.707 1.413-1.415L6.417 13H20v-2H6.416l6.302-6.293z"
              fill="rgba(240, 141, 242)"
            />
          </svg>
          Go Back
        </Link>

        {trainInfo.status && (
          <div className="trainStatusRow">
            <StatusBadge
              status={trainInfo.status}
              delayMinutes={trainInfo.delayMinutes}
            />
          </div>
        )}

        <div className="departureArrival">
          <div>
            <p>Departure</p>
            <p>{departureDate}</p>
            <p>{trainInfo.departureCity}</p>
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
            <p>Arrival</p>
            <p>{arrivalDate}</p>
            <p>{trainInfo.arrivalCity}</p>
          </div>
        </div>

        <p>Available seats: {trainInfo.availableSeats}</p>
        <p>Price: ${trainInfo.price}</p>

        {trainInfo.stops && trainInfo.stops.length > 0 && (
          <div className="stopsSection">
            <h3 className="stopsSectionTitle">Route</h3>
            <div className="stopsTimeline">
              {trainInfo.stops
                .slice()
                .sort((a, b) => a.stopOrder - b.stopOrder)
                .map((stop, idx) => (
                  <div key={stop.id} className="timelineStop">
                    <div className="timelineMarker">
                      <span className="timelineDot" />
                      {idx < trainInfo.stops!.length - 1 && (
                        <span className="timelineLine" />
                      )}
                    </div>
                    <div className="timelineContent">
                      <span className="timelineStation">
                        {stop.station?.name ?? stop.stationName ?? ""}
                      </span>
                      <div className="timelineTimes">
                        {stop.arrivalTime && (
                          <span>arr. {stop.arrivalTime}</span>
                        )}
                        {stop.departureTime && (
                          <span>dep. {stop.departureTime}</span>
                        )}
                        {stop.platform && (
                          <span>platform {stop.platform}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        <div className="controlsDiv">
          {isDispatcher && (
            <button
              className="controlBtn statusBtn"
              onClick={() => {
                setPendingStatus(trainInfo.status ?? "ON_TIME");
                setDelayMinutes(
                  trainInfo.delayMinutes?.toString() ?? ""
                );
                setShowStatusModal(true);
              }}
            >
              Update Status
            </button>
          )}
          {isAdmin && (
            <>
              <button className="controlBtn" onClick={() => setShowDeleteModal(true)}>
                Delete Train
              </button>
              <Link to={`/trains/edit/${trainId}`} className="controlBtn">
                Edit Train
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Delete confirmation */}
      <ConfirmModal
        isOpen={showDeleteModal}
        message="Are you sure you want to delete this train? This cannot be undone."
        confirmLabel="Delete"
        isDanger
        onConfirm={onDeleteTrain}
        onClose={() => setShowDeleteModal(false)}
      />

      {/* Status update modal */}
      {showStatusModal && (
        <div
          className="statusModalOverlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowStatusModal(false);
          }}
        >
          <div className="statusModal">
            <h3>Update Train Status</h3>
            <div className="statusOptions">
              {(["ON_TIME", "DELAYED", "CANCELLED"] as TrainStatus[]).map(
                (s) => (
                  <button
                    key={s}
                    className={`statusOptionBtn statusOptionBtn--${s.toLowerCase()}${pendingStatus === s ? " active" : ""}`}
                    onClick={() => setPendingStatus(s)}
                  >
                    {s === "ON_TIME" ? "🟢 On Time" : s === "DELAYED" ? "🟠 Delayed" : "🔴 Cancelled"}
                  </button>
                )
              )}
            </div>
            {pendingStatus === "DELAYED" && (
              <div className="delayInput">
                <label>Delay (minutes)</label>
                <input
                  type="number"
                  min={1}
                  value={delayMinutes}
                  onChange={(e) => setDelayMinutes(e.target.value)}
                  placeholder="e.g. 30"
                />
              </div>
            )}
            <div className="statusModalButtons">
              <button
                className="confirmBtn confirmBtn--cancel"
                onClick={() => setShowStatusModal(false)}
              >
                Cancel
              </button>
              <button
                className="confirmBtn confirmBtn--confirm"
                onClick={onStatusChange}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

