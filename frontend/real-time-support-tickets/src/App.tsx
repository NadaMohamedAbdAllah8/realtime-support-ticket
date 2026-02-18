import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

type SupportTicketPayload = {
  customer_name: string
  subject: string
  message: string
}

type LoginPayload = {
  email: string
  password: string
}

type SupportTicket = {
  id: number
  customer_name: string
  subject: string
  message: string
  status: string
  created_at: string
}

type ApiErrorResponse = {
  message?: string
  errors?: Partial<Record<keyof SupportTicketPayload, string[]>>
}

type LoginErrorResponse = {
  message?: string
  errors?: Partial<Record<keyof LoginPayload, string[]>>
}

type LoginSuccessResponse = {
  item: {
    token: string
    admin: {
      name: string
    }
  }
}

type TicketsResponse = {
  current_page: number
  data: SupportTicket[]
  last_page: number
  per_page: number
  total: number
}

type ViewMode = 'support' | 'admin-login' | 'admin-tickets'
type TicketCreatedEvent = {
  ticketId: number
  subject: string
}

type ToastItem = {
  id: number
  title: string
  message: string
}

const initialForm: SupportTicketPayload = {
  customer_name: '',
  subject: '',
  message: '',
}

const initialLoginForm: LoginPayload = {
  email: '',
  password: '',
}

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('support')

  const [form, setForm] = useState<SupportTicketPayload>(initialForm)
  const [errors, setErrors] = useState<Partial<Record<keyof SupportTicketPayload, string>>>({})
  const [notice, setNotice] = useState<string>('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [loginForm, setLoginForm] = useState<LoginPayload>(initialLoginForm)
  const [loginErrors, setLoginErrors] = useState<Partial<Record<keyof LoginPayload, string>>>({})
  const [loginNotice, setLoginNotice] = useState('')
  const [isLoginSubmitting, setIsLoginSubmitting] = useState(false)

  const [adminToken, setAdminToken] = useState(() => localStorage.getItem('admin_api_token') ?? '')
  const [adminName, setAdminName] = useState(() => localStorage.getItem('admin_name') ?? '')
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [ticketsTotal, setTicketsTotal] = useState(0)
  const [ticketsPage, setTicketsPage] = useState(1)
  const [ticketsLastPage, setTicketsLastPage] = useState(1)
  const [ticketsNotice, setTicketsNotice] = useState('')
  const [isTicketsLoading, setIsTicketsLoading] = useState(false)
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const toastIdRef = useRef(0)

  const apiBaseUrl = useMemo(
    () => import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? 'http://localhost:8081/api',
    [],
  )
  const apiOrigin = useMemo(() => apiBaseUrl.replace(/\/api$/, ''), [apiBaseUrl])
  const reverbKey = import.meta.env.VITE_REVERB_APP_KEY as string | undefined
  const reverbHost = import.meta.env.VITE_REVERB_HOST ?? 'localhost'
  const reverbPort = Number(import.meta.env.VITE_REVERB_PORT ?? 8080)
  const reverbScheme = import.meta.env.VITE_REVERB_SCHEME ?? 'http'

  const handleChange = (field: keyof SupportTicketPayload, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
    setNotice('')
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setNotice('')
    setIsSuccess(false)
    setErrors({})

    try {
      const response = await fetch(`${apiBaseUrl}/support-tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(form),
      })

      if (!response.ok) {
        const errorResponse = (await response.json()) as ApiErrorResponse
        const mappedErrors: Partial<Record<keyof SupportTicketPayload, string>> = {}

        if (errorResponse.errors) {
          for (const [field, messages] of Object.entries(errorResponse.errors) as [
            keyof SupportTicketPayload,
            string[] | undefined,
          ][]) {
            if (messages?.length) {
              mappedErrors[field] = messages[0]
            }
          }
        }

        setErrors(mappedErrors)
        setNotice(errorResponse.message ?? 'Failed to submit support ticket. Please try again.')
        return
      }

      setForm(initialForm)
      setIsSuccess(true)
      setNotice('Support ticket submitted successfully. Our team will contact you soon.')
    } catch {
      setNotice('Could not reach the API. Check your backend URL and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const fetchAdminTickets = async (token: string, page = 1) => {
    setIsTicketsLoading(true)
    setTicketsNotice('')

    try {
      const response = await fetch(`${apiBaseUrl}/admin/support-tickets?page=${page}`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('admin_api_token')
          localStorage.removeItem('admin_name')
          setAdminToken('')
          setAdminName('')
          setTickets([])
          setTicketsTotal(0)
          setTicketsPage(1)
          setTicketsLastPage(1)
          setViewMode('admin-login')
          setTicketsNotice('Your session has expired. Please log in again.')
          return
        }

        setTicketsNotice('Failed to load tickets. Please try again.')
        return
      }

      const data = (await response.json()) as TicketsResponse
      setTickets(data.data ?? [])
      setTicketsTotal(data.total ?? 0)
      setTicketsPage(data.current_page ?? page)
      setTicketsLastPage(data.last_page ?? 1)
      setViewMode('admin-tickets')
    } catch {
      setTicketsNotice('Could not reach the API. Check your backend URL and try again.')
    } finally {
      setIsTicketsLoading(false)
    }
  }

  const handleAdminLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoginSubmitting(true)
    setLoginNotice('')
    setLoginErrors({})

    try {
      const response = await fetch(`${apiBaseUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(loginForm),
      })

      if (!response.ok) {
        const errorResponse = (await response.json()) as LoginErrorResponse
        const mappedErrors: Partial<Record<keyof LoginPayload, string>> = {}

        if (errorResponse.errors?.email?.length) {
          mappedErrors.email = errorResponse.errors.email[0]
        }

        if (errorResponse.errors?.password?.length) {
          mappedErrors.password = errorResponse.errors.password[0]
        }

        setLoginErrors(mappedErrors)
        setLoginNotice(errorResponse.message ?? 'Login failed. Please check your credentials.')
        return
      }

      const loginResponse = (await response.json()) as LoginSuccessResponse
      const token = loginResponse.item.token
      const name = loginResponse.item.admin.name

      localStorage.setItem('admin_api_token', token)
      localStorage.setItem('admin_name', name)
      setAdminToken(token)
      setAdminName(name)
      setLoginForm(initialLoginForm)

      await fetchAdminTickets(token, 1)
    } catch {
      setLoginNotice('Could not reach the API. Check your backend URL and try again.')
    } finally {
      setIsLoginSubmitting(false)
    }
  }

  const handleAdminLogout = () => {
    localStorage.removeItem('admin_api_token')
    localStorage.removeItem('admin_name')
    setAdminToken('')
    setAdminName('')
    setTickets([])
    setTicketsTotal(0)
    setTicketsPage(1)
    setTicketsLastPage(1)
    setTicketsNotice('')
    setViewMode('support')
  }

  const showToast = (title: string, message: string) => {
    const id = ++toastIdRef.current
    setToasts((prev) => [...prev, { id, title, message }])

    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 5000)
  }

  useEffect(() => {
    if (!adminToken) {
      return
    }

    setViewMode('admin-tickets')
    void fetchAdminTickets(adminToken, 1)
  }, [adminToken])

  useEffect(() => {
    if (viewMode !== 'admin-tickets' || !adminToken || !reverbKey) {
      return
    }

    let isCancelled = false
    let cleanup: (() => void) | undefined

    void (async () => {
      const [{ default: Echo }, { default: Pusher }] = await Promise.all([
        import('laravel-echo'),
        import('pusher-js'),
      ])

      if (isCancelled) {
        return
      }

      ;(window as Window & { Pusher?: unknown }).Pusher = Pusher

      const echo = new Echo({
        broadcaster: 'reverb',
        key: reverbKey,
        wsHost: reverbHost,
        wsPort: reverbPort,
        wssPort: reverbPort,
        forceTLS: reverbScheme === 'https',
        enabledTransports: ['ws', 'wss'],
        authEndpoint: `${apiOrigin}/broadcasting/auth`,
        auth: {
          headers: {
            Authorization: `Bearer ${adminToken}`,
            Accept: 'application/json',
          },
        },
      })

      echo.private('admin.inbox').listen('.ticket.created', (event: TicketCreatedEvent) => {
        showToast('New Ticket', `#${event.ticketId} ${event.subject}`)
        void fetchAdminTickets(adminToken, 1)
      })

      cleanup = () => {
        echo.leave('admin.inbox')
        echo.disconnect()
      }
    })()

    return () => {
      isCancelled = true
      cleanup?.()
    }
  }, [adminToken, apiOrigin, reverbHost, reverbKey, reverbPort, reverbScheme, viewMode])

  if (viewMode === 'admin-login') {
    return (
      <main className="page">
        <section className="ticket-panel" aria-labelledby="admin-login-title">
          <div className="page-head">
            <button className="secondary-button" type="button" onClick={() => setViewMode('support')}>
              Back
            </button>
          </div>

          <h1 id="admin-login-title">Admin Login</h1>
          <p className="panel-subtitle">Sign in to view support tickets.</p>

          <form className="ticket-form" onSubmit={handleAdminLogin} noValidate>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={loginForm.email}
              onChange={(event) => setLoginForm((prev) => ({ ...prev, email: event.target.value }))}
              required
            />
            {loginErrors.email && <p className="field-error">{loginErrors.email}</p>}

            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={loginForm.password}
              onChange={(event) => setLoginForm((prev) => ({ ...prev, password: event.target.value }))}
              required
            />
            {loginErrors.password && <p className="field-error">{loginErrors.password}</p>}

            <button type="submit" disabled={isLoginSubmitting}>
              {isLoginSubmitting ? 'Logging in...' : 'Login'}
            </button>

            {loginNotice && (
              <p className="notice notice-error" role="status" aria-live="polite">
                {loginNotice}
              </p>
            )}
          </form>
        </section>
      </main>
    )
  }

  if (viewMode === 'admin-tickets') {
    return (
      <main className="page">
        <div className="toast-wrap" aria-live="polite" aria-atomic="true">
          {toasts.map((toast) => (
            <div key={toast.id} className="toast-item">
              <strong>{toast.title}</strong>
              <span>{toast.message}</span>
            </div>
          ))}
        </div>

        <section className="ticket-panel ticket-panel-wide" aria-labelledby="tickets-title">
          <div className="page-head">
            <button className="secondary-button" type="button" onClick={() => setViewMode('support')}>
              Back to Support Page
            </button>
            <button className="secondary-button" type="button" onClick={handleAdminLogout}>
              Logout
            </button>
          </div>

          <h1 id="tickets-title">Support Tickets</h1>
          <p className="panel-subtitle">Logged in as {adminName || 'Admin'}.</p>

          <div className="tickets-meta">
            <span>Total: {ticketsTotal}</span>
            <button className="secondary-button" type="button" onClick={() => void fetchAdminTickets(adminToken, ticketsPage)} disabled={isTicketsLoading}>
              {isTicketsLoading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          {ticketsNotice && (
            <p className="notice notice-error" role="status" aria-live="polite">
              {ticketsNotice}
            </p>
          )}

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                {tickets.length === 0 && (
                  <tr>
                    <td className="empty-cell" colSpan={5}>
                      No tickets found.
                    </td>
                  </tr>
                )}

                {tickets.map((ticket) => (
                  <tr key={ticket.id}>
                    <td>{ticket.id}</td>
                    <td>{ticket.customer_name}</td>
                    <td>{ticket.subject}</td>
                    <td>{ticket.status}</td>
                    <td>{new Date(ticket.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination-row">
            <button
              className="secondary-button"
              type="button"
              disabled={isTicketsLoading || ticketsPage <= 1}
              onClick={() => void fetchAdminTickets(adminToken, ticketsPage - 1)}
            >
              Previous
            </button>
            <span>
              Page {ticketsPage} of {ticketsLastPage}
            </span>
            <button
              className="secondary-button"
              type="button"
              disabled={isTicketsLoading || ticketsPage >= ticketsLastPage}
              onClick={() => void fetchAdminTickets(adminToken, ticketsPage + 1)}
            >
              Next
            </button>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="page">
      <section className="ticket-panel" aria-labelledby="ticket-form-title">
        <div className="page-head">
          <button className="secondary-button" type="button" onClick={() => setViewMode('admin-login')}>
            Login as Admin
          </button>
        </div>

        <h1 id="ticket-form-title">Submit a Support Ticket</h1>
        <p className="panel-subtitle">Tell us what happened and we will get back to you.</p>

        <form className="ticket-form" onSubmit={handleSubmit} noValidate>
          <label htmlFor="customer_name">Your Name</label>
          <input
            id="customer_name"
            name="customer_name"
            type="text"
            value={form.customer_name}
            onChange={(event) => handleChange('customer_name', event.target.value)}
            maxLength={255}
            required
          />
          {errors.customer_name && <p className="field-error">{errors.customer_name}</p>}

          <label htmlFor="subject">Subject</label>
          <input
            id="subject"
            name="subject"
            type="text"
            value={form.subject}
            onChange={(event) => handleChange('subject', event.target.value)}
            maxLength={255}
            required
          />
          {errors.subject && <p className="field-error">{errors.subject}</p>}

          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            name="message"
            value={form.message}
            onChange={(event) => handleChange('message', event.target.value)}
            rows={6}
            required
          />
          {errors.message && <p className="field-error">{errors.message}</p>}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
          </button>

          {notice && (
            <p className={isSuccess ? 'notice notice-success' : 'notice notice-error'} role="status" aria-live="polite">
              {notice}
            </p>
          )}
        </form>
      </section>
    </main>
  )
}

export default App
