# Skill-Swap API

The backend RESTful API for the Skill Exchange Platform. Built with **Node.js** and **Express**, this service handles user authentication, data management, and integration with third-party services like OpenAI and Cloudinary.

## 🚀 Features

- **Robust Authentication**: Secure User Signup, Login, Password Reset, and Email Verification using **JWT** and **Bcrypt**.
- **Profile Management**: CRUD operations for user profiles, including avatar uploads via **Cloudinary**.
- **Skill Ecosystem**: Manage skills offered and skills needed to facilitate accurate matching.
- **Request System**: Comprehensive logic for sending, tracking, accepting, and declining skill exchange requests.
- **AI Integration**: Routes to interact with **OpenAI** for platform intelligence and chat features.
- **Security**: Implemented Helmet (security headers), CORS, and Rate Limiting.
- **Logging**: Structured logging with **Pino**.
- **Documentation**: Auto-generated API docs via **Swagger UI**.

## 🛠️ Tech Stack

- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) (with [Mongoose](https://mongoosejs.com/) ODM)
- **Authentication**: `jsonwebtoken` (JWT), `bcrypt`
- **File Storage**: [Cloudinary](https://cloudinary.com/)
- **AI Service**: [OpenAI API](https://openai.com/)
- **Email Service**: [Nodemailer](https://nodemailer.com/)
- **Logging**: `pino`, `pino-http`
- **Documentation**: `swagger-ui-express`, `swagger-jsdoc`

## 📂 Project Structure

```bash
server/
├── config/             # Database, Cloudinary, Swagger, and Logger config
├── controllers/        # Request handlers (Auth, Profile, AI)
├── middleware/         # Custom middleware (Auth check, Error handling, Multer)
├── models/             # Mongoose schemas (User, Skill)
├── routes/             # API Route definitions
├── services/           # Business logic isolation
├── utils/              # Helper functions
├── src/                # Entry point (server.js, app.js)
└── .env                # Environment variables
```

## ⚡ Getting Started

### Prerequisites

- **Node.js** (v18+ recommended)
- **MongoDB** (Local instance or Atlas URI)
- **pnpm** (preferred) or npm

### Installation

1.  **Clone the repository** (if not done partly):
    ```bash
    git clone <repository_url>
    cd server
    ```

2.  **Install dependencies**:
    ```bash
    pnpm install
    ```

3.  **Environment Setup**:
    Create a `.env` file in the root directory with the following variables:

    ```env
    # Server
    PORT=5000
    NODE_ENV=development

    # Database
    MONGO_URI=mongodb://localhost:27017/skill-swap

    # Security
    JWT_SECRET=your_super_secret_jwt_key
    JWT_EXPIRE=30d

    # Cloudinary (for Image Uploads)
    CLOUDINARY_CLOUD_NAME=your_cloud_name
    CLOUDINARY_API_KEY=your_api_key
    CLOUDINARY_API_SECRET=your_api_secret

    # Email (Nodemailer)
    EMAIL_SERVICE=gmail
    EMAIL_USER=your_email@gmail.com
    EMAIL_PASS=your_email_password

    # OpenAI (for AI Chat)
    OPENAI_API_KEY=your_openai_api_key
    ```

4.  **Run Server**:
    - **Development** (with watch mode):
      ```bash
      pnpm dev
      ```
    - **Production**:
      ```bash
      pnpm start
      ```

    The server will run on `http://localhost:5000`.

## 📖 API Documentation

The API comes with built-in Swagger documentation.

- Start the server.
- Visit: **[http://localhost:5000/docs](http://localhost:5000/docs)** to view the interactive API playground.

## 🧪 Key Endpoints

- **Auth**: `/api/auth/signup`, `/api/auth/login`, `/api/auth/verify-otp`
- **Profile**: `/api/profiles/me`, `/api/profiles/update`, `/api/profiles/requests`
- **AI**: `/api/ai/chat` (if implemented)
