import { Router } from 'express'
import { visitUrlFromShortKey, shortenUrl, getUrlDataFromShortKey, getOwnedUrls, enableUrl, disableUrl, renameUrlShortKey, deleteUrl } from '../services/url.service'
import { RequestWithAuth, RequestWithIpInfo } from '../types'
import { getAuth, requireAuth } from '@clerk/express'
import { NotFoundError } from '../errors/notFound.error'
import { InvalidFormatError } from '../errors/invalidFormat.error'
import { ForbiddenAccessError } from '../errors/forbiddenAccess.error'

const router = Router()

router.post('/shorten', requireAuth(), async (req: RequestWithAuth, res) => {
	const { url } = req.body
	if (url === null || url === undefined || url === '') {
		res.status(400).json({ error: 'URL is required' })
		return
	}
	try {
		const userId = req.auth?.userId
		const shortUrl = await shortenUrl(url, (userId ?? null))
		res.json(shortUrl)
	} catch (error) {
		if (error instanceof InvalidFormatError) {
			res.status(error.status).json({ error: error.message })
		} else {
			console.error(error)
			res.status(400).json({ error: 'Could not shorten the URL. If the error persists, please contact an administrator.' })
		}
	}
})

router.get('/data', requireAuth({ signInUrl: '/auth/unauthorized' }), async (req, res) => {
	const { userId } = getAuth(req)
	try {
		const urlsData = await getOwnedUrls(userId)
		res.json(urlsData)
	} catch (error) {
		if (error instanceof ForbiddenAccessError) {
			res.status(error.status).json({ error: error.message })
		} else {
			console.error(error)
			res.status(500).json({ error: 'Couldn\'t fetch URLs data.' })
		}
	}
})

router.get('/data/:shortKey', requireAuth({ signInUrl: '/auth/unauthorized' }), async (req, res) => {
	const { shortKey } = req.params
	const { userId } = getAuth(req)

	try {
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
	} catch (error) {
		if (error instanceof NotFoundError) {
			res.status(error.status).json({ error: error.message })
		} else {
			console.error(error)
			res.status(500).json({ error: 'Couldn\'t fetch URL data.' })
		}
	}
})

router.get('/:shortKey', async (req: RequestWithIpInfo, res) => {
	const { shortKey } = req.params
	try {
		const targetUrl = await visitUrlFromShortKey({ shortKey, ipInfo: req.ipinfo, headers: req.headers })
		res.redirect(targetUrl)
	} catch (error) {
		console.error(error)
		res.status(404).json({ error: 'Couldn\'t find a URL with this shortkey.' })
	}
})

router.put('/:shortKey/rename', requireAuth({ signInUrl: '/auth/unauthorized' }), async (req, res) => {
	const { shortKey } = req.params
	const { shortKey: newShortKey } = req.body
	const { userId } = getAuth(req)

	if (newShortKey === null || newShortKey === undefined || newShortKey.length < 5) {
		res.status(400).json({ error: 'New short key must be at least 5 characters long' })
		return
	}

	try {
		const newUrlShortKey = await renameUrlShortKey({ shortKey, newShortKey, userId })
		res.json({ shortKey: newUrlShortKey })
	} catch (error) {
		console.error(error)
		if (error instanceof InvalidFormatError || error instanceof NotFoundError) {
			res.status(error.status).json({ error: error.message })
		} else {
			res.status(500).json({ error: 'Failed to update URL Short Key.' })
		}
	}
})

router.put('/:shortKey/enable', requireAuth({ signInUrl: '/auth/unauthorized' }), async (req, res) => {
	const { shortKey } = req.params
	const { userId } = getAuth(req)

	try {
		await enableUrl({ shortKey, userId })
		res.json({ success: true })
	} catch (error) {
		// ForbiddenAccessError or NotFoundError
		if (error instanceof ForbiddenAccessError || error instanceof NotFoundError) {
			res.status(error.status).json({ error: error.message })
		} else {
			console.error(error)
			res.status(500).json({ error: 'Couldn\'t enable this URL.' })
		}
	}
})

router.put('/:shortKey/disable', requireAuth({ signInUrl: '/auth/unauthorized' }), async (req, res) => {
	const { shortKey } = req.params
	const { userId } = getAuth(req)

	try {
		await disableUrl({ shortKey, userId })
		res.json({ success: true })
	} catch (error) {
		// ForbiddenAccessError or NotFoundError
		if (error instanceof ForbiddenAccessError || error instanceof NotFoundError) {
			res.status(error.status).json({ error: error.message })
		} else {
			console.error(error)
			res.status(500).json({ error: 'Couldn\'t disable this URL.' })
		}
	}
})

router.delete('/:shortKey', requireAuth({ signInUrl: '/auth/unauthorized' }), async (req, res) => {
	const { shortKey } = req.params
	const { userId } = getAuth(req)

	try {
		await deleteUrl({ shortKey, userId })
		res.status(200).json({ message: 'URL deleted successfully' })
	} catch (error) {
		// ForbiddenAccessError or NotFoundError
		if (error instanceof ForbiddenAccessError || error instanceof NotFoundError) {
			res.status(error.status).json({ error: error.message })
		} else {
			console.error(error)
			res.status(500).json({ error: 'Couldn\'t delete this URL.' })
		}
	}
})

export default router
