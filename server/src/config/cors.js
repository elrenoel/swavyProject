const allowedOrigins = [
  "https://swavy-app-project.vercel.app",
  "http://localhost:5173",
  "http://127.0.0.1:5173"
];

const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      origin === process.env.CLIENT_URL
    ) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

export default corsOptions;
