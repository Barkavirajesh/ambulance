import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const [driver, setDriver] = useState(null);

  // ✅ Protect dashboard (no access without login)
  useEffect(() => {
    const storedDriver = localStorage.getItem("driver");

    if (!storedDriver) {
      navigate("/", { replace: true }); // redirect to login
    } else {
      setDriver(JSON.parse(storedDriver));
    }
  }, [navigate]);

  const startEmergency = () => {
    navigate("/emergency");
  };

  const logout = () => {
    localStorage.removeItem("driver");
    navigate("/", { replace: true });
  };

  if (!driver) return null; // prevents flicker

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <h2>🚑 Emergency Dashboard</h2>
        <p className="subtitle">
          Press only in case of an active emergency
        </p>

        {/* ✅ MINIMAL DRIVER INFO ONLY */}
        <div
          style={{
            background: "#ECFEFF",
            border: "1px solid #06B6D4",
            borderRadius: "8px",
            padding: "12px",
            marginBottom: "15px"
          }}
        >
          <p>
            <strong>Driver Name:</strong> {driver.name} <br />
            <strong>Ambulance No:</strong> {driver.ambulanceNo}
          </p>
        </div>

        {/* 🚨 EMERGENCY BUTTON */}
        <button className="emergency-btn" onClick={startEmergency}>
          🚨 EMERGENCY
        </button>

        {/* 🔓 LOGOUT */}
        <button
          onClick={logout}
          style={{
            marginTop: "12px",
            background: "#EF4444",
            color: "white",
            border: "none",
            padding: "8px",
            borderRadius: "5px",
            cursor: "pointer"
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
