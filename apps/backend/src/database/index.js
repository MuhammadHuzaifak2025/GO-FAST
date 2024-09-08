import pg from "pg";
const { Pool } = pg;

const pool = new Pool({
  host: process.env.HOST,
  user: process.env.USER,
  database: process.env.DATABASENAME,
  password: process.env.PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

const connectDb = async () => {
  try {
    const client = await pool.connect();
    console.log("Connected to the database");
    return client;
  } catch (error) {
    console.log("Error connecting to the database: ", error);
    throw error;
  }
};

export { connectDb };