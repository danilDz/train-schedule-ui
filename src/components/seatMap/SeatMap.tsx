import React from "react";
import "./SeatMap.scss";

export interface ISeat {
  id: string;
  seatNumber: number;
  class: string;
  isBookingAvailable: boolean;
}

export interface ICarriage {
  id: string;
  carriageNumber: number;
  type: string;
  totalSeats: number;
  seats: ISeat[];
}

interface SeatMapProps {
  carriages: ICarriage[];
  selectedSeatId: string | null;
  onSeatSelect: (seat: ISeat) => void;
}

export const SeatMap: React.FC<SeatMapProps> = ({
  carriages,
  selectedSeatId,
  onSeatSelect,
}) => {
  if (!carriages || carriages.length === 0) {
    return (
      <p className="seatMap__empty">No carriage data available for this train.</p>
    );
  }

  return (
    <div className="seatMap">
      {carriages.map((carriage) => (
        <div key={carriage.id} className="seatMap__carriage">
          <div className="seatMap__carriageHeader">
            <span className="seatMap__carriageNumber">
              Carriage {carriage.carriageNumber}
            </span>
            <span className="seatMap__carriageType">{carriage.type}</span>
          </div>
          <div className="seatMap__seats">
            {carriage.seats
              .slice()
              .sort((a, b) => a.seatNumber - b.seatNumber)
              .map((seat) => {
                const isSelected = seat.id === selectedSeatId;
                const available = seat.isBookingAvailable;
                return (
                  <button
                    key={seat.id}
                    className={[
                      "seatMap__seat",
                      available ? "seatMap__seat--available" : "seatMap__seat--taken",
                      isSelected ? "seatMap__seat--selected" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    disabled={!available}
                    onClick={() => available && onSeatSelect(seat)}
                    title={
                      available
                        ? `Seat ${seat.seatNumber} — click to select`
                        : `Seat ${seat.seatNumber} — unavailable`
                    }
                  >
                    {seat.seatNumber}
                  </button>
                );
              })}
          </div>
        </div>
      ))}

      <div className="seatMap__legend">
        <span className="seatMap__legendItem">
          <span className="seatMap__legendDot seatMap__legendDot--available" />
          Available
        </span>
        <span className="seatMap__legendItem">
          <span className="seatMap__legendDot seatMap__legendDot--taken" />
          Taken
        </span>
        <span className="seatMap__legendItem">
          <span className="seatMap__legendDot seatMap__legendDot--selected" />
          Selected
        </span>
      </div>
    </div>
  );
};
