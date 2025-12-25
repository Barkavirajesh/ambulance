const express = require("express");
const axios = require("axios");

const router = express.Router();

router.post("/nearby-hospitals", async (req, res) => {
  const { latitude, longitude } = req.body;

  try {
    // 1️⃣ Get nearby hospitals from OpenStreetMap
    const query = `
      [out:json];
      node["amenity"="hospital"](around:8000,${latitude},${longitude});
      out;
    `;

    const osmRes = await axios.post(
      "https://overpass-api.de/api/interpreter",
      query,
      { headers: { "Content-Type": "text/plain" } }
    );

    const hospitals = osmRes.data.elements.slice(0, 5);
    const results = [];

    // 2️⃣ Calculate ETA and get route geometry
    for (const h of hospitals) {
      const routeURL = `https://router.project-osrm.org/route/v1/driving/${longitude},${latitude};${h.lon},${h.lat}?overview=full&geometries=geojson`;
      const routeRes = await axios.get(routeURL);
      const route = routeRes.data.routes[0];

      results.push({
        name: h.tags?.name || "Unnamed Hospital",
        distance_km: (route.distance / 1000).toFixed(2),
        time_min: Math.round(route.duration / 60),
        lat: h.lat,
        lng: h.lon,
        // ✨ Add route geometry (for drawing on map)
        route_geojson: route.geometry
      });
    }

    // 3️⃣ Sort by fastest
    results.sort((a, b) => a.time_min - b.time_min);

    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to calculate ETA" });
  }
});

module.exports = router;
