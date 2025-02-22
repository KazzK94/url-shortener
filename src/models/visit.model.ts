
import { Schema, model } from 'mongoose'

const VisitSchema = new Schema({
	shortKey: { type: String, required: true, index: true },
	// Location
	city: { type: String },
	country: { type: String },
	continent: { type: String },
	// Navigation
	referer: { type: String },
	// Device
	deviceType: { type: String },
	os: { type: String },
	// Date
	date: { type: Date, required: true }
})

export const VisitModel = model('Visit', VisitSchema)
