import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const srcRoot = join(process.cwd(), 'src')

function readSource(relativePath: string) {
  return readFileSync(join(srcRoot, relativePath), 'utf8')
}

describe('CSS architecture', () => {
  it('keeps page and component styles close to their owners instead of App.css', () => {
    const appCss = readSource('App.css')
    const expectedCssFiles = [
      'components/Sidebar.css',
      'components/Topbar.css',
      'components/MetricCard.css',
      'components/ModuleHero.css',
      'components/ApprovalsCard.css',
      'components/PipelineCard.css',
      'components/RequirementsCard.css',
      'components/PayrollSummaryCard.css',
      'components/RoadmapCard.css',
      'components/EmptyState.css',
      'components/StatusBadge.css',
      'pages/EmployeesPage.css',
      'pages/AccessDeniedPage.css',
    ]

    for (const relativePath of expectedCssFiles) {
      expect(existsSync(join(srcRoot, relativePath)), `${relativePath} should exist`).toBe(true)
    }

    expect(appCss.length).toBeLessThan(7000)
    expect(appCss).not.toContain('.employee-form')
    expect(appCss).not.toContain('.access-denied-card')
    expect(appCss).not.toContain('.role-selector')
    expect(appCss).not.toContain('.sidebar')
  })

  it('imports page-specific CSS from the page component', () => {
    expect(readSource('pages/EmployeesPage.tsx')).toContain("import './EmployeesPage.css'")
    expect(readSource('pages/AccessDeniedPage.tsx')).toContain("import './AccessDeniedPage.css'")
  })
})
