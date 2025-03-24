
import { InferSchemaType, Schema, model } from 'mongoose'
import { VisitModel } from './visit.model'

const UrlSchema = new Schema(
	{
		targetUrl: { type: String, required: true },
		shortKey: { type: String, unique: true, required: true },
		ownerId: { type: String, required: false, default: null },
		visits: {
			total: { type: Number, default: 0, required: true },
			byCountry: { type: Map, of: Number, default: {} },
			byDevice: { type: Map, of: Number, default: {} },
			byReferer: { type: Map, of: Number, default: {} }
		},
		enabled: { type: Boolean, default: true },
		createdAt: { type: Date, default: Date.now },
		lastVisitAt: { type: Date, default: null }
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
export type UrlType = InferSchemaType<typeof UrlSchema>
