
import { MongoClient, ServerApiVersion } from 'mongodb'

try {
	process.loadEnvFile()
} catch (error) {
	console.error('Error running process.loadEnvFile()')
}

const uri = process.env.MONGODB_URI

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
export const dbClient = new MongoClient(uri, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true
	}
})
