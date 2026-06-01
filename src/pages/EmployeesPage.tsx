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

  const resetFilters = () => {
    setEmployeeSearch('')
    setDepartmentFilter(allDepartmentOption)
    setStatusFilter(allStatusOption)
  }

  const updateFormValue = (field: keyof EmployeeFormState, value: string) => {
    setFormValues((currentValues) => ({ ...currentValues, [field]: value }))
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
      id: getNextEmployeeId(employeeList),
      name: trimmedName,
      role: trimmedRole,
      department: formValues.department,
      manager: trimmedManager,
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
    </section>
  )
}

function getNextEmployeeId(employeeList: Employee[]) {
  const nextNumber = Math.max(...employeeList.map((employee) => Number(employee.id.replace('EMP-', '')))) + 1
  return `EMP-${String(nextNumber).padStart(3, '0')}`
}

