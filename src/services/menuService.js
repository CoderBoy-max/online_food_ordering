import Restaurant from '../models/Restaurant.js';
import Category from '../models/Category.js';
import MenuItem from '../models/MenuItem.js';
import ApiError from '../utils/ApiError.js';

const DUPLICATE_CATEGORY = 'This restaurant already has a category with that name';

// Loads a restaurant and makes sure the logged-in owner owns it.
async function getOwnedRestaurant(restaurantId, user) {
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) throw new ApiError(404, 'Restaurant not found');
  if (String(restaurant.owner) !== String(user._id)) {
    throw new ApiError(403, 'You can only manage your own restaurant');
  }
  return restaurant;
}

async function getOwnedCategory(categoryId, user) {
  const category = await Category.findById(categoryId);
  if (!category) throw new ApiError(404, 'Category not found');
  await getOwnedRestaurant(category.restaurant, user);
  return category;
}

async function getOwnedMenuItem(itemId, user) {
  const item = await MenuItem.findById(itemId);
  if (!item) throw new ApiError(404, 'Menu item not found');
  await getOwnedRestaurant(item.restaurant, user);
  return item;
}

// ---------- Public menu ----------

// Only approved restaurants have a public menu.
export async function getPublicMenu(restaurantId) {
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant || restaurant.status !== 'approved') {
    throw new ApiError(404, 'Restaurant not found');
  }

  const [categories, items] = await Promise.all([
    Category.find({ restaurant: restaurantId }).sort({ createdAt: 1 }).lean(),
    MenuItem.find({ restaurant: restaurantId }).sort({ createdAt: 1 }).lean(),
  ]);

  return {
    restaurant: {
      _id: restaurant._id,
      name: restaurant.name,
      isOpen: restaurant.isOpen,
    },
    categories: categories.map((c) => ({
      _id: c._id,
      name: c.name,
      items: items.filter((i) => String(i.category) === String(c._id)),
    })),
  };
}

// ---------- Categories ----------

export async function createCategory(restaurantId, user, { name }) {
  await getOwnedRestaurant(restaurantId, user);
  try {
    return await Category.create({ restaurant: restaurantId, name });
  } catch (err) {
    if (err.code === 11000) throw new ApiError(409, DUPLICATE_CATEGORY);
    throw err;
  }
}

export async function renameCategory(categoryId, user, { name }) {
  const category = await getOwnedCategory(categoryId, user);
  category.name = name;
  try {
    return await category.save();
  } catch (err) {
    if (err.code === 11000) throw new ApiError(409, DUPLICATE_CATEGORY);
    throw err;
  }
}

export async function deleteCategory(categoryId, user) {
  const category = await getOwnedCategory(categoryId, user);
  const itemCount = await MenuItem.countDocuments({ category: category._id });
  if (itemCount > 0) {
    throw new ApiError(400, 'Remove or move the items in this category first');
  }
  await category.deleteOne();
}

// ---------- Menu items ----------

// The category must exist AND belong to the same restaurant.
async function getCategoryOfRestaurant(categoryId, restaurantId) {
  const category = await Category.findOne({ _id: categoryId, restaurant: restaurantId });
  if (!category) throw new ApiError(400, 'Category does not belong to this restaurant');
  return category;
}

export async function createMenuItem(restaurantId, user, body) {
  await getOwnedRestaurant(restaurantId, user);
  const category = await getCategoryOfRestaurant(body.category, restaurantId);

  return MenuItem.create({
    restaurant: restaurantId,
    category: category._id,
    name: body.name,
    description: body.description,
    price: body.price,
    imageUrl: body.imageUrl,
  });
}

export async function updateMenuItem(itemId, user, body) {
  const item = await getOwnedMenuItem(itemId, user);

  if (body.category !== undefined) {
    const category = await getCategoryOfRestaurant(body.category, item.restaurant);
    item.category = category._id;
  }
  for (const field of ['name', 'description', 'price', 'imageUrl']) {
    if (body[field] !== undefined) item[field] = body[field];
  }
  return item.save();
}

export async function setAvailability(itemId, user, { isAvailable }) {
  const item = await getOwnedMenuItem(itemId, user);
  item.isAvailable = isAvailable;
  return item.save();
}

export async function deleteMenuItem(itemId, user) {
  const item = await getOwnedMenuItem(itemId, user);
  await item.deleteOne();
}
