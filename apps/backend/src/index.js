import dotenv from "dotenv";
dotenv.config();
import express from "express";
// import sequelize, { verifyConnection } from "./database/index.js";
// import app from "./app.js";
// import syncModels from "./models/association.js";

const app = express();
const port = 3001;

let users = [{}];

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function registerUser(req, res) {
    const { username, password } = req.body;

    const existingUser = users.find((user) => user.username === username);
    if (existingUser) {
        return res.status(400).send({ error: "Username already exists" });
    }

    const newUser = { id: users.length + 1, username, password };
    users.push(newUser);
    res.send({ message: "User created successfully" });
}

function loginUser(req, res) {
    const { username, password } = req.body;

    const user = users.find(
        (user) => user.username === username && user.password === password,
    );
    if (!user) {
        return res.status(401).send({ error: "Invalid username or password" });
    }

    res.send({ message: "Logged in successfully", userId: user.id });
}

app.get("/login", loginUser);

app.post("/register", registerUser);

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

// verifyConnection()
//     .then(() => {
//         app.listen(process.env.PORT, () => {
//             console.log("Listening on port 8000");
//         });
//
//         // syncModels();
//     })
//     .catch((err) => {
//         console.error("Unable to connect to the database:", err);
//     });
