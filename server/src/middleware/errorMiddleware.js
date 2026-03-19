const errorMiddleware = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ msg: "Server error", error: err.message });
};

export default errorMiddleware;
