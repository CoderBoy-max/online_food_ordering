import Cart from '../models/cartModel.js';
import MenuItem from '../models/MenuItem.js';
import ApiError from '../utils/ApiError.js';

const formatCart = (cart) => {
    if (!cart) return { restaurant: null, items: [], total: 0 };
    const items = cart.items.filter((i)=> i.menuItem)
    .map((i) => ({
      menuItem: i.menuItem._id,
      name: i.menuItem.name,
      price: i.menuItem.price,
      quantity: i.quantity,
      subtotal: i.menuItem.price * i.quantity,
    }));
    const total = items.reduce((sum, item) => sum + item.subtotal, 0);
    return { restaurant: cart.restaurant, items, total };
};

export const getCart = async (userId) => { 
    const cart = await Cart.findOne({ user: userId }).populate('items.menuItem');
    return formatCart(cart);
};

export const addItem = async (userId, menuItemId, quantity = 1) => {
    const menuItem = await MenuItem.findById(menuItemId);
    if (!menuItem) throw new ApiError(404, 'Menu item not found');
    if(!menuItem.isAvailable) throw new ApiError(400, 'Menu item is not available');
    let cart = await Cart.findOne({ user: userId });
    if (!cart) cart = new Cart({ user: userId });

    const differentRestaurant = cart.items.length > 0 && String(cart.restaurant) !== String(menuItem.restaurant);
    if(differentRestaurant){ throw new ApiError(400, 'You can only add items from one restaurant at a time');
    }
    cart.restaurant = menuItem.restaurant;
    const existing = cart.items.find((i) => String(i.menuItem) === String(menuItemId));
    if (existing) {
        existing.quantity += quantity;
    } else {
        cart.items.push({ menuItem: menuItemId, quantity });
    }
    await cart.save();
    return getCart(userId);
 };

export const updateItem = async (userId, menuItemId, quantity) => {
    const cart = await Cart.findOne({ user: userId });
    if(!cart) throw new ApiError(404,'item not in cart');
    const item = cart.items.find((i) => String(i.menuItem) === String(menuItemId));
    if (!item) throw new ApiError(404, 'Item not in cart');
    item.quantity = quantity;
    await cart.save();
    return getCart(userId);
 };

export const removeItem = async (userId, menuItemId) => { 
    const cart = await Cart.findOne({ user: userId });
    if (!cart) throw new ApiError(404, 'cart is empty');

    const before = cart.items.length;
    cart.items = cart.items.filter((i) => String(i.menuItem) !== String(menuItemId));
    if (cart.items.length === before) throw new ApiError(404, 'Item not in cart');

    if (cart.items.length === 0) cart.restaurant = null;

    await cart.save();
    return getCart(userId);
};

export const clearCart = async (userId) => { 
    await Cart.findOneAndUpdate({ user: userId}, { items: [], restaurant: null });
    return { restaurant: null, items: [], total: 0}
 };