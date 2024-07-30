import express, {Router, Request, Response} from 'express';
import Article, {IArticle} from "../models/Article";

const router: Router = express.Router();

// Get /api/articles
router.get('/', async (req: Request, res: Response) => {
    try {
        const articles: IArticle[] = await Article.find().sort({publishDate: -1}).select('title translatedTitle translatedContent url source publishDate significance');
        res.json(articles);
    } catch (error) {
        res.status(500).json({message: (error as Error).message});
    }
})

export default router;

