import express, {Application} from "express";
import dotenv from "dotenv";
import {EventEmitter} from "node:events";
import connectDB from "./config/db";
import {IArticle} from "./models/Article";
import articleRoutes from "./routes/articleRoutes";
import cron from 'node-cron';
import {scanRSSFeeds} from "./services/rssScanner";
import SSE from "express-sse-ts";
import cors from 'cors';
import {sendMessage} from "./services/telegramService";

dotenv.config();
const app: Application = express();
const sse = new SSE()
const eventEmitter = new EventEmitter();

connectDB();

// Setting CORS
app.use(cors({
    origin: '*', // Будьте осторожны с этим в продакшене   origin: ['chrome-extension://your-extension-id', 'https://your-production-domain.com'],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

app.use('/api/articles', articleRoutes);
//Routes
app.get('/api/updates', (req, res) => {
    console.log('New SSE connection established');
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });

    const sendUpdate = (data: any) => {
        res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    eventEmitter.on('update', sendUpdate);

    req.on('close', () => {
        console.log('SSE connection closed');
        eventEmitter.off('update', sendUpdate);
    });
});

export function emitUpdate(data: any) {
    eventEmitter.emit('update', data);
}

// Running scanner every 15 minutes
cron.schedule('*/15 * * * *', async () => {
    console.log("cron scheduled");
    const newArticles = await scanRSSFeeds();

    // const mockArticles = [
    //     {
    //         title: "和小米渐行渐远，雷军曾站台的九号公司市值跌去七成 | 焦点分析",
    //         translatedContent: "Это первая тестовая статья",
    //         significance: "high",
    //         url: 'https://uladz.com',
    //         source: "TEST",
    //         publishDate: new Date().toISOString()
    //     },
    //     {
    //         title: "Тестовая статья 2",
    //         translatedContent: "Это вторая тестовая статья",
    //         significance: "medium",
    //         url: 'https://uladz.com',
    //         source: "TEST",
    //         publishDate: new Date().toISOString()
    //     }
    // ];

    console.log({newArticles}, 'NEW ARTICLES!!!!');

    // if (newArticles.length) {
    //     emitUpdate(newArticles);
    //
    //     for (const article of newArticles) {
    //         await sendMessage({
    //             title: article.title,
    //             translatedTitle: article.translatedTitle,
    //             url: article.url,
    //             significance: article.significance as 'low' | 'medium' | 'high',
    //             translatedContent: article.translatedContent,
    //             source: article.source,
    //         });
    //     }
    // }


})


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on ${PORT}`));



