import { useEffect, useState } from "react";
import { getNearbyHospitals } from "../services/api";

const AVERAGE_SPEED_KMPH = 40;

// 🌍 Haversine Distance Formula
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

// 📍 Universal coordinate extractor
function getCoordinates(hospital) {
  if (hospital.latitude && hospital.longitude)
    return { lat: hospital.latitude, lng: hospital.longitude };

  if (hospital.lat && hospital.lng)
    return { lat: hospital.lat, lng: hospital.lng };

  if (hospital.location?.lat && hospital.location?.lng)
    return { lat: hospital.location.lat, lng: hospital.location.lng };

  if (hospital.geometry?.location?.lat && hospital.geometry?.location?.lng)
    return {
      lat: hospital.geometry.location.lat,
      lng: hospital.geometry.location.lng
    };

  return null;
}

// 🌍 Reverse Geocoding (Lat/Lng → Place Name)
async function getPlaceName(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
    );
    const data = await res.json();
    return data.display_name || "Unknown Location";
  } catch {
    return "Unable to fetch location name";
  }
}

function EmergencyActive() {
  const [location, setLocation] = useState(null);
  const [locationName, setLocationName] = useState("Fetching location...");
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const currentLocation = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        };

        setLocation(currentLocation);

        const place = await getPlaceName(
          currentLocation.latitude,
          currentLocation.longitude
        );
        setLocationName(place);

        try {
          const res = await getNearbyHospitals(currentLocation);

          const enriched = (res.data || [])
            .map((h) => {
              const coords = getCoordinates(h);
              if (!coords) return null;

              const distance = calculateDistance(
                currentLocation.latitude,
                currentLocation.longitude,
                coords.lat,
                coords.lng
              );

              const eta = Math.max(
                1,
                Math.round((distance / AVERAGE_SPEED_KMPH) * 60)
              );

              return {
                ...h,
                latitude: coords.lat,
                longitude: coords.lng,
                distance: distance.toFixed(2),
                eta
              };
            })
            .filter(Boolean);

          setHospitals(enriched);
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

  // 🚑 GOOGLE MAPS — DESTINATION AUTOFILL WITH HOSPITAL NAME
  const getDirections = (hospital) => {
    if (!hospital.name) return;

    const destination = encodeURIComponent(
      `${hospital.name}, ${hospital.address || hospital.vicinity || ""}`
    );

    const url =
      `https://www.google.com/maps/dir/?api=1` +
      `&origin=My+Location` +
      `&destination=${destination}` +
      `&travelmode=driving` +
      `&dir_action=navigate`;

    window.location.href = url;
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h2>🚨 Emergency Mode Active</h2>

      {location && (
        <p>
          📍 <strong>Ambulance Current Location</strong><br />
          {locationName}<br />
          Lat: {location.latitude.toFixed(6)} | Lng:{" "}
          {location.longitude.toFixed(6)}
        </p>
      )}

      <h3>Nearest Hospitals</h3>

      {loading && <p>Searching hospitals...</p>}

      {!loading && hospitals.length === 0 && (
        <p>No hospitals found nearby.</p>
      )}

      {hospitals.map((h, index) => (
        <div
          key={index}
          style={{
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "15px",
            marginBottom: "10px"
          }}
        >
          <h4>🏥 {h.name || "Hospital"}</h4>

          <p>
            <strong>Distance:</strong> {h.distance} km <br />
            <strong>ETA:</strong> {h.eta} mins <br />
            <strong>Contact:</strong>{" "}
            {h.contact || h.phone || "Not Available"}
          </p>

          <button
            onClick={() => getDirections(h)}
            style={{
              backgroundColor: "#2563EB",
              color: "white",
              border: "none",
              padding: "10px 15px",
              borderRadius: "5px",
              cursor: "pointer"
            }}
          >
            🚑 Start Navigation
          </button>
        </div>
      ))}
    </div>
  );
}

export default EmergencyActive;
