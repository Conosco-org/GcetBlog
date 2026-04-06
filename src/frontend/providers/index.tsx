import React from 'react'

import { AuthProvider } from './Auth'
import { HeaderThemeProvider } from './HeaderTheme'
import { NavigationProgressProvider } from './NavigationProgress'
import { ThemeProvider } from './Theme'
import { UserProvider } from './User'

// Re-export individual providers
export { AuthProvider } from './Auth'
export { HeaderThemeProvider, useHeaderTheme } from './HeaderTheme'
export { NavigationProgressProvider, useNavigationProgress } from './NavigationProgress'
export { ThemeProvider, useTheme } from './Theme'
export { UserProvider, useUser } from './User'

// Composite provider that wraps all providers
export const Providers: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <ThemeProvider>
      <HeaderThemeProvider>
        <UserProvider>{children}</UserProvider>
      </HeaderThemeProvider>
    </ThemeProvider>
  )
}
