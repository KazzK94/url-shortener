
import { Schema, model } from 'mongoose'

const UrlSchema = new Schema({
	targetUrl: { type: String, required: true },
	shortKey: { type: String, unique: true, required: true },
	visits: { type: Number, default: 0 }
})

export const UrlModel = model('Url', UrlSchema)
