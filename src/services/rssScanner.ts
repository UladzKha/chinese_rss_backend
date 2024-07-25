import Parser from "rss-parser";
import Article, {IArticle} from "../models/Article";
import translateText from "./translator";
import {sources} from '../config/sources';

const parser = new Parser();

export async function scanRSSFeeds(): Promise<IArticle[]> {
    const newArticles: IArticle[] = [];

    for (let source of sources) {
        try {
            console.log(`Scanning feed: ${source.name}`);
            const feed = await parser.parseURL(source.rssUrl);

            for (let item of feed.items) {
                const existingArticle = await Article.findOne({url: item.link});
                if (!existingArticle) {
                    const {translatedText, significance} = await translateText(item.contentSnippet || '');
                    const newArticle: IArticle = new Article({
                        title: item.title,
                        originalContent: item.contentSnippet,
                        translatedContent: translatedText,
                        url: item.link,
                        source: feed.name,
                        publishDate: item.pubDate,
                        significance
                    });

                    await newArticle.save();
                    console.log(`New article saved: ${newArticle.title}`);
                }
            }

        } catch (error) {
            console.error(`Error scanning feed ${source.name}: ${(error as Error).message}`);
        }
    }
    return newArticles
}
