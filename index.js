require("dotenv").config();

const express = require("express");
const passport = require("passport");
const connectDB = require("./config/db");
const { protect } = require("./middleware/auth");
const { notFound, errorHandler } = require("./middleware/errorHandler");
const { apiLimiter } = require("./middleware/rateLimit");

require("./config/passport");

const helmet = require("helmet");

const app = express();
app.set("trust proxy", 1);

const cors = require("cors");

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL
}));
app.use(express.json({ limit: "10kb" }));
app.use(passport.initialize());
app.use("/api", apiLimiter);

connectDB();

app.get("/", (req, res) => {
  res.json({ message: "KaviosPix API is running" });
});

app.get("/api/me", protect, (req, res) => {
  res.json(req.user);
});

app.use("/auth", require("./routes/auth.routes"));
app.use("/api/albums", require("./routes/album.routes"));
app.use("/api/albums/:albumId/images", require("./routes/image.routes"));


app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});