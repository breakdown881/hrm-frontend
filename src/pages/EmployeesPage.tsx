import { useMemo, useState } from 'react'
import { EmptyState } from '../components/EmptyState'
import { StatusBadge } from '../components/StatusBadge'
import { employees } from '../data/hrmData'

export function EmployeesPage() {
  const [employeeSearch, setEmployeeSearch] = useState('')

  const filteredEmployees = useMemo(() => {
    const keyword = employeeSearch.trim().toLowerCase()

    if (!keyword) {
      return employees
    }

    return employees.filter((employee) =>
      [employee.id, employee.name, employee.role, employee.department, employee.manager]
        .join(' ')
        .toLowerCase()
        .includes(keyword),
    )
  }, [employeeSearch])

  return (
    <section className="content-grid page-only-grid">
      <div className="card wide-card full-width-card">
        <div className="card-header">
          <div>
            <p className="eyebrow">Employee Management</p>
            <h2>Employees Directory</h2>
          </div>
          <label className="search-field">
            <span className="sr-only">Search employees</span>
            <input
              onChange={(event) => setEmployeeSearch(event.target.value)}
              placeholder="Search employee, role, department..."
              type="search"
              value={employeeSearch}
            />
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
            description="No employee matches this keyword. Try a name, employee code, role or department."
            onAction={() => setEmployeeSearch('')}
            title="No employees found"
          />
        )}
      </div>
    </section>
  )
}
