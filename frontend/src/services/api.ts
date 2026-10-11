import axios from "axios";

// we set up the base url where our backend server is listening (Axios, 2024)
const API = axios.create({
  baseURL: "https://localhost:5000/api",
  headers: {
    "Content-Type": "application/json"
  }
});

// interceptor to automatically attach our jwt token to outgoing requests (Axios, 2024)
API.interceptors.request.use((req: any) => {
  const token = localStorage.getItem("token");
  if (token) {
    // sets the bearer authorization header expected by our backend authMiddleware
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// auth calls
export const registerUser = (userData: any) => API.post("/auth/register", userData);
export const loginUser = (credentials: any) => API.post("/auth/login", credentials);

// gig calls
export const fetchGigs = () => API.get("/gigs");
export const createGig = (gigData: any) => API.post("/gigs", gigData);
export const deleteGig = (id: string) => API.delete(`/gigs/${id}`);

// booking calls
export const createBooking = (gigId: string) => API.post("/bookings", { gigId });
export const fetchFreelancerIncome = () => API.get("/bookings/income");

export default API;

/*
Reference list:

Axios, 2024. Axios Interceptors (Version 1.7) [Source Code] Available at: <https://axios-http.com/docs/interceptors> [Accessed 10 October 2026]
*/