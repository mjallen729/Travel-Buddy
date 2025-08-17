# Travel Buddy Backend

A comprehensive travel planning API with MongoDB integration, AI-powered features, and collaboration capabilities.

## 🚀 Features

### Core Functionality
- ✅ User authentication and profile management
- ✅ Trip creation, editing, and deletion
- ✅ Travel preferences and personalization
- ✅ Collaboration and trip sharing
- ✅ Search and filtering capabilities
- ✅ Statistics and analytics

### AI-Powered Features (TODO)
- 🤖 Intelligent itinerary generation
- 🍽️ Restaurant and attraction recommendations
- 💡 Travel tips and local guidance
- 🎯 Personalized content based on preferences

### Organization Tools
- 📅 Trip categorization (upcoming, ongoing, completed)
- 🔍 Full-text search functionality
- 📊 Dashboard with statistics
- 👥 Collaboration management

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. **Clone and install dependencies**
   ```bash
   cd travel-buddy-backend
   npm install
   ```

2. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   # MongoDB Configuration
   MONGODB_URI=mongodb://localhost:27017/travel-buddy
   
   # Server Configuration
   PORT=3001
   NODE_ENV=development
   
   # CORS Origins
   ALLOWED_ORIGINS=http://localhost:8080,http://127.0.0.1:8080,http://localhost:3000
   ```

3. **Start MongoDB**
   ```bash
   # Local MongoDB
   mongod
   
   # Or use MongoDB Atlas (cloud)
   # Update MONGODB_URI in .env
   ```

4. **Start the server**
   ```bash
   npm run dev
   # or
   npx nodemon app.js
   ```

## 📚 API Documentation

### Authentication
- `POST /api/users/login` - User login
- `POST /api/users/signup` - User registration with questionnaire
- `PUT /api/users/profile/:userId` - Update user profile

### Trips
- `GET /api/trips/user/:userId` - Get user's trips
- `POST /api/trips` - Create new trip
- `PUT /api/trips/:tripId` - Update trip
- `DELETE /api/trips/:tripId` - Delete trip (soft delete)
- `GET /api/trips/search/:query` - Search trips
- `GET /api/trips/stats/:userId` - Get trip statistics

### Collaborations
- `GET /api/collaboration/user/:userId` - Get user's collaborations
- `POST /api/collaboration/invite` - Invite user to trip
- `PUT /api/collaboration/:collaborationId/accept` - Accept invitation
- `PUT /api/collaboration/:collaborationId/decline` - Decline invitation

## 🗄️ Database Models

### User Model
- Personal information (name, email, username)
- Travel preferences (budget, style, interests)
- Profile completion tracking
- Account status management

### Trip Model
- Trip details (name, destination, dates, budget)
- Travel preferences and interests
- AI-generated content (itinerary, recommendations, tips)
- Soft delete functionality
- Status tracking (planning, upcoming, ongoing, completed)

### Collaboration Model
- Trip sharing and permissions
- Role-based access control
- Invitation management
- Status tracking (pending, accepted, declined, revoked)

## 🔧 TODO List

### High Priority
- [ ] **JWT Authentication**
  - [ ] Implement JWT token generation
  - [ ] Add authentication middleware
  - [ ] Secure all protected routes
  - [ ] Token refresh mechanism

- [ ] **AI Integration**
  - [ ] Set up OpenAI/Claude API integration
  - [ ] Implement itinerary generation
  - [ ] Add restaurant/attraction recommendations
  - [ ] Create travel tips generation
  - [ ] Add destination-specific content

- [ ] **Frontend Integration**
  - [ ] Update frontend to use new API endpoints
  - [ ] Implement signup questionnaire flow
  - [ ] Add trip creation form
  - [ ] Create collaboration invitation UI
  - [ ] Build dashboard with real data

### Medium Priority
- [ ] **Email Notifications**
  - [ ] Set up email service (SendGrid/Nodemailer)
  - [ ] Collaboration invitation emails
  - [ ] Trip reminder notifications
  - [ ] Welcome emails for new users

- [ ] **File Upload**
  - [ ] Profile picture upload
  - [ ] Trip photo attachments
  - [ ] Document storage (passports, visas)

- [ ] **Advanced Features**
  - [ ] Real-time notifications (WebSocket)
  - [ ] Trip templates
  - [ ] Export trip data (PDF, calendar)
  - [ ] Integration with travel APIs (flights, hotels)

### Low Priority
- [ ] **Analytics & Reporting**
  - [ ] User behavior tracking
  - [ ] Trip success metrics
  - [ ] Popular destinations analysis
  - [ ] Budget tracking reports

- [ ] **Social Features**
  - [ ] Public trip sharing
  - [ ] User reviews and ratings
  - [ ] Community recommendations
  - [ ] Travel buddy matching

## 🧪 Testing

### Manual Testing Checklist
- [ ] User registration with questionnaire
- [ ] User login/logout
- [ ] Trip creation and editing
- [ ] Trip deletion (soft delete)
- [ ] Collaboration invitations
- [ ] Search functionality
- [ ] Dashboard statistics

### API Testing
```bash
# Test health check
curl http://localhost:3001/api/ping

# Test user creation
curl -X POST http://localhost:3001/api/users/signup \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "username": "johndoe",
    "password": "password123",
    "travelPreferences": {
      "budgetRange": "mid-range",
      "travelStyle": "balanced",
      "interests": ["food", "culture", "adventure"]
    }
  }'
```

## 🚨 Error Handling

The API includes comprehensive error handling:
- Input validation
- Database connection errors
- Authentication failures
- Resource not found errors
- Duplicate entry handling

## 🔒 Security Considerations

- [ ] Input sanitization
- [ ] SQL injection prevention (MongoDB)
- [ ] CORS configuration
- [ ] Rate limiting
- [ ] Password hashing (bcrypt)
- [ ] JWT token security
- [ ] Environment variable protection

## 📈 Performance Optimization

- [ ] Database indexing
- [ ] Query optimization
- [ ] Caching (Redis)
- [ ] Pagination for large datasets
- [ ] Image compression
- [ ] CDN integration

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check if MongoDB is running
   - Verify connection string in .env
   - Ensure network connectivity

2. **CORS Errors**
   - Check ALLOWED_ORIGINS in .env
   - Verify frontend URL matches

3. **Port Already in Use**
   - Change PORT in .env
   - Kill existing process: `lsof -ti:3001 | xargs kill`

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review error logs
3. Test with provided curl commands
4. Create an issue with detailed error information

---

**Happy Travel Planning! 🌍✈️**
