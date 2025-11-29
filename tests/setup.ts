import '@testing-library/jest-dom'
import { configure } from '@testing-library/react'

// Set global timeout for waitFor commands to 1 second
// This is a hard requirement for all tests in this project
configure({ asyncUtilTimeout: 1000 })
