const express = require("express");
const cors = require("cors");

const emergencyRoutes = require("./routes/emergencyRoutes");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/emergency", emergencyRoutes);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
