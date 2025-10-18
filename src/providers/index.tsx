import React from 'react'

import { AuthProvider } from './Auth'
import { HeaderThemeProvider } from './HeaderTheme'
import { ThemeProvider } from './Theme'
import { UserProvider } from './User'

export const Providers: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <ThemeProvider>
      <HeaderThemeProvider>
        <AuthProvider>
          <UserProvider>{children}</UserProvider>
        </AuthProvider>
      </HeaderThemeProvider>
    </ThemeProvider>
  )
}
