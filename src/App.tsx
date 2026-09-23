import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import './App.css'
import { supabase } from './lib/supabase'
import Header from './components/Header'
import Footer from './components/Footer'
import AuthModal from './components/AuthModal'
import type { AuthMode } from './components/AuthModal'
import CartDrawer from './components/CartDrawer'
import {
  academyModes,
  benefits,
  emptyDashboardData,
  faqs,
  featureTopics,
  galleryImages,
  heroImage,
  placeholderTestimonials,
  trainingImages,
  uuidPattern,
} from './data/site'
import type {
  AdminLesson,
  AdminOrder,
  AdminProduct,
  CartItem,
  DashboardData,
  LessonForm,
  ProductForm,
  StoreCourse,
  User,
} from './types'

function App() {
  const location = useLocation()
  const navigate = useNavigate()

  const path = location.pathname
  const courseMatch = path.match(/^\/course\/([^/]+)\/?$/)
  const modeMatch = path.match(/^\/mode\/([^/]+)\/?$/)
  const selectedCourseId = courseMatch ? courseMatch[1] : null
  const selectedModeId = modeMatch ? modeMatch[1] : null
  const activePage:
    | 'home' | 'courses' | 'about' | 'faq' | 'admin'
    | 'payments' | 'learning' | 'mode' | 'account' =
    path.startsWith('/account')
      ? 'account'
      : path.startsWith('/my-courses')
        ? 'learning'
        : path.startsWith('/payment')
          ? 'payments'
          : path === '/admin'
            ? 'admin'
            : path.startsWith('/mode')
              ? 'mode'
              : path.startsWith('/courses')
                ? 'courses'
                : path.startsWith('/about')
                  ? 'about'
                  : path.startsWith('/faq')
                    ? 'faq'
                    : 'home'

  const goHome = () => navigate('/')
  const goCourses = () => navigate('/courses')
  const goAbout = () => navigate('/about')
  const goFaq = () => navigate('/faq')
  const goAdmin = () => navigate('/admin')
  const goAccount = () => navigate('/account')
  const goLearning = () => navigate('/my-courses')
  const goPayments = () => navigate('/payment')
  const openCourse = (id: string) => navigate(`/course/${id}`)
  const openMode = (id: string) => navigate(`/mode/${id}`)
  const closeCourse = () => navigate('/')
  const [authMode, setAuthMode] = useState<AuthMode | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authMessage, setAuthMessage] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [dashboardData, setDashboardData] = useState<DashboardData>(emptyDashboardData)
  const [dashboardLoading, setDashboardLoading] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminProducts, setAdminProducts] = useState<AdminProduct[]>([])
  const [adminOrders, setAdminOrders] = useState<AdminOrder[]>([])
  const [adminLessons, setAdminLessons] = useState<AdminLesson[]>([])
  const [adminMessage, setAdminMessage] = useState('')
  const [adminStats, setAdminStats] = useState({ users: 0, products: 0, pendingOrders: 0, paidOrders: 0, revenue: 0 })
  const [productLoading, setProductLoading] = useState(false)
  const [purchaseMessage, setPurchaseMessage] = useState('')
  const [dashboardRefresh, setDashboardRefresh] = useState(0)
  const [proofMessage, setProofMessage] = useState('')
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [cartMessage, setCartMessage] = useState('')
  const [lessonForm, setLessonForm] = useState<LessonForm>({ productId: '', title: '', description: '', contentUrl: '' })
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [productForm, setProductForm] = useState<ProductForm>({
    name: '',
    category: 'general',
    price: '',
    description: '',
    thumbnailUrl: '',
    status: 'published',
  })
  const [storeCourses, setStoreCourses] = useState<StoreCourse[]>([])

  const selectedCourse = useMemo(
    () => storeCourses.find((course) => course.id === selectedCourseId) ?? null,
    [selectedCourseId, storeCourses],
  )

  const selectedMode = academyModes.find((mode) => mode.id === selectedModeId) ?? null

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0)
  const cartTotal = cartItems.reduce((total, item) => {
    const amount = Number(item.price.replace(/[^0-9.]/g, ''))
    return total + (Number.isNaN(amount) ? 0 : amount * item.quantity)
  }, 0)

  useEffect(() => {
    if (!supabase) return

    const client = supabase

    const loadStoreCourses = async () => {
      const { data } = await client
        .from('products')
        .select('id, name, category, price, description, short_description, thumbnail_url')
        .eq('status', 'published')
        .order('created_at', { ascending: false })

      if (!data?.length) return

      setStoreCourses(
        data.map((product) => ({
          id: product.id,
          title: product.name,
          category: product.category,
          price: `R${Number(product.price).toLocaleString('en-ZA')}`,
          tag: 'Available now',
          level: 'All skill levels',
          image: product.thumbnail_url || heroImage,
          shortDescription: product.short_description || product.description,
          description: product.description,
          outcomes: ['Recoil and aim drills', 'Rotations and zone play', 'Match review routines'],
        })),
      )
    }

    void loadStoreCourses()
  }, [])

  useEffect(() => {
    if (!supabase) return

    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null))

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      if (event === 'PASSWORD_RECOVERY') {
        setAuthMode('update-password')
        setAuthMessage('')
        setAuthPassword('')
      }
    })

    return () => data.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!supabase || !user) {
      setDashboardData(emptyDashboardData)
      return
    }

    const client = supabase

    const loadDashboard = async () => {
      setDashboardLoading(true)

      const profileResult = await client
        .from('profiles')
        .select('full_name, email, role')
        .eq('id', user.id)
        .maybeSingle()
      const admin = profileResult.data?.role === 'admin'
      const [ordersResult, accessResult] = await Promise.all([
        admin
          ? client.from('orders').select('id, order_number, user_id, status, total_amount, profiles(full_name, email)').order('created_at', { ascending: false })
          : client.from('orders').select('id, order_number, status, total_amount').eq('user_id', user.id),
        client
          .from('course_access')
          .select('product_id, status, products(name)')
          .eq('user_id', user.id),
      ])

      const proofResult = admin
        ? await client
          .from('payment_proofs')
          .select('order_id, status, file_name, file_url')
          .in('order_id', ordersResult.data?.map((order) => order.id) ?? [])
        : await client
          .from('payment_proofs')
          .select('order_id, status, file_name, file_url')
          .eq('user_id', user.id)

      const orders = ordersResult.data ?? []
      const proofs = proofResult.data ?? []
      setIsAdmin(admin)
      if (admin) {
        setAdminOrders((orders as AdminOrder[]).map((order) => ({
          ...order,
          customer: (order as AdminOrder & { profiles?: { full_name: string; email: string } | null }).profiles,
          proof_status: proofs.find((proof) => proof.order_id === order.id)?.status,
          proof_file_url: proofs.find((proof) => proof.order_id === order.id)?.file_url,
        })))
      }
      const activeAccess = (accessResult.data ?? []).filter((course) => course.status === 'active')
      const lessonQuery = admin
        ? client.from('course_lessons').select('id, product_id, title, description, content_url, is_published').order('lesson_order')
        : activeAccess.length
          ? client.from('course_lessons').select('id, product_id, title, description, content_url, is_published').in('product_id', activeAccess.map((course) => course.product_id)).eq('is_published', true).order('lesson_order')
          : null
      const lessonResult = lessonQuery ? await lessonQuery : { data: [] }
      if (admin) setAdminLessons((lessonResult.data ?? []) as AdminLesson[])
      const firstPendingOrder = orders.find((order) => order.status !== 'paid')
      const products = activeAccess.map((course) => {
        const product = Array.isArray(course.products) ? course.products[0] : course.products
        return {
          id: course.product_id,
          title: product?.name ?? 'Course access',
          access: true,
        }
      })

      setDashboardData({
        name: profileResult.data?.full_name || user.email?.split('@')[0] || 'Player',
        email: profileResult.data?.email || user.email || '',
        totalOrders: orders.length,
        pendingOrders: orders.filter((order) => order.status !== 'paid').length,
        paymentStatus: firstPendingOrder ? firstPendingOrder.status.replaceAll('_', ' ') : 'All payments approved',
        myCourses: products,
        orders: orders.map((order) => ({
          id: order.id,
          orderNumber: order.order_number,
          status: order.status,
          totalAmount: Number(order.total_amount),
          proofStatus: proofs.find((proof) => proof.order_id === order.id)?.status,
        })),
        lessons: (lessonResult.data ?? []).map((lesson) => ({
          id: lesson.id,
          productId: lesson.product_id,
          title: lesson.title,
          description: lesson.description || '',
          contentUrl: lesson.content_url,
        })),
      })
      setDashboardLoading(false)
    }

    void loadDashboard()
  }, [user, dashboardRefresh])

  useEffect(() => {
    if (!supabase || !isAdmin) {
      setAdminProducts([])
      setAdminOrders([])
      return
    }

    const client = supabase

    const loadAdminProducts = async () => {
      const { data } = await client
        .from('products')
        .select('id, name, category, price, status, description, short_description, thumbnail_url')
        .order('created_at', { ascending: false })

      if (data) setAdminProducts(data)
    }

    const loadAdminStats = async () => {
      const [usersResult, productsResult, ordersResult] = await Promise.all([
        client.from('profiles').select('id', { count: 'exact', head: true }),
        client.from('products').select('id', { count: 'exact', head: true }),
        client.from('orders').select('status, total_amount'),
      ])

      const orders = ordersResult.data ?? []
      const paidOrders = orders.filter((order) => order.status === 'paid')

      setAdminStats({
        users: usersResult.count ?? 0,
        products: productsResult.count ?? 0,
        pendingOrders: orders.filter((order) => order.status !== 'paid').length,
        paidOrders: paidOrders.length,
        revenue: paidOrders.reduce((sum, order) => sum + Number(order.total_amount), 0),
      })
    }

    void loadAdminProducts()
    void loadAdminStats()
  }, [isAdmin])

  const openAuth = (mode: AuthMode) => {
    setAuthMode(mode)
    setAuthMessage('')
    setAuthPassword('')
  }

  const handleAuthSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setAuthMessage('')

    if (!supabase) {
      setAuthMessage('Add your Supabase values to .env before using authentication.')
      return
    }

    if (authMode === 'reset') {
      setAuthLoading(true)
      const resetResult = await supabase.auth.resetPasswordForEmail(authEmail, {
        redirectTo: `${window.location.origin}/account`,
      })
      setAuthLoading(false)

      if (resetResult.error) {
        setAuthMessage(resetResult.error.message)
        return
      }

      setAuthMessage('If that email exists, a reset link is on its way. Check your inbox.')
      return
    }

    if (authMode === 'update-password') {
      setAuthLoading(true)
      const updateResult = await supabase.auth.updateUser({ password: authPassword })
      setAuthLoading(false)

      if (updateResult.error) {
        setAuthMessage(updateResult.error.message)
        return
      }

      setAuthMessage('Password updated. You can continue using your account.')
      setAuthPassword('')
      return
    }

    setAuthLoading(true)
    const result = authMode === 'login'
      ? await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword })
      : await supabase.auth.signUp({ email: authEmail, password: authPassword })

    setAuthLoading(false)

    if (result.error) {
      setAuthMessage(result.error.message)
      return
    }

    if (authMode === 'signup' && !result.data.session) {
      setAuthMessage('Account created. Check your email to confirm your account.')
      return
    }

    setAuthMode(null)
    setAuthEmail('')
    setAuthPassword('')
  }

  const handleLogout = async () => {
    await supabase?.auth.signOut()
  }

  const addToCart = (course: StoreCourse) => {
    setCartItems((items) => {
      const existing = items.find((item) => item.id === course.id)
      if (existing) {
        return items.map((item) => item.id === course.id ? { ...item, quantity: item.quantity + 1 } : item)
      }
      return [...items, { ...course, quantity: 1 }]
    })
    setCartMessage(`${course.title} added to your cart.`)
    setCartOpen(true)
  }

  const updateCartQuantity = (courseId: string, quantity: number) => {
    if (quantity <= 0) {
      setCartItems((items) => items.filter((item) => item.id !== courseId))
      return
    }
    setCartItems((items) => items.map((item) => item.id === courseId ? { ...item, quantity } : item))
  }

  const handleCartCheckout = async () => {
    if (!user) {
      setCartMessage('Log in before checking out.')
      openAuth('login')
      return
    }

    if (!supabase || !cartItems.length) return
    const invalidItem = cartItems.find((item) => !uuidPattern.test(item.id))
    if (invalidItem) {
      setCartMessage(`${invalidItem.title} is a demo course. Add published database products to checkout.`)
      return
    }

    const client = supabase
    setCartMessage('Creating your EFT order...')
    const orderResult = await client
      .from('orders')
      .insert({ user_id: user.id, total_amount: cartTotal, currency: 'ZAR', payment_method: 'EFT' })
      .select('id, order_number')
      .single()

    if (orderResult.error || !orderResult.data) {
      setCartMessage(orderResult.error?.message || 'Could not create your order.')
      return
    }

    const itemResult = await client.from('order_items').insert(cartItems.map((item) => ({
      order_id: orderResult.data.id,
      product_id: item.id,
      quantity: item.quantity,
      unit_price: Number(item.price.replace(/[^0-9.]/g, '')),
    })))

    if (itemResult.error) {
      setCartMessage(itemResult.error.message)
      return
    }

    setCartItems([])
    setCartMessage(`Order ${orderResult.data.order_number} created. Upload payment proof from My Orders.`)
    setDashboardRefresh((value) => value + 1)
  }

  const handlePurchase = async () => {
    if (!selectedCourse) return

    if (!uuidPattern.test(selectedCourse.id)) {
      setPurchaseMessage('This is a demo course. Publish it from the Admin Dashboard before buying it.')
      return
    }

    if (!user) {
      setPurchaseMessage('Please log in before placing an order.')
      openAuth('login')
      return
    }

    if (!supabase) {
      setPurchaseMessage('Supabase is not configured.')
      return
    }

    setPurchaseMessage('Creating your EFT order...')
    const client = supabase
    const amount = Number(selectedCourse.price.replace(/[^0-9.]/g, ''))
    const orderResult = await client
      .from('orders')
      .insert({ user_id: user.id, total_amount: amount, currency: 'ZAR', payment_method: 'EFT' })
      .select('id, order_number')
      .single()

    if (orderResult.error || !orderResult.data) {
      setPurchaseMessage(orderResult.error?.message || 'Could not create your order.')
      return
    }

    const itemResult = await client.from('order_items').insert({
      order_id: orderResult.data.id,
      product_id: selectedCourse.id,
      quantity: 1,
      unit_price: amount,
    })

    if (itemResult.error) {
      setPurchaseMessage(itemResult.error.message)
      return
    }

    setPurchaseMessage(`Order ${orderResult.data.order_number} created. Follow the EFT instructions to pay.`)
    setDashboardRefresh((value) => value + 1)
  }

  const handleProofUpload = async (orderId: string, file: File | undefined) => {
    if (!supabase || !user || !file) return

    setProofMessage('Uploading payment proof...')
    const client = supabase
    const filePath = `${user.id}/${orderId}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`
    const uploadResult = await client.storage.from('payment-proofs').upload(filePath, file, { upsert: true })

    if (uploadResult.error) {
      setProofMessage(uploadResult.error.message)
      return
    }

    const proofResult = await client.from('payment_proofs').upsert({
      order_id: orderId,
      user_id: user.id,
      file_url: filePath,
      file_name: file.name,
      status: 'pending',
    }, { onConflict: 'order_id' })

    if (proofResult.error) {
      setProofMessage(proofResult.error.message)
      return
    }

    const orderResult = await client.from('orders').update({ status: 'proof_submitted' }).eq('id', orderId)
    if (orderResult.error) {
      setProofMessage(orderResult.error.message)
      return
    }

    setProofMessage('Payment proof uploaded. Your order is waiting for admin review.')
    setDashboardRefresh((value) => value + 1)
  }

  const handleProductSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!supabase || !isAdmin) return

    setProductLoading(true)
    setAdminMessage('')
    const slug = productForm.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    const fields = {
      name: productForm.name.trim(),
      slug,
      category: productForm.category.trim() || 'general',
      price: Number(productForm.price),
      description: productForm.description.trim(),
      short_description: productForm.description.trim(),
      thumbnail_url: productForm.thumbnailUrl.trim() || null,
      status: productForm.status,
    }

    const { error } = editingProductId
      ? await supabase.from('products').update(fields).eq('id', editingProductId)
      : await supabase.from('products').insert(fields)

    if (error) {
      setAdminMessage(error.message)
      setProductLoading(false)
      return
    }

    const { data } = await supabase
      .from('products')
      .select('id, name, category, price, status, description, short_description, thumbnail_url')
      .order('created_at', { ascending: false })
    if (data) setAdminProducts(data)
    const publishedProducts = await supabase
      .from('products')
      .select('id, name, category, price, description, short_description, thumbnail_url')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
    setStoreCourses((publishedProducts.data ?? []).map((product) => ({
      id: product.id,
      title: product.name,
      category: product.category,
      price: `R${Number(product.price).toLocaleString('en-ZA')}`,
      tag: 'Available now',
      level: 'All skill levels',
      image: product.thumbnail_url || heroImage,
      shortDescription: product.short_description || product.description,
      description: product.description,
      outcomes: ['Recoil and aim drills', 'Rotations and zone play', 'Match review routines'],
    })))
    const wasEditing = Boolean(editingProductId)
    setProductForm({ name: '', category: 'general', price: '', description: '', thumbnailUrl: '', status: 'published' })
    setEditingProductId(null)
    setAdminMessage(wasEditing ? 'Product updated successfully.' : 'Product published successfully.')
    setProductLoading(false)
  }

  const startEditProduct = (product: AdminProduct) => {
    setEditingProductId(product.id)
    setProductForm({
      name: product.name,
      category: product.category,
      price: String(product.price),
      description: product.description || '',
      thumbnailUrl: product.thumbnail_url || '',
      status: product.status,
    })
    setAdminMessage('')
    document.querySelector('.admin-product-form')?.scrollIntoView({ behavior: 'smooth' })
  }

  const cancelEditProduct = () => {
    setEditingProductId(null)
    setProductForm({ name: '', category: 'general', price: '', description: '', thumbnailUrl: '', status: 'published' })
    setAdminMessage('')
  }

  const refreshPublishedCourses = async () => {
    if (!supabase) return
    const publishedProducts = await supabase
      .from('products')
      .select('id, name, category, price, description, short_description, thumbnail_url')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
    setStoreCourses((publishedProducts.data ?? []).map((product) => ({
      id: product.id,
      title: product.name,
      category: product.category,
      price: `R${Number(product.price).toLocaleString('en-ZA')}`,
      tag: 'Available now',
      level: 'All skill levels',
      image: product.thumbnail_url || heroImage,
      shortDescription: product.short_description || product.description,
      description: product.description,
      outcomes: ['Recoil and aim drills', 'Rotations and zone play', 'Match review routines'],
    })))
  }

  const handleProductStatusChange = async (productId: string, status: 'published' | 'archived') => {
    if (!supabase || !isAdmin) return

    const { error } = await supabase.from('products').update({ status }).eq('id', productId)
    if (error) {
      setAdminMessage(error.message)
      return
    }

    setAdminProducts((products) => products.map((product) => (
      product.id === productId ? { ...product, status } : product
    )))
    if (editingProductId === productId) {
      setProductForm((form) => ({ ...form, status }))
    }
    await refreshPublishedCourses()
    setAdminMessage(status === 'archived' ? 'Product archived. It is now hidden from the store.' : 'Product published. It is live on the store.')
  }

  const handleProductDelete = async (productId: string) => {
    if (!supabase || !isAdmin) return

    const { error } = await supabase.from('products').delete().eq('id', productId)
    if (error) {
      setAdminMessage(error.message)
      return
    }

    setAdminProducts((products) => products.filter((product) => product.id !== productId))
    await refreshPublishedCourses()
    setAdminMessage('Product deleted.')
  }

  const handleLessonSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!supabase || !isAdmin) return

    const { error } = await supabase.from('course_lessons').insert({
      product_id: lessonForm.productId,
      title: lessonForm.title.trim(),
      description: lessonForm.description.trim(),
      content_url: lessonForm.contentUrl.trim() || null,
      lesson_order: adminLessons.filter((lesson) => lesson.product_id === lessonForm.productId).length + 1,
      is_published: true,
    })

    if (error) {
      setAdminMessage(error.message)
      return
    }

    setLessonForm({ productId: '', title: '', description: '', contentUrl: '' })
    setAdminMessage('Lesson published successfully. Refresh the user dashboard to see it.')
    setDashboardRefresh((value) => value + 1)
  }

  const handleOrderReview = async (orderId: string, status: 'paid' | 'rejected') => {
    if (!supabase || !isAdmin) return

    if (status === 'paid') {
      const order = adminOrders.find((item) => item.id === orderId)
      const { data: orderItem, error: itemError } = await supabase
        .from('order_items')
        .select('product_id')
        .eq('order_id', orderId)
        .single()

      if (itemError || !orderItem || !order) {
        setAdminMessage(itemError?.message || 'Could not find the product attached to this order.')
        return
      }

      const accessResult = await supabase.from('course_access').upsert({
        user_id: order.user_id,
        product_id: orderItem.product_id,
        status: 'active',
      }, { onConflict: 'user_id,product_id' })

      if (accessResult.error) {
        setAdminMessage(accessResult.error.message)
        return
      }
    }

    const { error } = await supabase.from('orders').update({ status }).eq('id', orderId)
    if (error) {
      setAdminMessage(error.message)
      return
    }

    setAdminOrders((orders) => orders.map((order) => (
      order.id === orderId ? { ...order, status } : order
    )))
    setAdminMessage(`Order marked as ${status}.`)
  }

  const handleViewProof = async (filePath: string) => {
    if (!supabase) return

    const { data, error } = await supabase.storage.from('payment-proofs').createSignedUrl(filePath, 3600)
    if (error || !data?.signedUrl) {
      setAdminMessage(error?.message || 'Could not open payment proof.')
      return
    }

    window.open(data.signedUrl, '_blank', 'noopener,noreferrer')
  }

  const handleLessonFileUpload = async (file: File | undefined) => {
    if (!supabase || !isAdmin || !file) return

    if (!lessonForm.productId) {
      setAdminMessage('Choose a product before uploading a lesson file.')
      return
    }

    setAdminMessage('Uploading lesson file...')
    const path = `${lessonForm.productId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`
    const uploadResult = await supabase.storage.from('course-content').upload(path, file, { upsert: true })

    if (uploadResult.error) {
      setAdminMessage(uploadResult.error.message)
      return
    }

    await supabase.from('course_files').insert({
      product_id: lessonForm.productId,
      file_name: file.name,
      file_url: path,
      file_type: file.type,
      is_private: true,
    })

    setLessonForm((form) => ({ ...form, contentUrl: path }))
    setAdminMessage('Lesson file uploaded and linked below. Publish the lesson to save it.')
  }

  const handleOpenLessonResource = async (resource: string) => {
    if (!resource) return

    if (/^https?:\/\//i.test(resource)) {
      window.open(resource, '_blank', 'noopener,noreferrer')
      return
    }

    if (!supabase) return
    const { data, error } = await supabase.storage.from('course-content').createSignedUrl(resource, 3600)
    if (error || !data?.signedUrl) {
      setProofMessage(error?.message || 'Could not open lesson resource.')
      return
    }

    window.open(data.signedUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="page-shell">
      <Header
        user={user}
        isAdmin={isAdmin}
        cartCount={cartCount}
        onGoHome={goHome}
        onGoCourses={goCourses}
        onGoAbout={goAbout}
        onGoFaq={goFaq}
        onGoAdmin={goAdmin}
        onGoAccount={goAccount}
        onGoLearning={goLearning}
        onGoPayments={goPayments}
        onOpenCart={() => setCartOpen(true)}
        onOpenAuth={openAuth}
        onLogout={handleLogout}
      />

      <main>
        {!selectedCourse && ['home', 'courses', 'about', 'faq', 'admin'].includes(activePage) ? (
          <>
            {activePage === 'home' && (
              <>
            <section className="hero-section">
              <div className="hero-copy">
                <span className="eyebrow">PUBG COACHING</span>
                <h1>Win more gunfights.</h1>
                <p>
                  Learn recoil control, smart rotations, and late-game positioning through
                  PUBG courses built for players who want to climb the ranks fast.
                </p>

                <div className="hero-actions">
                  <button type="button" className="btn btn-primary large" onClick={() => document.querySelector('#courses')?.scrollIntoView({ behavior: 'smooth' })}>
                    Explore courses
                  </button>
                  <button type="button" className="btn btn-ghost large" onClick={goAbout}>
                    See how it works
                  </button>
                </div>

                <ul className="hero-stats" aria-label="Course highlights">
                  <li>
                    <strong>12+</strong>
                    <span>Skill tracks</span>
                  </li>
                  <li>
                    <strong>03</strong>
                    <span>Training tracks</span>
                  </li>
                  <li>
                    <strong>24/7</strong>
                    <span>Lifetime access</span>
                  </li>
                </ul>
              </div>

              <div className="hero-visual" aria-label="Featured course preview">
                <div
                  className="visual-image"
                  style={{ backgroundImage: `url(${heroImage})` }}
                  aria-hidden="true"
                />
                <div className="floating-badge">
                  <span className="badge-dot"></span>
                  Built for PUBG players
                </div>
              </div>
            </section>

            <div className="topic-marquee" aria-label="Topics covered by the academy">
              <div className="topic-marquee-track">
                {[...featureTopics, ...featureTopics].map((topic, index) => (
                  <span className="topic-pill" key={`${topic}-${index}`}>{topic}</span>
                ))}
              </div>
            </div>

            <section className="stats-band" aria-label="Course highlights">
              <div className="stat-block">
                <strong>12+</strong>
                <span>Skill tracks</span>
              </div>
              <div className="stat-block">
                <strong>03</strong>
                <span>Training tracks</span>
              </div>
              <div className="stat-block">
                <strong>24/7</strong>
                <span>Lifetime access</span>
              </div>
              <div className="stat-block">
                <strong>100%</strong>
                <span>PUBG focused</span>
              </div>
            </section>

            <section className="courses-section" id="courses">
              <div className="section-heading">
                <span className="eyebrow">FEATURED COURSES</span>
                <h2>Courses that actually move your rank.</h2>
              </div>

              <div className="course-grid">
                {storeCourses.length ? storeCourses.slice(0, 3).map((course) => (
                  <article className="course-card" key={course.id}>
                    <div
                      className="course-thumb"
                      style={{ backgroundImage: `linear-gradient(180deg, rgba(5,9,17,0.2), rgba(5,9,17,0.75)), url(${course.image})` }}
                    >
                      <span>{course.tag}</span>
                    </div>
                    <div className="course-body">
                      <p className="course-category">{course.category}</p>
                      <h3>{course.title}</h3>
                      <p className="course-short">{course.shortDescription}</p>
                      <div className="course-meta">
                        <span>{course.level}</span>
                        <strong>{course.price}</strong>
                      </div>
                      <button
                        type="button"
                        className="btn btn-secondary course-button"
                        onClick={() => openCourse(course.id)}
                      >
                        View course
                      </button>
                      <button type="button" className="btn btn-cart course-button" onClick={() => addToCart(course)}>
                        Add to cart
                      </button>
                    </div>
                  </article>
                )) : (
                  <div className="catalogue-empty">
                    <span className="mini-label">CATALOGUE LOADING</span>
                    <h3>No published courses yet.</h3>
                    <p>New training drops will appear here as soon as they are published by the academy.</p>
                  </div>
                )}
              </div>

              <div className="training-strip" aria-label="Training environment preview">
                <div className="training-strip-copy">
                  <span className="eyebrow">INSIDE THE TRAINING ROOM</span>
                  <h3>Turn every match into measurable progress.</h3>
                  <p>Recoil drills, rotation breakdowns, and repeatable routines built around the way good PUBG players actually win.</p>
                </div>
                <div className="training-strip-images">
                  {trainingImages.map((image, index) => (
                    <div className={`training-image training-image-${index + 1}`} key={image} style={{ backgroundImage: `url(${image})` }} />
                  ))}
                </div>
              </div>
            </section>
              </>
              )}

              {activePage === 'courses' && (
                <>
            <section className="courses-section" id="all-courses">
              <div className="section-heading">
                <span className="eyebrow">ALL COURSES</span>
                <h2>Every course in the catalogue.</h2>
              </div>
              <div className="course-grid">
                {storeCourses.length ? storeCourses.map((course) => (
                  <article className="course-card" key={course.id}>
                    <div
                      className="course-thumb"
                      style={{ backgroundImage: `linear-gradient(180deg, rgba(5,9,17,0.2), rgba(5,9,17,0.75)), url(${course.image})` }}
                    >
                      <span>{course.tag}</span>
                    </div>
                    <div className="course-body">
                      <p className="course-category">{course.category}</p>
                      <h3>{course.title}</h3>
                      <p className="course-short">{course.shortDescription}</p>
                      <div className="course-meta">
                        <span>{course.level}</span>
                        <strong>{course.price}</strong>
                      </div>
                      <button
                        type="button"
                        className="btn btn-secondary course-button"
                        onClick={() => openCourse(course.id)}
                      >
                        View course
                      </button>
                      <button type="button" className="btn btn-cart course-button" onClick={() => addToCart(course)}>
                        Add to cart
                      </button>
                    </div>
                  </article>
                )) : (
                  <div className="catalogue-empty">
                    <span className="mini-label">CATALOGUE LOADING</span>
                    <h3>No published courses yet.</h3>
                    <p>New training drops will appear here as soon as they are published by the academy.</p>
                  </div>
                )}
              </div>
            </section>

            <section className="gallery-section" aria-label="Inside the training room">
              <div className="section-heading">
                <span className="eyebrow">INSIDE THE TRAINING ROOM</span>
                <h2>Every session maps to a real skill.</h2>
              </div>
              <div className="gallery-grid">
                {galleryImages.map((item) => (
                  <figure className="gallery-card" key={item.label}>
                    <div className="gallery-image" style={{ backgroundImage: `url(${item.url})` }} />
                    <figcaption>
                      <span>{item.label}</span>
                      <strong>{item.caption}</strong>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </section>
                </>
              )}

              {activePage === 'about' && (
                <>
            <section className="benefits-section" id="benefits">
              <div className="section-heading narrow">
                <span className="eyebrow">WHY PLAYERS JOIN</span>
                <h2>Built for real improvement.</h2>
              </div>

              <div className="benefits-grid">
                {benefits.map((benefit) => (
                  <div className="benefit-item" key={benefit}>
                    <div className="benefit-icon">✓</div>
                    <p>{benefit}</p>
                  </div>
                ))}
              </div>
            </section>
                </>
              )}

              {activePage === 'home' && (
                <>
            <section className="modes-section" aria-label="Academy training modes">
              <div className="section-heading">
                <span className="eyebrow">CHOOSE YOUR TRACK</span>
                <h2>Three tracks. One sharper PUBG player.</h2>
              </div>
              <div className="modes-grid">
                {academyModes.map((mode) => (
                  <button type="button" className="mode-card" key={mode.title} onClick={() => openMode(mode.id)} style={{ backgroundImage: `linear-gradient(180deg, rgba(7,10,20,.08), rgba(7,10,20,.95)), url(${mode.image})` }}>
                    <div className="mode-card-content">
                      <span>{mode.label}</span>
                      <h3>{mode.title}</h3>
                      <p>{mode.detail}</p>
                      <i aria-hidden="true">↗</i>
                    </div>
                  </button>
                ))}
              </div>
            </section>
                </>
              )}

              {activePage === 'about' && (
                <>
            <section className="about-section" id="about">
              <div className="about-copy">
                <span className="eyebrow">ABOUT THE ACADEMY</span>
                <h2>PUBG coaching that focuses on skill, not hype.</h2>
                <p>
                  PUBG Mastery helps players build stronger aim, smarter rotations, and
                  calmer late-game decisions through focused courses designed for real
                  battleground play.
                </p>
              </div>

              <div className="about-panel">
                <h3>How it works</h3>
                <ol>
                  <li>Choose a course</li>
                  <li>Buy with EFT</li>
                  <li>Submit proof of payment</li>
                  <li>Get access after approval</li>
                </ol>
              </div>
            </section>

            <section className="testimonial-section">
              <div className="section-heading narrow">
                <span className="eyebrow">TESTIMONIALS</span>
                <h2>What players say (placeholder).</h2>
              </div>

              <div className="testimonial-grid">
                {placeholderTestimonials.map((item) => (
                  <div className="testimonial-card" key={`${item.name}-${item.tag}`}>
                    <div className="testimonial-quote-mark">“</div>
                    <p>{item.quote}</p>
                    <div className="testimonial-author">
                      <strong>{item.name}</strong>
                      <span>{item.tag}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
                </>
              )}

              {activePage === 'faq' && (
                <>
            <section className="faq-section" id="faq">
              <div className="section-heading narrow">
                <span className="eyebrow">FAQ</span>
                <h2>Everything you need to know before you start.</h2>
              </div>

              <div className="faq-list">
                {faqs.map((item) => (
                  <div className="faq-item" key={item.question}>
                    <h3>{item.question}</h3>
                    <p>{item.answer}</p>
                  </div>
                ))}
              </div>
            </section>
                </>
              )}

              {activePage === 'admin' && (
                <>
            {!isAdmin && (
              <section className="payment-page" aria-label="Access denied">
                <div className="payment-page-heading">
                  <span className="eyebrow">ADMIN ONLY</span>
                  <h1>Not authorised.</h1>
                  <p>You need an administrator account to view this page.</p>
                </div>
                <button type="button" className="btn btn-ghost page-back" onClick={goHome}>← Back to home</button>
              </section>
            )}
            {user && isAdmin && <section className="dashboard-section" aria-label="Admin account dashboard">
              <div className="section-heading narrow">
                <span className="eyebrow">USER DASHBOARD</span>
                <h2>Account overview.</h2>
              </div>

              <div className="dashboard-summary">
                <div className="summary-card">
                  <span>Name</span>
                  <strong>{dashboardLoading ? 'Loading...' : dashboardData.name}</strong>
                </div>
                <div className="summary-card">
                  <span>Email</span>
                  <strong>{dashboardLoading ? 'Loading...' : dashboardData.email}</strong>
                </div>
                <div className="summary-card">
                  <span>Orders</span>
                  <strong>{dashboardLoading ? '...' : dashboardData.totalOrders}</strong>
                </div>
                <div className="summary-card">
                  <span>Pending</span>
                  <strong>{dashboardLoading ? '...' : dashboardData.pendingOrders}</strong>
                </div>
                <div className="summary-card">
                  <span>Payment status</span>
                  <strong>{dashboardLoading ? 'Loading...' : dashboardData.paymentStatus}</strong>
                </div>
              </div>

              <div className="dashboard-content">
                <div className="dashboard-panel">
                  <h3>My Courses</h3>
                  <ul className="course-access-list">
                    {dashboardData.myCourses.map((course) => (
                      <li key={course.id}>
                        <span>{course.title}</span>
                        <strong>Access granted</strong>
                      </li>
                    ))}
                    {!dashboardData.myCourses.length && (
                      <li className="empty-state">No active course access yet.</li>
                    )}
                  </ul>
                </div>

                <div className="dashboard-panel">
                  <h3>{user ? 'My Orders' : 'Pending Orders'}</h3>
                  <ul className="course-access-list">
                    {user ? (
                      dashboardData.orders.length ? (
                        dashboardData.orders.map((order) => (
                          <li key={order.id}>
                            <div className="user-order-details">
                              <span>{order.orderNumber} · R{order.totalAmount}</span>
                              <strong className={`order-status order-status-${order.status}`}>
                                {order.status.replaceAll('_', ' ')}
                              </strong>
                            </div>
                            {order.status !== 'paid' && order.status !== 'rejected' && (
                              <label className="proof-upload">
                                Upload proof
                                <input type="file" accept="image/*,.pdf" onChange={(event) => handleProofUpload(order.id, event.target.files?.[0])} />
                              </label>
                            )}
                          </li>
                        ))
                      ) : (
                        <li className="empty-state">No orders yet.</li>
                      )
                    ) : (
                      <>
                        <li>
                          <span>Order #GB-1042</span>
                          <strong>Payment review</strong>
                        </li>
                        <li>
                          <span>Order #GB-1089</span>
                          <strong>Awaiting proof</strong>
                        </li>
                      </>
                    )}
                  </ul>
                  {user && proofMessage && <p className="admin-message" role="status">{proofMessage}</p>}
                </div>
              </div>

              {user && dashboardData.lessons.length > 0 && (
                <div className="dashboard-panel lessons-panel">
                  <h3>Learning area</h3>
                  <div className="lesson-list">
                    {dashboardData.lessons.map((lesson, index) => (
                      <article className="lesson-item" key={lesson.id}>
                        <span className="lesson-number">{String(index + 1).padStart(2, '0')}</span>
                        <div>
                          <h4>{lesson.title}</h4>
                          <p>{lesson.description}</p>
                          {lesson.contentUrl && (
                            <button type="button" className="lesson-resource-button" onClick={() => handleOpenLessonResource(lesson.contentUrl as string)}>
                              Open lesson resource
                            </button>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}
            </section>}

            {isAdmin && (
              <section className="admin-section" aria-label="Admin product management">
                <div className="section-heading narrow">
                  <span className="eyebrow">ADMIN DASHBOARD</span>
                  <h2>Manage your course catalogue.</h2>
                </div>

                <div className="dashboard-summary">
                  <div className="summary-card">
                    <span>Total users</span>
                    <strong>{adminStats.users}</strong>
                  </div>
                  <div className="summary-card">
                    <span>Total products</span>
                    <strong>{adminStats.products}</strong>
                  </div>
                  <div className="summary-card">
                    <span>Pending orders</span>
                    <strong>{adminStats.pendingOrders}</strong>
                  </div>
                  <div className="summary-card">
                    <span>Paid orders</span>
                    <strong>{adminStats.paidOrders}</strong>
                  </div>
                  <div className="summary-card">
                    <span>Revenue (approved EFT)</span>
                    <strong>R{adminStats.revenue.toLocaleString('en-ZA')}</strong>
                  </div>
                </div>

                <div className="admin-layout">
                  <form className="admin-product-form" onSubmit={handleProductSubmit}>
                    <h3>{editingProductId ? 'Edit product' : 'Add product'}</h3>
                    <label>
                      Course name
                      <input
                        value={productForm.name}
                        onChange={(event) => setProductForm({ ...productForm, name: event.target.value })}
                        required
                      />
                    </label>
                    <label>
                      Category
                      <input
                        value={productForm.category}
                        onChange={(event) => setProductForm({ ...productForm, category: event.target.value })}
                        required
                      />
                    </label>
                    <label>
                      Price in ZAR
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={productForm.price}
                        onChange={(event) => setProductForm({ ...productForm, price: event.target.value })}
                        required
                      />
                    </label>
                    <label>
                      Thumbnail URL
                      <input
                        type="url"
                        value={productForm.thumbnailUrl}
                        onChange={(event) => setProductForm({ ...productForm, thumbnailUrl: event.target.value })}
                        placeholder="https://..."
                      />
                    </label>
                    <label>
                      Description
                      <textarea
                        value={productForm.description}
                        onChange={(event) => setProductForm({ ...productForm, description: event.target.value })}
                        rows={4}
                        required
                      />
                    </label>
                    <label>
                      Status
                      <select
                        value={productForm.status}
                        onChange={(event) => setProductForm({ ...productForm, status: event.target.value })}
                      >
                        <option value="published">Published (visible on the site)</option>
                        <option value="draft">Draft (hidden)</option>
                        <option value="archived">Archived (hidden)</option>
                      </select>
                    </label>
                    <button type="submit" className="btn btn-primary" disabled={productLoading}>
                      {productLoading ? 'Saving...' : editingProductId ? 'Save changes' : 'Publish product'}
                    </button>
                    {editingProductId && (
                      <button type="button" className="btn btn-ghost" onClick={cancelEditProduct}>
                        Cancel edit
                      </button>
                    )}
                    {adminMessage && <p className="admin-message" role="status">{adminMessage}</p>}
                  </form>

                  <div className="admin-product-list">
                    <h3>Products in database</h3>
                    {adminProducts.length ? adminProducts.map((product) => (
                      <div className="admin-product-row" key={product.id}>
                        <div>
                          <strong>{product.name}</strong>
                          <span>{product.category} · R{product.price} · {product.status}</span>
                        </div>
                        <div className="order-actions">
                          <button type="button" className="btn btn-ghost order-button" onClick={() => startEditProduct(product)}>
                            Edit
                          </button>
                          {product.status === 'published' ? (
                            <button type="button" className="btn btn-secondary order-button" onClick={() => handleProductStatusChange(product.id, 'archived')}>
                              Archive
                            </button>
                          ) : (
                            <button type="button" className="btn btn-primary order-button" onClick={() => handleProductStatusChange(product.id, 'published')}>
                              Publish
                            </button>
                          )}
                          <button type="button" className="btn btn-danger order-button" onClick={() => handleProductDelete(product.id)}>
                            Delete
                          </button>
                        </div>
                      </div>
                    )) : <p className="empty-state">No products found yet.</p>}
                  </div>
                </div>

                <form className="admin-product-form lesson-form" onSubmit={handleLessonSubmit}>
                  <h3>Add lesson</h3>
                  <label>
                    Product
                    <select value={lessonForm.productId} onChange={(event) => setLessonForm({ ...lessonForm, productId: event.target.value })} required>
                      <option value="">Choose a product</option>
                      {adminProducts.map((product) => <option value={product.id} key={product.id}>{product.name}</option>)}
                    </select>
                  </label>
                  <label>
                    Lesson title
                    <input value={lessonForm.title} onChange={(event) => setLessonForm({ ...lessonForm, title: event.target.value })} required />
                  </label>
                  <label>
                    Lesson description
                    <textarea value={lessonForm.description} onChange={(event) => setLessonForm({ ...lessonForm, description: event.target.value })} rows={3} required />
                  </label>
                  <label>
                    Video or resource URL
                    <input type="url" value={lessonForm.contentUrl} onChange={(event) => setLessonForm({ ...lessonForm, contentUrl: event.target.value })} placeholder="https://... or upload a private file" />
                  </label>
                  <label className="lesson-upload">
                    Upload private lesson file (video, PDF)
                    <input type="file" onChange={(event) => handleLessonFileUpload(event.target.files?.[0])} />
                  </label>
                  <p className="admin-hint">Uploading stores the file privately. Only learners with access will be able to open it.</p>
                  <button type="submit" className="btn btn-primary">Publish lesson</button>
                </form>

                <div className="admin-orders-panel">
                  <h3>Customer orders</h3>
                  {adminOrders.length ? adminOrders.map((order) => (
                    <div className="admin-product-row" key={order.id}>
                      <div>
                        <strong>{order.order_number}</strong>
                        <span>{order.customer?.full_name || 'Customer'} · {order.customer?.email || order.user_id}</span>
                        <span>R{order.total_amount} · {order.status.replaceAll('_', ' ')}</span>
                        <span>Proof: {order.proof_status || 'Not uploaded'}</span>
                      </div>
                      <div className="order-actions">
                        {order.proof_file_url && (
                          <button type="button" className="btn btn-ghost order-button" onClick={() => handleViewProof(order.proof_file_url as string)}>
                            View proof
                          </button>
                        )}
                        <strong className="order-status">{order.status === 'paid' ? 'Paid' : order.status === 'rejected' ? 'Rejected' : 'Needs review'}</strong>
                        {order.status !== 'paid' && (
                          <button type="button" className="btn btn-primary order-button" onClick={() => handleOrderReview(order.id, 'paid')}>
                            Approve
                          </button>
                        )}
                        {order.status !== 'rejected' && (
                          <button type="button" className="btn btn-danger order-button" onClick={() => handleOrderReview(order.id, 'rejected')}>
                            Reject
                          </button>
                        )}
                      </div>
                    </div>
                  )) : <p className="empty-state">No customer orders found.</p>}
                </div>
              </section>
            )}
                </>
              )}
          </>
        ) : !selectedCourse && activePage === 'mode' && selectedMode ? (
          <section className="mode-page" aria-label={`${selectedMode.title} training mode`}>
            <button type="button" className="btn btn-ghost page-back" onClick={goHome}>
              ← Back to academy
            </button>
            <div className="mode-page-hero">
              <div className="mode-page-copy">
                <span className="eyebrow">{selectedMode.label}</span>
                <h1>{selectedMode.title}</h1>
                <p>{selectedMode.description}</p>
                <div className="mode-page-actions">
                  <button type="button" className="btn btn-primary large" onClick={() => { navigate('/'); document.querySelector('#courses')?.scrollIntoView({ behavior: 'smooth' }) }}>
                    Browse courses
                  </button>
                  <span className="mode-detail">{selectedMode.detail}</span>
                </div>
              </div>
              <div className="mode-page-image" style={{ backgroundImage: `linear-gradient(180deg, rgba(7,10,20,.05), rgba(7,10,20,.72)), url(${selectedMode.image})` }}>
                <span>BATTLEGROUNDS PROTOCOL</span>
              </div>
            </div>
            <div className="mode-page-grid">
              <div className="mode-module-panel">
                <span className="eyebrow">SESSION MAP</span>
                <h2>Your training sequence.</h2>
                <div className="mode-module-list">
                  {selectedMode.modules.map((module, index) => (
                    <div className="mode-module" key={module}>
                      <span>{String(index + 1).padStart(2, '0')}</span>
                      <strong>{module}</strong>
                      <i>↗</i>
                    </div>
                  ))}
                </div>
              </div>
              <aside className="mode-stat-panel">
                <span className="eyebrow">WHAT YOU BUILD</span>
                <strong>01</strong>
                <h3>A repeatable advantage.</h3>
                <p>Every session ends with one clear adjustment to carry into your next match.</p>
              </aside>
            </div>
          </section>
        ) : !selectedCourse && activePage === 'account' && user && !isAdmin ? (
          <section className="payment-page" aria-label="My account">
            <button type="button" className="btn btn-ghost page-back" onClick={goHome}>
              ← Back to store
            </button>
            <div className="payment-page-heading">
              <span className="eyebrow">MY ACCOUNT</span>
              <h1>Account overview.</h1>
              <p>Your profile, orders, and course access in one place.</p>
            </div>

            <div className="dashboard-summary">
              <div className="summary-card">
                <span>Name</span>
                <strong>{dashboardLoading ? 'Loading...' : dashboardData.name}</strong>
              </div>
              <div className="summary-card">
                <span>Email</span>
                <strong>{dashboardLoading ? 'Loading...' : dashboardData.email}</strong>
              </div>
              <div className="summary-card">
                <span>Orders</span>
                <strong>{dashboardLoading ? '...' : dashboardData.totalOrders}</strong>
              </div>
              <div className="summary-card">
                <span>Pending</span>
                <strong>{dashboardLoading ? '...' : dashboardData.pendingOrders}</strong>
              </div>
              <div className="summary-card">
                <span>Payment status</span>
                <strong>{dashboardLoading ? 'Loading...' : dashboardData.paymentStatus}</strong>
              </div>
            </div>

            <div className="dashboard-content">
              <div className="dashboard-panel">
                <h3>My Courses</h3>
                <ul className="course-access-list">
                  {dashboardData.myCourses.map((course) => (
                    <li key={course.id}>
                      <span>{course.title}</span>
                      <strong>Access granted</strong>
                    </li>
                  ))}
                  {!dashboardData.myCourses.length && (
                    <li className="empty-state">No active course access yet.</li>
                  )}
                </ul>
              </div>

              <div className="dashboard-panel">
                <h3>My Orders</h3>
                <ul className="course-access-list">
                  {dashboardData.orders.length ? (
                    dashboardData.orders.map((order) => (
                      <li key={order.id}>
                        <div className="user-order-details">
                          <span>{order.orderNumber} · R{order.totalAmount}</span>
                          <strong className={`order-status order-status-${order.status}`}>
                            {order.status.replaceAll('_', ' ')}
                          </strong>
                        </div>
                        {order.status !== 'paid' && order.status !== 'rejected' && (
                          <label className="proof-upload">
                            Upload proof
                            <input type="file" accept="image/*,.pdf" onChange={(event) => handleProofUpload(order.id, event.target.files?.[0])} />
                          </label>
                        )}
                      </li>
                    ))
                  ) : (
                    <li className="empty-state">No orders yet.</li>
                  )}
                </ul>
                {proofMessage && <p className="admin-message" role="status">{proofMessage}</p>}
              </div>
            </div>

            {dashboardData.lessons.length > 0 && (
              <div className="dashboard-panel lessons-panel">
                <h3>Learning area</h3>
                <div className="lesson-list">
                  {dashboardData.lessons.map((lesson, index) => (
                    <article className="lesson-item" key={lesson.id}>
                      <span className="lesson-number">{String(index + 1).padStart(2, '0')}</span>
                      <div>
                        <h4>{lesson.title}</h4>
                        <p>{lesson.description}</p>
                        {lesson.contentUrl && (
                          <button type="button" className="lesson-resource-button" onClick={() => handleOpenLessonResource(lesson.contentUrl as string)}>
                            Open lesson resource
                          </button>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </section>
        ) : !selectedCourse && activePage === 'learning' && user && !isAdmin ? (
          <section className="learning-page" aria-label="My learning">
            <button type="button" className="btn btn-ghost page-back" onClick={goHome}>
              ← Back to store
            </button>
            <div className="payment-page-heading">
              <span className="eyebrow">MY COURSES</span>
              <h1>Train with purpose.</h1>
              <p>These lessons are available because your payment has been approved.</p>
            </div>
            <div className="learning-course-list">
              {dashboardData.myCourses.length ? dashboardData.myCourses.map((course) => (
                <article className="learning-course-card" key={course.id}>
                  <span className="mini-label">ACCESS GRANTED</span>
                  <h2>{course.title}</h2>
                  <p>Work through the lessons below and keep building your competitive edge.</p>
                  <div className="lesson-list">
                    {dashboardData.lessons.filter((lesson) => lesson.productId === course.id).map((lesson, index) => (
                      <article className="lesson-item" key={lesson.id}>
                        <span className="lesson-number">{String(index + 1).padStart(2, '0')}</span>
                        <div>
                          <h4>{lesson.title}</h4>
                          <p>{lesson.description}</p>
                          {lesson.contentUrl && (
                            <button type="button" className="lesson-resource-button" onClick={() => handleOpenLessonResource(lesson.contentUrl as string)}>
                              Open lesson resource
                            </button>
                          )}
                        </div>
                      </article>
                    ))}
                    {!dashboardData.lessons.some((lesson) => lesson.productId === course.id) && (
                      <p className="empty-state">Your coach is preparing the first lessons.</p>
                    )}
                  </div>
                </article>
              )) : <div className="empty-learning-state"><h2>No approved courses yet.</h2><p>Once an admin approves your payment, your course will appear here.</p></div>}
            </div>
          </section>
        ) : !selectedCourse && activePage === 'payments' && user && !isAdmin ? (
          <section className="payment-page" aria-label="Payment center">
            <button type="button" className="btn btn-ghost page-back" onClick={goHome}>
              ← Back to store
            </button>
            <div className="payment-page-heading">
              <span className="eyebrow">PAYMENT CENTER</span>
              <h1>Finish your order.</h1>
              <p>Upload an EFT receipt for each order. Your course access is granted after admin approval.</p>
            </div>
            <div className="user-payment-panel">
              {dashboardData.orders.length ? dashboardData.orders.map((order) => (
                <div className="user-payment-order" key={order.id}>
                  <div className="user-order-details">
                    <strong>{order.orderNumber}</strong>
                    <span>R{order.totalAmount} · {order.status.replaceAll('_', ' ')}</span>
                  </div>
                  {order.status !== 'paid' && order.status !== 'rejected' ? (
                    <label className="proof-upload">
                      Upload proof
                      <input type="file" accept="image/*,.pdf" onChange={(event) => handleProofUpload(order.id, event.target.files?.[0])} />
                    </label>
                  ) : (
                    <strong className={`order-status order-status-${order.status}`}>
                      {order.status === 'paid' ? 'Approved' : 'Rejected'}
                    </strong>
                  )}
                </div>
              )) : <p className="empty-state">Place an order first to upload payment proof.</p>}
              {proofMessage && <p className="admin-message" role="status">{proofMessage}</p>}
            </div>
          </section>
        ) : selectedCourse ? (
          <section className="course-detail-page">
            <button
              type="button"
              className="btn btn-ghost course-back"
              onClick={closeCourse}
            >
              ← Back to courses
            </button>

            <div className="detail-hero">
              <div className="detail-copy">
                <span className="eyebrow">{selectedCourse.category}</span>
                <h1>{selectedCourse.title}</h1>
                <p>{selectedCourse.description}</p>

                <div className="detail-price-row">
                  <span className="price-tag">{selectedCourse.price}</span>
                  <span className="detail-level">{selectedCourse.level}</span>
                </div>

                <div className="detail-actions">
                  <button type="button" className="btn btn-primary large" onClick={() => addToCart(selectedCourse)}>
                    Add to cart
                  </button>
                  <button type="button" className="btn btn-ghost large" onClick={handlePurchase}>Buy now</button>
                  <button type="button" className="btn btn-ghost large">
                    Save for later
                  </button>
                </div>
                {purchaseMessage && <p className="purchase-message" role="status">{purchaseMessage}</p>}
              </div>

              <div className="detail-visual">
                <div className="detail-image" style={{ backgroundImage: `linear-gradient(180deg, rgba(7,10,20,.1), rgba(7,10,20,.72)), url(${selectedCourse.image})` }}>
                  <span className="detail-image-label">COURSE PREVIEW</span>
                </div>
                <div className="detail-card">
                  <span className="mini-label">Included</span>
                  <ul>
                    {selectedCourse.outcomes.map((outcome) => (
                      <li key={outcome}>{outcome}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="course-details-grid">
              <div className="detail-panel">
                <h2>What you’ll learn</h2>
                <ul>
                  {selectedCourse.outcomes.map((outcome) => (
                    <li key={outcome}>{outcome}</li>
                  ))}
                </ul>
              </div>

              <div className="detail-panel">
                <h2>Course overview</h2>
                <p>
                  This PUBG course gives you a clear structure, practical drills, and a
                  simple way to track your progress match after match.
                </p>
              </div>
            </div>
          </section>
        ) : null}
      </main>

      <Footer onGoHome={goHome} onGoCourses={goCourses} onGoAbout={goAbout} onGoFaq={goFaq} onGoLearning={goLearning} onGoPayments={goPayments} />

      {cartOpen && (
        <CartDrawer
          items={cartItems}
          message={cartMessage}
          total={cartTotal}
          onClose={() => setCartOpen(false)}
          onUpdateQuantity={updateCartQuantity}
          onCheckout={handleCartCheckout}
          onExploreCourses={() => { setCartOpen(false); document.querySelector('#courses')?.scrollIntoView({ behavior: 'smooth' }) }}
        />
      )}

      {authMode && (
        <AuthModal
          mode={authMode}
          email={authEmail}
          password={authPassword}
          message={authMessage}
          loading={authLoading}
          onEmailChange={setAuthEmail}
          onPasswordChange={setAuthPassword}
          onSubmit={handleAuthSubmit}
          onClose={() => setAuthMode(null)}
          onSwitch={() => openAuth(authMode === 'login' ? 'signup' : 'login')}
          onForgotPassword={() => openAuth('reset')}
        />
      )}
    </div>
  )
}

export default App
