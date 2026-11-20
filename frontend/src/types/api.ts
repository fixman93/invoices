export interface ApiResponse<T = undefined> {
  success: boolean
  message: string
  data: T
  errors?: { path: string; message: string }[]
}
