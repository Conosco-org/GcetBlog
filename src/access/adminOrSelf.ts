import type { Access } from 'payload'

export const adminOrSelf: Access = ({ req: { user } }) => {
  if (user?.role === 'admin') {
    return true
  }

  // Users can only update their own profile
  if (user) {
    return {
      id: {
        equals: user.id,
      },
    }
  }

  return false
}
