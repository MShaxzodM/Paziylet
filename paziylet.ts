import express from "express";
import { config } from "dotenv";
import bodyParser from "body-parser";
//the imports above is imported from npm packages and below is local files
import category from "./routes/category";
import post from "./routes/post";
import { Auth } from "./auth";
import qa from "./routes/qa";
import tag from "./routes/tags";
import Hadis from "./routes/hadis";
const app = express();
app.use(bodyParser.json());

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
