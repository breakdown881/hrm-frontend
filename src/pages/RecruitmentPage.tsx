import { useMemo, useState } from 'react'
import './RecruitmentPage.css'

type OpeningStatus = 'Draft' | 'Active' | 'Closed'
type CandidateStatus = 'Applied' | 'Screening' | 'Interview' | 'Offer' | 'Hired' | 'Rejected'

type JobOpening = {
  id: string
  title: string
  department: string
  status: OpeningStatus
}

type Candidate = {
  id: string
  name: string
  email: string
  phone: string
  position: string
  source: string
  status: CandidateStatus
}

type ConvertedEmployee = {
  id: string
  candidateId: string
  name: string
  email: string
  role: string
  department: string
}

const departments = ['People Ops', 'Engineering', 'Finance', 'Sales']
const openingStatuses: OpeningStatus[] = ['Draft', 'Active', 'Closed']
const candidateSources = ['LinkedIn', 'Referral', 'Career site', 'Agency']
const candidateStatuses: CandidateStatus[] = ['Applied', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected']

const initialOpenings: JobOpening[] = [
  { id: 'JOB-001', title: 'Frontend Engineer', department: 'Engineering', status: 'Active' },
  { id: 'JOB-002', title: 'Payroll Specialist', department: 'Finance', status: 'Draft' },
  { id: 'JOB-003', title: 'Sales Executive', department: 'Sales', status: 'Active' },
]

const initialCandidates: Candidate[] = [
  {
    id: 'CAN-001',
    name: 'Hoang Minh Tue',
    email: 'tue.hoang@example.com',
    phone: '0901234567',
    position: 'Frontend Engineer',
    source: 'LinkedIn',
    status: 'Applied',
  },
  {
    id: 'CAN-002',
    name: 'Ngoc Bao Tran',
    email: 'bao.tran@example.com',
    phone: '0907654321',
    position: 'Sales Executive',
    source: 'Referral',
    status: 'Interview',
  },
]

export function RecruitmentPage() {
  const [openings, setOpenings] = useState<JobOpening[]>(initialOpenings)
  const [candidates, setCandidates] = useState<Candidate[]>(initialCandidates)
  const [convertedEmployees, setConvertedEmployees] = useState<ConvertedEmployee[]>([])
  const [isOpeningFormOpen, setIsOpeningFormOpen] = useState(false)
  const [isCandidateFormOpen, setIsCandidateFormOpen] = useState(false)
  const [jobTitle, setJobTitle] = useState('')
  const [department, setDepartment] = useState(departments[0])
  const [openingStatus, setOpeningStatus] = useState<OpeningStatus>('Draft')
  const [candidateName, setCandidateName] = useState('')
  const [candidateEmail, setCandidateEmail] = useState('')
  const [candidatePhone, setCandidatePhone] = useState('')
  const [positionApplied, setPositionApplied] = useState(initialOpenings[0].title)
  const [candidateSource, setCandidateSource] = useState(candidateSources[0])
  const [applicationStatus, setApplicationStatus] = useState<CandidateStatus>('Applied')
  const [formError, setFormError] = useState('')
  const [feedback, setFeedback] = useState('')

  const activeOpenings = useMemo(() => openings.filter((opening) => opening.status === 'Active').length, [openings])
  const pipelineCounts = useMemo(
    () => candidateStatuses.map((status) => ({ status, count: candidates.filter((candidate) => candidate.status === status).length })),
    [candidates],
  )

  const handleSaveOpening = () => {
    const trimmedTitle = jobTitle.trim()

    if (!trimmedTitle) {
      setFormError('Job title is required.')
      return
    }

    const nextOpening: JobOpening = {
      id: getNextOpeningId(openings),
      title: trimmedTitle,
      department,
      status: openingStatus,
    }

    setOpenings((currentOpenings) => [...currentOpenings, nextOpening])
    setPositionApplied(trimmedTitle)
    setJobTitle('')
    setDepartment(departments[0])
    setOpeningStatus('Draft')
    setFormError('')
    setFeedback('Job opening created successfully')
    setIsOpeningFormOpen(false)
  }

  const handleSaveCandidate = () => {
    const trimmedName = candidateName.trim()
    const trimmedEmail = candidateEmail.trim()
    const trimmedPhone = candidatePhone.trim()

    if (!trimmedName || !trimmedEmail || !trimmedPhone) {
      setFormError('Candidate name, email and phone are required.')
      return
    }

    const nextCandidate: Candidate = {
      id: getNextCandidateId(candidates),
      name: trimmedName,
      email: trimmedEmail,
      phone: trimmedPhone,
      position: positionApplied,
      source: candidateSource,
      status: applicationStatus,
    }

    setCandidates((currentCandidates) => [...currentCandidates, nextCandidate])
    setCandidateName('')
    setCandidateEmail('')
    setCandidatePhone('')
    setCandidateSource(candidateSources[0])
    setApplicationStatus('Applied')
    setFormError('')
    setFeedback('Candidate created successfully')
    setIsCandidateFormOpen(false)
  }

  const handleConvertCandidate = (candidate: Candidate) => {
    const nextEmployee: ConvertedEmployee = {
      id: `EMP-${candidate.id}`,
      candidateId: candidate.id,
      name: candidate.name,
      email: candidate.email,
      role: candidate.position,
      department: getDepartmentForPosition(candidate.position, openings),
    }

    setConvertedEmployees((currentEmployees) => [...currentEmployees, nextEmployee])
    setFeedback('Candidate converted to employee successfully')
  }

  return (
    <>
      <section className="page-heading recruitment-heading">
        <p className="eyebrow">Full HR lifecycle</p>
        <h2>Recruitment Management</h2>
        <p>Manage job openings, candidate profiles, hiring sources and pipeline status.</p>
      </section>

      <section className="recruitment-summary" aria-label="Recruitment summary">
        <article className="recruitment-stat-card">
          <span>Job openings</span>
          <strong>{openings.length}</strong>
          <p>{activeOpenings} active openings</p>
        </article>
        <article className="recruitment-stat-card">
          <span>Candidates</span>
          <strong>{candidates.length}</strong>
          <p>Across hiring pipeline</p>
        </article>
        <article className="recruitment-stat-card">
          <span>Hiring sources</span>
          <strong>{candidateSources.length}</strong>
          <p>Tracked candidate origins</p>
        </article>
      </section>

      <section className="content-grid page-only-grid">
        <div className="card wide-card recruitment-card">
          <div className="card-header">
            <div>
              <p className="eyebrow">Open roles</p>
              <h2>Job Openings</h2>
            </div>
            <button className="primary-button" onClick={() => setIsOpeningFormOpen((isOpen) => !isOpen)} type="button">
              {isOpeningFormOpen ? 'Close form' : 'Add job opening'}
            </button>
          </div>

          {feedback && (
            <div className="success-banner" role="status">
              {feedback}
            </div>
          )}

          {isOpeningFormOpen && (
            <div className="recruitment-form" aria-label="Add job opening form">
              <label>
                <span>Job title</span>
                <input
                  onChange={(event) => {
                    setJobTitle(event.target.value)
                    setFormError('')
                  }}
                  placeholder="Job title"
                  type="text"
                  value={jobTitle}
                />
              </label>
              <label>
                <span>Department</span>
                <select onChange={(event) => setDepartment(event.target.value)} value={department}>
                  {departments.map((departmentOption) => (
                    <option key={departmentOption} value={departmentOption}>
                      {departmentOption}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Opening status</span>
                <select onChange={(event) => setOpeningStatus(event.target.value as OpeningStatus)} value={openingStatus}>
                  {openingStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
              {formError && <p className="form-error">{formError}</p>}
              <button className="primary-button" onClick={handleSaveOpening} type="button">
                Save job opening
              </button>
            </div>
          )}

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Job title</th>
                  <th>Department</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {openings.map((opening) => (
                  <tr key={opening.id}>
                    <td>
                      <strong>{opening.title}</strong>
                      <span>{opening.id}</span>
                    </td>
                    <td>{opening.department}</td>
                    <td>
                      <span className={`recruitment-status ${opening.status.toLowerCase()}`}>{opening.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card recruitment-card">
          <div className="card-header compact">
            <div>
              <p className="eyebrow">Pipeline</p>
              <h2>Candidate Pipeline</h2>
            </div>
          </div>
          <div className="candidate-pipeline">
            {pipelineCounts.map((item) => (
              <article className="candidate-pipeline-item" key={item.status}>
                <span>{item.status}</span>
                <strong>{item.count}</strong>
              </article>
            ))}
          </div>
        </div>

        <div className="card wide-card recruitment-card">
          <div className="card-header">
            <div>
              <p className="eyebrow">Applicants</p>
              <h2>Candidates</h2>
            </div>
            <button className="primary-button" onClick={() => setIsCandidateFormOpen((isOpen) => !isOpen)} type="button">
              {isCandidateFormOpen ? 'Close form' : 'Add candidate'}
            </button>
          </div>

          {isCandidateFormOpen && (
            <div className="recruitment-form candidate-form" aria-label="Add candidate form">
              <label>
                <span>Candidate name</span>
                <input
                  onChange={(event) => {
                    setCandidateName(event.target.value)
                    setFormError('')
                  }}
                  placeholder="Candidate name"
                  type="text"
                  value={candidateName}
                />
              </label>
              <label>
                <span>Email</span>
                <input
                  onChange={(event) => {
                    setCandidateEmail(event.target.value)
                    setFormError('')
                  }}
                  placeholder="candidate@example.com"
                  type="email"
                  value={candidateEmail}
                />
              </label>
              <label>
                <span>Phone</span>
                <input
                  onChange={(event) => {
                    setCandidatePhone(event.target.value)
                    setFormError('')
                  }}
                  placeholder="0900000000"
                  type="text"
                  value={candidatePhone}
                />
              </label>
              <label>
                <span>Position applied</span>
                <select onChange={(event) => setPositionApplied(event.target.value)} value={positionApplied}>
                  {openings.map((opening) => (
                    <option key={opening.id} value={opening.title}>
                      {opening.title}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Candidate source</span>
                <select onChange={(event) => setCandidateSource(event.target.value)} value={candidateSource}>
                  {candidateSources.map((source) => (
                    <option key={source} value={source}>
                      {source}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Application status</span>
                <select onChange={(event) => setApplicationStatus(event.target.value as CandidateStatus)} value={applicationStatus}>
                  {candidateStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
              {formError && <p className="form-error">{formError}</p>}
              <button className="primary-button" onClick={handleSaveCandidate} type="button">
                Save candidate
              </button>
            </div>
          )}

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Position</th>
                  <th>Source</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((candidate) => {
                  const isConverted = convertedEmployees.some((employee) => employee.candidateId === candidate.id)

                  return (
                    <tr key={candidate.id}>
                      <td>
                        <strong>{candidate.name}</strong>
                        <span>{candidate.email} - {candidate.phone}</span>
                      </td>
                      <td>{candidate.position}</td>
                      <td>{candidate.source}</td>
                      <td>
                        <span className={`candidate-status ${candidate.status.toLowerCase()}`}>
                          {isConverted ? 'Converted' : candidate.status}
                        </span>
                      </td>
                      <td>
                        {candidate.status === 'Hired' && !isConverted ? (
                          <button
                            aria-label={`Convert ${candidate.name} to employee`}
                            className="ghost-button"
                            onClick={() => handleConvertCandidate(candidate)}
                            type="button"
                          >
                            Convert
                          </button>
                        ) : (
                          <span className="candidate-action-note">{isConverted ? 'Employee created' : 'N/A'}</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card wide-card recruitment-card">
          <div className="card-header compact">
            <div>
              <p className="eyebrow">Hired candidates</p>
              <h2>Converted Employees</h2>
            </div>
          </div>
          <div className="converted-employee-list">
            {convertedEmployees.length === 0 ? (
              <p className="converted-empty">No hired candidates converted yet.</p>
            ) : (
              convertedEmployees.map((employee) => (
                <article className="converted-employee-item" key={employee.id}>
                  <div>
                    <strong>{employee.name}</strong>
                    <span>{employee.email}</span>
                  </div>
                  <div>
                    <strong>{employee.id}</strong>
                    <span>{employee.role} - {employee.department}</span>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </section>
    </>
  )
}

function getNextOpeningId(openings: JobOpening[]) {
  const nextNumber = Math.max(...openings.map((opening) => Number(opening.id.replace('JOB-', '')))) + 1
  return `JOB-${String(nextNumber).padStart(3, '0')}`
}

function getNextCandidateId(candidates: Candidate[]) {
  const nextNumber = Math.max(...candidates.map((candidate) => Number(candidate.id.replace('CAN-', '')))) + 1
  return `CAN-${String(nextNumber).padStart(3, '0')}`
}

function getDepartmentForPosition(position: string, openings: JobOpening[]) {
  return openings.find((opening) => opening.title === position)?.department ?? 'People Ops'
}
