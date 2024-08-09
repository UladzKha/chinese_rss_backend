import express, {Application} from "express";
import dotenv from "dotenv";
import connectDB from "./config/db";
import cron from 'node-cron';
import {scanRSSFeeds} from "./services/rssScanner";

dotenv.config();
const app: Application = express();

connectDB();

// Running scanner every 30 minutes
cron.schedule('*/30 * * * *', async () => {
    console.log("cron scheduled");
    await scanRSSFeeds();
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on ${PORT}`));



