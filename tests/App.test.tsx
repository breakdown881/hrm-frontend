import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import App from '../src/App'

function renderAt(path: string) {
  window.history.pushState({}, '', path)
  return render(<App />)
}

describe('HRM route navigation', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '/')
  })

  it('redirects the root route to the dashboard page by default', () => {
    renderAt('/')

    expect(screen.getByRole('heading', { name: /dashboard overview/i })).toBeInTheDocument()
    expect(window.location.pathname).toBe('/dashboard')
    expect(screen.getByRole('link', { name: /dashboard/i })).toHaveAttribute('aria-current', 'page')
  })

  it('switches to the employees route and supports the empty search state', async () => {
    const user = userEvent.setup()
    renderAt('/dashboard')

    await user.click(screen.getByRole('link', { name: /employees/i }))

    expect(window.location.pathname).toBe('/employees')
    expect(screen.getByRole('heading', { name: /employees directory/i })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /recruitment pipeline/i })).not.toBeInTheDocument()

    await user.type(screen.getByRole('searchbox', { name: /search employees/i }), 'not existing')

    expect(screen.getByRole('heading', { name: /no employees found/i })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /clear search/i }))
    expect(screen.getByText(/nguyen minh anh/i)).toBeInTheDocument()
  })

  it('opens payroll directly from the URL without showing employee table content', () => {
    renderAt('/payroll')

    expect(screen.getByRole('heading', { name: /payroll workspace/i })).toBeInTheDocument()
    expect(screen.getByText(/salary data is restricted by role/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /payroll/i })).toHaveAttribute('aria-current', 'page')
    expect(screen.queryByText(/nguyen minh anh/i)).not.toBeInTheDocument()
  })

  it('marks exactly one navigation link as the current route', async () => {
    const user = userEvent.setup()
    renderAt('/dashboard')

    await user.click(screen.getByRole('link', { name: /leave/i }))

    const navigation = screen.getByLabelText(/hrm navigation/i)
    const currentItems = within(navigation)
      .getAllByRole('link')
      .filter((link) => link.getAttribute('aria-current') === 'page')

    expect(window.location.pathname).toBe('/leave')
    expect(currentItems).toHaveLength(1)
    expect(currentItems[0]).toHaveTextContent(/leave/i)
  })

  it('hides restricted navigation links for employee role', async () => {
    const user = userEvent.setup()
    renderAt('/dashboard')

    await user.selectOptions(screen.getByRole('combobox', { name: /current role/i }), 'Employee')

    expect(screen.queryByRole('link', { name: /payroll/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /audit & security/i })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /leave/i })).toBeInTheDocument()
  })

  it('blocks payroll route for unauthorized roles and restores it for payroll finance', async () => {
    const user = userEvent.setup()
    renderAt('/payroll')

    expect(screen.getByRole('heading', { name: /payroll workspace/i })).toBeInTheDocument()

    await user.selectOptions(screen.getByRole('combobox', { name: /current role/i }), 'Employee')

    expect(screen.getByRole('heading', { name: /access denied/i })).toBeInTheDocument()
    expect(screen.getByText(/employee cannot access payroll/i)).toBeInTheDocument()

    await user.selectOptions(screen.getByRole('combobox', { name: /current role/i }), 'Payroll/Finance')

    expect(screen.getByRole('heading', { name: /payroll workspace/i })).toBeInTheDocument()
  })


  it('filters employees by department and employment status', async () => {
    const user = userEvent.setup()
    renderAt('/employees')

    await user.selectOptions(screen.getByRole('combobox', { name: /department filter/i }), 'Engineering')

    expect(screen.getByText(/tran quoc huy/i)).toBeInTheDocument()
    expect(screen.queryByText(/nguyen minh anh/i)).not.toBeInTheDocument()

    await user.selectOptions(screen.getByRole('combobox', { name: /department filter/i }), 'All departments')
    await user.selectOptions(screen.getByRole('combobox', { name: /status filter/i }), 'Probation')

    expect(screen.getByText(/le thu ha/i)).toBeInTheDocument()
    expect(screen.queryByText(/pham gia bao/i)).not.toBeInTheDocument()
  })

  it('adds a new employee from the directory form', async () => {
    const user = userEvent.setup()
    renderAt('/employees')

    await user.click(screen.getByRole('button', { name: /add employee/i }))
    await user.type(screen.getByRole('textbox', { name: /employee name/i }), 'Doan Lan Chi')
    await user.type(screen.getByRole('textbox', { name: /job title/i }), 'QA Engineer')
    await user.selectOptions(screen.getByRole('combobox', { name: /^department$/i }), 'Engineering')
    await user.type(screen.getByRole('textbox', { name: /manager/i }), 'CTO')
    await user.click(screen.getByRole('button', { name: /save employee/i }))

    expect(screen.getByRole('status')).toHaveTextContent(/employee created/i)
    expect(screen.getByText(/doan lan chi/i)).toBeInTheDocument()
    expect(screen.getByText(/emp-053/i)).toBeInTheDocument()
  })

})
