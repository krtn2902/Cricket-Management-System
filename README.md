# Cricket Management System

A comprehensive cricket management system built with React frontend and Node.js/Express backend.

## Features

-   User Authentication (Login/Registration)
-   Team Management (Add, Edit, View teams)
-   Player Management (Add, Edit, View players)
-   Match Management (Schedule, Track matches)
-   Tournament Management (Create tournaments with multiple matches)
-   Responsive Design

## Tech Stack

### Frontend

-   React 18
-   React Router
-   Axios
-   Tailwind CSS

### Backend

-   Node.js
-   Express.js
-   MongoDB with Mongoose
-   JWT Authentication
-   bcryptjs

## Project Structure

```
cricket-management-system/
├── frontend/           # React application
├── backend/           # Express API server
└── README.md
```

## Getting Started

### Prerequisites

-   Node.js (v16 or higher)
-   MongoDB (local or MongoDB Atlas)

### Installation

1. Clone the repository
2. Install backend dependencies:
    ```bash
    cd backend
    npm install
    ```
3. Install frontend dependencies:
    ```bash
    cd frontend
    npm install
    ```

### Running the Application

1. Start the backend server:

    ```bash
    cd backend
    npm start
    ```

2. Start the frontend development server:
    ```bash
    cd frontend
    npm start
    ```

The frontend will be available at `http://localhost:3000` and the backend API at `http://localhost:5000`.

## API Endpoints

### Authentication

-   POST `/api/auth/register` - Register new user
-   POST `/api/auth/login` - Login user

### Teams

-   GET `/api/teams` - Get all teams
-   POST `/api/teams` - Create new team
-   PUT `/api/teams/:id` - Update team
-   DELETE `/api/teams/:id` - Delete team

### Players

-   GET `/api/players` - Get all players
-   POST `/api/players` - Create new player
-   PUT `/api/players/:id` - Update player
-   DELETE `/api/players/:id` - Delete player

### Matches

-   GET `/api/matches` - Get all matches
-   POST `/api/matches` - Create new match
-   PUT `/api/matches/:id` - Update match
-   DELETE `/api/matches/:id` - Delete match

### Tournaments

-   GET `/api/tournaments` - Get all tournaments
-   POST `/api/tournaments` - Create new tournament
-   PUT `/api/tournaments/:id` - Update tournament
-   DELETE `/api/tournaments/:id` - Delete tournament
