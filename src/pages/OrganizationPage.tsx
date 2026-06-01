import { useMemo, useState } from 'react'
import './OrganizationPage.css'
import { employees } from '../data/hrmData'

type Department = {
  id: string
  name: string
  manager: string
  headcount: number
  status: 'Active' | 'Planning'
}

type JobTitle = {
  title: string
  department: string
  level: string
}

const initialDepartments: Department[] = [
  { id: 'DEP-001', name: 'People Ops', manager: 'Nguyen Minh Anh', headcount: 18, status: 'Active' },
  { id: 'DEP-002', name: 'Engineering', manager: 'Tran Quoc Huy', headcount: 92, status: 'Active' },
  { id: 'DEP-003', name: 'Finance', manager: 'Le Thu Ha', headcount: 21, status: 'Active' },
  { id: 'DEP-004', name: 'Sales', manager: 'Pham Gia Bao', headcount: 64, status: 'Active' },
]

const jobTitles: JobTitle[] = [
  { title: 'HR Manager', department: 'People Ops', level: 'Manager' },
  { title: 'Frontend Lead', department: 'Engineering', level: 'Lead' },
  { title: 'Finance Executive', department: 'Finance', level: 'Executive' },
  { title: 'Sales Manager', department: 'Sales', level: 'Manager' },
]

export function OrganizationPage() {
  const [departments, setDepartments] = useState<Department[]>(initialDepartments)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [departmentName, setDepartmentName] = useState('')
  const [departmentManager, setDepartmentManager] = useState(employees[0].name)
  const [feedback, setFeedback] = useState('')
  const [formError, setFormError] = useState('')

  const totalHeadcount = useMemo(
    () => departments.reduce((sum, department) => sum + department.headcount, 0),
    [departments],
  )

  const handleSaveDepartment = () => {
    const trimmedName = departmentName.trim()

    if (!trimmedName) {
      setFormError('Department name is required.')
      return
    }

    const newDepartment: Department = {
      id: getNextDepartmentId(departments),
      name: trimmedName,
      manager: departmentManager,
      headcount: 0,
      status: 'Planning',
    }

    setDepartments((currentDepartments) => [...currentDepartments, newDepartment])
    setDepartmentName('')
    setDepartmentManager(employees[0].name)
    setFormError('')
    setFeedback('Department created successfully')
    setIsFormOpen(false)
  }

  return (
    <>
      <section className="page-heading organization-heading">
        <p className="eyebrow">Organization foundation</p>
        <h2>Organization Management</h2>
        <p>Manage departments, job titles, reporting managers and organization structure for Phase 1.</p>
      </section>

      <section className="organization-summary" aria-label="Organization summary">
        <article className="organization-stat-card">
          <span>Departments</span>
          <strong>{departments.length}</strong>
          <p>Active and planning units</p>
        </article>
        <article className="organization-stat-card">
          <span>Known job titles</span>
          <strong>{jobTitles.length}</strong>
          <p>Mapped to departments</p>
        </article>
        <article className="organization-stat-card">
          <span>Assigned headcount</span>
          <strong>{totalHeadcount}</strong>
          <p>Mock organization data</p>
        </article>
      </section>

      <section className="content-grid page-only-grid">
        <div className="card wide-card organization-card">
          <div className="card-header">
            <div>
              <p className="eyebrow">Master data</p>
              <h2>Departments</h2>
            </div>
            <button className="primary-button" onClick={() => setIsFormOpen((isOpen) => !isOpen)} type="button">
              {isFormOpen ? 'Close form' : 'Add department'}
            </button>
          </div>

          {feedback && (
            <div className="success-banner" role="status">
              {feedback}
            </div>
          )}

          {isFormOpen && (
            <div className="organization-form" aria-label="Add department form">
              <label>
                <span>Department name</span>
                <input
                  onChange={(event) => {
                    setDepartmentName(event.target.value)
                    setFormError('')
                  }}
                  placeholder="Department name"
                  type="text"
                  value={departmentName}
                />
              </label>
              <label>
                <span>Department manager</span>
                <select onChange={(event) => setDepartmentManager(event.target.value)} value={departmentManager}>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.name}>
                      {employee.name}
                    </option>
                  ))}
                </select>
              </label>
              {formError && <p className="form-error">{formError}</p>}
              <button className="primary-button" onClick={handleSaveDepartment} type="button">
                Save department
              </button>
            </div>
          )}

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Manager</th>
                  <th>Headcount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((department) => (
                  <tr key={department.id}>
                    <td>
                      <strong>{department.name}</strong>
                      <span>{department.id}</span>
                    </td>
                    <td>{department.manager}</td>
                    <td>{department.headcount}</td>
                    <td>
                      <span className={`organization-status ${department.status.toLowerCase()}`}>{department.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card organization-card">
          <div className="card-header compact">
            <div>
              <p className="eyebrow">Job titles</p>
              <h2>Role catalog</h2>
            </div>
          </div>
          <div className="job-title-list">
            {jobTitles.map((jobTitle) => (
              <article className="job-title-item" key={`${jobTitle.department}-${jobTitle.title}`}>
                <strong>{jobTitle.title}</strong>
                <span>{jobTitle.level}</span>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

function getNextDepartmentId(departments: Department[]) {
  const nextNumber = Math.max(...departments.map((department) => Number(department.id.replace('DEP-', '')))) + 1
  return `DEP-${String(nextNumber).padStart(3, '0')}`
}
