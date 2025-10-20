// Tipos de resposta padronizados da API

export interface ApiSuccessResponse<T = any> {
  success: true
  data?: T
  status: number
  message?: string
}

export interface ApiErrorResponse {
  success?: false
  error: string
  status: number
  details?: any
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse

// HTTP Status Codes
export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const

