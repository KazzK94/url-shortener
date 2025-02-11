
import express from 'express'
import urlShortenerRoutes from './urls/urls.routes.js'

try {
	process.loadEnvFile()
} catch (error) {
	console.log('Error running process.loadEnvFile()')
}

const app = express()
const port = process.env.PORT || 3000

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(urlShortenerRoutes)

app.listen(port, () => {
	console.log(`Server is running on http://localhost:${port}`)
});

