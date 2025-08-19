import { render, screen } from '@testing-library/react'
import { Welcome } from './Welcome'
import { describe, it, expect } from 'vitest'

describe('Welcome Component', () => {
  it('should render welcome message', () => {
    render(<Welcome />)
    expect(screen.getByText('Welcome to PoolManager')).toBeInTheDocument()
  })

  it('should render description', () => {
    render(<Welcome />)
    expect(
      screen.getByText('Your premium NFL pool management system')
    ).toBeInTheDocument()
  })

  it('should accept custom className', () => {
    const { container } = render(<Welcome className="custom-class" />)
    const welcomeDiv = container.firstChild
    expect(welcomeDiv).toHaveClass('custom-class')
  })
})
