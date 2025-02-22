import { Router } from 'express'
import { getUrlFromShortKey, registerShortUrlVisit, shortenUrl } from '../services/url.service'
import { RequestWithIpInfo } from '../types'

const router = Router()

router.get('/', async (_req, res) => {
	res.json({ message: 'Please refer to the GitHub documentation in order to learn how to use this API.' })
})

router.post('/shorten', async (req, res) => {
	const { url } = req.body
	if (url === null || url === undefined || url === '') {
		res.status(400).json({ error: 'URL is required' })
		return
	}
	try {
		const shortUrl = await shortenUrl(url)
		res.json(shortUrl)
	} catch (error) {
		console.error(error)
		res.status(400).json({ error: 'Invalid URL' })
	}
})

router.get('/:shortKey', async (req: RequestWithIpInfo, res) => {
	const { shortKey } = req.params
	try {
		const url = await getUrlFromShortKey(shortKey)
		if (url === null) {
			res.status(404).json({ error: 'URL not found' })
			return
		}
		const ip = req.ipinfo
		if (ip === undefined || ip === null) {
			res.status(400).json({ error: 'IP not found' })
			return
		}
		await registerShortUrlVisit({ shortKey, ip })
		res.redirect(url.targetUrl)
	} catch (error) {
		console.error(error)
		res.status(500).json({ error: 'URL not found' })
	}
})

export default router
