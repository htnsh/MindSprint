# 🌬️ MindSprint - Hyperlocal Air Quality Monitoring Platform

A comprehensive air quality monitoring platform that provides real-time AQI data, pollen forecasts, community reports, and personalized health insights. Built with Django REST Framework backend and Next.js frontend.

## 🚀 Features

### 📊 **Dashboard**
- Real-time Air Quality Index (AQI) monitoring
- Interactive charts and visualizations
- Location-based air quality data
- Health insights and recommendations

### 🗺️ **Interactive Map**
- Dynamic map with AQI and pollen stations
- Real-time data visualization
- Multiple layer support (AQI, PM2.5, Pollen)
- Custom markers with color-coded risk levels

### 🔔 **Smart Notifications**
- Air quality alerts based on AQI thresholds
- Pollen forecasts and allergy warnings
- Daily air quality summaries
- Customizable notification preferences

### 👥 **Community Features**
- User-generated air quality reports
- Community voting system
- Location-based report filtering
- Report verification system

### 🤖 **AI Chatbot**
- Air quality queries and insights
- Health recommendations
- Location-specific advice
- Interactive Q&A system

## 🏗️ Architecture

```
MindSprint/
├── backend/                 # Django REST API
│   ├── authentication/     # User authentication & MongoDB
│   ├── dashboard/          # AQI & pollen data APIs
│   ├── community/          # Community reports & map data
│   ├── notifications/      # Notification system
│   └── myproject/          # Django settings & URLs
├── frontend/               # Next.js React application
│   ├── app/               # Next.js 13+ app router
│   ├── components/        # Reusable UI components
│   ├── lib/              # API services & utilities
│   └── contexts/         # React contexts
└── files/                # Additional utilities & ML models
```

## 🛠️ Technology Stack

### Backend
- **Django 5.2.4** - Web framework
- **Django REST Framework 3.15.2** - API development
- **MongoDB** - Primary database
- **SQLite** - Django ORM database
- **PyMongo 4.6.1** - MongoDB driver
- **JWT Authentication** - Secure API access

### Frontend
- **Next.js 14.2.16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Radix UI** - Component library
- **Leaflet.js** - Interactive maps
- **Recharts** - Data visualization

### External APIs
- **WAQI API** - Air quality data
- **Ambee Data API** - Pollen forecasts
- **OpenStreetMap** - Map tiles and geocoding

## 📋 Prerequisites

Before running the project, ensure you have:

- **Node.js** (v18 or higher)
- **Python** (v3.10 or higher)
- **MongoDB Atlas** (cloud database - connection string provided)
- **Git**

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd MindSprint
```

### 2. Backend Setup

#### Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

#### Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Django Settings
SECRET_KEY=your-secret-key-here
DEBUG=True

# MongoDB Configuration (Cloud Atlas)
MONGO_URI=mongodb+srv://Hetansh_Panchal:id4vxGPKAEIDlyVE@hetansh.pcfax7n.mongodb.net/
MONGODB_URI=mongodb+srv://Hetansh_Panchal:id4vxGPKAEIDlyVE@hetansh.pcfax7n.mongodb.net/
MONGODB_DATABASE=BreatheBetter

# API Keys
WAQI_API_TOKEN=your-waqi-api-token
AMBEE_API_TOKEN=your-ambee-api-token
```

#### Database Setup

```bash
# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser
```

#### Start Backend Server

```bash
python manage.py runserver
```

The backend will be available at `http://localhost:8000`

### 3. Frontend Setup

#### Install Node.js Dependencies

```bash
cd frontend
npm install
# or
yarn install
# or
pnpm install
```

#### Start Frontend Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

The frontend will be available at `http://localhost:3000`

## 📦 Dependencies

### Backend Dependencies (`backend/requirements.txt`)

```
Django==5.2.4
djangorestframework==3.15.2
djangorestframework-simplejwt==5.3.0
django-cors-headers==4.3.1
python-decouple==3.8
pymongo==4.6.1
```

### Frontend Dependencies (`frontend/package.json`)

#### Core Dependencies
- **next**: 14.2.16 - React framework
- **react**: ^18 - React library
- **react-dom**: ^18 - React DOM
- **typescript**: ^5 - TypeScript support

#### UI Components
- **@radix-ui/react-*** - Comprehensive UI component library
- **lucide-react**: ^0.454.0 - Icon library
- **tailwindcss**: ^4.1.9 - CSS framework
- **class-variance-authority**: ^0.7.1 - Component variants

#### Data & Visualization
- **recharts**: latest - Chart library
- **leaflet**: Interactive maps
- **date-fns**: 4.1.0 - Date utilities

#### Forms & Validation
- **react-hook-form**: ^7.60.0 - Form handling
- **@hookform/resolvers**: ^3.10.0 - Form validation
- **zod**: 3.25.67 - Schema validation

#### Utilities
- **clsx**: ^2.1.1 - Conditional classes
- **tailwind-merge**: ^2.5.5 - Tailwind class merging
- **js-cookie**: ^3.0.5 - Cookie management

### Additional Dependencies (`files/requirements.txt`)

```
pandas==2.2.2
scikit-learn==1.3.2
joblib==1.3.2
Flask==2.3.3
Flask-CORS==4.0.0
Flask-SQLAlchemy==3.0.5
requests==2.31.0
numpy==1.24.3
scipy==1.11.1
geopy==2.3.0
python-dotenv==1.0.0
APScheduler==3.10.4
gunicorn
flask-pymongo
pymongo[srv]
```

## 🚀 Running the Project

### Development Mode

1. **Start Backend** (Terminal 1):
```bash
cd backend
python manage.py runserver
```

2. **Start Frontend** (Terminal 2):
```bash
cd frontend
npm run dev
```

3. **Access the Application**:
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:8000`
   - Django Admin: `http://localhost:8000/admin`

### Production Mode

1. **Build Frontend**:
```bash
cd frontend
npm run build
npm start
```

2. **Deploy Backend**:
```bash
cd backend
python manage.py collectstatic
gunicorn myproject.wsgi:application
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/login/` - User login
- `POST /api/auth/signup/` - User registration
- `GET /api/auth/me/` - Get user profile
- `POST /api/auth/logout/` - User logout

### Air Quality Data
- `GET /api/aqi/{city}/` - Get AQI data for city
- `GET /api/pollen/{city}/` - Get pollen data for city

### Community Features
- `GET /api/community/reports/` - Get community reports
- `POST /api/community/reports/` - Create new report
- `GET /api/community/map-data/` - Get map data
- `POST /api/community/vote/{id}/` - Vote on report

### Notifications
- `GET /api/notifications/` - Get user notifications
- `GET /api/notifications/mock/` - Get mock notifications
- `POST /api/notifications/generate-air-quality-alert/` - Generate alert
- `POST /api/notifications/generate-daily-summary/` - Generate summary
- `GET/POST /api/notifications/preferences/` - Manage preferences

## 🗄️ Database Schema

### MongoDB Collections
- **users** - User profiles and authentication
- **community_reports** - User-generated reports

### SQLite Tables (Django ORM)
- **notifications_notification** - Notification records
- **notifications_notificationpreference** - User preferences
- **auth_user** - Django user system (for notifications)

## 🔧 Configuration

### Environment Variables

#### Backend (`.env`)
```env
SECRET_KEY=your-secret-key
DEBUG=True
MONGO_URI=mongodb+srv://Hetansh_Panchal:id4vxGPKAEIDlyVE@hetansh.pcfax7n.mongodb.net/
MONGODB_URI=mongodb+srv://Hetansh_Panchal:id4vxGPKAEIDlyVE@hetansh.pcfax7n.mongodb.net/
MONGODB_DATABASE=BreatheBetter
WAQI_API_TOKEN=your-waqi-token
AMBEE_API_TOKEN=your-ambee-token
```

#### Frontend
No additional environment variables required for development.

### API Keys Setup

1. **WAQI API**: Get your token from [WAQI API](https://aqicn.org/api/)
2. **Ambee Data API**: Get your token from [Ambee Data](https://www.getambee.com/)

## 🧪 Testing

### Backend Testing
```bash
cd backend
python manage.py test
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 📱 Features Overview

### Dashboard
- Real-time AQI monitoring
- Interactive charts
- Location selector
- Health insights

### Map
- Dynamic AQI stations
- Pollen monitoring
- Layer controls
- Interactive markers

### Notifications
- Air quality alerts
- Pollen forecasts
- Daily summaries
- Preference management

### Community
- Report submission
- Voting system
- Location filtering
- Verification system

## 🚨 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**:
   - Verify MongoDB Atlas connection string in `.env`
   - Check network connectivity to MongoDB Atlas
   - Ensure IP whitelist includes your current IP address
   - Verify database user credentials

2. **API Key Errors**:
   - Verify API keys in `.env` file
   - Check API quota limits
   - Ensure keys are valid

3. **CORS Issues**:
   - Check `CORS_ALLOWED_ORIGINS` in settings
   - Verify frontend URL is included

4. **Port Conflicts**:
   - Backend: Change port in `runserver` command
   - Frontend: Use `npm run dev -- -p 3001`

### Debug Mode

Enable debug mode by setting `DEBUG=True` in your `.env` file.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the API documentation

## 🔮 Future Enhancements

- [ ] Mobile app development
- [ ] Machine learning predictions
- [ ] Advanced analytics dashboard
- [ ] Social media integration
- [ ] Weather integration
- [ ] Multi-language support

---

**Built with ❤️ for better air quality awareness**
