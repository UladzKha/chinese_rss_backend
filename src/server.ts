import express, {Application} from "express";
import dotenv from "dotenv";
import {EventEmitter} from "node:events";
import connectDB from "./config/db";
import Article, {IArticle} from "./models/Article";
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

export function emitUpdate(data: IArticle) {
    eventEmitter.emit('update', data);
}

const changeStream = Article.watch();

changeStream.on('change', async (change) => {
    if (change.operationType === 'insert') {
        const document = change.fullDocument as IArticle;

        emitUpdate(document);

        await sendMessage({
            title: document.title,
            translatedTitle: document.translatedTitle,
            url: document.url,
            significance: document.significance as 'low' | 'medium' | 'high',
            translatedContent: document.translatedContent,
            source: document.source
        })
    }
},)

// Running scanner every 30 minutes
cron.schedule('*/30 * * * *', async () => {
    console.log("cron scheduled");
    await scanRSSFeeds();
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on ${PORT}`));



