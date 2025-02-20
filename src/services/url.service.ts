
import { UrlModel } from '../models/url.model'
import { nanoid } from 'nanoid'
import { UrlDataType } from '../types'

export const shortenUrl = async (targetUrl: string): Promise<UrlDataType> => {
	const shortKey = nanoid(6)
	const url = new UrlModel({ targetUrl, shortKey })
	await url.save()
	return url
}

export const getUrl = async (shortKey: string): Promise<UrlDataType> => {
	console.log({ shortKey })
	const url = await UrlModel.findOne({ shortKey })
	if (url === null) {
		throw new Error('Url not found')
	}
	url.visits += 1
	await url.save()
	return url
}
