/**
 * Development-only logging utility
 * Prevents console output from being serialized into API responses
 */

const isDev = process.env.NODE_ENV === 'development'

export const logger = {
  debug: (message: string, data?: any) => {
    if (isDev) {
      console.log(message, data || '')
    }
  },
  info: (message: string, data?: any) => {
    if (isDev) {
      console.log(message, data || '')
    }
  },
  warn: (message: string, data?: any) => {
    if (isDev) {
      console.warn(message, data || '')
    }
  },
  error: (message: string, data?: any) => {
    if (isDev) {
      console.error(message, data || '')
    }
  },
}
