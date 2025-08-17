## Travel Buddy – Local Only Setup (Single Server)

This project is configured for local development only. The backend serves the frontend statically, so everything runs on one origin. All API keys are in place just follow the below instructions

### Prerequisites
- Node.js 18+
- npm 9+

### Repository Structure
```
travel-buddy/
  backend/
  frontend/
```

## Run (single terminal)

```bash
cd /PATH-TO/travel-buddy-backend
npm install
npm start
# App runs at http://localhost:3001
```

Open your browser to:
- `http://localhost:3001` (frontend served by the backend)

Health check:
```bash
curl http://localhost:3001/api/ping
```

Login of a user with data
```bash
email:
admin@admin.com

pass:
adminadmin123
```