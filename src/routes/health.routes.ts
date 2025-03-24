
import { Router } from 'express'

const router = Router()

// Health check
router.get('/check', (_, res) => {
	res.send('OK')
})

export default router
