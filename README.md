# CitizenSpeak

CitizenSpeak is a multi-platform complaint management system consisting of:

- **backend** – Spring Boot REST API
- **frontend-web** – React/Vite web dashboard
- **frontend-mobile** – React Native mobile application (Expo)

This guide explains how to run each component locally and configure essential settings such as the SMTP server.

## Repository Structure

```
CitizenSpeak/
├── backend/          # Spring Boot API
├── frontend-web/     # Vite + React web interface
└── frontend-mobile/  # Expo React Native app
```

## Prerequisites

- **Java 17+** and Maven (the repository includes the Maven Wrapper)
- **Node.js 18+** and npm
- **MongoDB** running locally on `mongodb://localhost:27017`
- **Expo CLI** for the mobile application (`npm install -g expo-cli`)

## Backend Setup

1. Copy `backend/src/main/resources/application.properties` and update values as needed. In particular, configure your SMTP server:

```properties
# backend/src/main/resources/application.properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your_email@example.com
spring.mail.password=your_password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

2. (Optional) Adjust `server.port` if you want a different port.
3. Start the API:

```bash
cd backend
./mvnw spring-boot:run
```

The API will start on the configured port (default `8081`).

## Web Frontend Setup

1. Create a `.env` file inside `frontend-web` and specify the backend URL:

```bash
VITE_API_BASE_URL=http://localhost:8081
```

2. Install dependencies and start the development server:

```bash
cd frontend-web
npm install
npm run dev
```

The web interface will be available at `http://localhost:5173`.

## Mobile Frontend Setup

1. Create a `.env` file inside `frontend-mobile` and point it to the backend API:

```bash
API_URL=http://localhost:8081/api
```

   The value of `API_URL` is read in `src/services/api.js`:

```javascript
const API_BASE_URL = process.env.API_URL;
```

2. Install dependencies and run the Expo development server:

```bash
cd frontend-mobile
npm install
npx expo start
```

You can then launch the app on an emulator or physical device.

## Running Everything

Start MongoDB, then run the backend, followed by either frontend. Ensure that the frontends use the correct API URL matching the backend port.

## Notes

- The default SMTP settings in `application.properties` are placeholders. Replace them with your own credentials before sending emails.
- If you change the backend port, update the `VITE_API_BASE_URL` and `API_URL` variables in the web and mobile frontends respectively.

