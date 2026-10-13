
import Address from '../models/Address.js';
import ApiError from '../utils/ApiError.js';


// Create a new address
const createAddress = async (userId, addressData) => {
  const { label, street, city, notes } = addressData;

  // Validate required fields
  for (const [field, value] of Object.entries({
    label,
    street,
    city,
  })) {
    if (typeof value !== 'string' || !value.trim()) {
      throw new ApiError(
        400,
        `${field} must be a non-empty string.`
      );
    }
  }

  // Validate optional notes
  if (notes !== undefined && typeof notes !== 'string') {
    throw new ApiError(400, 'Notes must be a string.');
  }

  const address = await Address.create({
    user: userId,
    label: label.trim(),
    street: street.trim(),
    city: city.trim(),
    notes: notes?.trim() ?? '',
  });

  return address;
};

const getAddressesByUser = async (userId) => {
  const addresses = await Address.find({ user: userId }).sort({
    createdAt: -1,
  });

  return addresses;
};


const updateAddress = async (userId, addressId, updateData) => {
  const allowedFields = ['label', 'street', 'city', 'notes'];
  const updates = {};

  // Keep only the fields users are allowed to update.
  for (const field of allowedFields) {
    if (updateData[field] !== undefined) {
      updates[field] = updateData[field];
    }
  }

  // Reject requests with no valid fields.
  if (Object.keys(updates).length === 0) {
    throw new ApiError(400, 'Provide at least one field to update.');
  }

  // Validate required fields and remove surrounding spaces.
  for (const field of ['label', 'street', 'city']) {
    if (field in updates) {
      if (
        typeof updates[field] !== 'string' ||
        !updates[field].trim()
      ) {
        throw new ApiError(
          400,
          `${field} must be a non-empty string.`
        );
      }

      updates[field] = updates[field].trim();
    }
  }

  // Update only the address belonging to this user.
  const address = await Address.findOneAndUpdate(
    { _id: addressId, user: userId },
    updates,
    { new: true, runValidators: true }
  );

  // Return an error if the address doesn't exist or isn't owned by this user.
  if (!address) {
    throw new ApiError(404, 'Address not found.');
  }

  return address;
};


const deleteAddress = async (userId, addressId) => {
  const address = await Address.findOneAndDelete({
    _id: addressId,
    user: userId,
  });

  if (!address) {
    throw new ApiError(404, 'Address not found.');
  }

  return address;
};

export {
  createAddress,
  getAddressesByUser,
  updateAddress,
  deleteAddress,
};
