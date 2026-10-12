import ApiError from '../utils/ApiError.js';

// Plain validators (no extra package). Each one collects every problem and
// passes a single 400 to the error handler.

const OBJECT_ID = /^[0-9a-fA-F]{24}$/;
const isId = (v) => typeof v === 'string' && OBJECT_ID.test(v);
const isText = (v, max) => typeof v === 'string' && v.trim().length > 0 && v.trim().length <= max;
const isPrice = (v) => typeof v === 'number' && Number.isInteger(v) && v >= 0;

function isHttpUrl(v) {
  try {
    const { protocol } = new URL(v);
    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
}

// Wraps a function that returns a list of error messages.
const makeValidator = (check) => (req, res, next) => {
  req.body = req.body ?? {};
  const errors = check(req.body, req);
  if (errors.length) return next(new ApiError(400, 'Validation failed', errors));
  next();
};

// Checks that :id in the URL is a valid id.
export const validateIdParam = (req, res, next) => {
  if (!isId(req.params.id)) return next(new ApiError(400, 'Invalid id'));
  next();
};

function checkName(body, errors, max, required) {
  if (body.name === undefined) {
    if (required) errors.push('name is required');
    return;
  }
  if (!isText(body.name, max)) errors.push(`name must be text of 1 to ${max} characters`);
  else body.name = body.name.trim();
}

function checkOptionalText(body, field, errors, max) {
  if (body[field] === undefined) return;
  if (typeof body[field] !== 'string' || body[field].trim().length > max) {
    errors.push(`${field} must be text of at most ${max} characters`);
  } else {
    body[field] = body[field].trim();
  }
}

function checkImageUrl(body, errors) {
  if (body.imageUrl === undefined || body.imageUrl === '') return;
  if (typeof body.imageUrl !== 'string' || !isHttpUrl(body.imageUrl.trim())) {
    errors.push('imageUrl must be a valid http or https link');
  } else {
    body.imageUrl = body.imageUrl.trim();
  }
}

export const validateCategory = makeValidator((body) => {
  const errors = [];
  checkName(body, errors, 60, true);
  return errors;
});

export const validateCreateMenuItem = makeValidator((body) => {
  const errors = [];
  if (!isId(body.category)) errors.push('category must be a valid category id');
  checkName(body, errors, 100, true);
  if (!isPrice(body.price)) errors.push('price must be a whole number of 0 or more');
  checkOptionalText(body, 'description', errors, 500);
  checkImageUrl(body, errors);
  return errors;
});

export const validateUpdateMenuItem = makeValidator((body) => {
  const errors = [];
  const fields = ['category', 'name', 'price', 'description', 'imageUrl'];
  if (!fields.some((f) => body[f] !== undefined)) {
    errors.push(`send at least one of: ${fields.join(', ')}`);
    return errors;
  }
  if (body.category !== undefined && !isId(body.category)) {
    errors.push('category must be a valid category id');
  }
  checkName(body, errors, 100, false);
  if (body.price !== undefined && !isPrice(body.price)) {
    errors.push('price must be a whole number of 0 or more');
  }
  checkOptionalText(body, 'description', errors, 500);
  checkImageUrl(body, errors);
  return errors;
});

export const validateAvailability = makeValidator((body) => {
  return typeof body.isAvailable === 'boolean' ? [] : ['isAvailable must be true or false'];
});
