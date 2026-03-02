# John's MERN Todo List Application

A professional, full-stack todo application built with the MERN stack (MongoDB, Express, React, Node.js). This application demonstrates enterprise-level security practices, responsive UI development, and production-ready deployment patterns.

## 🚀 Features

### Core Functionality
- **CRUD Operations**: Create, read, update, and delete todos
- **Real-time Updates**: Optimistic UI updates for instant feedback
- **Input Validation**: Client and server-side validation with sanitization
- **Network Awareness**: Online/offline status monitoring
- **Error Handling**: Comprehensive error states with user-friendly messages

### Security Features
- **Input Sanitization**: XSS protection and character validation
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Security Headers**: Helmet.js with CSP, HSTS, and XSS protection
- **MongoDB Sanitization**: NoSQL injection prevention
- **CORS Protection**: Restricted to specific origins
- **Body Size Limits**: DoS attack prevention

### Professional UX
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Cross-browser Compatibility**: Optimized for Chrome, Firefox, Safari, and Edge
- **Accessibility**: ARIA labels and keyboard navigation
- **Micro-interactions**: Hover effects and smooth transitions
- **Loading States**: Visual feedback for all operations
- **Empty States**: Friendly messages and guidance

## 🛠️ Tech Stack

### Frontend
- **React 19**: Modern UI with hooks and concurrent features
- **Vite**: Fast build tool and development server
- **Axios**: HTTP client with timeout and error handling
- **Tailwind CSS**: Utility-first CSS framework
- **ESLint**: Code quality and consistency

### Backend
- **Node.js 18+**: JavaScript runtime with ES6+ support
- **Express.js**: Web framework with middleware
- **MongoDB**: NoSQL database with Mongoose ODM
- **Security Middleware**: Helmet, rate limiting, validation
- **Environment Management**: Production-ready configuration

### Security & Validation
- **express-validator**: Input validation and sanitization
- **express-rate-limit**: API rate limiting
- **helmet**: Security headers and CSP
- **express-mongo-sanitize**: NoSQL injection prevention
- **xss**: Cross-site scripting protection

### Deployment
- **Vercel**: Frontend hosting with automatic CI/CD
- **Render**: Backend hosting with environment management
- **MongoDB Atlas**: Cloud database with monitoring

## 📋 Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account (for production)
- Git and GitHub account (for deployment)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yrdnal-c-nhoj/mern-todo.git
cd mern-todo
```

### 2. Backend Setup

```bash
cd backend
npm install
```

#### Environment Variables
Create a `.env` file in the `backend` directory:

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/todo-app?retryWrites=true&w=majority
PORT=5001
NODE_ENV=development
```

#### Start Backend Server
```bash
npm start
```

The backend will be available at `http://localhost:5001`

### 3. Frontend Setup

```bash
cd frontend
npm install
```

#### Environment Variables
Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:5001
```

#### Start Frontend Development Server
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 🏗️ Project Structure

```
mern-todo/
├── backend/
│   ├── middleware/
│   │   ├── security.js      # Security middleware
│   │   └── validation.js    # Input validation
│   ├── models/
│   │   └── Todo.js          # Mongoose schema
│   ├── routes/
│   │   └── todoRoutes.js    # API routes with validation
│   ├── .env                 # Environment variables
│   ├── package.json         # Dependencies with security packages
│   └── server.js            # Express server with security
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Main React component with UX enhancements
│   │   └── main.jsx         # React entry point
│   ├── public/
│   ├── .env                 # Development environment
│   ├── .env.production      # Production environment
│   ├── package.json         # Dependencies
│   └── vite.config.js       # Vite configuration
├── render.yaml              # Render deployment config
├── vercel.json              # Vercel deployment config
└── README.md                # This file
```

## 🔧 API Endpoints

### Todos

| Method | Endpoint | Description | Validation |
|--------|----------|-------------|------------|
| GET | `/api/todos` | Get all todos (sorted by newest) | - |
| POST | `/api/todos` | Create a new todo | Text: 1-200 chars, alphanumeric + symbols |
| DELETE | `/api/todos/:id` | Delete a todo by ID | Valid MongoDB ObjectId |

### System

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Check server status and uptime |
| GET | `/` | Get API information and endpoints |

### Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: Character limits and sanitization
- **CORS**: Restricted to allowed origins only
- **Security Headers**: HSTS, CSP, XSS protection
- **Body Size**: Limited to 10KB per request

## 🌐 Deployment

### Frontend (Vercel)

1. Connect your GitHub repository to Vercel
2. Set the `VITE_API_URL` environment variable to your backend URL
3. Deploy automatically on push to main branch

### Backend (Render)

1. Connect your GitHub repository to Render
2. Set environment variables:
   - `MONGO_URI`: Your MongoDB Atlas connection string
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
3. Deploy automatically on push to main branch

### Environment Variables

| Environment | Frontend URL | Backend URL | Database | Security |
|------------|--------------|-------------|----------|----------|
| Development | `http://localhost:5173` | `http://localhost:5001` | MongoDB Atlas | CORS disabled |
| Production | `https://mern-todo-gules.vercel.app` | `https://nasapod-1.onrender.com` | MongoDB Atlas | Full security |

## 🧪 Testing

### Manual Testing

#### Backend API
```bash
# Health check
curl http://localhost:5001/health

# Get todos
curl http://localhost:5001/api/todos

# Create todo (valid)
curl -X POST http://localhost:5001/api/todos \
  -H "Content-Type: application/json" \
  -d '{"text":"Test todo"}'

# Create todo (invalid - too long)
curl -X POST http://localhost:5001/api/todos \
  -H "Content-Type: application/json" \
  -d '{"text":"'$(printf 'a%.0s' {1..201})'"}'

# Rate limiting test
for i in {1..105}; do curl http://localhost:5001/api/todos; done
```

#### Frontend Testing
1. **Network Status**: Test offline/online behavior
2. **Input Validation**: Try invalid characters and long inputs
3. **Error Handling**: Test network failures
4. **Cross-browser**: Chrome, Firefox, Safari, Edge

### Security Testing

```bash
# XSS attempt
curl -X POST http://localhost:5001/api/todos \
  -H "Content-Type: application/json" \
  -d '{"text":"<script>alert(1)</script>"}'

# NoSQL injection attempt
curl -X POST http://localhost:5001/api/todos \
  -H "Content-Type: application/json" \
  -d '{"text":{"$ne":""}}'

# CORS test
curl -H "Origin: https://evil.com" http://localhost:5001/api/todos
```

## 🔒 Security Considerations

### Implemented Protections
- **Input Validation**: All user inputs are validated and sanitized
- **XSS Protection**: Scripts are stripped from user input
- **NoSQL Injection**: MongoDB queries are sanitized
- **Rate Limiting**: Prevents brute force and DoS attacks
- **CORS**: Restricted to specific origins
- **Security Headers**: HSTS, CSP, and other security headers
- **Body Size Limits**: Prevents large payload attacks

### Best Practices
- **Environment Variables**: Sensitive data stored securely
- **Error Handling**: No sensitive information leaked in errors
- **HTTPS Enforced**: Production uses secure connections
- **Regular Updates**: Dependencies kept up to date

## 🐛 Troubleshooting

### Common Issues

#### CORS Errors in Firefox
- Disable Enhanced Tracking Protection for localhost
- Ensure `withCredentials` is set to `false`

#### Rate Limiting
- Wait 15 minutes if limit exceeded
- Check IP address if using VPN/proxy

#### Validation Errors
- Check input length (max 200 characters)
- Ensure only allowed characters are used

#### Database Connection Issues
- Verify MongoDB Atlas connection string
- Check IP whitelist in Atlas settings
- Ensure environment variables are correctly set

#### Deployment Issues
- Check build logs on Vercel/Render
- Verify environment variables in production
- Ensure all dependencies are listed in package.json

### Debug Mode

Enable debug logging by setting:
```env
DEBUG=*
```

## 📝 Development Workflow

### Feature Development
```bash
git checkout -b feature/new-feature
# Make changes
npm test  # Run tests
git commit -m "Add new feature with security validation"
git push origin feature/new-feature
```

### Security Review
1. **Input Validation**: Test with malicious inputs
2. **Rate Limiting**: Verify limits are enforced
3. **CORS**: Test unauthorized origins
4. **Error Handling**: Ensure no data leakage

### Deployment
```bash
git checkout main
git merge feature/new-feature
git push origin main
# Automatic deployment to Vercel and Render
```

## 📊 Performance Monitoring

### Health Check Endpoint
```json
{
  "status": "Server is running",
  "env": "production",
  "timestamp": "2026-03-02T18:00:00.000Z",
  "uptime": 3600
}
```

### Rate Limiting Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1641234567
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Implement security best practices
4. Add tests for new features
5. Submit a pull request

### Security Guidelines
- Always validate and sanitize user input
- Follow OWASP security best practices
- Test for common vulnerabilities
- Keep dependencies updated

## 📄 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- MongoDB Atlas for database hosting
- Vercel for frontend deployment
- Render for backend deployment
- OWASP for security guidelines
- Open source community for amazing tools and libraries

## 📞 Support

For questions or support:
- Create an issue on GitHub
- Check the troubleshooting section
- Review the API documentation
- Test security features before deployment

---

**Built with ❤️ and security-first approach using the MERN stack**
