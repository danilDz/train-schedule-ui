import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import "./BookingSuccess.scss";
import { ApiService } from "../../services/api.service";
import { Spinner } from "../spinner/Spinner";
import { useLogout } from "../../utils/logout";
import { statusCodesForLogout } from "../../variables";

interface ITicket {
  ticketNumber: string;
  issuedAt: string;
}

interface IBookingDetail {
  id: string;
  status: string;
  totalAmount: string;
  currency: string;
  seat: {
    seatNumber: number;
    class: string;
    carriage: { carriageNumber: number };
  };
  train: {
    departureCity: string;
    arrivalCity: string;
    departureDate: string;
  };
  ticket?: ITicket;
}

export const BookingSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("booking_id");
  const [booking, setBooking] = useState<IBookingDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const logout = useLogout();

  useEffect(() => {
    if (!bookingId) {
      setIsLoading(false);
      return;
    }

    // Poll briefly for webhook to process — retry up to 5×
    let attempts = 0;
    const maxAttempts = 5;
    const intervalMs = 2000;

    const timer = setInterval(async () => {
      attempts++;
      const data = await ApiService.getBookingById(bookingId);
      if (data?.statusCode) {
        if (statusCodesForLogout.includes(data.statusCode)) logout();
        toast.error("Failed to load booking.");
        clearInterval(timer);
        setIsLoading(false);
        return;
      }
      if (data.status === "CONFIRMED" || attempts >= maxAttempts) {
        setBooking(data);
        setIsLoading(false);
        clearInterval(timer);
      }
    }, intervalMs);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId]);

  if (isLoading) return <Spinner />;

  if (!booking) {
    return (
      <div className="bookingResult bookingResult--error">
        <h2>Booking not found</h2>
        <Link to="/bookings" className="bookingResult__btn">
          My Bookings
        </Link>
      </div>
    );
  }

  const isConfirmed = booking.status === "CONFIRMED";

  return (
    <div className={`bookingResult ${isConfirmed ? "bookingResult--success" : "bookingResult--pending"}`}>
      <div className="bookingResult__icon">{isConfirmed ? "✓" : "⏳"}</div>
      <h2 className="bookingResult__title">
        {isConfirmed ? "Payment Successful!" : "Payment Processing…"}
      </h2>
      <p className="bookingResult__subtitle">
        {isConfirmed
          ? "Your seat is confirmed. Have a great journey!"
          : "Your payment is being processed. Check your bookings shortly."}
      </p>

      <div className="bookingResult__card">
        <div className="bookingResult__row">
          <span>Route</span>
          <strong>
            {booking.train?.departureCity} → {booking.train?.arrivalCity}
          </strong>
        </div>
        <div className="bookingResult__row">
          <span>Departure</span>
          <strong>
            {new Date(booking.train?.departureDate).toLocaleString()}
          </strong>
        </div>
        <div className="bookingResult__row">
          <span>Seat</span>
          <strong>
            Carriage {booking.seat?.carriage?.carriageNumber} · Seat{" "}
            {booking.seat?.seatNumber} ({booking.seat?.class})
          </strong>
        </div>
        <div className="bookingResult__row">
          <span>Amount</span>
          <strong>
            ${parseFloat(booking.totalAmount).toFixed(2)}{" "}
            {booking.currency?.toUpperCase()}
          </strong>
        </div>
        {booking.ticket && (
          <div className="bookingResult__row">
            <span>Ticket #</span>
            <strong className="bookingResult__ticketNum">
              {booking.ticket.ticketNumber}
            </strong>
          </div>
        )}
      </div>

      <div className="bookingResult__actions">
        <Link to="/bookings" className="bookingResult__btn bookingResult__btn--primary">
          My Bookings
        </Link>
        <Link to="/" className="bookingResult__btn bookingResult__btn--secondary">
          Back to Trains
        </Link>
      </div>
    </div>
  );
};
