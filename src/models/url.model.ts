
import { Schema, model } from 'mongoose'
import { VisitModel } from './visit.model'

const UrlSchema = new Schema(
	{
		targetUrl: { type: String, required: true },
		shortKey: { type: String, unique: true, required: true }
	},
	{
		methods: {
			getVisits: async function () {
				return await VisitModel.find({ shortKey: this.shortKey })
			}
		}
	}
)

export const UrlModel = model('Url', UrlSchema)
