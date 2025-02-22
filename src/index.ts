
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import urlRoutes from './routes/url.routes'
import mongoose from 'mongoose'
import ipinfoMiddleware from 'ipinfo-express'

dotenv.config()

const app = express()
const port = 3000

app.use(express.json())
app.use(cors())

app.set('trust proxy', true)
app.use(ipinfoMiddleware({
	token: 'token',
	cache: null,
	timeout: 5000
}))

const MONGODB_URI = process.env.MONGODB_URI
if (MONGODB_URI === undefined || MONGODB_URI === null || MONGODB_URI === '') {
	throw new Error('Missing MONGODB_URI in .env file')
}
mongoose.connect(MONGODB_URI, { dbName: 'url-shortener' })
	.then(() => console.log('DB Connected'))
	.catch(err => console.log({ message: 'Error trying to connect to the DB', error: err }))

app.use('/', urlRoutes)

app.listen(port, () => {
	console.log(`Server is running at http://localhost:${port}`)
})
