import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import "./BookingCancel.scss";

export const BookingCancel: React.FC = () => {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("booking_id");

  return (
    <div className="bookingCancel">
      <div className="bookingCancel__icon">✕</div>
      <h2 className="bookingCancel__title">Payment Cancelled</h2>
      <p className="bookingCancel__subtitle">
        Your payment was not completed. Your seat reservation will be held for
        a few more minutes — you can retry payment from My Bookings.
      </p>

      <div className="bookingCancel__actions">
        {bookingId && (
          <Link
            to="/bookings"
            className="bookingCancel__btn bookingCancel__btn--primary"
          >
            Retry Payment
          </Link>
        )}
        <Link
          to="/"
          className="bookingCancel__btn bookingCancel__btn--secondary"
        >
          Back to Trains
        </Link>
      </div>
    </div>
  );
};
