# Skill Exchange Platform Server

## Project Overview
The Skill Exchange Platform is a backend API designed to facilitate skill sharing between users. It allows users to register, log in, and manage their skills by specifying the skills they have and those they need.

## Features
- **Authentication**: Secure user registration and login using JWT tokens.
- **Skill Management**: Users can add skills they have and request skills they need.
- **MongoDB & Mongoose**: Data storage using MongoDB with Mongoose schema validation for data integrity.

## Tech Stack
- **Node.js**
- **Express.js** - Web framework
- **Mongoose** - ODM (Object Data Modeling) for MongoDB
- **JWT Authentication** - For secure user management
- **bcrypt** - Password hashing
- **Pino** - Structured logging
- **CORS** - Cross-Origin Resource Sharing

## Project Structure
The project follows a clean architecture with separate modules for:
- **Controllers**: Handling API endpoints
- **Services**: Business logic implementation
- **Repositories**: Data access layer
- **Models**: Database schema definitions

## Installation Guide
1. **Clone the repository:**
   ```bash
   git clone https://github.com/shahidii/skill-exchange-server.git
   ```

2. **Navigate to the project directory:**
   ```bash
   cd skill-exchange-server
   ```

3. **Install dependencies:**
   ```bash
   pnpm install
   ```

## Usage Instructions
1. **Start the server:**
   - Development mode:
     ```bash
     npm run dev
     ```
   - Production mode:
     ```bash
     npm run start
     ```

2. **API Endpoints:**
   - Sign up: `/api/auth/signup`
   - Login: `/api/auth/login`

3. **Environment Variables:**
   - `NODE_ENV`: `production` or `development`
   - `PORT`: Server port (default: 5000)

## API Documentation
- Visit the [Swagger documentation](http://localhost:5000/api-docs) for detailed API endpoints and usage examples.

## Contributing Guidelines
1. Fork the repository.
2. Create a new branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -m "Your descriptive commit message"`
4. Push to the branch: `git push origin feature/new-feature`
5. Open a pull request and describe your changes.

## License & Author Information
The Skill Exchange Platform is licensed under the ISC license. The project was created by [Muhammed Shahid](https://github.com/shahidii).
