/**
 * Sends a consistent JSON response.
 * @param {Response} res  Express response
 * @param {number}   code HTTP status code
 * @param {string}   message Human-readable message
 * @param {*}        data Payload (optional)
 */
const apiResponse = (res, code, message, data = undefined) => {
  const body = { success: code >= 200 && code < 300, message };
  if (data !== undefined) body.data = data;
  return res.status(code).json(body);
};

export default apiResponse;
