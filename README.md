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

### Render production configuration

Set `VITE_API_BASE_URL` in the Render environment for **both** frontend static sites to:

```text
https://ev-charging-backend-ozie.onrender.com/api
```

Vite only exposes client-side variables prefixed with `VITE_`; an `API_BASE_URL` variable will not be available to the browser app. The API clients add `/api` when a host-only URL is configured.

The backend defaults to the current exact Render origins. If you set or override `CORS_ALLOWED_ORIGINS` in the backend Render service, use the exact comma-separated origins below, without trailing slashes:

```text
https://ev-charging-frontend-0hf9.onrender.com,https://ev-charging-admin.onrender.com
```

Set these values in Render's service environment settings, not in committed files. Redeploy both frontend sites after changing `VITE_API_BASE_URL`, and redeploy the backend after changing `CORS_ALLOWED_ORIGINS`. Keep `MONGODB_URI` and `JWT_SECRET` configured as Render secrets; never put their values in frontend variables.

## Hackathon

Submitted to ForgeHacks Online 2026.

## License

Add a license if you intend to distribute the project under specific open-source terms.
