
import { InferSchemaType, Schema, model } from 'mongoose'

const VisitSchema = new Schema({
	url_id: { type: Schema.Types.ObjectId, ref: 'Url', required: true, index: true },
	// Location
	city: { type: String }, // <-- Information stored in CITY is usually not precise, be careful when using it
	country: { type: String },
	continent: { type: String },
	// Navigation
	referer: { type: String },
	// Device
	device: { type: String },
	os: { type: String },
	// Date
	date: { type: Date, required: true }
})

export const VisitModel = model('Visit', VisitSchema)
export type VisitType = InferSchemaType<typeof VisitSchema>
