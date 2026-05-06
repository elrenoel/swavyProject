import mysql from "mysql2/promise"; // Tambahkan /promise

export const db = mysql.createPool({
  // Gunakan createPool agar lebih stabil
  host: "localhost",
  user: "root",
  password: "",
  database: "db_swavy",
  port: 3307,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export const connectDB = async () => {
  try {
    // Mencoba mendapatkan koneksi dari pool untuk verifikasi
    const connection = await db.getConnection();
    console.log("MySQL Connected Successfully to db_swavy");
    connection.release(); // Kembalikan koneksi ke pool
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1); // Hentikan aplikasi jika database tidak bisa diakses
  }
};
