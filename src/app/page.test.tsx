import { render, screen } from '@testing-library/react'
import Home from './page'
import { describe, it, expect } from 'vitest'

describe('Home Page - Modern UI', () => {
  it('should render navigation header with logo', () => {
    render(<Home />)

    // Should have a header with navigation
    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByText('PoolManager')).toBeInTheDocument()
  })

  it('should render primary action buttons', () => {
    render(<Home />)

    // Should have clickable action buttons
    expect(
      screen.getByRole('link', { name: /upload data/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /manage pools/i })
    ).toBeInTheDocument()
  })
})
