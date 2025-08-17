import { render, screen } from '@testing-library/react'
import { Welcome } from './Welcome'

describe('Welcome Component', () => {
  it('should render welcome message', () => {
    render(<Welcome />)
    expect(screen.getByText('Welcome to PoolManager')).toBeInTheDocument()
  })

  it('should render description', () => {
    render(<Welcome />)
    expect(
      screen.getByText('Your NFL pool management system')
    ).toBeInTheDocument()
  })

  it('should accept custom className', () => {
    render(<Welcome className="custom-class" />)
    const welcomeDiv = screen.getByText('Welcome to PoolManager').parentElement
    expect(welcomeDiv).toHaveClass('custom-class')
  })
})
