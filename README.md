⚡ URL Shortener – Full Stack

Minimal full-stack URL shortener with custom codes, expiry support, and basic analytics.

🧱 Stack

Frontend: React + Material UI
Backend: Node.js + Express
Database: MongoDB (via Mongoose)
API Client: Axios
🚀 Quickstart

1. Clone the repo
git clone 
2. Backend Setup
cd backend
npm install
cp .env.example .env
# Set your MONGODB_URI in .env

npm run dev  # Starts on http://localhost:5000
3. Frontend Setup
cd ../frontend
npm install
cp .env.example .env
# Set REACT_APP_API_URL=http://localhost:5000

npm start  # Opens http://localhost:3000
🧩 Folder Structure

url-shortener/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── index.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── UrlShortener.js
│   │   │   └── Statistics.js
│   │   ├── App.js
│   │   └── index.js
⚙️ API Endpoints

POST /api/shorten
{
  "originalUrl": "https://example.com",
  "customCode": "optional-code",
  "expiresIn": 7
}
Returns:

{
  "shortUrl": "http://localhost:5000/abc123"
}
GET /:shortCode
Redirects to the original URL and logs analytics.

GET /api/stats
Returns stats for all URLs shortened (clicks, status, timestamps).


Done. No auth, no bloated design systems. Just a solid URL shortener.
