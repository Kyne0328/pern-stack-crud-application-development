export function notFoundHandler(req, res) {
  res.status(404).json({success: false, message: `Route not found: ${req.method} ${req.originalUrl}`});
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({success: false, message: 'Request body must contain valid JSON.'});
  }
  if (error.code === '23505') {
    return res.status(409).json({
      success: false,
      message: 'An employee with that employee number already exists.',
      errors: {employeeNumber: 'Use a unique employee number.'},
    });
  }
  if (error.code === '23503') {
    return res.status(400).json({
      success: false,
      message: 'The selected department or position no longer exists.',
      errors: {positionId: 'Select an available position.'},
    });
  }
  if (error.code === '23514' || error.code === '22001' || error.code === '22P02') {
    return res.status(400).json({success: false, message: 'The employee data violates a database rule.'});
  }

  console.error(error);
  return res.status(500).json({success: false, message: 'An unexpected server error occurred.'});
}
