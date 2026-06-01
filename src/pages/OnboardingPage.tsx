import { useMemo, useState } from 'react'
import { employees } from '../data/hrmData'
import './OnboardingPage.css'

type OnboardingStatus = 'Pending' | 'Completed'

type OnboardingTask = {
  id: string
  name: string
  newHire: string
  owner: string
  status: OnboardingStatus
}

const initialTasks: OnboardingTask[] = [
  {
    id: 'ONB-001',
    name: 'Complete employee profile',
    newHire: 'Le Thu Ha',
    owner: 'Nguyen Minh Anh',
    status: 'Pending',
  },
  {
    id: 'ONB-002',
    name: 'Sign employment contract',
    newHire: 'Le Thu Ha',
    owner: 'Nguyen Minh Anh',
    status: 'Completed',
  },
  {
    id: 'ONB-003',
    name: 'Create system account',
    newHire: 'Tran Quoc Huy',
    owner: 'Nguyen Minh Anh',
    status: 'Pending',
  },
]

const checklistTemplates = ['Profile verification', 'Contract signing', 'System account setup', 'Equipment handover']

export function OnboardingPage() {
  const [tasks, setTasks] = useState<OnboardingTask[]>(initialTasks)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [taskName, setTaskName] = useState('')
  const [newHire, setNewHire] = useState(employees[2].name)
  const [taskOwner, setTaskOwner] = useState(employees[0].name)
  const [formError, setFormError] = useState('')
  const [feedback, setFeedback] = useState('')

  const completedCount = useMemo(() => tasks.filter((task) => task.status === 'Completed').length, [tasks])
  const pendingCount = tasks.length - completedCount
  const completionRate = tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 100)

  const handleSaveTask = () => {
    const trimmedName = taskName.trim()

    if (!trimmedName) {
      setFormError('Task name is required.')
      return
    }

    const nextTask: OnboardingTask = {
      id: getNextTaskId(tasks),
      name: trimmedName,
      newHire,
      owner: taskOwner,
      status: 'Pending',
    }

    setTasks((currentTasks) => [...currentTasks, nextTask])
    setTaskName('')
    setNewHire(employees[2].name)
    setTaskOwner(employees[0].name)
    setFormError('')
    setFeedback('Onboarding task created successfully')
    setIsFormOpen(false)
  }

  const handleCompleteTask = (taskId: string) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) => (task.id === taskId ? { ...task, status: 'Completed' } : task)),
    )
    setFeedback('Onboarding task completed successfully')
  }

  return (
    <>
      <section className="page-heading onboarding-heading">
        <p className="eyebrow">Full HR lifecycle</p>
        <h2>Onboarding Management</h2>
        <p>Coordinate new hire checklists, task owners, template steps and onboarding progress.</p>
      </section>

      <section className="onboarding-summary" aria-label="Onboarding summary">
        <article className="onboarding-stat-card">
          <span>New hire tasks</span>
          <strong>{tasks.length}</strong>
          <p>Across active onboarding plans</p>
        </article>
        <article className="onboarding-stat-card">
          <span>Completed</span>
          <strong>{completedCount}</strong>
          <p>{completionRate}% completion rate</p>
        </article>
        <article className="onboarding-stat-card">
          <span>Pending</span>
          <strong>{pendingCount}</strong>
          <p>Tasks still need action</p>
        </article>
      </section>

      <section className="content-grid page-only-grid">
        <div className="card wide-card onboarding-card">
          <div className="card-header">
            <div>
              <p className="eyebrow">New hires</p>
              <h2>New Hire Checklist</h2>
            </div>
            <button className="primary-button" onClick={() => setIsFormOpen((isOpen) => !isOpen)} type="button">
              {isFormOpen ? 'Close form' : 'Add onboarding task'}
            </button>
          </div>

          {feedback && (
            <div className="success-banner" role="status">
              {feedback}
            </div>
          )}

          {isFormOpen && (
            <div className="onboarding-form" aria-label="Add onboarding task form">
              <label>
                <span>Task name</span>
                <input
                  onChange={(event) => {
                    setTaskName(event.target.value)
                    setFormError('')
                  }}
                  placeholder="Task name"
                  type="text"
                  value={taskName}
                />
              </label>
              <label>
                <span>New hire</span>
                <select onChange={(event) => setNewHire(event.target.value)} value={newHire}>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.name}>
                      {employee.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Task owner</span>
                <select onChange={(event) => setTaskOwner(event.target.value)} value={taskOwner}>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.name}>
                      {employee.name}
                    </option>
                  ))}
                </select>
              </label>
              {formError && <p className="form-error">{formError}</p>}
              <button className="primary-button" onClick={handleSaveTask} type="button">
                Save onboarding task
              </button>
            </div>
          )}

          <div className="onboarding-task-list">
            {tasks.map((task) => (
              <article className="onboarding-task-item" key={task.id}>
                <div>
                  <span className="onboarding-task-id">{task.id}</span>
                  <h3>{task.name}</h3>
                  <p>
                    New hire: {task.newHire} | Owner: {task.owner}
                  </p>
                </div>
                <div className="onboarding-task-actions">
                  <span className={`onboarding-status ${task.status.toLowerCase()}`}>{task.status}</span>
                  {task.status === 'Pending' && (
                    <button
                      aria-label={`Complete ${task.name}`}
                      className="ghost-button"
                      onClick={() => handleCompleteTask(task.id)}
                      type="button"
                    >
                      Complete
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="card onboarding-card">
          <div className="card-header compact">
            <div>
              <p className="eyebrow">Template</p>
              <h2>Checklist Template</h2>
            </div>
          </div>
          <ul className="onboarding-template-list">
            {checklistTemplates.map((template) => (
              <li key={template}>{template}</li>
            ))}
          </ul>
        </div>
      </section>
    </>
  )
}

function getNextTaskId(tasks: OnboardingTask[]) {
  const nextNumber = Math.max(...tasks.map((task) => Number(task.id.replace('ONB-', '')))) + 1
  return `ONB-${String(nextNumber).padStart(3, '0')}`
}
