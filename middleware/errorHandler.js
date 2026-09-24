const multer = require("multer");

const notFound = (req, res, next) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
};


const errorHandler = (err, req, res, next) => {

  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "File too large. Max size is 5MB." });
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({ message: "Upload the file in a field named 'image'." });
    }
    return res.status(400).json({ message: err.message });
  }

  const status = err.statusCode || 500;
  res.status(status).json({ message: err.message || "Something went wrong" });
};

module.exports = { notFound, errorHandler };