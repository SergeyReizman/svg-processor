🎨 SVG Design Processor

A full-stack application that allows users to upload SVG files containing rectangles, process them on the backend, store structured data in MongoDB, and visualize the results interactively using an HTML Canvas interface.

This project demonstrates end-to-end engineering across backend, frontend, database, and visualization layers.

🚀 Demo

✨ Features

📂 Upload SVG files via drag & drop

⚙️ Automatic rectangle extraction and processing

🚨 Issue detection:

Empty SVG

Out-of-bounds rectangles

🗄️ MongoDB persistent storage

🎨 Interactive HTML Canvas preview

🖱️ Hover tooltips with rectangle metadata

📱 Responsive design (desktop & mobile)

🏗️ Architecture
Frontend (React + Canvas)
        │
        │ REST API
        ▼
Backend (Node.js + Express)
        │
        │ Mongoose ODM
        ▼
MongoDB


Processing Flow:

User uploads SVG

Backend parses XML

Rectangles extracted + validated

Data stored in MongoDB

Frontend renders interactive preview

🧰 Tech Stack
Backend

Node.js

TypeScript

Express.js

MongoDB + Mongoose

Multer (file uploads)

xml2js (SVG parsing)

Docker (MongoDB container)

Frontend

React

TypeScript

React Router

React Dropzone

React Hot Toast

HTML Canvas API

Axios

📁 Project Structure
svg-processor/
│
├── backend/
│   ├── src/
│   │   ├── models/
│   │   ├── services/
│   │   └── server.ts
│   ├── uploads/
│   └── docker-compose.yml
│
└── frontend/
    ├── src/
    ├── public/
    └── package.json

✅ Prerequisites

Node.js ≥ 18

Docker & Docker Compose

npm or yarn

⚙️ Installation
1️⃣ Clone Repository
git clone <your-repository-url>
cd svg-processor

2️⃣ Backend Setup
cd backend

npm install

mkdir -p uploads

docker-compose up -d

npm run dev


Backend runs at:

http://localhost:5000

3️⃣ Frontend Setup
cd frontend

npm install

npm start


Frontend runs at:

http://localhost:3000

🔐 Environment Variables

Create .env in /backend:

PORT=5000
MONGODB_URI=mongodb://localhost:27017/svg_designs
NODE_ENV=development
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880

📡 API Endpoints
Method	Endpoint	Description
GET	/api/test	Health check
POST	/api/designs/upload	Upload SVG
GET	/api/designs	Get all designs
GET	/api/designs/:id	Get design by ID
🧑‍💻 Usage
Upload SVG

Open http://localhost:3000

Drag & drop SVG file

Wait for processing

View results

Design View Includes

Interactive canvas preview

Rectangle metadata

Coverage ratio

Issue highlighting

Hover inspection

📄 Example SVG Files

Valid SVG

<svg width="1200" height="400" xmlns="http://www.w3.org/2000/svg">
  <rect x="50" y="80" width="300" height="120" fill="#FF0000" />
  <rect x="400" y="100" width="500" height="200" fill="#00FF00" />
</svg>

<svg width="1200" height="400" xmlns="http://www.w3.org/2000/svg">
  <rect x="50" y="80" width="300" height="120" fill="#FF0000" />
  <rect x="400" y="100" width="500" height="200" fill="#00FF00" />
  <rect x="950" y="50" width="200" height="300" fill="#0000FF" />
</svg>

<svg width="800" height="400" xmlns="http://www.w3.org/2000/svg">
  <rect x="50" y="50" width="200" height="200" fill="#FFAA00" />
  <rect x="700" y="100" width="200" height="250" fill="#FF0000" />
</svg>

<svg width="600" height="300" xmlns="http://www.w3.org/2000/svg">
</svg>


🔍 Backend Processing

Processing pipeline:

Save uploaded file

Create DB record (pending)

Parse SVG

Extract rectangles

Detect issues

Compute coverage ratio

Update record → processed

🎨 Canvas Rendering

Maintains aspect ratio

20px padding

Color indicators:

Black → Normal

Red → Out-of-bounds

Blue → Hovered

🗄️ Database Schema
{
  _id: ObjectId,
  filename: String,
  originalName: String,
  status: "pending" | "processed" | "error",

  svgWidth: Number,
  svgHeight: Number,

  items: [
    {
      x: Number,
      y: Number,
      width: Number,
      height: Number,
      fill: String,
      issue?: "OUT_OF_BOUNDS"
    }
  ],

  itemsCount: Number,
  coverageRatio: Number,
  issues: ["EMPTY" | "OUT_OF_BOUNDS"],

  rawSvgPath: String,
  createdAt: Date
}

🛠️ Troubleshooting
MongoDB Not Running
docker-compose up -d
docker-compose logs mongodb

Port Already in Use
lsof -i :5000
kill -9 <PID>

🧪 Development

Backend:

npm run dev


Frontend:

npm start

📦 Production Build

Backend:

npm run build
npm start


Frontend:

npm run build

🤝 Contributing

Fork repo

Create branch

git checkout -b feature/amazing-feature


Commit & push

Open Pull Request

📜 License

ISC License

👨‍💻 Author

Your Name
your-email@example.com

⭐ Reviewer Notes (For Hiring Teams)

This project demonstrates:

Full-stack architecture

Backend file processing pipeline

MongoDB schema design

Interactive Canvas rendering

TypeScript usage across stack

Error handling and validation

Clean modular code organization

🔮 Possible Future Improvements

Authentication & user accounts

SVG export after processing

WebSocket real-time updates

Kubernetes deployment

Rectangle editing UI

Performance optimization for large SVGs


# SVG Design Processor

A full-stack application that allows users to upload SVG files containing rectangles, process them on the backend, store the data in MongoDB, and visualize them interactively using HTML Canvas.

![SVG Processor Demo](https://via.placeholder.com/800x400?text=SVG+Processor+Demo)

## Features

- **Upload SVG Files** - Drag & drop or select SVG files with rectangle elements
- **Automatic Processing** - Extracts rectangle dimensions, positions, and colors
- **Issue Detection** - Identifies empty files and out-of-bounds rectangles
- **MongoDB Storage** - Stores all design data for future reference
- **Interactive Preview** - Canvas-based visualization with hover tooltips
- **Responsive Design** - Works on desktop and mobile devices

## Tech Stack

### Backend
- Node.js with TypeScript
- Express.js
- MongoDB with Mongoose
- Multer for file uploads
- xml2js for SVG parsing

### Frontend
- React with TypeScript
- React Router for navigation
- React Dropzone for file uploads
- React Hot Toast for notifications
- HTML Canvas for rendering
- Axios for API calls

## Project Structure
svg-processor/
├── backend/
│ ├── src/
│ │ ├── models/
│ │ │ └── Design.ts
│ │ ├── services/
│ │ │ └── svgProcessor.ts
│ │ └── server.ts
│ ├── uploads/
│ ├── .env
│ ├── package.json
│ ├── tsconfig.json
│ └── docker-compose.yml
│
└── frontend/
├── public/
│ └── index.html
├── src/
│ ├── Upload.tsx
│ ├── Designs.tsx
│ ├── DesignView.tsx
│ ├── App.tsx
│ ├── index.tsx
│ └── index.css
├── package.json
└── tsconfig.json


## Prerequisites

- Node.js (v18 or higher)
- Docker and Docker Compose
- npm or yarn
- Git

## Installation & Setup

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd svg-processor

2. Backend Setup

# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create uploads directory (will be created automatically if it doesn't exist)
mkdir -p uploads

# Start MongoDB with Docker
docker-compose up -d

# Start the backend server in development mode
npm run dev

3. Frontend Setup

# Open a new terminal and navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the React development server
npm start

The frontend will start on http://localhost:3000

Environment Variables
Backend (.env)

Create a .env file in the backend directory:

PORT=5000
MONGODB_URI=mongodb://localhost:27017/svg_designs
NODE_ENV=development
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880

API Endpoints
Method	Endpoint	Description
GET	/api/test	Test if server is running
POST	/api/designs/upload	Upload an SVG file
GET	/api/designs	Get all designs
GET	/api/designs/:id	Get a specific design by ID
Usage Guide
1. Upload an SVG File
Open http://localhost:3000 in your browser

Click on the "Upload" tab or navigate to the home page

Drag and drop an SVG file or click to select one

Wait for the upload and processing to complete

You'll be redirected to the designs list

2. View All Designs
Click on the "Designs" tab in the navigation bar

See a table of all uploaded designs with their status

Click "View" on any design to see details

3. Explore Design Details
In the design details view, you'll see:

An interactive canvas preview

Design metadata (dimensions, rectangle count, coverage)

List of all rectangles

Hover over rectangles to see their details

Out-of-bounds rectangles are highlighted in red

Example SVG Files
Valid SVG (All rectangles within bounds)
svg
<svg width="1200" height="400" xmlns="http://www.w3.org/2000/svg">
  <rect x="50" y="80" width="300" height="120" fill="#FF0000" />
  <rect x="400" y="100" width="500" height="200" fill="#00FF00" />
  <rect x="950" y="50" width="200" height="300" fill="#0000FF" />
</svg>
Out of Bounds (Rectangle exceeds canvas)
svg
<svg width="800" height="400" xmlns="http://www.w3.org/2000/svg">
  <rect x="50" y="50" width="200" height="200" fill="#FFAA00" />
  <rect x="700" y="100" width="200" height="250" fill="#FF0000" />
</svg>
Empty SVG (No rectangles)
svg
<svg width="600" height="300" xmlns="http://www.w3.org/2000/svg">
</svg>
Features in Detail
Backend Processing
When an SVG is uploaded, the backend:

Saves the file to the uploads directory

Creates a database record with status "pending"

Parses the SVG to extract:

Canvas dimensions (width, height)

Rectangle properties (x, y, width, height, fill)

Total rectangle count

Coverage ratio (total rectangle area / canvas area)

Detects issues:

EMPTY - No rectangles in the file

OUT_OF_BOUNDS - Rectangle exceeds canvas boundaries

Updates the database record with processed data

Frontend Canvas Preview
The canvas preview:

Fits the SVG content with proper aspect ratio

Adds 20px padding around the content

Uses different border colors:

Black border for normal rectangles

Red border for out-of-bounds rectangles

Blue border for hovered rectangles

Shows rectangle details on hover

Displays the coverage ratio and issue status

Troubleshooting
MongoDB Connection Issues
bash
# Check if MongoDB container is running
docker ps

# If not running, start it
cd backend
docker-compose up -d

# Check MongoDB logs
docker-compose logs mongodb
Backend Won't Start
bash
# Check if port 5000 is already in use
lsof -i :5000

# Kill the process using port 5000
kill -9 <PID>

# Try starting again
npm run dev
Frontend Can't Connect to Backend
Verify backend is running on http://localhost:5000

Check browser console for CORS errors

Ensure the API URL in frontend code is correct (http://localhost:5000)

Common Errors and Solutions
Error	Solution
Only SVG files allowed	Upload a file with .svg extension
ECONNREFUSED	Make sure MongoDB is running (docker-compose up -d)
Port 5000 already in use	Kill the process using port 5000 or change PORT in .env
Cannot find module	Run npm install in the respective directory
Development
Running in Development Mode
Backend:

bash
cd backend
npm run dev
# Auto-reloads on file changes
Frontend:

bash
cd frontend
npm start
# Auto-reloads on file changes
Building for Production
Backend:

bash
cd backend
npm run build
npm start
Frontend:

bash
cd frontend
npm run build
# Serve the build folder with a static server
Database Schema
Design Collection
javascript
{
  _id: ObjectId,
  filename: String,        // Generated filename
  originalName: String,     // Original uploaded filename
  status: String,           // pending | processed | error
  svgWidth: Number,         // SVG canvas width
  svgHeight: Number,        // SVG canvas height
  items: [{                 // Array of rectangles
    x: Number,
    y: Number,
    width: Number,
    height: Number,
    fill: String,
    issue: String           // OUT_OF_BOUNDS (optional)
  }],
  itemsCount: Number,       // Number of rectangles
  coverageRatio: Number,    // Total area / canvas area
  issues: [String],         // EMPTY, OUT_OF_BOUNDS
  rawSvgPath: String,       // Path to stored file
  createdAt: Date
}
Contributing
Fork the repository

Create a feature branch (git checkout -b feature/AmazingFeature)

Commit your changes (git commit -m 'Add some AmazingFeature')

Push to the branch (git push origin feature/AmazingFeature)

Open a Pull Request

License
This project is licensed under the ISC License.

Author
Your Name - [Your Email]

Acknowledgments
Node.js community

React community

MongoDB team

All contributors

Support
For support, email your-email@example.com or create an issue in the repository.

Happy Coding! 🚀

text

This README.md provides:
- Clear project overview
- Setup instructions
- API documentation
- Usage examples
- Troubleshooting guide
- Database schema
- Development tips
- Contribution guidelines