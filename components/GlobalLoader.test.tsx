import React from 'react'
import { render, screen, act } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { GlobalLoaderProvider, useGlobalLoader } from './GlobalLoaderContext'
import GlobalLoader from './GlobalLoader'

const TestComponent = () => {
  const { isLoading, message, showLoader, hideLoader } = useGlobalLoader()

  return (
    <div>
      <button onClick={() => showLoader('Testing loader...')}>Show</button>
      <button onClick={() => hideLoader()}>Hide</button>
      <div data-testid="status">{isLoading ? 'Loading' : 'Idle'}</div>
      <div data-testid="msg">{message}</div>
    </div>
  )
}

describe('GlobalLoader Context & Component', () => {
  it('should provide default values and update state when showLoader is called', () => {
    render(
      <GlobalLoaderProvider>
        <TestComponent />
        <GlobalLoader />
      </GlobalLoaderProvider>
    )

    // Initially idle
    expect(screen.getByTestId('status').textContent).toBe('Idle')
    expect(screen.queryByTestId('global-loader')).toBeNull()

    // Click to show loader
    act(() => {
      screen.getByText('Show').click()
    })

    expect(screen.getByTestId('status').textContent).toBe('Loading')
    expect(screen.getByTestId('msg').textContent).toBe('Testing loader...')
    
    const loader = screen.getByTestId('global-loader')
    expect(loader).toBeDefined()
    expect(screen.getAllByText('Testing loader...').length).toBe(2)

    // Click to hide
    act(() => {
      screen.getByText('Hide').click()
    })

    expect(screen.getByTestId('status').textContent).toBe('Idle')
    expect(screen.queryByTestId('global-loader')).toBeNull()
  })
})