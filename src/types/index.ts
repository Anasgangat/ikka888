import type { User } from '@supabase/supabase-js'

export type { User }

export type DashboardData = {
  name: string
  email: string
  totalOrders: number
  pendingOrders: number
  paymentStatus: string
  myCourses: Array<{ id: string; title: string; access: boolean }>
  orders: Array<{ id: string; orderNumber: string; status: string; totalAmount: number; proofStatus?: string }>
  lessons: Array<{ id: string; productId: string; title: string; description: string; contentUrl: string | null }>
}

export type AdminProduct = {
  id: string
  name: string
  category: string
  price: number
  status: string
  description: string | null
  short_description: string | null
  thumbnail_url: string | null
}

export type AdminOrder = {
  id: string
  order_number: string
  user_id: string
  status: string
  total_amount: number
  customer?: { full_name: string; email: string } | null
  proof_status?: string
  proof_file_url?: string
}

export type AdminLesson = {
  id: string
  product_id: string
  title: string
  description: string | null
  is_published: boolean
}

export type StoreCourse = {
  id: string
  title: string
  category: string
  price: string
  tag: string
  level: string
  image: string
  shortDescription: string
  description: string
  outcomes: string[]
}

export type CartItem = StoreCourse & { quantity: number }

export type AcademyMode = {
  id: string
  title: string
  label: string
  detail: string
  description: string
  modules: string[]
  image: string
}

export type ProductForm = {
  name: string
  category: string
  price: string
  description: string
  thumbnailUrl: string
  status: string
}

export type LessonForm = {
  productId: string
  title: string
  description: string
  contentUrl: string
}