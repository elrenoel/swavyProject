/**
 * Global error-handling middleware (Express error middleware signature: 4 params).
 *
 * How it works:
 * - Express routes this middleware whenever `next(err)` is called from a
 *   controller/middleware, or when an unhandled exception occurs in an async route.
 * - It is registered LAST in index.js (`app.use(errorHandler)`) so it catches
 *   any error that wasn't handled by previous middleware.
 *
 * Current limitations (to be improved):
 * - Always returns HTTP 500 regardless of the actual error type (e.g. 400, 404).
 * - Response shape `{ error }` is inconsistent with some controllers that use
 *   `{ status, message }` — should be standardized across the app.
 * - Logs the raw error object but lacks request context (route, method, userId)
 *   which makes debugging harder in production.
 * - Exposes no error `code` for the frontend to differentiate error types.
 *
 * @param {Error} err    - The error thrown or passed via next(err)
 * @param {Request} req  - Express request (unused currently, needed for context logging)
 * @param {Response} res - Express response used to send the error JSON
 * @param {Function} next - Must be declared (4-arg signature) for Express to
 *                          recognise this as an error-handling middleware
 */
const errorHandler = (err, req, res, next) => {
  // Log the full error to the server console for developer debugging.
  // TODO: Include request context (req.method, req.originalUrl, req.user?.id)
  //       so errors can be traced back to specific routes and users.
  console.error("🔴 Unhandled Error:", err);

  // Send a generic 500 response to the client.
  // TODO: Use err.status (if set) instead of hardcoding 500,
  //       and return a structured body: { status, message, code, detail? }
  res.status(500).json({ error: "Server error" });
};

export default errorHandler;
