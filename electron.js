import { ElectronApp } from './dist-main/main.js'
import { DatabaseSeeder } from './dist-main/database-seeder.js'
import { config } from 'dotenv'

// Load environment variables
config()

// Set NODE_ENV if not already set
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'production'
}

const isDevelopment = process.env.NODE_ENV === 'development'

async function main() {
  const app = new ElectronApp()
  
  try {
    // Initialize the app
    await app.initialize()
    
    // Only seed database in development mode or if explicitly requested
    if (isDevelopment || process.env.FORCE_SEED === 'true') {
      const databaseService = app.getDatabaseService()
      const seeder = new DatabaseSeeder(databaseService)
      
      await seeder.seedDatabase()
      await seeder.createSamplePluginFiles()
      
      console.log('Database seeded with sample data')
    }
    
    console.log(`Application initialized successfully in ${process.env.NODE_ENV} mode`)
  } catch (error) {
    console.error('Failed to initialize application:', error)
    process.exit(1)
  }
}

main()