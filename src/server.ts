import express, {Application} from "express";
import dotenv from "dotenv";
import connectDB from "./config/db";
import articleRoutes from "./routes/articleRoutes";
import {subscriptionRoutes} from "./routes/subscriptionRoutes";
import cron from 'node-cron';
import scanRSSFeeds from "./services/rssScanner";


dotenv.config();

const app: Application = express();
connectDB();
app.use(express.json());

//Routes
app.use('/api/articles', articleRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on ${PORT}`));

// Running scanner every hour
cron.schedule('0 * * * * *', async () => {
    console.log("Scanning RSS feeds");
    await scanRSSFeeds();
})

