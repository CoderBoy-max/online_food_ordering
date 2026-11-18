import asyncHandler from '../utils/asyncHandler.js'
import ApiError from '../utils/ApiError.js'
import { sendSuccess } from '../utils/response.js'
import * as cartService from '../services/cartService.js'

// Make sure quantity is a whole number of 1 or more
const parseQuantity = (value) => {
    const q = Number(value);
    if(!Number.isInteger(q) || q < 1){
        throw new ApiError(400, 'Quantity must be a whole number of 1 or more')
    }
    return q;
};
export const getCart = asyncHandler(async (req, res) => {
    const cart = await cartService.getCart(req.user._id)
    sendSuccess(res, cart);
})
export const addItem = asyncHandler(async (req, res) => {
  const { menuItemId, quantity = 1 } = req.body ?? {};
  if (!menuItemId) throw new ApiError(400, 'menuItemId is required');

  const cart = await cartService.addItem(req.user._id, menuItemId, parseQuantity(quantity));
  sendSuccess(res, cart, 'Item added to cart');
});

export const updateItem = asyncHandler(async (req, res) => {
  const quantity = parseQuantity((req.body ?? {}).quantity);
  const cart = await cartService.updateItem(req.user._id, req.params.menuItemId, quantity);
  sendSuccess(res, cart, 'Cart updated');
});

export const removeItem = asyncHandler(async (req, res) => {
  const cart = await cartService.removeItem(req.user._id, req.params.menuItemId);
  sendSuccess(res, cart, 'Item removed');
});

export const clearCart = asyncHandler(async (req, res) => {
  const cart = await cartService.clearCart(req.user._id);
  sendSuccess(res, cart, 'Cart cleared');
});