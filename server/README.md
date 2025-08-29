# Chat App Backend

Express.js backend server with Socket.IO for the real-time chat application.

## 🚀 Technology Stack

- **Framework**: Express.js with TypeScript
- **Real-time**: Socket.IO for WebSocket communication
- **Database**: SQLite with Drizzle ORM
- **Authentication**: JWT + bcrypt
- **Build**: ts-node for development, TypeScript compiler for production

## 📁 Project Structure

```
server/
├── src/
│   ├── db/                 # Database setup and schema
│   │   ├── index.ts        # Database connection
│   │   └── schema.ts       # Drizzle schema definitions
│   ├── middleware/         # Express middleware
│   │   └── auth.ts         # JWT authentication middleware
│   ├── utils/              # Utility functions
│   │   └── auth.ts         # Authentication utilities
│   └── index.ts            # Server entry point
├── drizzle/                # Database migrations
├── chat.db                 # SQLite database file
├── drizzle.config.ts       # Drizzle configuration
└── package.json
```

## 🛠️ Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration
```

### Available Scripts

- `npm run dev` - Start development server with nodemon
- `npm run build` - Compile TypeScript to dist/
- `npm start` - Run production build
- `npx drizzle-kit generate` - Generate database migrations  
- `npx drizzle-kit push` - Apply schema changes to database

### Environment Variables

Create a `.env` file:

```env
PORT=3001
CLIENT_URL=http://localhost:3000
JWT_SECRET=your-super-secret-jwt-key-here
```

## 🗄️ Database Schema

- **users**: User accounts (id, email, username, password, createdAt)
- **conversations**: Chat rooms (id, name, createdAt, updatedAt)
- **messages**: Individual messages (id, content, conversationId, userId, createdAt)
- **conversation_participants**: Many-to-many relationship between users and conversations

## 🔌 Socket.IO Events

**Client → Server:**
- `join` - User joins with authentication token
- `join_conversation` - User joins a specific conversation
- `send_message` - User sends a message

**Server → Client:**
- `joined` - Confirmation of successful join
- `conversation_history` - Historical messages for a conversation
- `new_message` - New message broadcast
- `user_connected` / `user_disconnected` - User presence updates
- `error` - Error messages

## 🔐 Authentication

1. Users register/login via REST API endpoints
2. Server returns JWT token on successful authentication
3. Clients use JWT for Socket.IO connection and API requests
4. Passwords are hashed with bcrypt

## 📡 API Endpoints

- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `GET /api/conversations` - Get user's conversations
- `POST /api/conversations` - Create new conversation
- `GET /api/users/validate` - Validate usernames

For complete setup instructions, see the main project README.