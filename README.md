# Smart Mobility Infrastructure Hub for Transit EV Fleets

An EV Charging Management Platform designed to help EV drivers discover charging stations, book charging ports, and manage charging sessions while enabling station hosts and fleet operators to manage their operations.

## Features

- EV user portal for charging station discovery and booking
- Station host portal for station and charging-port management
- Fleet operator portal for fleet-related charging management
- Admin portal for platform administration
- Charging session and payment management
- Battery life management and charging insights
- Interactive charging station map using OpenStreetMap, if implemented

## Technology Stack

- **Frontend:** React, Vite, JavaScript, Tailwind CSS (where used)
- **Backend:** Java, Spring Boot
- **Database:** MongoDB
- **Tools:** Git, GitHub, Postman

## Project Structure

- `ev-charging-frontend/` — EV user frontend
- `ev-charging-admin/` — Admin frontend
- `ev-charging-backend/` — Spring Boot backend

## Getting Started

### Backend

1. Install a compatible Java JDK and Maven, or use the included Maven wrapper if available.
2. Configure the required database connection and application settings using local environment configuration.
3. Run the Spring Boot application using the project's documented Maven command.

### Frontend

1. Install Node.js and npm.
2. Open the relevant frontend directory in a terminal.
3. Run `npm install`.
4. Configure the backend URL using the project's environment configuration.
5. Run `npm run dev`.

Repeat for the admin frontend where applicable.

## Configuration and Security

Do not commit database credentials, JWT secrets, access tokens, or private environment files. Configure required values locally before running the application.

## Hackathon

Submitted to ForgeHacks Online 2026.

## License

Add a license if you intend to distribute the project under specific open-source terms.
