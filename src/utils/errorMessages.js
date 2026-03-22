import { MESSAGES } from '../constants/messages'

/**
 * Extracts a user-friendly error message from a raw Supabase error or generic Error
 */
export function getErrorMessage(error, defaultMessage = MESSAGES.ERROR.DEFAULT) {
  if (!error) return defaultMessage
  
  // Custom mapping can be added here based on Supabase error codes
  // e.g., if (error.code === '23505') return 'この値は既に使われています'

  return error.message || defaultMessage
}
