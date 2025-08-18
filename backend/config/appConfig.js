import dotenv from "dotenv";

dotenv.config();

const appConfig = {
  PORT: 5000, // Port the backend server runs on
  FRONTEND_ORIGIN: "http://localhost:8080", // Used for CORS config
};

export default appConfig;
