import React, { useState, useEffect } from "react";
import { fetchGigs, createBooking } from "../services/api";

const GigsList = () => {
  const [gigs, setGigs] = useState([]);
  const [statusMessage, setStatusMessage] = useState("");

  // fetches gigs right after the component mounts on screen (React, 2024)
  useEffect(() => {
    loadGigs();
  }, []);

  const loadGigs = async () => {
    try {
      // pulls all active gigs from the server
      const response = await fetchGigs();
      setGigs(response.data.gigs);
    } catch (err) {
      // friendly fallback message if the server runs into issues
      setStatusMessage("Could not load gigs. Check backend connection.");
    }
  };

  const handleBook = async (gigId) => {
    try {
      // calls backend booking endpoint with gig id
      const res = await createBooking(gigId);
      setStatusMessage(`Booked! Ref: ${res.data.booking.paymentReference}`);
    } catch (err) {
      // shows server error like "You cannot book your own gig"
      setStatusMessage(err.response?.data?.message || "Booking failed.");
    }
  };

  return (
    <div>
      <h2>Available Gigs</h2>
      {statusMessage && <p>{statusMessage}</p>}
      <ul>
        {gigs.map((gig) => (
          <li key={gig.id || gig._id}>
            <h3>{gig.title} - R{gig.price}</h3>
            <p>{gig.description}</p>
            <p><strong>Category:</strong> {gig.category}</p>
            <button onClick={() => handleBook(gig.id || gig._id)}>
              Book Gig
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GigsList;

/*
Reference list:

React, 2024. Synchronizing with Effects (Version 18.3) [Source Code] Available at: <https://react.dev/reference/react/useEffect> [Accessed 10 October 2026]
*/