import { vi, beforeEach } from 'vitest'
import '@testing-library/jest-dom'

// Mock Electron modules for testing
vi.mock('electron', () => ({
  app: {
    whenReady: vi.fn(() => Promise.resolve()),
    on: vi.fn(),
    quit: vi.fn(),
    getPath: vi.fn(() => '/mock/path'),
  },
  BrowserWindow: vi.fn(() => ({
    loadURL: vi.fn(),
    loadFile: vi.fn(),
    webContents: {
      openDevTools: vi.fn(),
    },
    once: vi.fn(),
    on: vi.fn(),
    minimize: vi.fn(),
    maximize: vi.fn(),
    restore: vi.fn(),
    close: vi.fn(),
    isMaximized: vi.fn(() => false),
  })),
  ipcMain: {
    handle: vi.fn(),
    on: vi.fn(),
  },
  ipcRenderer: {
    invoke: vi.fn(),
    on: vi.fn(),
    send: vi.fn(),
  },
  dialog: {
    showOpenDialog: vi.fn(),
  },
  shell: {
    openExternal: vi.fn(),
  },
}))

// Mock Prisma Client
vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(() => ({
    $connect: vi.fn(),
    $disconnect: vi.fn(),
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    plugin: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    userPlugin: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
    appSettings: {
      findMany: vi.fn(),
      upsert: vi.fn(),
      deleteMany: vi.fn(),
    },
  })),
}))

// Mock Node.js modules
vi.mock('fs/promises', () => ({
  readFile: vi.fn(),
  writeFile: vi.fn(),
  mkdir: vi.fn(),
  access: vi.fn(),
  readdir: vi.fn(),
  stat: vi.fn(),
}))

vi.mock('path', async (importOriginal) => {
  const actual = await importOriginal() as any
  return {
    ...actual,
    join: vi.fn((...args) => args.join('/')),
    resolve: vi.fn((...args) => args.join('/')),
    dirname: vi.fn((path) => path.split('/').slice(0, -1).join('/')),
    basename: vi.fn((path) => path.split('/').pop()),
    extname: vi.fn((path) => {
      const parts = path.split('.')
      return parts.length > 1 ? '.' + parts.pop() : ''
    }),
  }
})

// Global test setup
beforeEach(() => {
  vi.clearAllMocks()
})