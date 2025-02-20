
import { UrlModel } from '../models/url.model'
import { nanoid } from 'nanoid'
import { UrlDataType } from '../types'

/** Receives a full url, then returns an object containing both the fullUrl and the shortKey (and visits: 0) */
export async function shortenUrl(targetUrl: string): Promise<UrlDataType> {
	if (targetUrl === undefined || targetUrl === null || targetUrl === '' || !isValidUrl(targetUrl)) {
		throw new Error('Invalid URL')
	}
	const shortKey = nanoid(6)
	const url = new UrlModel({ targetUrl, shortKey })
	await url.save()
	return url
}

/** Receives a shortKey and returns an object containing both the fullUrl, the shortKey and the visits */
export async function getUrlFromShortKey(shortKey: string): Promise<UrlDataType> {
	console.log({ shortKey })
	const url = await UrlModel.findOne({ shortKey })
	if (url === null) {
		throw new Error('Url not found')
	}
	url.visits += 1
	await url.save()
	return url
}

/** Receives a string and returns true if its a valid url, or false otherwise */
function isValidUrl(url: string): boolean {
	try {
		const validUrl = new URL(url)
		return validUrl.protocol === 'http:' || validUrl.protocol === 'https:'
	} catch (error) {
		console.log(error)
		return false
	}
}
