# 🏢 Work Management System

A comprehensive full-stack work management system designed for managing interns, tasks, attendance, evaluations, and more. Built with **Next.js 16** for the frontend and **Express.js** with **MongoDB** for the backend.

🌐 **Live Demo**: [https://dashboard.lovosis.in](https://dashboard.lovosis.in)

![Node.js](https://img.shields.io/badge/Node.js-20-green?logo=node.js)
![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![MongoDB](https://img.shields.io/badge/MongoDB-8.x-green?logo=mongodb)
![Docker](https://img.shields.io/badge/Docker-Ready-blue?logo=docker)
![License](https://img.shields.io/badge/License-ISC-blue)
![Website](https://img.shields.io/website?url=https%3A%2F%2Fdashboard.lovosis.in)

---

## 📋 Table of Contents

- [Features](#-features)
- [Live Demo](#-live-demo)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
  - [Local Development](#local-development)
  - [Docker Deployment](#docker-deployment)
- [Environment Variables](#-environment-variables)
- [API Documentation](#-api-documentation)
- [Database Models](#-database-models)
- [Authentication](#-authentication)
- [Role-Based Access](#-role-based-access)
- [Scripts](#-scripts)
- [Contributing](#-contributing)

---

## 🌐 Live Demo

Visit the live application at: **[https://dashboard.lovosis.in](https://dashboard.lovosis.in)**

### Demo Access
> Contact the administrator for demo credentials or register a new account.

---

## ✨ Features

### 👤 User Management
- **Role-based access control** (Admin & Intern roles)
- User registration and profile management
- Avatar upload with Cloudinary integration
- Intern-specific fields (college, department, internship role, etc.)
- Auto-generated unique Intern IDs

### ⏰ Attendance Management
- Daily check-in and check-out system
- Leave request and approval workflow
- Support for different leave types (sick, casual, emergency)
- Attendance statistics and reporting
- Half-day and full-day tracking

### 📝 Task Management
- Create, assign, and track tasks
- Priority levels (low, medium, high, urgent)
- Status tracking (pending, in-progress, completed, cancelled)
- Due date management
- Task comments and attachments
- Estimated hours tracking

### 📊 Work Logs
- Daily work log entries
- Hours worked tracking
- Progress documentation

### 📈 Evaluations
- Performance evaluation system
- Feedback and rating mechanisms

### 💬 Messaging
- Internal messaging system
- User-to-user communication

### 📢 Announcements
- Company-wide announcements
- Important notifications

### 📄 Document Management
- Document upload and storage
- Cloudinary integration for file storage

### 🔔 Notifications
- Real-time notification system
- Activity alerts

### 📊 Dashboard
- Admin dashboard with comprehensive overview
- Intern dashboard with personalized view
- Statistics and analytics

---

## 🛠 Tech Stack

### Frontend
| Technology | Version | Description |
|------------|---------|-------------|
| Next.js | 16.0.1 | React framework with App Router |
| React | 19.2.0 | UI library |
| TypeScript | 5.x | Type-safe JavaScript |
| Tailwind CSS | 4.1.16 | Utility-first CSS framework |
| Axios | 1.13.2 | HTTP client |
| Recharts | 3.3.0 | Charting library |
| Lucide React | 0.552.0 | Icon library |
| React Hook Form | 7.66.0 | Form handling |
| Zod | 4.1.12 | Schema validation |
| date-fns | 4.1.0 | Date utilities |

### Backend
| Technology | Version | Description |
|------------|---------|-------------|
| Node.js | 20.x | JavaScript runtime |
| Express.js | 5.1.0 | Web framework |
| MongoDB | - | NoSQL database |
| Mongoose | 8.19.3 | MongoDB ODM |
| JWT | 9.0.2 | Authentication tokens |
| bcryptjs | 3.0.3 | Password hashing |
| Cloudinary | 2.8.0 | Cloud storage for images |
| Multer | 2.0.2 | File upload handling |

### DevOps
| Technology | Description |
|------------|-------------|
| Docker | Containerization |
| Docker Compose | Multi-container orchestration |

---

## 📁 Project Structure

```
work-management-system/
├── docker-compose.yml          # Docker orchestration config
├── LICENSE                     # License file
├── README.md                   # This file
│
├── Backend/                    # Express.js Backend
│   ├── Dockerfile              # Backend container config
│   ├── fixDemoPhone.js         # Script to fix demo phone
│   ├── index.js                # Application entry point
│   ├── package.json            # Dependencies & scripts
│   ├── updateDemoPhone.js      # Script to update demo phone
│   │
│   ├── config/                 # Configuration files
│   │   ├── cloudinary.js       # Cloudinary config
│   │   ├── db.js               # MongoDB connection
│   │   └── whatsapp.js         # WhatsApp integration
│   │
│   ├── controllers/            # Route handlers
│   │   ├── announcementController.js
│   │   ├── attendanceController.js
│   │   ├── authController.js
│   │   ├── dashboardController.js
│   │   ├── documentController.js
│   │   ├── evaluationController.js
│   │   ├── messageController.js
│   │   ├── notificationController.js
│   │   ├── passwordResetController.js
│   │   ├── taskController.js
│   │   ├── userController.js
│   │   └── workLogController.js
│   │
│   ├── middleware/             # Express middleware
│   │   ├── auth.js             # JWT authentication
│   │   └── error.js            # Error handling
│   │
│   ├── models/                 # Mongoose schemas
│   │   ├── Announcement.js
│   │   ├── Attendance.js
│   │   ├── Document.js
│   │   ├── Evaluation.js
│   │   ├── Message.js
│   │   ├── Notification.js
│   │   ├── Task.js
│   │   ├── User.js
│   │   └── WorkLog.js
│   │
│   ├── routes/                 # API routes
│   │   ├── announcementRoutes.js
│   │   ├── attendanceRoutes.js
│   │   ├── authRoutes.js
│   │   ├── dashboardRoutes.js
│   │   ├── documentRoutes.js
│   │   ├── evaluationRoutes.js
│   │   ├── messageRoutes.js
│   │   ├── notificationRoutes.js
│   │   ├── passwordResetRoutes.js
│   │   ├── taskRoutes.js
│   │   ├── userRoutes.js
│   │   └── workLogRoutes.js
│   │
│   └── scripts/                # Utility scripts
│       ├── createAdmin.js      # Create admin user
│       └── testLoginAPI.js     # Test login API
│
└── Frontend/                   # Next.js Frontend
    ├── components.json         # Component configuration
    ├── Dockerfile              # Frontend container config
    ├── eslint.config.mjs       # ESLint configuration
    ├── next-env.d.ts           # Next.js environment types
    ├── next.config.ts          # Next.js configuration
    ├── package.json            # Dependencies & scripts
    ├── postcss.config.mjs      # PostCSS configuration
    ├── tailwind.config.ts      # Tailwind configuration
    ├── tsconfig.json           # TypeScript configuration
    │
    ├── public/                 # Static assets
    │
    └── src/
        ├── app/                # Next.js App Router
        │   ├── globals.css      # Global styles
        │   ├── layout.tsx       # Root layout
        │   ├── page.tsx         # Home page
        │   │
        │   ├── dashboard/       # Dashboard routes
        │   │   ├── layout.tsx
        │   │   ├── page.tsx
        │   │   ├── attendance/
        │   │   │   └── page.tsx
        │   │   ├── documents/
        │   │   │   └── page.tsx
        │   │   ├── evaluations/
        │   │   │   └── page.tsx
        │   │   ├── messages/
        │   │   │   └── page.tsx
        │   │   ├── profile/
        │   │   │   └── page.tsx
        │   │   ├── tasks/
        │   │   │   └── page.tsx
        │   │   ├── users/
        │   │   │   └── page.tsx
        │   │   └── worklogs/
        │   │       └── page.tsx
        │   │
        │   ├── forgot-password/ # Password reset
        │   │   └── page.tsx
        │   ├── login/           # Login page
        │   │   └── page.tsx
        │   ├── privacy/         # Privacy policy
        │   │   └── page.tsx
        │   ├── support/         # Support page
        │   │   └── page.tsx
        │   ├── tasks/           # Tasks page
        │   │   └── page.tsx
        │   ├── terms/           # Terms of service
        │   │   └── page.tsx
        │   └── users/           # Users page
        │       └── page.tsx
        │
        ├── components/          # React components
        │   ├── GlobalSearch.tsx
        │   ├── NotificationDropdown.tsx
        │   ├── dashboard/
        │   │   ├── AdminDashboard.tsx
        │   │   └── InternDashboard.tsx
        │   └── ui/              # UI components
        │       ├── badge.tsx
        │       ├── button.tsx
        │       ├── card.tsx
        │       ├── input.tsx
        │       ├── table.tsx
        │       └── textarea.tsx
        │
        ├── context/             # React contexts
        │   └── AuthContext.tsx
        │
        ├── lib/                 # Utilities
        │   ├── api.ts           # API client
        │   ├── csvUtils.ts      # CSV utilities
        │   └── utils.ts        # General utilities
        │
        └── types/               # TypeScript types
            └── index.ts
```

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v20.x or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** - Comes with Node.js
- **MongoDB** - [Download](https://www.mongodb.com/try/download/community) or use MongoDB Atlas
- **Docker** (optional) - [Download](https://www.docker.com/products/docker-desktop)

---

## 🚀 Installation

### Local Development

#### 1. Clone the Repository

```bash
git clone https://github.com/muynuddinr/work-management-system.git
cd work-management-system
```

#### 2. Backend Setup

```bash
# Navigate to backend directory
cd Backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your configurations (see Environment Variables section)

# Start development server
npm run dev
```

The backend will run on `http://localhost:8089`

#### 3. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd Frontend

# Install dependencies
npm install

# Create environment file
echo "NEXT_PUBLIC_API_URL=http://localhost:8089/api" > .env.local

# Start development server
npm run dev
```

The frontend will run on `http://localhost:3000`

#### 4. Create Admin User

```bash
cd Backend
npm run admin
```

### Docker Deployment

#### 1. Build and Start Containers

```bash
# From project root
docker-compose up --build
```

#### 2. Access the Application

- **Frontend**: `http://localhost:8090`
- **Backend API**: `http://localhost:8089`

#### 3. Stop Containers

```bash
docker-compose down
```

---

## 🔐 Environment Variables

### Backend (`Backend/.env`)

```env
# Server Configuration
PORT=8089
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/work-management

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7

# Client URL (for CORS)
CLIENT_URL=http://localhost:3000

# Cloudinary Configuration (for file uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# WhatsApp Configuration (optional)
WHATSAPP_API_URL=your-whatsapp-api-url
WHATSAPP_API_TOKEN=your-whatsapp-token
```

### Frontend (`Frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:8089/api
```

---

## 📡 API Documentation

### Base URL
```
http://localhost:8089/api
```

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | User login | No |
| POST | `/auth/logout` | User logout | Yes |
| GET | `/auth/me` | Get current user | Yes |
| PUT | `/auth/updatedetails` | Update user details | Yes |
| PUT | `/auth/updatepassword` | Update password | Yes |

### User Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/users` | Get all users | Yes (Admin) |
| GET | `/users/:id` | Get single user | Yes |
| POST | `/users` | Create user | Yes (Admin) |
| PUT | `/users/:id` | Update user | Yes |
| DELETE | `/users/:id` | Delete user | Yes (Admin) |
| GET | `/users/interns` | Get all interns | Yes |
| POST | `/users/:id/avatar` | Upload avatar | Yes |

### Attendance Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/attendance/checkin` | Check in | Yes |
| PUT | `/attendance/checkout` | Check out | Yes |
| GET | `/attendance` | Get attendance records | Yes |
| POST | `/attendance/leave` | Request leave | Yes |
| PUT | `/attendance/leave/:id` | Approve/reject leave | Yes (Admin) |
| GET | `/attendance/stats/:userId?` | Get attendance stats | Yes |

### Task Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/tasks` | Get all tasks | Yes |
| GET | `/tasks/:id` | Get single task | Yes |
| POST | `/tasks` | Create task | Yes (Admin) |
| PUT | `/tasks/:id` | Update task | Yes |
| DELETE | `/tasks/:id` | Delete task | Yes (Admin) |
| POST | `/tasks/:id/comments` | Add comment | Yes |
| GET | `/tasks/stats/:userId?` | Get task stats | Yes |

### Work Log Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/worklogs` | Get work logs | Yes |
| GET | `/worklogs/:id` | Get single work log | Yes |
| POST | `/worklogs` | Create work log | Yes |
| PUT | `/worklogs/:id` | Update work log | Yes |
| DELETE | `/worklogs/:id` | Delete work log | Yes |

### Other Endpoints

| Resource | Base Path | Description |
|----------|-----------|-------------|
| Evaluations | `/evaluations` | Performance evaluations |
| Messages | `/messages` | Internal messaging |
| Announcements | `/announcements` | Company announcements |
| Documents | `/documents` | Document management |
| Dashboard | `/dashboard` | Dashboard statistics |
| Notifications | `/notifications` | User notifications |
| Password Reset | `/password-reset` | Password recovery |

---

## 🗃 Database Models

### User Model

```javascript
{
  name: String,           // Required
  email: String,          // Required, unique
  password: String,       // Required, hashed
  role: ['admin', 'intern'],
  phone: String,
  avatar: String,
  internId: String,       // Auto-generated for interns
  college: String,
  department: String,
  internshipRole: String,
  startDate: Date,
  endDate: Date,
  status: ['active', 'inactive', 'completed'],
  supervisorId: ObjectId,
  address: String,
  emergencyContact: {
    name: String,
    phone: String,
    relation: String
  }
}
```

### Attendance Model

```javascript
{
  userId: ObjectId,       // Required
  date: Date,             // Required
  checkIn: Date,          // Required
  checkOut: Date,
  status: ['present', 'absent', 'half-day', 'leave'],
  leaveType: ['sick', 'casual', 'emergency', null],
  leaveReason: String,
  leaveApproved: Boolean,
  approvedBy: ObjectId,
  totalHours: Number,
  notes: String
}
```

### Task Model

```javascript
{
  title: String,          // Required
  description: String,    // Required
  assignedTo: ObjectId,   // Required
  assignedBy: ObjectId,   // Required
  priority: ['low', 'medium', 'high', 'urgent'],
  status: ['pending', 'in-progress', 'completed', 'cancelled'],
  dueDate: Date,          // Required
  startDate: Date,
  completedDate: Date,
  attachments: [{
    name: String,
    url: String,
    uploadedAt: Date
  }],
  comments: [{
    userId: ObjectId,
    comment: String,
    createdAt: Date
  }],
  tags: [String],
  estimatedHours: Number
}
```

---

## 🔒 Authentication

The system uses **JWT (JSON Web Tokens)** for authentication:

1. **Login**: User provides email and password
2. **Token Generation**: Server generates a JWT token
3. **Token Storage**: Token is stored in localStorage on the client
4. **Request Authentication**: Token is sent in the `Authorization` header
5. **Token Verification**: Server verifies the token on protected routes

### Token Format
```
Authorization: Bearer <token>
```

### Password Security
- Passwords are hashed using **bcryptjs**
- Minimum password length: 6 characters
- Passwords are never stored in plain text

---

## 👥 Role-Based Access

### Admin Role
- Full access to all features
- Manage users (create, update, delete)
- Assign tasks to interns
- Approve/reject leave requests
- View all attendance records
- Create announcements
- Access admin dashboard

### Intern Role
- Limited access based on assignment
- View and update own tasks
- Check-in/check-out attendance
- Request leaves
- Submit work logs
- Access intern dashboard

---

## 📜 Scripts

### Backend Scripts

```bash
# Start production server
npm start

# Start development server with hot reload
npm run dev

# Create admin user
npm run admin
```

### Frontend Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

### Utility Scripts (Backend)

| Script | Location | Description |
|--------|----------|-------------|
| `createAdmin.js` | `scripts/` | Create an admin user |
| `testLoginAPI.js` | `scripts/` | Test login API |

---

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### Code Style
- Follow ESLint rules for JavaScript/TypeScript
- Use meaningful variable and function names
- Add comments for complex logic
- Write clean, readable code

---

## 📄 License

This project is licensed under the **ISC License** - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Muynuddin R**
- GitHub: [@muynuddinr](https://github.com/muynuddinr)

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Express.js](https://expressjs.com/) - Fast, unopinionated web framework
- [MongoDB](https://www.mongodb.com/) - The database for modern applications
- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework
- [Cloudinary](https://cloudinary.com/) - Cloud-based image management

---

<div align="center">
  <p>Made with ❤️ for better work management</p>
  <p>⭐ Star this repository if you find it helpful!</p>
</div>
