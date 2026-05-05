# Online Course Platform

Production-ready mini Udemy style platform built with `React + Vite`, `Node.js + Express`, `MongoDB Atlas`, `JWT`, `Cloudinary`, `Stripe`, and PDF certificate generation.

## Features

- User register/login with JWT auth
- Public home page with search and filter
- Course preview without login
- Paid/free course support
- Sequential lesson access
- Resume video playback from last saved time
- Likes, dislikes, comments, ratings, bookmarks
- Profile page with progress bars and certificates
- Notification feed for new courses and comment replies
- Admin dashboard for course creation, chapters, video upload, analytics, and deletion
- Stripe checkout flow
- Cloudinary storage for thumbnails and video files

## Folder structure

```text
backend/
  src/
    config/
    controllers/
    middleware/
    models/
    routes/
    services/
    utils/
  .env.example
  package.json
  server.js

frontend/
  src/
    api/
    components/
    context/
    pages/
    styles/
  .env.example
  package.json
  vite.config.js

render.yaml
README.md
```

## Backend models

- `User`: name, email, password, role, avatar
- `Course`: title, description, price, thumbnail, rating, views, category, createdBy
- `Chapter`: title, courseId, order
- `Video`: title, description, videoUrl, publicId, duration, order, chapterId, likes, dislikes, views
- `UserProgress`: userId, videoId, watched, lastTime
- `Comment`: userId, videoId, text, parentCommentId
- `Reaction`: userId, videoId, type
- `Rating`: userId, courseId, value
- `Purchase`: userId, courseId, amount, paidAt, stripeSessionId
- `Bookmark`: userId, courseId
- `Notification`: userId, text, read

## API routes

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Courses and learning

- `GET /api/courses`
- `GET /api/courses/categories`
- `GET /api/courses/:courseId`
- `GET /api/courses/:courseId/status`
- `GET /api/courses/:courseId/progress-summary`
- `POST /api/courses/:courseId/bookmark`
- `POST /api/courses/:courseId/rate`
- `POST /api/courses/videos/:videoId/open`
- `POST /api/courses/videos/:videoId/progress`
- `POST /api/courses/videos/:videoId/reaction`
- `POST /api/courses/videos/:videoId/comments`

### Admin

- `GET /api/admin/analytics`
- `POST /api/admin/courses`
- `PUT /api/admin/courses/:courseId`
- `DELETE /api/admin/courses/:courseId`
- `POST /api/admin/courses/:courseId/chapters`
- `POST /api/admin/chapters/:chapterId/videos`

### Payments

- `POST /api/payments/:courseId/checkout`
- `POST /api/payments/confirm`

### Profile and certificates

- `GET /api/profile`
- `GET /api/profile/certificate/:courseId`

### Notifications

- `GET /api/notifications`
- `PATCH /api/notifications/:notificationId/read`

## Environment variables

### Backend `.env`

```env
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/online-course
JWT_SECRET=replace-with-a-long-secret
CLIENT_URL=http://localhost:5173
CLIENT_APP_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
STRIPE_SECRET_KEY=sk_test_example
```

### Frontend `.env`

```env
VITE_API_URL=http://localhost:5000/api
```

## Local development

### 1. Backend

```bash
cd backend
npm install
npm run dev
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

## Render deployment

### Database

1. Create MongoDB Atlas cluster
2. Add network access for Render IPs or allow all during setup
3. Create database user
4. Copy Atlas connection string into `MONGO_URI`

### Backend on Render Web Service

1. Create a new Web Service
2. Root directory: `backend`
3. Build command: `npm install`
4. Start command: `npm start`
5. Add environment variables from backend `.env.example`
6. Set `CLIENT_URL` and `CLIENT_APP_URL` to the deployed frontend URL

### Frontend on Render Static Site

1. Create a new Static Site
2. Root directory: `frontend`
3. Build command: `npm install && npm run build`
4. Publish directory: `dist`
5. Add `VITE_API_URL=https://your-backend-service.onrender.com/api`
6. In Render Static Site settings, add a rewrite so SPA routes work on refresh:
   - Source: `/*`
   - Destination: `/index.html`
   - Action: `Rewrite`

## Important implementation notes

- Sequential watching is enforced in the backend before a video opens
- Paid lessons are blocked until purchase is confirmed
- Video views increment when a lesson is opened
- Resume state is stored in `UserProgress.lastTime`
- Course completion reaches 100% when all lessons are marked watched
- Certificates are generated as PDF streams on demand
- Cloudinary stores both thumbnails and lesson videos
- Stripe uses hosted checkout and a confirmation endpoint after success redirect
- When an admin calls `GET /api/courses` with a token, unpublished courses are included (public users still only see published)

## Production checklist

1. Create the first admin user manually in MongoDB or with a seed script by setting `role: "admin"`
2. Use strong production secrets for JWT and Stripe
3. Configure Cloudinary upload limits and allowed formats
4. Add Stripe webhook confirmation if you want payment finalization to be fully server-driven
5. Add validation, tests, rate limiting, and logging before high-traffic launch
