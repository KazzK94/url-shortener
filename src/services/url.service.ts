
import { UrlModel } from '../models/url.model'
import { nanoid } from 'nanoid'
import { IpInfo, UrlDataType, UsedRequestHeaders } from '../types'
import { VisitModel } from '../models/visit.model'

import { UAParser } from 'ua-parser-js'

/** Receives a full url, then returns an object containing both the fullUrl and the shortKey (and visits: 0) */
export async function shortenUrl(targetUrl: string): Promise<UrlDataType> {
	if (targetUrl === undefined || targetUrl === null || targetUrl === '' || !isValidUrl(targetUrl)) {
		throw new Error('Error: Invalid URL format. Please provide a valid URL')
	}
	const shortKey = nanoid(6)
	const url = new UrlModel({ targetUrl, shortKey })
	await url.save()
	return url
}

/** Receives a shortKey and returns an object containing both the fullUrl, the shortKey and the visits */
export async function getUrlFromShortKey({ shortKey, ipInfo, headers }: { shortKey: string, ipInfo: IpInfo | undefined, headers: UsedRequestHeaders }): Promise<UrlDataType> {
	const urlData = await UrlModel.findOne({ shortKey })
	if (urlData === null) {
		throw new Error('Error: No URL was found with this shortKey')
	}

	if (ipInfo !== undefined && ipInfo !== null) {
		const newVisit = new VisitModel({
			shortKey,
			city: ipInfo.city,
			country: ipInfo.country,
			continent: ipInfo.continent.name,
			referer: headers.referer,
			device: getDeviceType(headers['user-agent']),
			os: getOs(headers['user-agent']),
			date: new Date()
		})
		await newVisit.save()
	} else {
		// TODO: Register this as anonymous visit
		console.error('IP Data not found, visit not registered')
	}

	return urlData
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

function getDeviceType(userAgent?: string): string | undefined {
	if (userAgent === undefined) return
	const ua = UAParser(userAgent)
	if (ua.device.type === undefined) return 'computer'
	return ua.device.type
}

function getOs(userAgent?: string): string | undefined {
	if (userAgent === undefined) return
	const ua = UAParser(userAgent)
	if (ua.os.name === undefined) return
	const osName = ua.os.name
	let osVersion = ''
	if (ua.os.version !== undefined) {
		osVersion = ua.os.version
	}
	return `${osName} ${osVersion}`.trim()
}
