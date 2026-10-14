## Setup

1. Install Node.js and MongoDB, then run `npm install`.
2. Copy `.env.example` to `.env` and replace the placeholder values. `JWT_SECRET` and `ADMIN_JWT_SECRET` must be separate, long random secrets.
3. Start the API with `npm run dev` (or `npm start`).

The server requires `DEVELOPMENT_DB_URI` and the three Cloudinary settings at startup. Customer registration/login also requires `JWT_SECRET`; admin login requires `ADMIN_JWT_SECRET`.

Run the automated tests with `npm test`.