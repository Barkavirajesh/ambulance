import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api"
});

export const getNearbyHospitals = (location) =>
  API.post("/emergency/nearby-hospitals", location);
