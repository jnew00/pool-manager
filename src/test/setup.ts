import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'
import React from 'react'

// Make React available globally for JSX
global.React = React

// cleanup DOM after each test
afterEach(() => cleanup())
