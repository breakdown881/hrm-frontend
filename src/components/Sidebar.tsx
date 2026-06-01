import './Sidebar.css'
import { NavLink } from 'react-router-dom'
import type { Module } from '../data/hrmData'

type SidebarProps = {
  modules: Module[]
}

export function Sidebar({ modules }: SidebarProps) {
  return (
    <aside className="sidebar" aria-label="HRM navigation">
      <div className="brand-card">
        <div className="brand-logo">HR</div>
        <div>
          <strong>HRM System</strong>
          <span>Full HR Workflow</span>
        </div>
      </div>

      <nav className="module-nav">
        {modules.map((module) => (
          <NavLink
            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
            key={module.id}
            to={`/${module.id}`}
          >
            <span aria-hidden="true">{module.icon}</span>
            <span>{module.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-note">
        <strong>Security first</strong>
        <span>Payroll, contract and audit logs must use strict role-based access.</span>
      </div>
    </aside>
  )
}
