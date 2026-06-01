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


  it('opens organization management and adds a department', async () => {
    const user = userEvent.setup()
    renderAt('/organization')

    expect(screen.getByRole('heading', { name: /organization management/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /departments/i })).toBeInTheDocument()
    expect(screen.getByText(/engineering/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /add department/i }))
    await user.type(screen.getByRole('textbox', { name: /department name/i }), 'Customer Success')
    await user.selectOptions(screen.getByRole('combobox', { name: /department manager/i }), 'Pham Gia Bao')
    await user.click(screen.getByRole('button', { name: /save department/i }))

    expect(screen.getByRole('status')).toHaveTextContent(/department created/i)
    expect(screen.getByText(/customer success/i)).toBeInTheDocument()
    expect(screen.getByText(/dep-005/i)).toBeInTheDocument()
  })


  it('opens settings master data and adds a leave type', async () => {
    const user = userEvent.setup()
    renderAt('/settings')

    expect(screen.getByRole('heading', { name: /settings & master data/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /leave types/i })).toBeInTheDocument()
    expect(screen.getByText(/annual leave/i)).toBeInTheDocument()
    expect(screen.getByText(/probation contract/i)).toBeInTheDocument()
    expect(screen.getByText(/company holiday/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /add leave type/i }))
    await user.type(screen.getByRole('textbox', { name: /leave type name/i }), 'Marriage Leave')
    await user.type(screen.getByRole('spinbutton', { name: /default days/i }), '3')
    await user.click(screen.getByRole('button', { name: /save leave type/i }))

    expect(screen.getByRole('status')).toHaveTextContent(/leave type created/i)
    expect(screen.getByText(/marriage leave/i)).toBeInTheDocument()
    expect(screen.getByText(/3 days/i)).toBeInTheDocument()
  })

  it('opens leave management, submits a request, and approves a pending request', async () => {
    const user = userEvent.setup()
    renderAt('/leave')

    expect(screen.getByRole('heading', { name: /leave management/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /remaining balances/i })).toBeInTheDocument()
    expect(screen.getAllByText(/tran quoc huy/i).length).toBeGreaterThan(0)

    await user.click(screen.getByRole('button', { name: /add leave request/i }))
    await user.selectOptions(screen.getByRole('combobox', { name: /^employee$/i }), 'Le Thu Ha')
    await user.selectOptions(screen.getByRole('combobox', { name: /leave type/i }), 'Sick Leave')
    await user.type(screen.getByRole('textbox', { name: /date range/i }), '2026-06-10 to 2026-06-11')
    await user.type(screen.getByRole('spinbutton', { name: /^days$/i }), '2')
    await user.click(screen.getByRole('button', { name: /submit leave request/i }))

    expect(screen.getByRole('status')).toHaveTextContent(/leave request submitted/i)
    expect(screen.getByText(/2026-06-10 to 2026-06-11/i)).toBeInTheDocument()
    expect(screen.getAllByText(/^pending$/i)).toHaveLength(3)

    await user.click(screen.getByRole('button', { name: /approve tran quoc huy leave request/i }))

    expect(screen.getByRole('status')).toHaveTextContent(/leave request approved/i)
    expect(screen.getByText(/approved by admin/i)).toBeInTheDocument()
  })

  it('opens attendance management and records a daily timesheet entry', async () => {
    const user = userEvent.setup()
    renderAt('/attendance')

    expect(screen.getByRole('heading', { name: /attendance management/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /company timesheet/i })).toBeInTheDocument()
    expect(screen.getByText(/standard working hours/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /add attendance record/i }))
    await user.selectOptions(screen.getByRole('combobox', { name: /^employee$/i }), 'Le Thu Ha')
    await user.type(screen.getByRole('textbox', { name: /^work date$/i }), '2026-06-02')
    await user.type(screen.getByRole('textbox', { name: /check-in/i }), '08:45')
    await user.type(screen.getByRole('textbox', { name: /check-out/i }), '17:35')
    await user.selectOptions(screen.getByRole('combobox', { name: /^status$/i }), 'On time')
    await user.click(screen.getByRole('button', { name: /save attendance record/i }))

    expect(screen.getByRole('status')).toHaveTextContent(/attendance record created/i)
    expect(screen.getByText(/2026-06-02/i)).toBeInTheDocument()
    expect(screen.getAllByText(/le thu ha/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/^on time$/i).length).toBeGreaterThan(0)
  })

  it('opens contract management and creates an expiring employee contract', async () => {
    const user = userEvent.setup()
    renderAt('/contracts')

    expect(screen.getByRole('heading', { name: /contract management/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /contract registry/i })).toBeInTheDocument()
    expect(screen.getAllByText(/expiring soon/i).length).toBeGreaterThan(0)

    await user.click(screen.getByRole('button', { name: /add contract/i }))
    await user.selectOptions(screen.getByRole('combobox', { name: /^employee$/i }), 'Le Thu Ha')
    await user.selectOptions(screen.getByRole('combobox', { name: /contract type/i }), 'Fixed-term Contract')
    await user.type(screen.getByRole('textbox', { name: /start date/i }), '2026-06-01')
    await user.type(screen.getByRole('textbox', { name: /end date/i }), '2026-11-30')
    await user.selectOptions(screen.getByRole('combobox', { name: /^status$/i }), 'Expiring soon')
    await user.click(screen.getByRole('button', { name: /save contract/i }))

    expect(screen.getByRole('status')).toHaveTextContent(/contract created/i)
    expect(screen.getAllByText(/le thu ha/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/2026-11-30/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/^expiring soon$/i).length).toBeGreaterThan(0)
  })

  it('opens notifications and marks an onboarding task notification as read', async () => {
    const user = userEvent.setup()
    renderAt('/notifications')

    expect(screen.getByRole('heading', { name: /notifications/i })).toBeInTheDocument()
    expect(screen.getAllByText(/contract expiring soon/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/onboarding task assigned/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/unread notifications/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /mark onboarding task assigned as read/i }))

    expect(screen.getByRole('status')).toHaveTextContent(/notification marked as read/i)
    const onboardingNotification = screen
      .getAllByText(/onboarding task assigned/i)
      .find((element) => element.closest('article'))
    expect(onboardingNotification?.closest('article')).toHaveTextContent(/read/i)
  })

})
