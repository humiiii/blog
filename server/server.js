// Load environment variables as early as possible
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./connect");

connectDB();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const authRoute = require("./routes/auth");
app.use("/", authRoute);

const uploadRoute = require("./routes/imagekitAuth");
app.use("/api", uploadRoute);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server started on port: ${PORT}`);
});
