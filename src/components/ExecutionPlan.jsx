export default function ExecutionPlan({ steps = [], activeStep = -1 }) {
  return (
    <div className="card execution-card">
      <div className="card-title">Execution Plan</div>
      <div className="plan-tree">
        {steps.map((step, index) => (
          <div key={step.label + index} className={`plan-node-wrap ${index === activeStep ? 'active' : ''} ${index < activeStep ? 'completed' : ''}`}>
            <div className="plan-node">
              <div className="plan-node-index">{index + 1}</div>
              <div className="plan-node-content">
                <div className="plan-node-label">{step.label}</div>
                <div className="plan-node-detail">{step.detail}</div>
              </div>
            </div>
            {index < steps.length - 1 && <div className="plan-edge"></div>}
          </div>
        ))}
        {steps.length === 0 ? <div className="empty-copy">Run a query to inspect the execution path.</div> : null}
      </div>
    </div>
  )
}
