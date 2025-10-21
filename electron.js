import { ElectronApp } from './dist-electron/main.js'
import { DatabaseSeeder } from './dist-electron/database-seeder.js'

async function main() {
  const app = new ElectronApp()
  
  try {
    // Initialize the app
    await app.initialize()
    
    // Seed database with sample data
    const databaseService = app.getDatabaseService()
    const seeder = new DatabaseSeeder(databaseService)
    
    await seeder.seedDatabase()
    await seeder.createSamplePluginFiles()
    
    console.log('Application initialized successfully')
  } catch (error) {
    console.error('Failed to initialize application:', error)
    process.exit(1)
  }
}

main()