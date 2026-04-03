/**
 * asyncHandler — wraps async route handlers so thrown errors are
 * forwarded to Express's next(err) automatically.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
