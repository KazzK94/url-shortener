import { Router } from 'express'
import { visitUrlFromShortKey, shortenUrl, getUrlDataFromShortKey, getOwnedUrls } from '../services/url.service'
import { RequestWithIpInfo } from '../types'
import { getAuth, requireAuth } from '@clerk/express'

const router = Router()

router.post('/shorten', async (req, res) => {
	const { url } = req.body
	if (url === null || url === undefined || url === '') {
		res.status(400).json({ error: 'URL is required' })
		return
	}
	try {
		const { userId } = getAuth(req)
		const shortUrl = await shortenUrl(url, userId)
		res.json(shortUrl)
	} catch (error) {
		console.error(error)
		res.status(400).json({ error: 'Invalid URL' })
	}
})

router.get('/info', requireAuth({ signInUrl: '/auth/unauthorized' }), async (req, res) => {
	const { userId } = getAuth(req)

	if (userId === undefined || userId === null || userId === '') {
		res.redirect('/auth/unauthorized')
		return
	}

	const urlsData = await getOwnedUrls(userId)
	res.json(urlsData)
})

router.get('/info/:shortKey', requireAuth({ signInUrl: '/auth/unauthorized' }), async (req, res) => {
	const { shortKey } = req.params
	const { userId } = getAuth(req)

	if (userId === undefined || userId === null || userId === '') {
		res.redirect('/auth/unauthorized')
		return
	}

	const urlData = await getUrlDataFromShortKey({ shortKey })
	if (urlData === null) {
		res.status(404).json({ error: 'URL not found' })
		return
	}

	if (urlData.ownerId !== userId) {
		res.status(403).json({ error: 'You are not authorized to access this resource' })
		return
	}

	res.json(urlData)
})

router.get('/:shortKey', async (req: RequestWithIpInfo, res) => {
	const { shortKey } = req.params
	try {
		const targetUrl = await visitUrlFromShortKey({ shortKey, ipInfo: req.ipinfo, headers: req.headers })
		if (targetUrl === null) {
			res.status(404).json({ error: 'URL not found' })
			return
		}
		res.redirect(targetUrl)
	} catch (error) {
		console.error(error)
		res.status(404).json({ error: 'Couldn\'t find a URL with this shortkey.' })
	}
})

export default router
