import { useEffect, useMemo, useState } from 'react'
import { employees as mockEmployees } from '../data/hrmData'
import type { Employee } from '../data/hrmData'
import {
  completeOnboardingTask,
  createOnboardingTask,
  fetchEmployees,
  fetchOnboardingTasks,
} from '../services/hrmApi'
import type { FrontendOnboardingTask } from '../services/hrmApi'
import './OnboardingPage.css'

type OnboardingTask = FrontendOnboardingTask

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

export function OnboardingPage({ apiToken }: { apiToken?: string | null }) {
  const [tasks, setTasks] = useState<OnboardingTask[]>(initialTasks)
  const [employeeOptions, setEmployeeOptions] = useState<Employee[]>(mockEmployees)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [taskName, setTaskName] = useState('')
  const [newHire, setNewHire] = useState(mockEmployees[2].name)
  const [taskOwner, setTaskOwner] = useState(mockEmployees[0].name)
  const [formError, setFormError] = useState('')
  const [feedback, setFeedback] = useState('')

  const completedCount = useMemo(() => tasks.filter((task) => task.status === 'Completed').length, [tasks])
  const pendingCount = tasks.length - completedCount
  const completionRate = tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 100)

  useEffect(() => {
    if (!apiToken) {
      return
    }

    let isMounted = true

    Promise.all([fetchOnboardingTasks(apiToken), fetchEmployees(apiToken)])
      .then(([apiTasks, apiEmployees]) => {
        if (isMounted) {
          setTasks(apiTasks)
          setEmployeeOptions(apiEmployees)
          setNewHire(apiEmployees[2]?.name ?? apiEmployees[0]?.name ?? mockEmployees[2].name)
          setTaskOwner(apiEmployees[0]?.name ?? mockEmployees[0].name)
        }
      })
      .catch(() => {
        // Keep mock data available when the API is offline during local UI work.
      })

    return () => {
      isMounted = false
    }
  }, [apiToken])

  const handleSaveTask = async () => {
    const trimmedName = taskName.trim()

    if (!trimmedName) {
      setFormError('Task name is required.')
      return
    }

    const localTask: OnboardingTask = {
      id: getNextTaskId(tasks),
      name: trimmedName,
      newHire,
      owner: taskOwner,
      status: 'Pending',
    }
    const selectedNewHire = employeeOptions.find((employee) => employee.name === newHire)
    const selectedOwner = employeeOptions.find((employee) => employee.name === taskOwner)
    let nextTask = localTask

    if (apiToken && selectedNewHire?.backendId) {
      try {
        nextTask = await createOnboardingTask(apiToken, {
          name: trimmedName,
          newHireId: selectedNewHire.backendId,
          ownerId: selectedOwner?.backendId,
        })
      } catch {
        nextTask = localTask
      }
    }

    setTasks((currentTasks) => [...currentTasks, nextTask])
    setTaskName('')
    setNewHire(employeeOptions[2]?.name ?? employeeOptions[0]?.name ?? mockEmployees[2].name)
    setTaskOwner(employeeOptions[0]?.name ?? mockEmployees[0].name)
    setFormError('')
    setFeedback('Onboarding task created successfully')
    setIsFormOpen(false)
  }

  const handleCompleteTask = async (taskId: string) => {
    const targetTask = tasks.find((task) => task.id === taskId)
    let completedTask: OnboardingTask | null = null

    if (apiToken && targetTask?.backendId) {
      try {
        completedTask = await completeOnboardingTask(apiToken, targetTask.backendId)
      } catch {
        completedTask = null
      }
    }

    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId ? completedTask ?? { ...task, status: 'Completed' } : task,
      ),
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
                  {employeeOptions.map((employee) => (
                    <option key={employee.id} value={employee.name}>
                      {employee.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Task owner</span>
                <select onChange={(event) => setTaskOwner(event.target.value)} value={taskOwner}>
                  {employeeOptions.map((employee) => (
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
