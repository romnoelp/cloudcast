export type User = {
  user_id: string
  user_name: string
  user_email: string
  user_avatar_url?: string
  status: "active" | "inactive"
  role: string
}
