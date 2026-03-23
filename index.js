const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const coockieParser = require('cookie-parser');

const mongoose = require('mongoose');

const authRouter = require("./routers/authRouter");
const postsRouter = require("./routers/postsRouter");



const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(coockieParser());
app.use(express.urlencoded({extended: true}));

mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log("Connected to MongoDB");
}).catch((err => {
    console.log("Error connecting to MongoDB: ", err);
}))

app.use("/api/auth", authRouter);
app.use("/api/posts", postsRouter);

app.get("/", (req, res) => {
    res.json({message: "Hello from server!"});
})

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
})