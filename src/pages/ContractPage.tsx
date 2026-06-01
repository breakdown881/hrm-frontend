import { useEffect, useMemo, useState } from 'react'
import './ContractPage.css'
import { employees as mockEmployees } from '../data/hrmData'
import type { Employee } from '../data/hrmData'
import { createContract, fetchContracts, fetchEmployees } from '../services/hrmApi'

type ContractStatus = 'Active' | 'Expiring soon' | 'Expired'

type ContractRecord = {
  backendId?: number
  id: string
  employee: string
  employeeBackendId?: number
  type: string
  startDate: string
  endDate: string
  status: ContractStatus
}

const contractTypes = ['Probation Contract', 'Fixed-term Contract', 'Indefinite Contract']
const contractStatuses: ContractStatus[] = ['Active', 'Expiring soon', 'Expired']

const initialContracts: ContractRecord[] = [
  {
    id: 'CON-001',
    employee: 'Nguyen Minh Anh',
    type: 'Indefinite Contract',
    startDate: '2024-01-15',
    endDate: 'No end date',
    status: 'Active',
  },
  {
    id: 'CON-002',
    employee: 'Tran Quoc Huy',
    type: 'Fixed-term Contract',
    startDate: '2025-07-01',
    endDate: '2026-06-30',
    status: 'Expiring soon',
  },
  {
    id: 'CON-003',
    employee: 'Pham Gia Bao',
    type: 'Fixed-term Contract',
    startDate: '2025-03-01',
    endDate: '2027-02-28',
    status: 'Active',
  },
]

export function ContractPage({ apiToken }: { apiToken?: string | null }) {
  const [contracts, setContracts] = useState<ContractRecord[]>(initialContracts)
  const [employeeOptions, setEmployeeOptions] = useState<Employee[]>(mockEmployees)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [employeeName, setEmployeeName] = useState(mockEmployees[0].name)
  const [contractType, setContractType] = useState(contractTypes[0])
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [status, setStatus] = useState<ContractStatus>('Active')
  const [formError, setFormError] = useState('')
  const [feedback, setFeedback] = useState('')

  const activeCount = useMemo(() => contracts.filter((contract) => contract.status === 'Active').length, [contracts])
  const expiringCount = useMemo(
    () => contracts.filter((contract) => contract.status === 'Expiring soon').length,
    [contracts],
  )

  useEffect(() => {
    if (!apiToken) {
      return
    }

    let isMounted = true

    Promise.all([fetchContracts(apiToken), fetchEmployees(apiToken)])
      .then(([apiContracts, apiEmployees]) => {
        if (isMounted) {
          setContracts(apiContracts)
          setEmployeeOptions(apiEmployees)
          setEmployeeName(apiEmployees[0]?.name ?? mockEmployees[0].name)
        }
      })
      .catch(() => {
        // Keep mock data available when the API is offline during local UI work.
      })

    return () => {
      isMounted = false
    }
  }, [apiToken])

  const handleSaveContract = async () => {
    const trimmedStartDate = startDate.trim()
    const trimmedEndDate = endDate.trim()

    if (!trimmedStartDate || !trimmedEndDate) {
      setFormError('Start date and end date are required.')
      return
    }

    const localContract: ContractRecord = {
      id: getNextContractId(contracts),
      employee: employeeName,
      type: contractType,
      startDate: trimmedStartDate,
      endDate: trimmedEndDate,
      status,
    }
    const selectedEmployee = employeeOptions.find((employee) => employee.name === employeeName)
    let nextContract = localContract

    if (apiToken && selectedEmployee?.backendId) {
      try {
        nextContract = await createContract(apiToken, {
          employeeId: selectedEmployee.backendId,
          contractType,
          startDate: trimmedStartDate,
          endDate: trimmedEndDate,
          status,
        })
      } catch {
        nextContract = localContract
      }
    }

    setContracts((currentContracts) => [...currentContracts, nextContract])
    setStartDate('')
    setEndDate('')
    setStatus('Active')
    setFormError('')
    setFeedback('Contract created successfully')
    setIsFormOpen(false)
  }

  return (
    <>
      <section className="page-heading contract-heading">
        <p className="eyebrow">Core HR workflow</p>
        <h2>Contract Management</h2>
        <p>Manage employee contract terms, validity status and expiring contract alerts for HR.</p>
      </section>

      <section className="contract-summary" aria-label="Contract summary">
        <article className="contract-stat-card">
          <span>Total contracts</span>
          <strong>{contracts.length}</strong>
          <p>Tracked employee agreements</p>
        </article>
        <article className="contract-stat-card">
          <span>Active contracts</span>
          <strong>{activeCount}</strong>
          <p>Currently valid terms</p>
        </article>
        <article className="contract-stat-card warning">
          <span>Expiring soon</span>
          <strong>{expiringCount}</strong>
          <p>Need HR follow-up</p>
        </article>
      </section>

      <section className="content-grid page-only-grid">
        <div className="card wide-card contract-card">
          <div className="card-header">
            <div>
              <p className="eyebrow">Employment agreements</p>
              <h2>Contract Registry</h2>
            </div>
            <button className="primary-button" onClick={() => setIsFormOpen((isOpen) => !isOpen)} type="button">
              {isFormOpen ? 'Close form' : 'Add contract'}
            </button>
          </div>

          {feedback && (
            <div className="success-banner" role="status">
              {feedback}
            </div>
          )}

          {isFormOpen && (
            <div className="contract-form" aria-label="Add contract form">
              <label>
                <span>Employee</span>
                <select onChange={(event) => setEmployeeName(event.target.value)} value={employeeName}>
                  {employeeOptions.map((employee) => (
                    <option key={employee.id} value={employee.name}>
                      {employee.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Contract type</span>
                <select onChange={(event) => setContractType(event.target.value)} value={contractType}>
                  {contractTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Start date</span>
                <input
                  onChange={(event) => {
                    setStartDate(event.target.value)
                    setFormError('')
                  }}
                  placeholder="2026-06-01"
                  type="text"
                  value={startDate}
                />
              </label>
              <label>
                <span>End date</span>
                <input
                  onChange={(event) => {
                    setEndDate(event.target.value)
                    setFormError('')
                  }}
                  placeholder="2026-11-30"
                  type="text"
                  value={endDate}
                />
              </label>
              <label>
                <span>Status</span>
                <select onChange={(event) => setStatus(event.target.value as ContractStatus)} value={status}>
                  {contractStatuses.map((contractStatus) => (
                    <option key={contractStatus} value={contractStatus}>
                      {contractStatus}
                    </option>
                  ))}
                </select>
              </label>
              {formError && <p className="form-error">{formError}</p>}
              <button className="primary-button" onClick={handleSaveContract} type="button">
                Save contract
              </button>
            </div>
          )}

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Contract type</th>
                  <th>Start date</th>
                  <th>End date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {contracts.map((contract) => (
                  <tr key={contract.id}>
                    <td>
                      <strong>{contract.employee}</strong>
                      <span>{contract.id}</span>
                    </td>
                    <td>{contract.type}</td>
                    <td>{contract.startDate}</td>
                    <td>{contract.endDate}</td>
                    <td>
                      <span className={`contract-status ${getStatusClassName(contract.status)}`}>{contract.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card contract-card">
          <div className="card-header compact">
            <div>
              <p className="eyebrow">HR alerts</p>
              <h2>Expiry Watchlist</h2>
            </div>
          </div>
          <div className="contract-watchlist">
            {contracts
              .filter((contract) => contract.status === 'Expiring soon')
              .map((contract) => (
                <article className="contract-watchlist-item" key={contract.id}>
                  <div>
                    <strong>{contract.employee}</strong>
                    <span>{contract.type}</span>
                  </div>
                  <span>{contract.endDate}</span>
                </article>
              ))}
          </div>
        </div>
      </section>
    </>
  )
}

function getNextContractId(contracts: ContractRecord[]) {
  const nextNumber = Math.max(...contracts.map((contract) => Number(contract.id.replace('CON-', '')))) + 1
  return `CON-${String(nextNumber).padStart(3, '0')}`
}

function getStatusClassName(status: ContractStatus) {
  return status.toLowerCase().replace(/\s+/g, '-')
}
