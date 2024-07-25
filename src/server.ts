import express, {Application} from "express";
import dotenv from "dotenv";
import connectDB from "./config/db";
import {IArticle} from "./models/Article";
import articleRoutes from "./routes/articleRoutes";
import {subscriptionRoutes} from "./routes/subscriptionRoutes";
import cron from 'node-cron';
import {scanRSSFeeds} from "./services/rssScanner";
import SSE from "express-sse-ts";

dotenv.config();
connectDB();

const app: Application = express();
const sse = new SSE()

app.use(express.json());
//Routes
app.use('/api/articles', articleRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on ${PORT}`));

export function sendUpdate(articles: IArticle[]) {
    sse.send(JSON.stringify(articles));
}

// Running scanner every hour
cron.schedule('0 * * * * *', async () => {
    console.log("Scanning RSS feeds");
    await scanRSSFeeds();
})



