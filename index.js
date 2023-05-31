import express from "express";
import dotenv from "dotenv";
import colors from 'colors'
import connectDB from "./config/db.js";
import cors from "cors";
import UserRouts from "./routs/userRouts.js"
import RecipeRouts from "./routs/recipeRouts.js"
import Category from "./routs/categoryRouts.js";
dotenv.config();

connectDB();

const port = process.env.PORT || 1001;

const app = new express();
app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.use(express.static('public'));

app.use("/user", UserRouts)
app.use("/recipe", RecipeRouts)
app.use("/category", Category)

app.listen(port,
    () =>(
        console.log(`Server is tunning on PORT: ${port}`)
    )
);
