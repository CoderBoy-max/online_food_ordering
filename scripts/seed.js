// Seeds one admin, one owner with an approved restaurant and a full menu, and one customer.
// Run with:  node scripts/seed.js
// Needs the User and Restaurant models (Auth and Restaurant modules) and `npm i bcryptjs`.
import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

dotenv.config({ path: fileURLToPath(new URL('../src/.env', import.meta.url)) });

import User from '../src/models/User.js';
import Restaurant from '../src/models/Restaurant.js';
import Category from '../src/models/Category.js';
import MenuItem from '../src/models/MenuItem.js';

// Prices are whole numbers in naira.
const MENU = {
  'Starters': [
    ['Chicken Wings', 'Crispy wings with spicy pepper sauce', 3500],
    ['Pepper Soup', 'Goat meat pepper soup with local spices', 3000],
    ['Spring Rolls', 'Vegetable spring rolls with sweet chili dip', 2500],
    ['Garden Salad', 'Fresh lettuce, tomato, cucumber and carrot', 2500],
  ],
  'Rice Dishes': [
    ['Jollof Rice', 'Smoky party-style jollof rice', 2500],
    ['Fried Rice', 'Mixed vegetable fried rice', 2500],
    ['Coconut Rice', 'Rice cooked in coconut milk', 2800],
    ['Ofada Rice and Stew', 'Local ofada rice with designer stew', 3500],
  ],
  'Swallow and Soups': [
    ['Pounded Yam and Egusi', 'Egusi soup with assorted meat', 4500],
    ['Amala and Ewedu', 'Amala with ewedu, gbegiri and stew', 4000],
    ['Eba and Okra Soup', 'Eba with okra soup and fish', 3800],
  ],
  'Grills': [
    ['Grilled Chicken', 'Half chicken, peppered and grilled', 5000],
    ['Beef Suya', 'Spicy skewered beef with onions', 3000],
    ['Grilled Fish', 'Whole tilapia with pepper sauce', 6000],
  ],
  'Sides': [
    ['Fried Plantain', 'Ripe plantain, fried golden', 1000],
    ['Moi Moi', 'Steamed bean pudding', 1200],
    ['French Fries', 'Crispy salted fries', 1800],
    ['Coleslaw', 'Creamy cabbage and carrot slaw', 1000],
  ],
  'Desserts': [
    ['Chocolate Cake', 'Rich chocolate cake slice', 2500],
    ['Ice Cream', 'Two scoops, vanilla or chocolate', 2000],
    ['Fruit Salad', 'Seasonal fresh fruit', 2000],
  ],
  'Drinks': [
    ['Bottled Water', '75cl', 500],
    ['Soft Drink', 'Coke, Fanta or Sprite', 700],
    ['Chapman', 'Classic Nigerian Chapman', 2000],
    ['Zobo', 'Chilled hibiscus drink', 1000],
    ['Fresh Juice', 'Orange, pineapple or watermelon', 1800],
  ],
};

const EMAILS = ['admin@foodapp.com', 'owner@foodapp.com', 'customer@foodapp.com'];

async function run() {
  const uri = process.env.DEVELOPMENT_DB_URI?.trim();
  if (!uri) throw new Error('DEVELOPMENT_DB_URI is not set (put it in src/.env).');
  await mongoose.connect(uri);
  console.log('Connected. Clearing old seed data...');

  const oldUsers = await User.find({ email: { $in: EMAILS } });
  const oldRestaurants = await Restaurant.find({ owner: { $in: oldUsers.map((u) => u._id) } });
  const ids = oldRestaurants.map((r) => r._id);
  await MenuItem.deleteMany({ restaurant: { $in: ids } });
  await Category.deleteMany({ restaurant: { $in: ids } });
  await Restaurant.deleteMany({ _id: { $in: ids } });
  await User.deleteMany({ email: { $in: EMAILS } });

  const passwordHash = await bcrypt.hash('Password123!', 10);
  await User.create({ name: 'Admin', email: EMAILS[0], passwordHash, phone: '08000000001', role: 'admin' });
  const owner = await User.create({ name: 'Demo Owner', email: EMAILS[1], passwordHash, phone: '08000000002', role: 'owner' });
  await User.create({ name: 'Demo Customer', email: EMAILS[2], passwordHash, phone: '08000000003', role: 'customer' });

  const restaurant = await Restaurant.create({
    owner: owner._id,
    name: 'Mama Put Kitchen',
    description: 'Classic Nigerian dishes, grills and drinks',
    cuisine: 'Nigerian',
    phone: '08000000002',
    address: '12 Allen Avenue, Ikeja, Lagos',
    openHours: '09:00 - 22:00',
    status: 'approved',
    isOpen: true,
  });

  let itemCount = 0;
  for (const [categoryName, items] of Object.entries(MENU)) {
    const category = await Category.create({ restaurant: restaurant._id, name: categoryName });
    await MenuItem.insertMany(
      items.map(([name, description, price]) => ({
        restaurant: restaurant._id,
        category: category._id,
        name,
        description,
        price,
      }))
    );
    itemCount += items.length;
  }

  console.log(`Seeded 3 users, 1 restaurant, ${Object.keys(MENU).length} categories, ${itemCount} menu items.`);
  console.log('Logins (password for all: Password123!):', EMAILS.join(', '));
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
