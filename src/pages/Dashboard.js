import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const startEmergency = () => {
    navigate("/emergency");
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <h2>🚑 Emergency Dashboard</h2>
        <p className="subtitle">
          Press only in case of an active emergency
        </p>

        <button className="emergency-btn" onClick={startEmergency}>
          🚨 EMERGENCY
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
