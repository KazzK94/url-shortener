
import express from 'express'
import urlShortenerRoutes from './urls/urls.routes.js'
import cors from 'cors'

try {
	process.loadEnvFile()
} catch (error) {
	console.error('Error running process.loadEnvFile()')
}

const app = express()
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(urlShortenerRoutes)

app.listen(port, () => {
	console.log(`Server is running on PORT: ${port}`)
});

