const notFound = (req, res, next) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
};

const errorHandler = (err, req, res, next) => {
  console.error("Server error:", err.message);

  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: Object.values(err.errors)
        .map((e) => e.message)
        .join(", "),
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({ success: false, message: "Invalid ID format" });
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
};

module.exports = { notFound, errorHandler };
