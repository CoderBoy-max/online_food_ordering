export const sendSuccess = (res, data = null, message = '', statusCode = 200) =>
  res.status(statusCode).json({ success: true, data, message });