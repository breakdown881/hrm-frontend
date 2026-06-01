import { useMemo, useState } from 'react'
import { employees } from '../data/hrmData'
import './PerformancePage.css'

type ReviewStatus = 'Draft' | 'Completed'

type ReviewRecord = {
  id: string
  cycle: string
  employee: string
  criteria: string
  selfScore: number
  managerScore: number
  managerComment: string
  status: ReviewStatus
}

const initialReviews: ReviewRecord[] = [
  {
    id: 'REV-001',
    cycle: 'Q2 2026 Performance Review',
    employee: 'Tran Quoc Huy',
    criteria: 'Delivery quality',
    selfScore: 4,
    managerScore: 4,
    managerComment: 'Consistent delivery and strong engineering mentorship.',
    status: 'Completed',
  },
  {
    id: 'REV-002',
    cycle: 'Q2 2026 Performance Review',
    employee: 'Pham Gia Bao',
    criteria: 'Sales leadership',
    selfScore: 3,
    managerScore: 4,
    managerComment: 'Improved team forecast accuracy and follow-up rhythm.',
    status: 'Completed',
  },
]

const criteriaOptions = ['Delivery quality', 'Collaboration', 'Leadership', 'Customer impact']

export function PerformancePage() {
  const [reviews, setReviews] = useState<ReviewRecord[]>(initialReviews)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [reviewCycle, setReviewCycle] = useState('')
  const [employee, setEmployee] = useState(employees[0].name)
  const [criteria, setCriteria] = useState(criteriaOptions[0])
  const [selfScore, setSelfScore] = useState('')
  const [managerScore, setManagerScore] = useState('')
  const [managerComment, setManagerComment] = useState('')
  const [formError, setFormError] = useState('')
  const [feedback, setFeedback] = useState('')

  const cycleCount = useMemo(() => new Set(reviews.map((review) => review.cycle)).size, [reviews])
  const completedCount = useMemo(() => reviews.filter((review) => review.status === 'Completed').length, [reviews])
  const averageScore = useMemo(() => {
    if (reviews.length === 0) {
      return '0.0'
    }

    const total = reviews.reduce((sum, review) => sum + getAverageReviewScore(review), 0)
    return (total / reviews.length).toFixed(1)
  }, [reviews])
  const cycles = useMemo(() => Array.from(new Set(reviews.map((review) => review.cycle))), [reviews])

  const handleSaveReview = () => {
    const trimmedCycle = reviewCycle.trim()
    const trimmedComment = managerComment.trim()
    const parsedSelfScore = Number(selfScore)
    const parsedManagerScore = Number(managerScore)

    if (!trimmedCycle || !trimmedComment || !isValidScore(parsedSelfScore) || !isValidScore(parsedManagerScore)) {
      setFormError('Cycle, valid scores and manager comment are required.')
      return
    }

    const nextReview: ReviewRecord = {
      id: getNextReviewId(reviews),
      cycle: trimmedCycle,
      employee,
      criteria,
      selfScore: parsedSelfScore,
      managerScore: parsedManagerScore,
      managerComment: trimmedComment,
      status: 'Completed',
    }

    setReviews((currentReviews) => [...currentReviews, nextReview])
    setReviewCycle('')
    setEmployee(employees[0].name)
    setCriteria(criteriaOptions[0])
    setSelfScore('')
    setManagerScore('')
    setManagerComment('')
    setFormError('')
    setFeedback('Review record created successfully')
    setIsFormOpen(false)
  }

  return (
    <>
      <section className="page-heading performance-heading">
        <p className="eyebrow">Full HR lifecycle</p>
        <h2>Performance Management</h2>
        <p>Manage review cycles, self assessments, manager scoring, criteria and evaluation history.</p>
      </section>

      <section className="performance-summary" aria-label="Performance summary">
        <article className="performance-stat-card">
          <span>Review cycles</span>
          <strong>{cycleCount}</strong>
          <p>Active evaluation periods</p>
        </article>
        <article className="performance-stat-card">
          <span>Completed reviews</span>
          <strong>{completedCount}</strong>
          <p>Manager and employee inputs captured</p>
        </article>
        <article className="performance-stat-card">
          <span>Average score</span>
          <strong>{averageScore}</strong>
          <p>Combined self and manager rating</p>
        </article>
      </section>

      <section className="content-grid page-only-grid">
        <div className="card performance-card">
          <div className="card-header compact">
            <div>
              <p className="eyebrow">Cycles</p>
              <h2>Review Cycles</h2>
            </div>
          </div>
          <div className="performance-cycle-list">
            {cycles.map((cycle) => (
              <article className="performance-cycle-item" key={cycle}>
                <span>{cycle}</span>
                <strong>{reviews.filter((review) => review.cycle === cycle).length}</strong>
                <p>Assigned employees</p>
              </article>
            ))}
          </div>
        </div>

        <div className="card wide-card performance-card">
          <div className="card-header">
            <div>
              <p className="eyebrow">Reviews</p>
              <h2>Evaluation History</h2>
            </div>
            <button className="primary-button" onClick={() => setIsFormOpen((isOpen) => !isOpen)} type="button">
              {isFormOpen ? 'Close form' : 'Add review record'}
            </button>
          </div>

          {feedback && (
            <div className="success-banner" role="status">
              {feedback}
            </div>
          )}

          {isFormOpen && (
            <div className="performance-form" aria-label="Add review record form">
              <label>
                <span>Review cycle</span>
                <input
                  onChange={(event) => {
                    setReviewCycle(event.target.value)
                    setFormError('')
                  }}
                  placeholder="Review cycle"
                  type="text"
                  value={reviewCycle}
                />
              </label>
              <label>
                <span>Employee</span>
                <select onChange={(event) => setEmployee(event.target.value)} value={employee}>
                  {employees.map((employeeOption) => (
                    <option key={employeeOption.id} value={employeeOption.name}>
                      {employeeOption.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Criteria</span>
                <select onChange={(event) => setCriteria(event.target.value)} value={criteria}>
                  {criteriaOptions.map((criteriaOption) => (
                    <option key={criteriaOption} value={criteriaOption}>
                      {criteriaOption}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Self review score</span>
                <input
                  max="5"
                  min="1"
                  onChange={(event) => {
                    setSelfScore(event.target.value)
                    setFormError('')
                  }}
                  type="number"
                  value={selfScore}
                />
              </label>
              <label>
                <span>Manager review score</span>
                <input
                  max="5"
                  min="1"
                  onChange={(event) => {
                    setManagerScore(event.target.value)
                    setFormError('')
                  }}
                  type="number"
                  value={managerScore}
                />
              </label>
              <label className="performance-comment-field">
                <span>Manager comment</span>
                <input
                  onChange={(event) => {
                    setManagerComment(event.target.value)
                    setFormError('')
                  }}
                  placeholder="Manager comment"
                  type="text"
                  value={managerComment}
                />
              </label>
              {formError && <p className="form-error">{formError}</p>}
              <button className="primary-button" onClick={handleSaveReview} type="button">
                Save review record
              </button>
            </div>
          )}

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Review cycle</th>
                  <th>Employee</th>
                  <th>Criteria</th>
                  <th>Scores</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((review) => (
                  <tr key={review.id}>
                    <td>
                      <strong>{review.cycle}</strong>
                      <span>{review.managerComment}</span>
                    </td>
                    <td>{review.employee}</td>
                    <td>{review.criteria}</td>
                    <td>
                      Self {review.selfScore} / Manager {review.managerScore}
                    </td>
                    <td>
                      <span className={`performance-status ${review.status.toLowerCase()}`}>{review.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  )
}

function getAverageReviewScore(review: ReviewRecord) {
  return (review.selfScore + review.managerScore) / 2
}

function isValidScore(score: number) {
  return Number.isInteger(score) && score >= 1 && score <= 5
}

function getNextReviewId(reviews: ReviewRecord[]) {
  const nextNumber = Math.max(...reviews.map((review) => Number(review.id.replace('REV-', '')))) + 1
  return `REV-${String(nextNumber).padStart(3, '0')}`
}
