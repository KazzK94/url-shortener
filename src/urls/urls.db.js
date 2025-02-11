
import { nanoid } from 'nanoid'
import { dbClient } from '../lib/mongodb.js'

export async function insertUrl(url) {
	try {
		const shortKey = nanoid(7).replace(/\s/g, "")
		const data = {
			shortKey,
			targetUrl: url
		}
		const result = await dbClient.db("url-shortener").collection("urls").insertOne(data)
		return {
			success: result.acknowledged,
			shortKey,
			targetUrl: url
		}
	} catch (error) {
		console.error(error)
		throw new Error('Something went wrong')
	}
}

export async function findUrl(shortKey) {
	try {
		const result = await dbClient.db("url-shortener").collection("urls").findOne({ shortKey })
		return result?.targetUrl
	} catch (error) {
		console.error(error)
		throw new Error('Something went wrong')
	}
}
