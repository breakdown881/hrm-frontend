import './EmployeesPage.css'
import { useMemo, useState } from 'react'
import { EmptyState } from '../components/EmptyState'
import { StatusBadge } from '../components/StatusBadge'
import type { Employee } from '../data/hrmData'
import { employees } from '../data/hrmData'

type EmployeeFormState = {
  department: string
  manager: string
  name: string
  role: string
}

type EmployeeEditFormState = EmployeeFormState & {
  address: string
  birthDate: string
  email: string
  emergencyContact: string
  employeeType: string
  gender: string
  phone: string
  startDate: string
  status: Employee['status']
}

const allDepartmentOption = 'All departments'
const allStatusOption = 'All statuses'
const knownDepartments = ['People Ops', 'Engineering', 'Finance', 'Sales']
const statusOptions: Array<Employee['status']> = ['Official', 'Probation', 'Offboarding']
const emptyForm: EmployeeFormState = {
  department: 'Engineering',
  manager: '',
  name: '',
  role: '',
}

export function EmployeesPage() {
  const [employeeList, setEmployeeList] = useState<Employee[]>(employees)
  const [employeeSearch, setEmployeeSearch] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState(allDepartmentOption)
  const [statusFilter, setStatusFilter] = useState(allStatusOption)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formValues, setFormValues] = useState<EmployeeFormState>(emptyForm)
  const [editValues, setEditValues] = useState<EmployeeEditFormState | null>(null)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null)
  const [formError, setFormError] = useState('')
  const [feedback, setFeedback] = useState('')

  const departments = useMemo(() => {
    return Array.from(new Set([...knownDepartments, ...employeeList.map((employee) => employee.department)]))
  }, [employeeList])

  const filteredEmployees = useMemo(() => {
    const keyword = employeeSearch.trim().toLowerCase()

    return employeeList.filter((employee) => {
      const matchesSearch = keyword
        ? [employee.id, employee.name, employee.role, employee.department, employee.manager]
            .join(' ')
            .toLowerCase()
            .includes(keyword)
        : true
      const matchesDepartment = departmentFilter === allDepartmentOption || employee.department === departmentFilter
      const matchesStatus = statusFilter === allStatusOption || employee.status === statusFilter

      return matchesSearch && matchesDepartment && matchesStatus
    })
  }, [departmentFilter, employeeList, employeeSearch, statusFilter])
  const selectedEmployee = employeeList.find((employee) => employee.id === selectedEmployeeId) ?? null

  const resetFilters = () => {
    setEmployeeSearch('')
    setDepartmentFilter(allDepartmentOption)
    setStatusFilter(allStatusOption)
  }

  const updateFormValue = (field: keyof EmployeeFormState, value: string) => {
    setFormValues((currentValues) => ({ ...currentValues, [field]: value }))
    setFormError('')
  }

  const updateEditValue = (field: keyof EmployeeEditFormState, value: string) => {
    setEditValues((currentValues) => (currentValues ? { ...currentValues, [field]: value } : currentValues))
    setFormError('')
  }

  const handleViewEmployee = (employee: Employee) => {
    setSelectedEmployeeId(employee.id)
    setEditValues(null)
    setFormError('')
  }

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployeeId(employee.id)
    setEditValues({
      address: employee.address,
      birthDate: employee.birthDate,
      department: employee.department,
      email: employee.email,
      emergencyContact: employee.emergencyContact,
      employeeType: employee.employeeType,
      gender: employee.gender,
      manager: employee.manager,
      name: employee.name,
      phone: employee.phone,
      role: employee.role,
      startDate: employee.startDate,
      status: employee.status,
    })
    setFormError('')
  }

  const handleSaveEmployee = () => {
    const trimmedName = formValues.name.trim()
    const trimmedRole = formValues.role.trim()
    const trimmedManager = formValues.manager.trim()

    if (!trimmedName || !trimmedRole || !trimmedManager) {
      setFormError('Please complete employee name, job title and manager before saving.')
      return
    }

    const newEmployee: Employee = {
      address: 'Needs update',
      birthDate: 'Needs update',
      email: `${trimmedName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      emergencyContact: 'Needs update',
      employeeType: 'Full-time',
      gender: 'Needs update',
      id: getNextEmployeeId(employeeList),
      name: trimmedName,
      phone: 'Needs update',
      role: trimmedRole,
      department: formValues.department,
      manager: trimmedManager,
      startDate: 'Needs update',
      status: 'Probation',
      attendance: 'Not checked in',
      leaveBalance: 0,
    }

    setEmployeeList((currentEmployees) => [...currentEmployees, newEmployee])
    setFeedback('Employee created successfully')
    setFormValues(emptyForm)
    setIsFormOpen(false)
    setFormError('')
    resetFilters()
  }

  const handleSaveEmployeeChanges = () => {
    if (!selectedEmployee || !editValues) {
      return
    }

    const trimmedName = editValues.name.trim()
    const trimmedRole = editValues.role.trim()
    const trimmedManager = editValues.manager.trim()

    if (!trimmedName || !trimmedRole || !trimmedManager) {
      setFormError('Please complete employee name, job title and manager before saving.')
      return
    }

    setEmployeeList((currentEmployees) =>
      currentEmployees.map((employee) =>
        employee.id === selectedEmployee.id
          ? {
              ...employee,
              address: editValues.address.trim(),
              birthDate: editValues.birthDate.trim(),
              department: editValues.department,
              email: editValues.email.trim(),
              emergencyContact: editValues.emergencyContact.trim(),
              employeeType: editValues.employeeType.trim(),
              gender: editValues.gender.trim(),
              manager: trimmedManager,
              name: trimmedName,
              phone: editValues.phone.trim(),
              role: trimmedRole,
              startDate: editValues.startDate.trim(),
              status: editValues.status,
            }
          : employee,
      ),
    )
    setFeedback('Employee updated successfully')
    setEditValues(null)
    setFormError('')
  }

  return (
    <section className="content-grid page-only-grid">
      <div className="card wide-card full-width-card">
        <div className="card-header">
          <div>
            <p className="eyebrow">Employee Management</p>
            <h2>Employees Directory</h2>
          </div>
          <div className="directory-actions">
            <button className="primary-button" onClick={() => setIsFormOpen((isOpen) => !isOpen)} type="button">
              {isFormOpen ? 'Close form' : 'Add employee'}
            </button>
          </div>
        </div>

        {feedback && (
          <div className="success-banner" role="status">
            {feedback}
          </div>
        )}

        {isFormOpen && (
          <div className="employee-form" aria-label="Add employee form">
            <label>
              <span>Employee name</span>
              <input
                onChange={(event) => updateFormValue('name', event.target.value)}
                placeholder="Full name"
                type="text"
                value={formValues.name}
              />
            </label>
            <label>
              <span>Job title</span>
              <input
                onChange={(event) => updateFormValue('role', event.target.value)}
                placeholder="Job title"
                type="text"
                value={formValues.role}
              />
            </label>
            <label>
              <span>Department</span>
              <select onChange={(event) => updateFormValue('department', event.target.value)} value={formValues.department}>
                {departments.map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Manager</span>
              <input
                onChange={(event) => updateFormValue('manager', event.target.value)}
                placeholder="Direct manager"
                type="text"
                value={formValues.manager}
              />
            </label>
            {formError && <p className="form-error">{formError}</p>}
            <button className="primary-button" onClick={handleSaveEmployee} type="button">
              Save employee
            </button>
          </div>
        )}

        <div className="employee-toolbar">
          <label className="search-field">
            <span className="sr-only">Search employees</span>
            <input
              onChange={(event) => setEmployeeSearch(event.target.value)}
              placeholder="Search employee, role, department..."
              type="search"
              value={employeeSearch}
            />
          </label>
          <label className="filter-field">
            <span>Department filter</span>
            <select onChange={(event) => setDepartmentFilter(event.target.value)} value={departmentFilter}>
              <option value={allDepartmentOption}>{allDepartmentOption}</option>
              {departments.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>
          </label>
          <label className="filter-field">
            <span>Status filter</span>
            <select onChange={(event) => setStatusFilter(event.target.value)} value={statusFilter}>
              <option value={allStatusOption}>{allStatusOption}</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
        </div>

        {filteredEmployees.length > 0 ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Manager</th>
                  <th>Status</th>
                  <th>Attendance</th>
                  <th>Leave</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id}>
                    <td>
                      <strong>{employee.name}</strong>
                      <span>
                        {employee.id} ? {employee.role}
                      </span>
                    </td>
                    <td>{employee.department}</td>
                    <td>{employee.manager}</td>
                    <td>
                      <StatusBadge status={employee.status} />
                    </td>
                    <td>{employee.attendance}</td>
                    <td>{employee.leaveBalance} days</td>
                    <td>
                      <div className="employee-row-actions">
                        <button
                          aria-label={`View ${employee.name} details`}
                          className="ghost-button"
                          onClick={() => handleViewEmployee(employee)}
                          type="button"
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            actionLabel="Clear search"
            description="No employee matches these filters. Try another keyword, department or status."
            onAction={resetFilters}
            title="No employees found"
          />
        )}
      </div>

      {selectedEmployee && (
        <aside aria-label="Employee detail panel" className="card employee-detail-card">
          <div className="card-header">
            <div>
              <p className="eyebrow">{selectedEmployee.id}</p>
              <h2>Employee Detail</h2>
            </div>
            <button
              className="ghost-button"
              onClick={() => handleEditEmployee(selectedEmployee)}
              type="button"
            >
              Edit {selectedEmployee.name}
            </button>
          </div>

          {editValues ? (
            <div className="employee-form detail-edit-form" aria-label="Edit employee form">
              <label>
                <span>Employee name</span>
                <input
                  onChange={(event) => updateEditValue('name', event.target.value)}
                  type="text"
                  value={editValues.name}
                />
              </label>
              <label>
                <span>Job title</span>
                <input
                  onChange={(event) => updateEditValue('role', event.target.value)}
                  type="text"
                  value={editValues.role}
                />
              </label>
              <label>
                <span>Department</span>
                <select onChange={(event) => updateEditValue('department', event.target.value)} value={editValues.department}>
                  {departments.map((department) => (
                    <option key={department} value={department}>
                      {department}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Manager</span>
                <input
                  onChange={(event) => updateEditValue('manager', event.target.value)}
                  type="text"
                  value={editValues.manager}
                />
              </label>
              <label>
                <span>Employment status</span>
                <select
                  onChange={(event) => updateEditValue('status', event.target.value as Employee['status'])}
                  value={editValues.status}
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Email</span>
                <input
                  onChange={(event) => updateEditValue('email', event.target.value)}
                  type="email"
                  value={editValues.email}
                />
              </label>
              <label>
                <span>Phone number</span>
                <input
                  onChange={(event) => updateEditValue('phone', event.target.value)}
                  type="text"
                  value={editValues.phone}
                />
              </label>
              <label>
                <span>Address</span>
                <input
                  onChange={(event) => updateEditValue('address', event.target.value)}
                  type="text"
                  value={editValues.address}
                />
              </label>
              <label>
                <span>Birth date</span>
                <input
                  onChange={(event) => updateEditValue('birthDate', event.target.value)}
                  type="text"
                  value={editValues.birthDate}
                />
              </label>
              <label>
                <span>Gender</span>
                <input
                  onChange={(event) => updateEditValue('gender', event.target.value)}
                  type="text"
                  value={editValues.gender}
                />
              </label>
              <label>
                <span>Start date</span>
                <input
                  onChange={(event) => updateEditValue('startDate', event.target.value)}
                  type="text"
                  value={editValues.startDate}
                />
              </label>
              <label>
                <span>Employee type</span>
                <input
                  onChange={(event) => updateEditValue('employeeType', event.target.value)}
                  type="text"
                  value={editValues.employeeType}
                />
              </label>
              <label>
                <span>Emergency contact</span>
                <input
                  onChange={(event) => updateEditValue('emergencyContact', event.target.value)}
                  type="text"
                  value={editValues.emergencyContact}
                />
              </label>
              {formError && <p className="form-error">{formError}</p>}
              <button className="primary-button" onClick={handleSaveEmployeeChanges} type="button">
                Save employee changes
              </button>
            </div>
          ) : (
            <div className="employee-detail-sections">
              <section className="employee-detail-section" aria-labelledby="personal-information-heading">
                <div className="employee-section-heading">
                  <div className="employee-avatar" aria-label={`${selectedEmployee.name} avatar`}>
                    {getEmployeeInitials(selectedEmployee.name)}
                  </div>
                  <h3 id="personal-information-heading">Personal Information</h3>
                </div>
                <dl className="employee-detail-list">
                  <div>
                    <dt>Name</dt>
                    <dd>{selectedEmployee.name}</dd>
                  </div>
                  <div>
                    <dt>Email</dt>
                    <dd>{selectedEmployee.email}</dd>
                  </div>
                  <div>
                    <dt>Phone</dt>
                    <dd>{selectedEmployee.phone}</dd>
                  </div>
                  <div>
                    <dt>Birth date</dt>
                    <dd>{selectedEmployee.birthDate}</dd>
                  </div>
                  <div>
                    <dt>Gender</dt>
                    <dd>{selectedEmployee.gender}</dd>
                  </div>
                  <div>
                    <dt>Address</dt>
                    <dd>{selectedEmployee.address}</dd>
                  </div>
                </dl>
              </section>

              <section className="employee-detail-section" aria-labelledby="work-information-heading">
                <h3 id="work-information-heading">Work Information</h3>
                <dl className="employee-detail-list">
                  <div>
                    <dt>Employee code</dt>
                    <dd>{selectedEmployee.id}</dd>
                  </div>
                  <div>
                    <dt>Job title</dt>
                    <dd>{selectedEmployee.role}</dd>
                  </div>
                  <div>
                    <dt>Department</dt>
                    <dd>{selectedEmployee.department}</dd>
                  </div>
                  <div>
                    <dt>Manager</dt>
                    <dd>{selectedEmployee.manager}</dd>
                  </div>
                  <div>
                    <dt>Start date</dt>
                    <dd>{selectedEmployee.startDate}</dd>
                  </div>
                  <div>
                    <dt>Employee type</dt>
                    <dd>{selectedEmployee.employeeType}</dd>
                  </div>
                  <div>
                    <dt>Status</dt>
                    <dd>{selectedEmployee.status}</dd>
                  </div>
                </dl>
              </section>

              <section className="employee-detail-section" aria-labelledby="emergency-contact-heading">
                <h3 id="emergency-contact-heading">Emergency Contact</h3>
                <dl className="employee-detail-list">
                  <div>
                    <dt>Contact</dt>
                    <dd>{selectedEmployee.emergencyContact}</dd>
                  </div>
                </dl>
              </section>
            </div>
          )}
        </aside>
      )}
    </section>
  )
}

function getNextEmployeeId(employeeList: Employee[]) {
  const nextNumber = Math.max(...employeeList.map((employee) => Number(employee.id.replace('EMP-', '')))) + 1
  return `EMP-${String(nextNumber).padStart(3, '0')}`
}

function getEmployeeInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

