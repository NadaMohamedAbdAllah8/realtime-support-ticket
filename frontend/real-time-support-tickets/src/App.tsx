import { FormEvent, useMemo, useState } from 'react'
import './App.css'

type SupportTicketPayload = {
  customer_name: string
  subject: string
  message: string
}

type ApiErrorResponse = {
  message?: string
  errors?: Partial<Record<keyof SupportTicketPayload, string[]>>
}

const initialForm: SupportTicketPayload = {
  customer_name: '',
  subject: '',
  message: '',
}

function App() {
  const [form, setForm] = useState<SupportTicketPayload>(initialForm)
  const [errors, setErrors] = useState<Partial<Record<keyof SupportTicketPayload, string>>>({})
  const [notice, setNotice] = useState<string>('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const apiBaseUrl = useMemo(
    () => import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? 'http://localhost:8000/api',
    [],
  )

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

  return (
    <main className="page">
      <section className="ticket-panel" aria-labelledby="ticket-form-title">
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
