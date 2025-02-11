
import express from 'express'
import { findUrl, insertUrl } from './urls.db.js'

const router = express.Router()

router.get('/', async (_req, res) => {
	res.json({ message: 'Please refer to GitHub documentation in order to learn how to use this API.' })
})

router.post('/shorten', async (req, res) => {
	const { url } = req.body
	if (!url) {
		return res.status(400).json({
			error: 'URL is required'
		})
	}
	try {
		const result = await insertUrl(url)
		res.json({
			...result,
			shortUrl: `https://${req.hostname}/${result.shortKey}`
		})
	} catch (error) {
		console.error(error)
		res.status(500).json({ error: 'Something went wrong' })
	}
})

router.get('/:shortKey', async (req, res) => {
	try {
		const { shortKey } = req.params
		const url = await findUrl(shortKey)
		res.redirect(url)
	} catch (error) {
		console.error(error)
		res.status(500).json({ error: 'Something went wrong' })
	}
})


export default router
