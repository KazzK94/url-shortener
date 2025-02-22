
import { Request } from 'express'

export interface UrlDataType {
	shortKey: string
	targetUrl: string
}

export interface IpInfo {
	ip: string
	city: string
	region: string
	country: string
	continent: { name: string }
}

export interface RequestWithIpInfo extends Request {
	ipinfo?: IpInfo
}

export interface UsedRequestHeaders {
	'user-agent'?: string
	'referer'?: string
}
