# Backend API Documentation

This document provides a quick overview of the backend API endpoints, their HTTP verbs, and a brief summary of their functionality, organized into multiple levels for faster access.

---

### 1. Health Check

*   `GET /api/ping`: Check if the backend server is operational.

### 2. Trips API (`/api/trips`)

#### 2.1. Trip Management

*   `GET /api/trips/user/:userId`: Retrieve all trips associated with a specific user, with options for status and search filtering.
*   `GET /api/trips/:tripId`: Fetch detailed information for a single trip by its ID.
*   `POST /api/trips/`: Create a new trip entry.
*   `PUT /api/trips/:tripId`: Update an existing trip's details.
*   `DELETE /api/trips/:tripId`: Perform a soft delete on a trip (marks as deleted but retains data).

#### 2.2. Trip Search & Statistics

*   `GET /api/trips/search/:query`: Search for trips based on a text query and optional date range.
*   `GET /api/trips/stats/:userId`: Get statistical data related to a user's trips.

#### 2.3. AI Generation

*   `POST /api/trips/:tripId/generate-itinerary`: Request the generation of an AI-powered itinerary for a specified trip.
*   `POST /api/trips/:tripId/generate-recommendations`: Request the generation of AI-powered recommendations for a specified trip.
*   `POST /api/trips/:tripId/generate-tips`: Request the generation of AI-powered travel tips for a specified trip.

### 3. Users API (`/api/users`)

#### 3.1. User Management

*   `GET /api/users/:userId`: Retrieve a user's profile details by their ID.
*   `PUT /api/users/profile/:userId`: Update a user's profile information, including travel preferences.
*   `GET /api/users/search/:query`: Search for users by various criteria (username, email, name) for collaboration purposes.

#### 3.2. Authentication

*   `POST /api/users/login`: Authenticate a user and establish a session.
*   `POST /api/users/signup`: Register a new user account.

### 4. Collaboration API (`/api/collaboration`)

#### 4.1. Collaboration Management

*   `GET /api/collaboration/user/:userId`: Retrieve all collaboration invitations and statuses for a specific user.
*   `GET /api/collaboration/trip/:tripId`: Retrieve all active collaborations associated with a particular trip.
*   `POST /api/collaboration/invite`: Send an invitation to another user to collaborate on a trip.

#### 4.2. Collaboration Actions

*   `PUT /api/collaboration/:collaborationId/accept`: Accept a pending collaboration invitation.
*   `PUT /api/collaboration/:collaborationId/decline`: Decline a pending collaboration invitation.
*   `PUT /api/collaboration/:collaborationId/revoke`: Revoke an outstanding collaboration invitation.
*   `PUT /api/collaboration/:collaborationId/role`: Update the role of a collaborator on a trip.
*   `DELETE /api/collaboration/:collaborationId`: Deactivate or remove a collaboration entry.

#### 4.3. Collaboration Statistics

*   `GET /api/collaboration/stats/:userId`: Get statistical data related to a user's collaborations.

### 5. Preferences API (`/api/preferences`)

#### 5.1. User Preferences

*   `POST /api/preferences/`: Create or update a user's travel preferences.