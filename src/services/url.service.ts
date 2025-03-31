
import { UrlModel, UrlType } from '../models/url.model'
import { VisitModel, VisitType } from '../models/visit.model'
import nanoid from 'nanoid'
import { IpInfo, UrlDataType, UsedRequestHeaders } from '../types'

import { UAParser } from 'ua-parser-js'
import { NotFoundError } from '../errors/notFound.error'
import { InvalidFormatError } from '../errors/invalidFormat.error'
import { ForbiddenAccessError } from '../errors/forbiddenAccess.error'

/** Receives a full url, then returns an object containing both the fullUrl and the shortKey (and visits: 0) */
export async function shortenUrl(targetUrl: string, userId: string | null): Promise<UrlDataType> {
	if (targetUrl === undefined || targetUrl === null || targetUrl === '' || !isValidUrl(targetUrl)) {
		throw new InvalidFormatError('Invalid URL format. Please provide a valid URL')
	}
	const shortKey = nanoid.nanoid(6)
	const url = new UrlModel({ targetUrl, shortKey, ownerId: userId })
	await url.save()
	return url
}

export async function getOwnedUrls(userId: string | null): Promise<UrlDataType[]> {
	if (userId === null) {
		throw new ForbiddenAccessError('You cannot access your URL\'s data without being logged in')
	}
	const urls = await UrlModel.find({ ownerId: userId })
	return urls
}

export async function getUrlDataFromShortKey({ shortKey }: { shortKey: string }): Promise<UrlDataType> {
	const urlData = await UrlModel.findOne({ shortKey })
	if (urlData === null) {
		throw new NotFoundError(`No URL was found with the shortKey "${shortKey}"`)
	}
	return urlData
}

export async function renameUrlShortKey({ shortKey, newShortKey, userId }: { shortKey: string, newShortKey: string, userId: string | null }): Promise<string> {
	const shortKeyRegex = /^[a-zA-Z0-9_-]{5,}$/
	if (newShortKey === undefined || newShortKey === null || newShortKey === '' || !shortKeyRegex.test(newShortKey)) {
		throw new InvalidFormatError('Invalid Short Key format, please provide a valid Short Key with at least 5 characters; it can only contain letters, numbers, dashes (-) and underscores (_)')
	}
	const urlData = await UrlModel.findOne({ shortKey })
	if (urlData === null) {
		throw new NotFoundError(`No URL was found with the shortKey "${shortKey}"`)
	}
	if (userId === null || urlData.ownerId !== userId) {
		throw new ForbiddenAccessError('You are not authorized to access this URL\'s data')
	}
	const existingUrlData = await UrlModel.findOne({ shortKey: newShortKey })
	if (existingUrlData !== null) {
		throw new InvalidFormatError('The new shortKey already exists, please provide a different one')
	}
	try {
		const newUrlData = await urlData.updateOne({ shortKey: newShortKey })
		return newUrlData.shortKey
	} catch (error) {
		console.error('Error updating URL shortKey:', error)
		throw new Error('Error updating URL shortKey')
	}
}

export async function enableUrl({ shortKey, userId }: { shortKey: string, userId: string | null }): Promise<void> {
	if (userId === null) {
		throw new ForbiddenAccessError('You cannot modify a URL without being logged in')
	}
	const disabledUrl = await UrlModel.findOneAndUpdate({ shortKey, ownerId: userId }, { enabled: true }, { new: true })
	if (disabledUrl === null) {
		throw new NotFoundError('No URL owned by the logged user was found with this shortKey')
	}
}

export async function disableUrl({ shortKey, userId }: { shortKey: string, userId: string | null }): Promise<void> {
	if (userId === null) {
		throw new ForbiddenAccessError('You cannot modify a URL without being logged in')
	}
	const disabledUrl = await UrlModel.findOneAndUpdate({ shortKey, ownerId: userId }, { enabled: false }, { new: true })
	if (disabledUrl === null) {
		throw new NotFoundError('No URL owned by the logged user was found with this shortKey')
	}
}

export async function deleteUrl({ shortKey, userId }: { shortKey: string, userId: string | null }): Promise<void> {
	const urlData = await UrlModel.findOne({ shortKey })
	if (urlData === null) {
		throw new NotFoundError(`No URL was found with the shortKey "${shortKey}"`)
	}
	if (userId === null || urlData.ownerId !== userId) {
		throw new ForbiddenAccessError('You are not authorized to access this URL\'s data')
	}
	try {
		await urlData.deleteOne()
		await VisitModel.deleteMany({ url_id: urlData._id })
	} catch (error) {
		console.error('Error deleting URL:', error)
		throw new Error('Error deleting URL')
	}
}

/** Receives a shortKey and returns an object containing both the fullUrl, the shortKey and the visits */
export async function visitUrlFromShortKey({ shortKey, ipInfo, headers }: { shortKey: string, ipInfo: IpInfo | undefined, headers: UsedRequestHeaders }): Promise<string> {
	const urlData = await UrlModel.findOne({ shortKey })
	if (urlData === null) {
		throw new NotFoundError(`No URL was found with the shortKey "${shortKey}"`)
	}

	if (!urlData.enabled) {
		throw new NotFoundError('This URL has been disabled by the owner')
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

	return urlData.targetUrl
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
	} else if (urlData.visits.byReferer.get(encodeKey(visit.referer)) === undefined) {
		urlData.visits.byReferer.set(encodeKey(visit.referer), 1)
	} else {
		urlData.visits.byReferer.set(encodeKey(visit.referer),
			(urlData.visits.byReferer.get(encodeKey(visit.referer)) ?? 0) + 1)
	}
}

function encodeKey(key: string): string {
	return key.replace(/\./g, '__DOT__')
}

export function decodeKey(encodedKey: string): string {
	return encodedKey.replace(/__DOT__/g, '.')
}

/** Receives a string and returns true if its a valid url, or false otherwise */
function isValidUrl(url: string): boolean {
	try {
		const validUrl = new URL(url)
		return validUrl.protocol === 'http:' || validUrl.protocol === 'https:'
	} catch (error) {
		console.error(error)
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
