import { useEffect, useState } from "react";
import { getNearbyHospitals } from "../services/api";

/* ---------------- CONFIG ---------------- */
const BASE_SPEED_KMPH = 35;      // realistic city speed
const TRAFFIC_BUFFER = 1.25;     // 25% buffer
const MAX_RADIUS_KM = 15;

/* ---------------- HELPERS ---------------- */

// Accurate distance (Haversine)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Safely extract coordinates
function extractCoords(h) {
  if (h.latitude && h.longitude)
    return { lat: h.latitude, lng: h.longitude };

  if (h.lat && h.lng)
    return { lat: h.lat, lng: h.lng };

  if (h.geometry?.location)
    return {
      lat: h.geometry.location.lat,
      lng: h.geometry.location.lng
    };

  return null;
}

// Remove invalid / fake hospitals
function isValidHospital(h) {
  return (
    h.name &&
    h.name.toLowerCase() !== "point b" &&
    h.name.toLowerCase() !== "unknown"
  );
}

// Remove duplicates (same name + coords)
function removeDuplicates(list) {
  const map = new Map();
  list.forEach((h) => {
    const key = `${h.name}-${h.latitude}-${h.longitude}`;
    if (!map.has(key)) map.set(key, h);
  });
  return [...map.values()];
}

/* ---------------- COMPONENT ---------------- */

function EmergencyActive() {
  const [location, setLocation] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);

  const driver = JSON.parse(localStorage.getItem("driver"));

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const current = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        };

        setLocation(current);

        try {
          const res = await getNearbyHospitals(current);

          const processed = (res.data || [])
            .filter(isValidHospital)
            .map((h) => {
              const coords = extractCoords(h);
              if (!coords) return null;

              const distance = calculateDistance(
                current.latitude,
                current.longitude,
                coords.lat,
                coords.lng
              );

              if (distance > MAX_RADIUS_KM) return null;

              const eta = Math.max(
                2,
                Math.round(
                  (distance / BASE_SPEED_KMPH) * 60 * TRAFFIC_BUFFER
                )
              );

              return {
                id: h.id || crypto.randomUUID(),
                name: h.name,
                latitude: coords.lat,
                longitude: coords.lng,
                distance: Number(distance.toFixed(2)),
                eta,
                status: h.emergency === false
                  ? "NO EMERGENCY"
                  : "EMERGENCY AVAILABLE"
              };
            })
            .filter(Boolean);

          const unique = removeDuplicates(processed);

          // Sort by fastest ETA
          unique.sort((a, b) => a.eta - b.eta);

          setHospitals(unique);
        } catch (err) {
          console.error("Hospital fetch error:", err);
        } finally {
          setLoading(false);
        }
      },
      () => {
        alert("⚠️ Location permission required");
        setLoading(false);
      }
    );
  }, []);

  const startNavigation = (h) => {
    window.open(
      `https://www.google.com/maps/dir/?api=1&origin=${location.latitude},${location.longitude}&destination=${h.latitude},${h.longitude}&travelmode=driving`,
      "_blank"
    );
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>🚨 Emergency Mode Active</h2>

      {driver && (
        <p>
          👨‍⚕️ <b>Driver:</b> {driver.name}<br />
          🚑 <b>Ambulance:</b> {driver.ambulanceNo}
        </p>
      )}

      {loading && <p>🔍 Finding nearest emergency hospitals…</p>}

      {!loading && hospitals.length === 0 && (
        <p>❌ No verified emergency hospitals nearby.</p>
      )}

      {hospitals.map((h) => (
        <div
          key={h.id}
          style={{
            border: "1px solid #ddd",
            borderRadius: 8,
            padding: 15,
            marginBottom: 10
          }}
        >
          <h4>🏥 {h.name}</h4>
          <p>
            📏 <b>Distance:</b> {h.distance} km<br />
            ⏱️ <b>ETA:</b> {h.eta} mins<br />
            🚨 <b>Status:</b>{" "}
            <span
              style={{
                color: h.status.includes("AVAILABLE") ? "green" : "red",
                fontWeight: "bold"
              }}
            >
              {h.status}
            </span>
          </p>

          {h.status.includes("AVAILABLE") && (
            <button
              onClick={() => startNavigation(h)}
              style={{
                background: "#2563EB",
                color: "#fff",
                padding: 10,
                border: "none",
                borderRadius: 5,
                cursor: "pointer"
              }}
            >
              🚑 Start Navigation
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

export default EmergencyActive;
