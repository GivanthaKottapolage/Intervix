const express = require("express")
const mongoose = require("mongoose")
const userRouter = require("./routes/userRouter.js")
const jwt = require("jsonwebtoken")
const cors = require("cors")
const dotenv = require("dotenv")
const sessionRouter = require("./routes/sessionRouter.js")
const aiRouter = require("./routes/aiRouter.js")
const reviewRouter = require("./routes/reviewRouter.js")
const dns = require("dns")


dotenv.config()
dns.setServers(["1.1.1.1","8.8.8.8"])



const mongoURI = process.env.MONGO_URL

mongoose.connect(mongoURI).then(() => {
    console.log('Connected to mongodb cluster');
});

const app = express();

app.use(cors());
app.use(express.json());

// auth middleware
app.use((req, res, next) => {
    const AuthorizationHeader = req.header('Authorization');

    if (AuthorizationHeader != null) {
        const token = AuthorizationHeader.replace('Bearer ', '');

        jwt.verify(token, process.env.JWT_SECRET, (error, content) => {
            if (content == null) {
                console.log('invalid token');
                return res.status(401).json({ message: 'Invalid token' });
            } else {
                console.log(content);
                req.user = content;
                next();
            }
        });
    } else {
        next();
    }
});

app.use("/api/users", userRouter)
app.use("/api/sessions", sessionRouter)
app.use("/api/reviews", reviewRouter)
app.use("/api", aiRouter)


app.listen(5000, () => {
    console.log('server is running');
});
