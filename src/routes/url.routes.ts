import { Router } from 'express'
import { getUrlFromShortKey, shortenUrl } from '../services/url.service'
import { RequestWithIpInfo } from '../types'
import { getAuth } from '@clerk/express'

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

router.get('/:shortKey', async (req: RequestWithIpInfo, res) => {
	const { shortKey } = req.params
	try {
		const url = await getUrlFromShortKey({ shortKey, ipInfo: req.ipinfo, headers: req.headers })
		if (url === null) {
			res.status(404).json({ error: 'URL not found' })
			return
		}
		res.redirect(url.targetUrl)
	} catch (error) {
		console.error(error)
		res.status(404).json({ error: 'Couldn\'t find a URL with this shortkey.' })
	}
})

router.get('/info/:shortKey', async (req, res) => {
	const { shortKey } = req.params

	res.json({ shortKey })
})

export default router
