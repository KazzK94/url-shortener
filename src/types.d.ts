import { Request } from 'express'

export interface UrlDataType {
	shortKey: string
	targetUrl: string
	visits: number
}

export interface RequestWithIpInfo extends Request {
	ipinfo?: string
}
