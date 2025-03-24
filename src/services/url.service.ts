
import { UrlModel, UrlType } from '../models/url.model'
import { VisitModel, VisitType } from '../models/visit.model'
import { nanoid } from 'nanoid'
import { IpInfo, UrlDataType, UsedRequestHeaders } from '../types'

import { UAParser } from 'ua-parser-js'

/** Receives a full url, then returns an object containing both the fullUrl and the shortKey (and visits: 0) */
export async function shortenUrl(targetUrl: string, userId: string | null): Promise<UrlDataType> {
	if (targetUrl === undefined || targetUrl === null || targetUrl === '' || !isValidUrl(targetUrl)) {
		throw new Error('Error: Invalid URL format. Please provide a valid URL')
	}
	const shortKey = nanoid(6)
	const url = new UrlModel({ targetUrl, shortKey, ownerId: userId })
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
		const newVisitData = {
			url_id: urlData._id,
			city: ipInfo.city,
			country: ipInfo.country,
			continent: ipInfo.continent?.name,
			referer: headers.referer,
			device: getDeviceType(headers['user-agent']),
			os: getOs(headers['user-agent']),
			date: new Date()
		}
		console.log({ newVisitData })
		const visit = new VisitModel(newVisitData)
		visit.save()
			.then(() => {
				updateUrlDataVisits(urlData, visit)
				urlData.save()
					.catch(error => {
						console.error('Error saving URL visits:', error)
					})
			})
			.catch(error => {
				console.error('Error saving new visit:', error)
			})
	} else {
		updateUrlDataVisits(urlData)
		urlData.save()
			.catch(error => {
				console.error('Error saving URL visits:', error)
			})
		console.warn('IP Data not found, visit details not registered')
	}

	return urlData
}

function updateUrlDataVisits(urlData: UrlType, visit?: VisitType): void {
	if (urlData.visits === null || urlData.visits === undefined) return

	// Total visits & last visit
	urlData.visits.total += 1
	urlData.lastVisitAt = new Date()

	// TODO: Change the code below to use a generic function to avoid redundancy

	// Visits by Country
	if (visit === null || visit === undefined || visit.country === null || visit.country === undefined) {
		urlData.visits.byCountry.set('unknown',
			(urlData.visits.byCountry.get('unknown') ?? 0) + 1)
	} else if (urlData.visits.byCountry.get(visit.country) === undefined) {
		urlData.visits.byCountry.set(visit.country, 1)
	} else {
		urlData.visits.byCountry.set(visit.country,
			(urlData.visits.byCountry.get(visit.country) ?? 0) + 1)
	}

	// Visits by Device
	if (visit === null || visit === undefined || visit.device === null || visit.device === undefined) {
		urlData.visits.byDevice.set('unknown',
			(urlData.visits.byDevice.get('unknown') ?? 0) + 1)
	} else if (urlData.visits.byDevice.get(visit.device) === undefined) {
		urlData.visits.byDevice.set(visit.device, 1)
	} else {
		urlData.visits.byDevice.set(visit.device,
			(urlData.visits.byDevice.get(visit.device) ?? 0) + 1)
	}

	// Visits by Referer
	if (visit === null || visit === undefined || visit.referer === null || visit.referer === undefined) {
		urlData.visits.byReferer.set('unknown',
			(urlData.visits.byReferer.get('unknown') ?? 0) + 1)
	} else if (urlData.visits.byReferer.get(visit.referer) === undefined) {
		urlData.visits.byReferer.set(encodeKey(visit.referer), 1)
	} else {
		urlData.visits.byReferer.set(encodeKey(visit.referer),
			(urlData.visits.byReferer.get(visit.referer) ?? 0) + 1)
	}
}

function encodeKey(key: string): string {
	return key.replace(/\./g, '_DOT_')
}

export function decodeKey(encodedKey: string): string {
	return encodedKey.replace(/_DOT_/g, '.')
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
