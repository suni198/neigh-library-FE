import '@testing-library/jest-dom'

// localStorage mock that actually stores values so auth checks work
let _store = {}
const localStorageMock = {
  getItem: jest.fn((key) => _store[key] ?? null),
  setItem: jest.fn((key, value) => { _store[key] = String(value) }),
  removeItem: jest.fn((key) => { delete _store[key] }),
  clear: jest.fn(() => { _store = {} }),
}
Object.defineProperty(global, 'localStorage', { value: localStorageMock, writable: true })

// Reset the backing store before each test so tests don't bleed into each other
beforeEach(() => { _store = {} })
