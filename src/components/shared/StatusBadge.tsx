import React from "react";
import "./StatusBadge.scss";
import { TrainStatus } from "../train/interfaces/train.interface";

interface StatusBadgeProps {
  status: TrainStatus;
  delayMinutes?: number;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  delayMinutes,
}) => {
  const labels: Record<TrainStatus, string> = {
    ON_TIME: "On Time",
    DELAYED: `Delayed${delayMinutes ? ` +${delayMinutes} min` : ""}`,
    CANCELLED: "Cancelled",
  };

  const icons: Record<TrainStatus, string> = {
    ON_TIME: "🟢",
    DELAYED: "🟠",
    CANCELLED: "🔴",
  };

  return (
    <span className={`statusBadge statusBadge--${status.toLowerCase()}`}>
      {icons[status]} {labels[status]}
    </span>
  );
};
