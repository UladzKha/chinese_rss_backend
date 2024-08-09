import Parser from "rss-parser";
import Article, {IArticle} from "../models/Article";
import translateText from "./translator";
import {sources} from '../config/sources';

const parser = new Parser();

export async function scanRSSFeeds(): Promise<void> {
    for (let source of sources) {
        try {
            console.log(`Scanning feed: ${source.name}`);
            const feed = await parser.parseURL(source.rssUrl);

            for (let item of feed.items) {
                const existingArticle = await Article.findOne({url: item.link});
                if (!existingArticle && item.contentSnippet) {
                    const {
                        translatedText,
                        significance,
                        translatedTitle,
                        tags
                    } = await translateText(item.contentSnippet);

                    if (!translatedText || !significance || !translatedTitle) continue;

                    const newArticle: IArticle = new Article({
                        title: item.title,
                        originalContent: item.contentSnippet,
                        translatedContent: translatedText,
                        url: item.link,
                        source: source.name,
                        publishDate: item.pubDate,
                        significance: significance || 'low',
                        translatedTitle,
                        tags
                    });

                    await newArticle.save();
                    console.log(`New article saved: ${newArticle.title}`);
                }
            }

        } catch (error) {
            console.error(`Error scanning feed ${source.name}: ${(error as Error).message}`);
        }
    }
}
