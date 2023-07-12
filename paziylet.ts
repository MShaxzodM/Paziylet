import express from "express";
import { config } from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
//the imports above is imported from npm packages and below is local files
import category from "./routes/category";
import post from "./routes/post";
import { Auth } from "./auth";
import qa from "./routes/qa";
import tag from "./routes/tags";
import Hadis from "./routes/hadis";
const app = express();

//npm middlewares:

app.use(bodyParser.json());
app.use(cors({ origin: "*" }));
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*"); // Replace with the actual origin you want to allow
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
});

//local routes below:

app.use("/category", category);
app.use("/posts", post);
app.use("/qa", qa);
app.use("/tags", tag);
app.use("/kunhadisi", Hadis);
app.post("/login", Auth, async (req, res) => {
    res.send("Logged in ");
});
config();

app.listen(process.env.PORT, () => console.log("Application started"));
