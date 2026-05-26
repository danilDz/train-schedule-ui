import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./MyBookings.scss";
import { ApiService } from "../../services/api.service";
import { Spinner } from "../spinner/Spinner";
import { useLogout } from "../../utils/logout";
import { statusCodesForLogout } from "../../variables";

const PAGE_SIZE = 5;

type BookingStatus =
  | "PENDING_PAYMENT"
  | "CONFIRMED"
  | "CANCELLED"
  | "EXPIRED"
  | "REFUNDED";

interface IBooking {
  id: string;
  status: BookingStatus;
  totalAmount: string;
  currency: string;
  expiresAt: string;
  createdAt: string;
  seat: {
    seatNumber: number;
    class: string;
    carriage: {
      carriageNumber: number;
    };
  };
  train: {
    id: string;
    name?: string;
    departureCity: string;
    arrivalCity: string;
    departureDate: string;
  };
  ticket?: {
    ticketNumber: string;
    issuedAt: string;
  };
}

const STATUS_LABELS: Record<BookingStatus, string> = {
  PENDING_PAYMENT: "Pending",
  CONFIRMED: "Confirmed",
  CANCELLED: "Cancelled",
  EXPIRED: "Expired",
  REFUNDED: "Refunded",
};

const STATUS_CLASS: Record<BookingStatus, string> = {
  PENDING_PAYMENT: "badge--pending",
  CONFIRMED: "badge--confirmed",
  CANCELLED: "badge--cancelled",
  EXPIRED: "badge--expired",
  REFUNDED: "badge--refunded",
};

export const MyBookings: React.FC = () => {
  const [bookings, setBookings] = useState<IBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const logout = useLogout();
  const navigate = useNavigate();

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  useEffect(() => {
    fetchBookings(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  async function fetchBookings(p: number) {
    setIsLoading(true);
    const data = await ApiService.getMyBookings(p, PAGE_SIZE);
    if (data?.statusCode) {
      if (statusCodesForLogout.includes(data.statusCode)) logout();
      toast.error("Failed to load bookings.");
      setIsLoading(false);
      return;
    }
    setBookings(Array.isArray(data?.data) ? data.data : []);
    setTotal(data?.total ?? 0);
    setIsLoading(false);
  }

  async function handleCancel(id: string) {
    setCancellingId(id);
    const res = await ApiService.cancelBooking(id);
    setCancellingId(null);
    if (res?.statusCode) {
      if (statusCodesForLogout.includes(res.statusCode)) logout();
      toast.error(res.message ?? "Failed to cancel booking.");
      return;
    }
    toast.success("Booking cancelled.");
    // If the current page becomes empty after cancellation, go back one page
    const newTotal = total - 1;
    const newTotalPages = Math.max(1, Math.ceil(newTotal / PAGE_SIZE));
    const nextPage = Math.min(page, newTotalPages);
    if (nextPage !== page) {
      setPage(nextPage);
    } else {
      fetchBookings(page);
    }
  }

  async function handleRetryPayment(booking: IBooking) {
    const session = await ApiService.createCheckoutSession(booking.id);
    if (session?.statusCode) {
      toast.error(session.message ?? "Failed to create payment session.");
      return;
    }
    window.location.href = session.url;
  }

  if (isLoading) return <Spinner />;

  return (
    <div className="myBookings">
      <h2 className="myBookings__title">My Bookings</h2>

      {bookings.length === 0 ? (
        <div className="myBookings__empty">
          <p>You have no bookings yet.</p>
          <button
            className="myBookings__browseBtn"
            onClick={() => navigate("/")}
          >
            Browse Trains
          </button>
        </div>
      ) : (
        <div className="myBookings__list">
          {bookings.map((booking) => (
            <div key={booking.id} className="bookingCard">
              <div className="bookingCard__header">
                <div className="bookingCard__route">
                  <span>{booking.train?.departureCity}</span>
                  <span className="bookingCard__arrow">→</span>
                  <span>{booking.train?.arrivalCity}</span>
                </div>
                <span
                  className={`bookingCard__badge ${STATUS_CLASS[booking.status]}`}
                >
                  {STATUS_LABELS[booking.status]}
                </span>
              </div>

              <div className="bookingCard__details">
                <div className="bookingCard__detailRow">
                  <span className="bookingCard__label">Departure</span>
                  <span>
                    {new Date(booking.train?.departureDate).toLocaleString()}
                  </span>
                </div>
                <div className="bookingCard__detailRow">
                  <span className="bookingCard__label">Seat</span>
                  <span>
                    Carriage {booking.seat?.carriage?.carriageNumber} · Seat{" "}
                    {booking.seat?.seatNumber} ({booking.seat?.class})
                  </span>
                </div>
                <div className="bookingCard__detailRow">
                  <span className="bookingCard__label">Amount</span>
                  <span>
                    ${parseFloat(booking.totalAmount).toFixed(2)}{" "}
                    {booking.currency.toUpperCase()}
                  </span>
                </div>
                {booking.ticket && (
                  <div className="bookingCard__detailRow">
                    <span className="bookingCard__label">Ticket</span>
                    <span className="bookingCard__ticket">
                      {booking.ticket.ticketNumber}
                    </span>
                  </div>
                )}
                {booking.status === "PENDING_PAYMENT" && (
                  <div className="bookingCard__detailRow">
                    <span className="bookingCard__label">Expires</span>
                    <span className="bookingCard__expiry">
                      {new Date(booking.expiresAt).toLocaleTimeString()}
                    </span>
                  </div>
                )}
              </div>

              <div className="bookingCard__actions">
                {booking.status === "PENDING_PAYMENT" && (
                  <>
                    <button
                      className="bookingCard__btn bookingCard__btn--pay"
                      onClick={() => handleRetryPayment(booking)}
                    >
                      Pay Now
                    </button>
                    <button
                      className="bookingCard__btn bookingCard__btn--cancel"
                      onClick={() => handleCancel(booking.id)}
                      disabled={cancellingId === booking.id}
                    >
                      {cancellingId === booking.id ? "Cancelling…" : "Cancel"}
                    </button>
                  </>
                )}
                {booking.status === "CONFIRMED" && (
                  <button
                    className="bookingCard__btn bookingCard__btn--cancel"
                    onClick={() => handleCancel(booking.id)}
                    disabled={cancellingId === booking.id}
                  >
                    {cancellingId === booking.id
                      ? "Processing…"
                      : "Request Refund"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="myBookings__pagination">
          <button
            className="myBookings__pageBtn"
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 1}
          >
            ‹
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              className={`myBookings__pageBtn${page === p ? " myBookings__pageBtn--active" : ""}`}
              onClick={() => setPage(p)}
            >
              {p}
            </button>
          ))}

          <button
            className="myBookings__pageBtn"
            onClick={() => setPage((p) => p + 1)}
            disabled={page === totalPages}
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
};
