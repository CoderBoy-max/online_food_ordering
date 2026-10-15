## Setup

1. Install Node.js and MongoDB, then run `npm install`.
2. Copy `.env.example` to `.env` and replace the placeholder values. `JWT_SECRET` and `ADMIN_JWT_SECRET` must be separate, long random secrets.
3. Start the API with `npm run dev` (or `npm start`).

The server requires `DEVELOPMENT_DB_URI` and the three Cloudinary settings at startup. Customer registration/login also requires `JWT_SECRET`; admin login requires `ADMIN_JWT_SECRET`.

Run the automated tests with `npm test`.

# Cart Module

This document explains how the shopping cart works in the Online Food Ordering API. It is written for someone who has never seen this code, so you can read it top to bottom and understand what is going on.

## 1. What the cart is

The cart is the customer's shopping bag. Before a customer places an order, they pick food and put it in the cart. They can change the amounts, remove things, or empty it. When they are happy, they check out, and the cart becomes an order (that part belongs to the Orders module, not here).

Three rules shape everything in this module:

1. **One cart per customer.** Every customer has exactly one cart.
2. **One restaurant per cart.** Everything in a cart must come from the same restaurant. This is because one order goes to one restaurant and is paid with one payment. If the customer tries to add food from a second restaurant, the API refuses and tells them to clear the cart first.
3. **The cart does not store prices.** It stores only which food and how many. The price is looked up from the menu each time the cart is shown, so the customer always sees the current price. (Prices are frozen later, at checkout, when the order is created.)

Only logged-in users with the **customer** role can use the cart. Owners and admins get a 403 error.

## 2. The files

| File | Job |
| --- | --- |
| `models/Cart.js` | Describes what a cart looks like in the database. |
| `services/cart.service.js` | Holds the rules and the database work (the real logic). |
| `controllers/cart.controller.js` | Reads the request, calls the service, sends the response. No rules here. |
| `routes/cart.routes.js` | Connects each URL to a controller and adds the login and role checks. |
| `routes/index.js` | Mounts the cart routes under `/api/v1/cart`. |

A request travels through them in this order:

```text
Request -> route -> login check -> role check -> controller -> service -> database
                                                                      |
Response <- controller (sendSuccess) <---------------------------------
```

If anything fails along the way, an `ApiError` is thrown and the central `errorHandler` turns it into a clean JSON error. You never write try/catch in the controller because `asyncHandler` forwards the errors for you.

## 3. The data model

One cart in the database looks like this:

```json
{
  "user": "64f...a1",
  "restaurant": "64f...b2",
  "items": [
    { "menuItem": "64f...c3", "quantity": 2 },
    { "menuItem": "64f...d4", "quantity": 1 }
  ],
  "createdAt": "...",
  "updatedAt": "..."
}
```

| Field | Meaning |
| --- | --- |
| `user` | The customer who owns the cart. It is `unique`, so the database itself refuses a second cart for the same user. |
| `restaurant` | Which restaurant the cart belongs to. It is `null` when the cart is empty and is set when the first item is added. |
| `items` | The list of food in the cart. Starts as an empty list. |
| `items[].menuItem` | A reference to a menu item (only its id is stored). |
| `items[].quantity` | How many. Must be 1 or more. |

## 4. The API

Base path: `/api/v1/cart`. Every endpoint needs the header `Authorization: Bearer <token>` of a customer.

| Method | Endpoint | What it does |
| --- | --- | --- |
| GET | `/cart` | Show my cart with names, prices, subtotals, and the total. |
| POST | `/cart/items` | Add an item. Body: `menuItemId`, optional `quantity` (default 1). |
| PATCH | `/cart/items/:menuItemId` | Set the quantity of an item. Body: `quantity`. |
| DELETE | `/cart/items/:menuItemId` | Remove one item. |
| DELETE | `/cart` | Empty the whole cart. |

### Example: add an item

Request:

```http
POST /api/v1/cart/items
Authorization: Bearer <customer token>
Content-Type: application/json

{ "menuItemId": "64f...c3", "quantity": 2 }
```

Response:

```json
{
  "success": true,
  "data": {
    "restaurant": "64f...b2",
    "items": [
      {
        "menuItem": "64f...c3",
        "name": "Jollof Rice",
        "price": 2500,
        "quantity": 2,
        "subtotal": 5000
      }
    ],
    "total": 5000
  },
  "message": "Item added to cart"
}
```

Every cart endpoint returns the updated cart in this same shape, so a frontend never needs to make a second request to see the result.

## 5. How each function works

All the logic lives in `services/cart.service.js`.

### `formatCart(cart)` (helper)

Turns the raw database cart into the clean shape the customer sees.

- If there is no cart, it returns an empty one: `{ restaurant: null, items: [], total: 0 }`.
- It skips items whose menu item was deleted by the owner, so the app never crashes on a missing food.
- For each item it adds the name, the current price, and `subtotal = price x quantity`.
- It adds all subtotals into `total`.

### `getCart(userId)`

1. Finds the cart that belongs to this user.
2. Uses `populate('items.menuItem')` to replace each stored id with the real menu item (name, price, and so on).
3. Passes the result to `formatCart`.

A customer with no cart yet gets an empty cart, not an error. An empty cart is a normal state.

### `addItem(userId, menuItemId, quantity)`

This function has the most rules. It checks, in this order:

1. The menu item exists (otherwise 404).
2. The menu item is available, not sold out (otherwise 400).
3. Finds the user's cart, or starts a new one if they have none.
4. If the cart already has items and belongs to a different restaurant, it refuses with a 400: *"Your cart has items from another restaurant. Clear it first."*
5. Sets the cart's restaurant to this item's restaurant.
6. If the same food is already in the cart, it **adds to the quantity** instead of creating a second row. Otherwise it adds a new item.
7. Saves, then returns the updated cart.

### `updateItem(userId, menuItemId, quantity)`

Finds the item in the cart and **replaces** its quantity with the new number (it does not add). Returns 404 if the cart is empty or the item is not in it.

### `removeItem(userId, menuItemId)`

Removes the item from the list. Returns 404 if it was not there. If the cart is now empty, it sets `restaurant` back to `null`. This matters: without it, a customer who removes everything would still be locked to the old restaurant.

### `clearCart(userId)`

Empties the items and sets `restaurant` to `null` in one database call, then returns an empty cart.

## 6. Input checking

The controller checks input before it reaches the service:

- `menuItemId` is required when adding.
- `quantity` must be a whole number of 1 or more. Values like `0`, `-2`, `1.5`, or `"abc"` return a 400.

## 7. Errors you can get

| Status | When |
| --- | --- |
| 400 | Quantity is invalid, `menuItemId` is missing, the item is sold out, or the item is from a different restaurant than the cart. |
| 401 | No token, or an invalid or expired token. |
| 403 | The user is logged in but is not a customer. |
| 404 | The menu item does not exist, the cart is empty, or the item is not in the cart. |

A badly formatted id (for example `abc`) also returns a 400 ("Invalid id"), handled by the central `errorHandler`.

## 8. Walkthrough: a customer's session

1. The customer logs in and calls `GET /cart`. The response is an empty cart with `total: 0`.
2. They add 2 portions of Jollof Rice from Restaurant A. The cart now belongs to Restaurant A.
3. They add 1 Chicken from Restaurant A. The cart has two rows.
4. They add 1 Pizza from Restaurant B. The API returns a 400 and the cart does not change.
5. They change the Jollof Rice quantity to 3 with `PATCH`. The total updates.
6. They remove everything. The cart's restaurant resets, so now they can order from Restaurant B.

## 9. How to test it in Postman

You need a customer account, a restaurant, and at least one menu item (the seed script can create these).

| Test | Expected result |
| --- | --- |
| `GET /cart` with no token | 401 |
| `GET /cart` as an owner | 403 |
| `GET /cart` as a customer with an empty cart | 200, `items: []`, `total: 0` |
| `POST /cart/items` with a valid `menuItemId` | 200, item present, total correct |
| Same `POST` again | Quantity goes up, still one row |
| `POST` an item from a different restaurant | 400 |
| `PATCH /cart/items/:id` with `quantity: 0` | 400 |
| `DELETE` the only item | 200, `restaurant` is `null` again |

## 10. Notes for developers

- **Where the user comes from:** the controller uses `req.user._id`, which the auth middleware sets. The client never sends a user id, so nobody can read someone else's cart.
- **Prices:** never store prices in the cart. They are copied into the order only at checkout.
- **Deleted menu items:** they stay in the stored cart but are hidden from the response and left out of the total. Checkout must re-check that every item still exists and is available.
- **Checkout dependency:** the Orders module reads the cart through `getCart` (or the `Cart` model), builds the order, and then calls `clearCart`.
- **Adding a new cart rule:** put it in the service, not in the controller. That keeps one copy of every rule.

## 11. Not included (possible later)

- A "clear the cart and switch restaurant" button flow (the API already supports it by calling `DELETE /cart`, then `POST /cart/items`).
- Cart expiry for carts left untouched for days.
- Notes per item, such as "no pepper".