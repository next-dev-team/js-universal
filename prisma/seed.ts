import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create default user
  const defaultUser = await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@superapp.local',
      preferences: {
        theme: 'light',
        language: 'en',
        autoUpdate: true,
        developerMode: false
      }
    }
  })

  // Create sample plugins
  const calculatorPlugin = await prisma.plugin.create({
    data: {
      name: 'Calculator',
      description: 'Simple calculator mini-app for basic arithmetic operations',
      author: 'Super App Team',
      category: 'utilities',
      iconUrl: 'assets/calculator-icon.png',
      downloadCount: 150,
      averageRating: 4.5,
      isVerified: true,
      versions: {
        create: {
          version: '1.0.0',
          entryPoint: 'dist/index.html',
          manifestPath: 'manifest.json',
          releaseDate: new Date(),
          changelog: 'Initial release with basic calculator functionality'
        }
      },
      permissions: {
        create: [
          {
            permissionType: 'storage',
            description: 'Store calculation history and user preferences'
          },
          {
            permissionType: 'notifications',
            description: 'Show calculation results and error messages'
          }
        ]
      }
    }
  })

  const notepadPlugin = await prisma.plugin.create({
    data: {
      name: 'Notepad',
      description: 'Simple text editor for quick notes and documents',
      author: 'Super App Team',
      category: 'productivity',
      iconUrl: 'assets/notepad-icon.png',
      downloadCount: 89,
      averageRating: 4.2,
      isVerified: true,
      versions: {
        create: {
          version: '1.1.0',
          entryPoint: 'dist/index.html',
          manifestPath: 'manifest.json',
          releaseDate: new Date(),
          changelog: 'Added auto-save and syntax highlighting'
        }
      },
      permissions: {
        create: [
          {
            permissionType: 'storage',
            description: 'Save and load text documents'
          },
          {
            permissionType: 'filesystem',
            description: 'Access local files for import/export'
          }
        ]
      }
    }
  })

  const weatherPlugin = await prisma.plugin.create({
    data: {
      name: 'Weather Widget',
      description: 'Display current weather and forecast information',
      author: 'Community Developer',
      category: 'widgets',
      iconUrl: 'assets/weather-icon.png',
      downloadCount: 234,
      averageRating: 4.7,
      isVerified: false,
      versions: {
        create: {
          version: '2.0.1',
          entryPoint: 'dist/index.html',
          manifestPath: 'manifest.json',
          releaseDate: new Date(),
          changelog: 'Fixed location detection and added 7-day forecast'
        }
      },
      permissions: {
        create: [
          {
            permissionType: 'network',
            description: 'Fetch weather data from external APIs'
          },
          {
            permissionType: 'geolocation',
            description: 'Access user location for local weather'
          }
        ]
      }
    }
  })

  // Install plugins for default user
  await prisma.userPlugin.createMany({
    data: [
      {
        userId: defaultUser.id,
        pluginId: calculatorPlugin.id,
        installedVersion: '1.0.0',
        isEnabled: true,
        settings: {
          theme: 'light',
          precision: 2
        }
      },
      {
        userId: defaultUser.id,
        pluginId: notepadPlugin.id,
        installedVersion: '1.1.0',
        isEnabled: true,
        settings: {
          fontSize: 14,
          autoSave: true
        }
      }
    ]
  })

  // Add sample ratings
  await prisma.pluginRating.createMany({
    data: [
      {
        userId: defaultUser.id,
        pluginId: calculatorPlugin.id,
        rating: 5,
        review: 'Excellent calculator with clean interface!'
      },
      {
        userId: defaultUser.id,
        pluginId: notepadPlugin.id,
        rating: 4,
        review: 'Good text editor, would love more formatting options.'
      }
    ]
  })

  // Create default app settings
  await prisma.appSettings.createMany({
    data: [
      {
        key: 'security.allowUntrustedPlugins',
        value: false
      },
      {
        key: 'security.sandboxLevel',
        value: 'strict'
      },
      {
        key: 'ui.theme',
        value: 'light'
      },
      {
        key: 'ui.language',
        value: 'en'
      },
      {
        key: 'plugins.autoUpdate',
        value: true
      },
      {
        key: 'plugins.maxConcurrent',
        value: 5
      }
    ]
  })

  console.log('Database seeded successfully!')
  console.log(`Created user: ${defaultUser.username}`)
  console.log(`Created ${3} sample plugins`)
  console.log(`Installed ${2} plugins for default user`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })