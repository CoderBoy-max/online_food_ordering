
import ApiError from '../utils/ApiError.js';

const allowedTransitions = {
  pending: ['accepted', 'rejected', 'cancelled'],
  accepted: ['preparing'],
  preparing: ['ready'],
  ready: ['out_for_delivery'],
  out_for_delivery: ['delivered'],
  delivered: [],
  rejected: [],
  cancelled: [],
};

const ownerStatuses = [
  'accepted',
  'rejected',
  'preparing',
  'ready',
  'out_for_delivery',
  'delivered',
];

export const validateOrderStatusTransition = (
  currentStatus,
  nextStatus,
  actorRole
) => {
  const allowedNextStatuses = allowedTransitions[currentStatus];

  if (!allowedNextStatuses || !allowedNextStatuses.includes(nextStatus)) {
    throw new ApiError(
      400,
      `Cannot change order status from "${currentStatus}" to "${nextStatus}".`
    );
  }

  if (nextStatus === 'cancelled' && actorRole !== 'customer') {
    throw new ApiError(
      403,
      'Only the customer can cancel an order.'
    );
  }

  if (ownerStatuses.includes(nextStatus) && actorRole !== 'owner') {
    throw new ApiError(
      403,
      'Only the restaurant owner can perform this status transition.'
    );
  }

  return true;
};

export default validateOrderStatusTransition;
