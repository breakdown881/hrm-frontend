import './PayrollSummaryCard.css'
export function PayrollSummaryCard() {
  return (
    <div className="card payroll-card">
      <div className="card-header compact">
        <div>
          <p className="eyebrow">Payroll</p>
          <h2>May salary cycle</h2>
        </div>
        <span className="pill warning">Draft</span>
      </div>
      <div className="payroll-breakdown">
        <span>Base salary</span>
        <strong>VND 4.82B</strong>
        <span>Allowances</span>
        <strong>VND 312M</strong>
        <span>Deductions</span>
        <strong>VND 86M</strong>
        <span>Net payroll</span>
        <strong>VND 5.04B</strong>
      </div>
    </div>
  )
}
