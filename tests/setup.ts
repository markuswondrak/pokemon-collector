import '@testing-library/jest-dom'
import { configure, screen } from '@testing-library/react'

// Set global timeout for waitFor commands to 1 second
// This is a hard requirement for all tests in this project
configure({ asyncUtilTimeout: 1000 })

// Test utility: Get the search button specifically (not the mode toggle)
// eslint-disable-next-line @typescript-eslint/no-namespace
declare global {
  namespace Vi {
    interface TestContext {
      getSearchButton: () => HTMLButtonElement
    }
  }
}

// Export utility for tests to use
export function getSearchButton(): HTMLButtonElement {
  const buttons = screen.getAllByRole('button')
  const searchBtn = buttons.find(btn => btn.textContent === 'Search' && btn.className.includes('btn-primary'))
  if (!searchBtn) {
    throw new Error('Search button not found')
  }
  return searchBtn as HTMLButtonElement
}

