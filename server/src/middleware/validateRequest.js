function formatValidationErrors(issues) {
  const errors = {};

  for (const issue of issues) {
    const field = issue.path.length > 0 ? String(issue.path[0]) : 'request';
    if (!errors[field]) errors[field] = issue.message;
  }

  return errors;
}

function validateRequest(schema, options = {}) {
  const {
    source = 'body',
    target = source,
    message = 'Please correct the request data.',
  } = options;

  return function requestValidationMiddleware(req, res, next) {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message,
        errors: formatValidationErrors(result.error.issues),
      });
    }

    req[target] = result.data;
    return next();
  };
}

module.exports = {formatValidationErrors, validateRequest};
