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
    expect(screen.queryByRole('heading', { name: /employees directory/i })).not.toBeInTheDocument()
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

  it('supports basic authentication login, logout, and password change', async () => {
    const user = userEvent.setup()
    renderAt('/login')

    expect(screen.getByRole('heading', { name: /authentication/i })).toBeInTheDocument()

    await user.type(screen.getByRole('textbox', { name: /^email$/i }), 'hr@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'secret123')
    await user.selectOptions(screen.getByRole('combobox', { name: /sign in role/i }), 'HR')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(window.location.pathname).toBe('/dashboard')
    expect(screen.getByRole('status')).toHaveTextContent(/signed in as hr@example.com/i)
    expect(screen.getByRole('combobox', { name: /current role/i })).toHaveValue('HR')

    await user.click(screen.getByRole('button', { name: /sign out/i }))

    expect(window.location.pathname).toBe('/login')
    expect(screen.getByRole('heading', { name: /authentication/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /change password/i }))
    await user.type(screen.getByLabelText(/current password/i), 'secret123')
    await user.type(screen.getByLabelText(/new password/i), 'newSecret123')
    await user.click(screen.getByRole('button', { name: /save password/i }))

    expect(screen.getByRole('status')).toHaveTextContent(/password changed/i)
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

  it('views and edits an employee profile from the directory', async () => {
    const user = userEvent.setup()
    renderAt('/employees')

    await user.click(screen.getByRole('button', { name: /view nguyen minh anh details/i }))

    expect(screen.getByRole('heading', { name: /employee detail/i })).toBeInTheDocument()
    const detailPanel = screen.getByLabelText(/employee detail panel/i)
    expect(within(detailPanel).getByText(/hr manager/i)).toBeInTheDocument()
    expect(within(detailPanel).getByText(/people ops/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /edit nguyen minh anh/i }))
    await user.clear(screen.getByRole('textbox', { name: /job title/i }))
    await user.type(screen.getByRole('textbox', { name: /job title/i }), 'People Operations Lead')
    await user.selectOptions(screen.getByRole('combobox', { name: /employment status/i }), 'Official')
    await user.click(screen.getByRole('button', { name: /save employee changes/i }))

    expect(screen.getByRole('status')).toHaveTextContent(/employee updated/i)
    expect(within(detailPanel).getByText(/people operations lead/i)).toBeInTheDocument()
  })

  it('manages personal details, work details, and emergency contact in the employee profile', async () => {
    const user = userEvent.setup()
    renderAt('/employees')

    await user.click(screen.getByRole('button', { name: /view nguyen minh anh details/i }))

    const detailPanel = screen.getByLabelText(/employee detail panel/i)
    expect(within(detailPanel).getByRole('heading', { name: /personal information/i })).toBeInTheDocument()
    expect(within(detailPanel).getByText(/minh\.anh@example\.com/i)).toBeInTheDocument()
    expect(within(detailPanel).getByText(/0901000001/i)).toBeInTheDocument()
    expect(within(detailPanel).getByRole('heading', { name: /work information/i })).toBeInTheDocument()
    expect(within(detailPanel).getByText(/2022-03-15/i)).toBeInTheDocument()
    expect(within(detailPanel).getByText(/full-time/i)).toBeInTheDocument()
    expect(within(detailPanel).getByRole('heading', { name: /emergency contact/i })).toBeInTheDocument()
    expect(within(detailPanel).getByText(/tran minh quan - 0902000001/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /edit nguyen minh anh/i }))
    await user.clear(screen.getByRole('textbox', { name: /phone number/i }))
    await user.type(screen.getByRole('textbox', { name: /phone number/i }), '0911222333')
    await user.clear(screen.getByRole('textbox', { name: /emergency contact/i }))
    await user.type(screen.getByRole('textbox', { name: /emergency contact/i }), 'Nguyen Van Nam - 0988123456')
    await user.click(screen.getByRole('button', { name: /save employee changes/i }))

    expect(screen.getByRole('status')).toHaveTextContent(/employee updated/i)
    expect(within(detailPanel).getByText(/0911222333/i)).toBeInTheDocument()
    expect(within(detailPanel).getByText(/nguyen van nam - 0988123456/i)).toBeInTheDocument()
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

  it('configures working calendar hours and adds a company holiday', async () => {
    const user = userEvent.setup()
    renderAt('/settings')

    expect(screen.getByRole('heading', { name: /working calendar/i })).toBeInTheDocument()
    expect(screen.getByText(/monday - friday/i)).toBeInTheDocument()
    expect(screen.getByText(/09:00 - 18:00/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /configure work calendar/i }))
    await user.clear(screen.getByRole('textbox', { name: /workdays/i }))
    await user.type(screen.getByRole('textbox', { name: /workdays/i }), 'Monday - Saturday')
    await user.clear(screen.getByRole('textbox', { name: /standard working hours/i }))
    await user.type(screen.getByRole('textbox', { name: /standard working hours/i }), '08:30 - 17:30')
    await user.click(screen.getByRole('button', { name: /save work calendar/i }))

    expect(screen.getByRole('status')).toHaveTextContent(/work calendar updated/i)
    expect(screen.getByText(/monday - saturday/i)).toBeInTheDocument()
    expect(screen.getByText(/08:30 - 17:30/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /add holiday/i }))
    await user.type(screen.getByRole('textbox', { name: /holiday name/i }), 'Liberation Day')
    await user.type(screen.getByLabelText(/holiday date/i), '2026-04-30')
    await user.click(screen.getByRole('button', { name: /save holiday/i }))

    expect(screen.getByRole('status')).toHaveTextContent(/holiday created/i)
    expect(screen.getByText(/liberation day/i)).toBeInTheDocument()
    expect(screen.getByText(/hol-003/i)).toBeInTheDocument()
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

  it('opens request approvals and rejects a timesheet adjustment with a note', async () => {
    const user = userEvent.setup()
    renderAt('/approvals')

    expect(screen.getByRole('heading', { name: /request & approval workflow/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /pending requests/i })).toBeInTheDocument()
    expect(screen.getAllByText(/timesheet adjustment/i).length).toBeGreaterThan(0)

    await user.type(screen.getByRole('textbox', { name: /decision note/i }), 'Missing manager confirmation')
    await user.click(screen.getByRole('button', { name: /reject le thu ha timesheet adjustment/i }))

    expect(screen.getByRole('status')).toHaveTextContent(/request rejected/i)
    expect(screen.getByText(/missing manager confirmation/i)).toBeInTheDocument()
    expect(screen.getAllByText(/rejected by admin/i).length).toBeGreaterThan(0)
  })

  it('opens recruitment management and creates a job opening with a candidate', async () => {
    const user = userEvent.setup()
    renderAt('/recruitment')

    expect(screen.getByRole('heading', { name: /recruitment management/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /job openings/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /candidate pipeline/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /add job opening/i }))
    await user.type(screen.getByRole('textbox', { name: /job title/i }), 'Data Analyst')
    await user.selectOptions(screen.getByRole('combobox', { name: /^department$/i }), 'Finance')
    await user.selectOptions(screen.getByRole('combobox', { name: /opening status/i }), 'Active')
    await user.click(screen.getByRole('button', { name: /save job opening/i }))

    expect(screen.getByRole('status')).toHaveTextContent(/job opening created/i)
    expect(screen.getByText(/data analyst/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /add candidate/i }))
    await user.type(screen.getByRole('textbox', { name: /candidate name/i }), 'Mai Anh Duong')
    await user.type(screen.getByRole('textbox', { name: /^email$/i }), 'mai.anh@example.com')
    await user.type(screen.getByRole('textbox', { name: /phone/i }), '0909000111')
    await user.selectOptions(screen.getByRole('combobox', { name: /position applied/i }), 'Data Analyst')
    await user.selectOptions(screen.getByRole('combobox', { name: /candidate source/i }), 'Referral')
    await user.selectOptions(screen.getByRole('combobox', { name: /application status/i }), 'Screening')
    await user.click(screen.getByRole('button', { name: /save candidate/i }))

    expect(screen.getByRole('status')).toHaveTextContent(/candidate created/i)
    expect(screen.getByText(/mai anh duong/i)).toBeInTheDocument()
    expect(screen.getAllByText(/^screening$/i).length).toBeGreaterThan(0)
  })

  it('converts a hired candidate into an employee profile', async () => {
    const user = userEvent.setup()
    renderAt('/recruitment')

    await user.click(screen.getByRole('button', { name: /add candidate/i }))
    await user.type(screen.getByRole('textbox', { name: /candidate name/i }), 'Linh Pham')
    await user.type(screen.getByRole('textbox', { name: /^email$/i }), 'linh.pham@example.com')
    await user.type(screen.getByRole('textbox', { name: /phone/i }), '0909000222')
    await user.selectOptions(screen.getByRole('combobox', { name: /position applied/i }), 'Frontend Engineer')
    await user.selectOptions(screen.getByRole('combobox', { name: /candidate source/i }), 'Career site')
    await user.selectOptions(screen.getByRole('combobox', { name: /application status/i }), 'Hired')
    await user.click(screen.getByRole('button', { name: /save candidate/i }))

    expect(screen.getByRole('status')).toHaveTextContent(/candidate created/i)

    await user.click(screen.getByRole('button', { name: /convert linh pham to employee/i }))

    expect(screen.getByRole('status')).toHaveTextContent(/candidate converted to employee/i)
    expect(screen.getByRole('heading', { name: /converted employees/i })).toBeInTheDocument()
    expect(screen.getByText(/emp-can-003/i)).toBeInTheDocument()
    expect(screen.getAllByText(/linh.pham@example.com/i).length).toBeGreaterThan(0)
  })

  it('opens onboarding management and completes a new hire task', async () => {
    const user = userEvent.setup()
    renderAt('/onboarding')

    expect(screen.getByRole('heading', { name: /onboarding management/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /new hire checklist/i })).toBeInTheDocument()
    expect(screen.getByText(/complete employee profile/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /add onboarding task/i }))
    await user.type(screen.getByRole('textbox', { name: /task name/i }), 'Prepare welcome kit')
    await user.selectOptions(screen.getByRole('combobox', { name: /new hire/i }), 'Le Thu Ha')
    await user.selectOptions(screen.getByRole('combobox', { name: /task owner/i }), 'Nguyen Minh Anh')
    await user.click(screen.getByRole('button', { name: /save onboarding task/i }))

    expect(screen.getByRole('status')).toHaveTextContent(/onboarding task created/i)
    expect(screen.getByText(/prepare welcome kit/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /complete prepare welcome kit/i }))

    expect(screen.getByRole('status')).toHaveTextContent(/onboarding task completed/i)
    expect(screen.getByText(/prepare welcome kit/i).closest('article')).toHaveTextContent(/completed/i)
  })

  it('opens performance management and creates a review record', async () => {
    const user = userEvent.setup()
    renderAt('/performance')

    expect(screen.getByRole('heading', { name: /performance management/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /review cycles/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /evaluation history/i })).toBeInTheDocument()
    expect(screen.getAllByText(/q2 2026 performance review/i).length).toBeGreaterThan(0)

    await user.click(screen.getByRole('button', { name: /add review record/i }))
    await user.type(screen.getByRole('textbox', { name: /review cycle/i }), 'Q3 2026 Performance Review')
    await user.selectOptions(screen.getByRole('combobox', { name: /^employee$/i }), 'Le Thu Ha')
    await user.type(screen.getByRole('spinbutton', { name: /self review score/i }), '4')
    await user.type(screen.getByRole('spinbutton', { name: /manager review score/i }), '5')
    await user.type(screen.getByRole('textbox', { name: /manager comment/i }), 'Strong ownership on payroll handover')
    await user.click(screen.getByRole('button', { name: /save review record/i }))

    expect(screen.getByRole('status')).toHaveTextContent(/review record created/i)
    expect(screen.getAllByText(/q3 2026 performance review/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/le thu ha/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/strong ownership on payroll handover/i)).toBeInTheDocument()
  })

  it('opens reports analytics, generates a filtered report, and exports it', async () => {
    const user = userEvent.setup()
    renderAt('/reports')

    expect(screen.getByRole('heading', { name: /reports & analytics/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /report builder/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /report preview/i })).toBeInTheDocument()
    expect(screen.getAllByText(/headcount by department/i).length).toBeGreaterThan(0)

    await user.selectOptions(screen.getByRole('combobox', { name: /department filter/i }), 'Engineering')
    await user.click(screen.getByRole('button', { name: /generate report/i }))

    expect(screen.getByRole('status')).toHaveTextContent(/report generated/i)
    expect(screen.getAllByText(/engineering/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/1 employees/i).length).toBeGreaterThan(0)

    await user.click(screen.getByRole('button', { name: /export current report/i }))

    expect(screen.getByRole('status')).toHaveTextContent(/report export prepared/i)
  })

  it('opens payroll management, creates a payroll run, and locks the cycle', async () => {
    const user = userEvent.setup()
    renderAt('/payroll')

    expect(screen.getByRole('heading', { name: /payroll workspace/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /monthly payroll/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /payslip preview/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /add payroll run/i }))
    await user.type(screen.getByRole('textbox', { name: /payroll month/i }), '2026-06')
    await user.selectOptions(screen.getByRole('combobox', { name: /^employee$/i }), 'Le Thu Ha')
    await user.type(screen.getByRole('spinbutton', { name: /basic salary/i }), '20000000')
    await user.type(screen.getByRole('spinbutton', { name: /working days/i }), '22')
    await user.type(screen.getByRole('spinbutton', { name: /unpaid leave days/i }), '1')
    await user.type(screen.getByRole('spinbutton', { name: /allowances/i }), '1500000')
    await user.type(screen.getByRole('spinbutton', { name: /deductions/i }), '500000')
    await user.click(screen.getByRole('button', { name: /save payroll run/i }))

    expect(screen.getByRole('status')).toHaveTextContent(/payroll run created/i)
    expect(screen.getAllByText(/le thu ha/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/2026-06/i)).toBeInTheDocument()
    expect(screen.getAllByText(/20,090,909 vnd/i).length).toBeGreaterThan(0)

    await user.click(screen.getByRole('button', { name: /lock le thu ha 2026-06 payroll run/i }))

    expect(screen.getByRole('status')).toHaveTextContent(/payroll cycle locked/i)
    expect(screen.getByText(/2026-06/i).closest('article')).toHaveTextContent(/locked/i)
  })

  it('opens audit security, filters audit logs, and records a sensitive action', async () => {
    const user = userEvent.setup()
    renderAt('/audit')

    expect(screen.getByRole('heading', { name: /audit log & security/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /^audit log$/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /security controls/i })).toBeInTheDocument()
    expect(screen.getAllByText(/payroll locked/i).length).toBeGreaterThan(0)

    await user.selectOptions(screen.getByRole('combobox', { name: /module filter/i }), 'Payroll')

    expect(screen.getAllByText(/payroll/i).length).toBeGreaterThan(0)
    expect(screen.queryByText(/employee profile updated/i)).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /record sensitive action/i }))

    expect(screen.getByRole('status')).toHaveTextContent(/audit entry recorded/i)
    expect(screen.getByText(/salary visibility reviewed/i)).toBeInTheDocument()
  })

})
