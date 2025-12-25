import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [ambulanceNo, setAmbulanceNo] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    if (!name || !phone || !ambulanceNo) {
      alert("Please fill all fields");
      return;
    }

    localStorage.setItem(
      "driver",
      JSON.stringify({ name, phone, ambulanceNo })
    );

    navigate("/dashboard");
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>🚑 Ambulance Login</h2>
        <p className="subtitle">Emergency Driver Access</p>

        <input
          type="text"
          placeholder="Driver Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="tel"
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <input
          type="text"
          placeholder="Ambulance Plate No"
          value={ambulanceNo}
          onChange={(e) => setAmbulanceNo(e.target.value)}
        />

        <button onClick={handleLogin}>Login</button>
      </div>
    </div>
  );
}

export default Login;
