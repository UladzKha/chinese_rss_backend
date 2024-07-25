import mongoose, {Document, Schema} from 'mongoose';

export interface IArticle extends Document {
    title: string;
    originalContent: string;
    translatedContent: string;
    url: string;
    source: string;
    publishDate: string;
    significance: 'low' | 'medium' | 'high';
}

export const ArticleSchema = new Schema({
    title: {type: String, required: true},
    originalContent: {type: String, required: true},
    translatedContent: {type: String, required: true},
    url: {type: String, required: true},
    source: {type: String, required: true},
    publishDate: {type: String, required: true},
    significance: {type: String, enum: ['low', 'medium', 'high'], default: 'low'},
}, {timestamps: true});


export default mongoose.model<IArticle>('Article', ArticleSchema);
