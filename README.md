# 🌱 SustainAride

<div align="center">

![SustainAride Banner](https://img.shields.io/badge/SustainAride-Eco--Friendly_Transportation-00C853?style=for-the-badge&logo=leaf&logoColor=white)

**Making every ride count towards a greener planet** 🌍

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE)

[Features](#-features) • [Demo](#-demo) • [Installation](#-installation) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---

## 📖 About

**SustainAride** is a full-stack sustainability-focused ride-hailing platform that promotes eco-friendly transportation by encouraging users to choose CNG vehicles, electric vehicles (EVs), and shared rides. The platform gamifies sustainable travel with rewards, coupons, and real-time pollution alerts to reduce CO₂ emissions and promote green commuting.

Built for environmentally conscious travelers who want to make a positive impact while getting from point A to point B.

---

## ✨ Features

### 🚗 Core Features

- **🌿 Eco-Ride Booking System**
  - Book rides with Electric, CNG, or Shared vehicles
  - Real-time ride tracking with Leaflet maps
  - Smart route optimization for reduced emissions
  - Multi-step booking flow with driver matching

- **💰 Smart Coupon Engine**
  - Dynamic coupon validation system
  - User-specific and ride-type-specific coupons
  - Automatic eligibility checking
  - Active/expired coupon management
  - Predefined eco-friendly coupons:
    - `GreenStart10` - ₹10 off first eco-ride
    - `EcoRide20` - ₹20 cashback on 3 shared rides
    - `ElectricSaver30` - ₹30 off electric rides >10km
    - `SharedBonus50` - ₹50 off on shared rides
    - `ReferralRide100` - ₹100 referral bonus

- **🎁 Rewards & Gamification**
  - Earn SustainPoints for eco-friendly rides
  - Redeem rewards from partner brands
  - Achievement badges and milestones
  - Emergency pollution alert bonuses

### 🌍 Environmental Features

- **📊 Carbon Footprint Tracking**
  - Real-time CO₂ savings calculator
  - Impact dashboard with visualizations
  - Trees planted equivalent metric
  - Monthly/weekly environmental reports

- **🚨 Real-Time AQI Monitoring**
  - Live Air Quality Index tracking (Delhi)
  - Emergency pollution mode activation (AQI > 200)
  - Bonus eco-rewards during high pollution
  - Test pollution mode for development

### 👤 User Management

- **🔐 Secure Authentication**
  - JWT-based authentication
  - BCrypt password hashing
  - Token expiration and refresh
  - Protected routes and API endpoints
  - Auto-logout on token expiry

- **👨‍💼 User Profiles**
  - Customizable user profiles
  - Profile picture upload
  - Ride history tracking
  - SustainPoints wallet
  - Coupon & reward management

### 🎨 User Experience

- **🌓 Modern UI/UX**
  - Dark/Light theme support
  - Fully responsive design (mobile-first)
  - Smooth animations with Framer Motion
  - Beautiful Shadcn/UI components
  - Interactive Storybook components

- **📱 Progressive Web Features**
  - Offline mode support
  - Real-time backend status monitoring
  - Network error handling
  - Optimistic UI updates

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS 3.4
- **UI Components**: Radix UI + Shadcn/UI
- **Animations**: Framer Motion
- **Forms**: React Hook Form + Zod validation
- **Routing**: React Router v6
- **Maps**: Leaflet + React Leaflet
- **State Management**: React Context API
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js 24.x
- **Framework**: Express.js 5
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken)
- **Security**: 
  - Helmet (HTTP headers)
  - CORS
  - BCrypt (password hashing)
  - Express Rate Limit
  - Mongo Sanitize
- **Task Scheduling**: Node-cron
- **Caching**: Node-cache

### DevOps & Tools
- **Deployment**: Vercel (Frontend & Serverless Functions)
- **Development**: 
  - Concurrently (parallel scripts)
  - Nodemon (hot reload)
  - TypeScript 5
  - ESLint
- **Component Development**: Tempo Devtools & Storybook

---

## 🚀 Installation

### Prerequisites

- Node.js 18+ (recommended: 24.x)
- MongoDB Atlas account or local MongoDB
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/SustainAride.git
cd SustainAride
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `server/config.env` file:

```env
# MongoDB Connection
ATLAS_URI=your_mongodb_connection_string

# JWT Configuration
JWT_SECRET=your_jwt_secret_key

# Server Configuration
PORT=5000
NODE_ENV=development

# Air Quality API (optional)
AQI_API_KEY=your_aqi_api_key
```

Create a `.env` file in the root (for frontend):

```env
VITE_API_URL=http://localhost:5000
VITE_TEMPO=false
```

### 4. Start Development

**Option 1: Start Frontend & Backend Together**
```bash
npm run dev:all
```

**Option 2: Start Separately**

Terminal 1 - Backend:
```bash
npm run server
```

Terminal 2 - Frontend:
```bash
npm run dev
```

The app will be available at:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`

---

## 📂 Project Structure

```
SustainAride/
├── src/                          # Frontend source code
│   ├── api/                      # API service layers
│   │   ├── apiClient.ts         # Axios client configuration
│   │   ├── authService.ts       # Authentication API
│   │   ├── couponService.ts     # Coupon management API
│   │   ├── rewardService.ts     # Rewards API
│   │   ├── rideService.ts       # Ride booking API
│   │   └── userService.ts       # User management API
│   ├── components/               # React components
│   │   ├── auth/                # Authentication components
│   │   ├── map/                 # Map components
│   │   ├── ui/                  # Reusable UI components
│   │   ├── Dashboard.tsx        # User dashboard
│   │   ├── Profile.tsx          # User profile
│   │   ├── RideBookingFlow.tsx  # Ride booking interface
│   │   └── ...
│   ├── contexts/                 # React Context providers
│   │   └── AuthContext.tsx      # Authentication context
│   ├── types/                    # TypeScript type definitions
│   │   └── api.ts               # API type definitions
│   ├── lib/                      # Utility libraries
│   ├── stories/                  # Storybook stories
│   ├── App.tsx                   # Main app component
│   └── main.tsx                  # App entry point
├── server/                       # Backend source code
│   ├── controllers/              # Request handlers
│   │   ├── authController.cjs   # Authentication logic
│   │   ├── rewardController.cjs # Rewards logic
│   │   └── aqiController.cjs    # AQI monitoring
│   ├── models/                   # MongoDB schemas
│   │   ├── User.cjs             # User model
│   │   ├── Ride.cjs             # Ride model
│   │   ├── Coupon.cjs           # Coupon model
│   │   └── Reward.cjs           # Reward model
│   ├── routes/                   # API route definitions
│   │   ├── authRoutes.cjs       # Auth endpoints
│   │   ├── userRoutes.cjs       # User endpoints
│   │   ├── rideRoutes.cjs       # Ride endpoints
│   │   ├── couponRoutes.cjs     # Coupon endpoints
│   │   └── rewardRoutes.cjs     # Reward endpoints
│   ├── middlewares/              # Express middlewares
│   │   └── auth.cjs             # JWT verification
│   ├── utils/                    # Utility functions
│   │   ├── couponEngine.cjs     # Coupon validation engine
│   │   └── scheduler.cjs        # Cron jobs
│   ├── db.cjs                    # Database connection
│   ├── server.cjs                # Express server
│   └── config.env                # Environment variables
├── api/                          # Vercel serverless functions
│   ├── auth/                     # Auth endpoints
│   ├── coupons/                  # Coupon endpoints
│   └── aqi/                      # AQI endpoints
├── public/                       # Static assets
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
├── tailwind.config.js            # Tailwind configuration
├── vite.config.ts                # Vite configuration
└── vercel.json                   # Vercel deployment config
```

---

## 🔌 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "phone": "1234567890"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

#### Verify Token
```http
GET /api/auth/verify
Authorization: Bearer <token>
```

### User Endpoints

#### Get User Profile
```http
GET /api/users/:id
Authorization: Bearer <token>
```

#### Update User Profile
```http
PUT /api/users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Updated",
  "phone": "9876543210"
}
```

#### Get User Rides
```http
GET /api/users/:id/rides
Authorization: Bearer <token>
```

#### Get User Coupons
```http
GET /api/users/:id/coupons
Authorization: Bearer <token>
```

### Coupon Endpoints

#### Get All Coupons
```http
GET /api/coupons
```

#### Get Active User Coupons
```http
GET /api/coupons/user/:userId/active
```

#### Validate Coupon
```http
POST /api/coupons/validate
Content-Type: application/json

{
  "code": "GreenStart10",
  "userId": "user_id",
  "rideType": "Electric",
  "rideValue": 100
}
```

### Ride Endpoints

#### Book a Ride
```http
POST /api/rides
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "user_id",
  "type": "Electric",
  "pickupLocation": {
    "coordinates": [77.1025, 28.7041],
    "address": "Connaught Place, Delhi"
  },
  "dropoffLocation": {
    "coordinates": [77.2090, 28.6139],
    "address": "India Gate, Delhi"
  },
  "distance": 8.5,
  "estimatedPrice": 150
}
```

#### Get Ride Details
```http
GET /api/rides/:id
Authorization: Bearer <token>
```

### Reward Endpoints

#### Get All Rewards
```http
GET /api/rewards
```

#### Claim Emergency Eco Bonus
```http
POST /api/rewards/claim-eco-bonus
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "user_id"
}
```

#### Redeem Reward
```http
POST /api/rewards/:id/redeem
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "user_id"
}
```

### AQI Endpoints

#### Get Delhi AQI
```http
GET /api/aqi/delhi
```

#### Get Alert Status
```http
GET /api/aqi/alert-status
```

---

## 🎨 Component Storybook

The project includes a comprehensive Storybook for UI components:

```bash
npm run storybook
```

Available component stories:
- Buttons, Cards, Forms
- Alerts, Dialogs, Modals
- Navigation, Menus
- Data display components
- And more...

---

## 🔒 Security Features

- **Authentication**: JWT-based with 7-day expiration
- **Password Security**: BCrypt hashing with salt rounds
- **API Security**: 
  - Rate limiting
  - CORS protection
  - Helmet security headers
  - MongoDB injection prevention
- **Protected Routes**: Frontend and backend route protection
- **Token Management**: Automatic logout on expiry
- **Environment Variables**: Sensitive data protection

---

## 🌐 Deployment

### Vercel Deployment (Recommended)

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Deploy**
```bash
vercel
```

3. **Set Environment Variables** in Vercel Dashboard:
   - `ATLAS_URI`
   - `JWT_SECRET`
   - `NODE_ENV=production`

### MongoDB Atlas Setup

1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get your connection string
4. Add to `config.env` or environment variables

---

## 🧪 Testing

### Test Pollution Mode

A test pollution button is available in the UI to simulate high AQI conditions:
- Activates emergency eco-bonus mode
- Triggers pollution alerts
- Tests coupon eligibility during high pollution

### API Testing

Test backend endpoints:
```bash
node server/test-api.cjs
```

---

## 📊 Database Models

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  sustainPoints: Number,
  rides: [Ride],
  coupons: [Coupon],
  rewards: [Reward],
  joinDate: Date
}
```

### Ride Model
```javascript
{
  user: ObjectId,
  type: Enum ['Electric', 'CNG', 'Shared'],
  pickupLocation: Location,
  dropoffLocation: Location,
  distance: Number,
  carbonSaved: Number,
  price: Number,
  status: Enum ['Pending', 'Confirmed', 'Completed']
}
```

### Coupon Model
```javascript
{
  code: String (unique),
  description: String,
  discountType: Enum ['Fixed', 'Percentage'],
  discountValue: Number,
  validFrom: Date,
  validUntil: Date,
  applicableRideTypes: [String],
  usageLimit: Number,
  isActive: Boolean
}
```

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation for new features
- Test thoroughly before submitting PR

---

## 🐛 Known Issues & Roadmap

### Current Limitations
- Profile picture upload (UI ready, backend pending)
- Real-time ride tracking (simulated)
- Payment gateway integration (planned)

### Future Enhancements
- [ ] Real-time driver tracking
- [ ] Push notifications
- [ ] Social sharing features
- [ ] Advanced analytics dashboard
- [ ] Driver companion app
- [ ] Multi-language support
- [ ] Payment gateway integration
- [ ] Ride scheduling
- [ ] Corporate accounts

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Dhruv**

- GitHub: [@dhruv552](https://github.com/dhruv552)
- Project Link: [https://github.com/dhruv552/SustainAride](https://github.com/dhruv552/SustainAride)

---

## 🙏 Acknowledgments

- Shadcn/UI for beautiful components
- Radix UI for accessible primitives
- OpenStreetMap for mapping services
- MongoDB Atlas for database hosting
- Vercel for deployment platform

---

## 📞 Support

If you have any questions or need help:

1. **Open an issue**: [GitHub Issues](https://github.com/dhruv552/SustainAride/issues)
2. **Email**: support@sustainaride.com
3. **Documentation**: Check the [Wiki](https://github.com/dhruv552/SustainAride/wiki)

---

<div align="center">

**Made with 💚 for a sustainable future**

⭐ Star this repo if you find it helpful!

[Back to Top](#-sustainaride)

</div>
