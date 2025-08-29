# Real-Time Chat Application

A modern, full-stack real-time chat application built with Next.js 15, Express.js, Socket.IO, and TypeScript.

## ✨ Features

- **Real-time messaging** with Socket.IO
- **User authentication** (signup/signin)
- **Multiple conversation support** with participant management
- **Responsive design** with Tailwind CSS
- **Type-safe** development with TypeScript
- **Modern UI** with React 19 and Next.js 15 App Router
- **SQLite database** with Drizzle ORM
- **JWT-based authentication**

## 🏗️ Architecture

This is a monorepo structure with three main parts:

```
chat-app/
├── client/          # Next.js 15 frontend with App Router
├── server/          # Express.js backend with Socket.IO
└── shared/          # Shared TypeScript types
```

### Technology Stack

**Frontend (`client/`)**
- **Framework**: Next.js 15 with App Router + React 19
- **Styling**: Tailwind CSS 3.x with @tailwindcss/forms
- **State Management**: TanStack Query for server state
- **Real-time**: Socket.IO client
- **Language**: TypeScript

**Backend (`server/`)**
- **Framework**: Express.js with TypeScript
- **Real-time**: Socket.IO for WebSocket communication
- **Database**: SQLite with Drizzle ORM
- **Authentication**: JWT + bcrypt
- **Language**: TypeScript

**Shared (`shared/`)**
- Common TypeScript interfaces for `User`, `Conversation`, `Message`, and `SocketEvents`

## 🚀 Getting Started

### Prerequisites

- **Node.js** (version 18+ recommended)
- **npm** or **yarn**

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd chat-app
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Set up environment variables**

   **Server (.env in `/server` directory):**
   ```env
   PORT=3001
   CLIENT_URL=http://localhost:3000
   JWT_SECRET=your-super-secret-jwt-key-here
   ```

   **Client (.env.development in `/client` directory):**
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
   ```

5. **Set up the database**
   ```bash
   cd server
   # Generate and apply database schema
   npx drizzle-kit push
   ```

### Running the Application

You'll need to run both the server and client in separate terminals.

**Terminal 1 - Start the backend server:**
```bash
cd server
npm run dev
```
The server will start on `http://localhost:3001`

**Terminal 2 - Start the frontend client:**
```bash
cd client
npm run dev
```
The client will start on `http://localhost:3000`

### 🎯 Usage

1. **Open your browser** and navigate to `http://localhost:3000`
2. **Create an account** or sign in with existing credentials
3. **Create a new conversation** by clicking "Create New Conversation"
4. **Add participants** by entering their usernames
5. **Start chatting** in real-time!

## 🧪 Testing

### Manual Testing

1. **Start both server and client** (see Running the Application above)
2. **Open multiple browser tabs/windows** to `http://localhost:3000`
3. **Create different user accounts** in each tab
4. **Test real-time messaging** between users
5. **Test conversation creation** and participant management

### Testing Checklist

- [ ] User registration works
- [ ] User login works
- [ ] User can create conversations
- [ ] User can add participants to conversations
- [ ] Messages are sent and received in real-time
- [ ] Connection status indicator works
- [ ] Logout functionality works
- [ ] Application works across multiple browser tabs
- [ ] Responsive design works on mobile devices

## 🔧 Development

### Available Scripts

**Server (`/server`):**
- `npm run dev` - Start development server with nodemon
- `npm run build` - Compile TypeScript to dist/
- `npm start` - Run production build
- `npx drizzle-kit generate` - Generate database migrations
- `npx drizzle-kit push` - Apply schema changes to database

**Client (`/client`):**
- `npm run dev` - Start Next.js development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run Next.js ESLint

### Key Implementation Details

**Database Schema:**
- `users` - User accounts with id, email, username, createdAt
- `conversations` - Chat rooms with id, name, createdAt, updatedAt  
- `messages` - Individual messages linking users to conversations
- `conversation_participants` - Many-to-many relationship between users and conversations

**Socket.IO Events:**
- **Client→Server**: `join`, `join_conversation`, `send_message`
- **Server→Client**: `joined`, `conversation_history`, `new_message`, `user_connected`, `user_disconnected`, `error`

**Authentication Flow:**
1. User registers/logs in via REST API
2. Server returns JWT token
3. Client stores token in localStorage
4. Client connects to Socket.IO with token
5. All subsequent API calls include JWT token

## 🚨 Troubleshooting

### Common Issues

**Port conflicts:**
- Server default: `3001`
- Client default: `3000`
- If ports are in use, the apps will try alternative ports

**Database issues:**
```bash
cd server
# Reset database schema
npx drizzle-kit push
```

**Dependencies issues:**
```bash
# Clean install server
cd server
rm -rf node_modules package-lock.json
npm install

# Clean install client
cd client
rm -rf node_modules package-lock.json .next
npm install
```

**Environment variables:**
- Make sure `.env` files are in the correct directories
- Don't commit `.env` files to version control
- Restart servers after changing environment variables

## 📄 License

This project is licensed under the MIT License.
