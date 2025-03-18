
import { Router } from 'express'
import { clerkClient, getAuth, requireAuth } from '@clerk/express'

const router = Router()

router.get('/me', requireAuth({ signInUrl: '/auth/unauthorized' }), async (req, res) => {
	const { userId } = getAuth(req)

	if (userId === undefined || userId === null || userId === '') {
		res.status(401).json({
			authenticated: false,
			message: 'You need to be authenticated to access this resource'
		})
		return
	}

	const user = await clerkClient.users.getUser(userId)
	const { id, emailAddresses, fullName, username } = user

	res.json({
		authenticated: true,
		message: 'You are authenticated',
		user: {
			id, email: emailAddresses[0].emailAddress, fullName, username
		}
	})
})

router.get('/unauthorized', (req, res) => {
	res.status(401).json({
		authenticated: false,
		message: 'You need to be authenticated to access this resource'
	})
})

export default router
