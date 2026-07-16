import { doc, type Template } from './template'

export const DOC_TEMPLATES: Template[] = [
  {
    id: 'prd',
    name: 'Product requirements doc',
    description: 'Structure for product specification and planning',
    type: 'doc',
    content: doc(`
      <h1>[Product Name] PRD</h1>
      <h2>Overview</h2>
      <p>This document outlines the product requirements for [Product Name]. It serves as a reference for all stakeholders and development team members.</p>
      <h2>Problem</h2>
      <p>Our users currently struggle with [specific pain point]. This limits their ability to [desired outcome], resulting in [business impact].</p>
      <h2>Goals</h2>
      <ul>
        <li>Reduce time spent on [specific task] by enabling [solution]</li>
        <li>Increase user retention by improving [aspect of experience]</li>
        <li>Enable [new capability] to unlock [business opportunity]</li>
      </ul>
      <h2>Non-goals</h2>
      <ul>
        <li>Mobile app development (focus on web first)</li>
        <li>Integration with [external system] in initial release</li>
      </ul>
      <h2>Requirements</h2>
      <ol>
        <li>User must be able to [core user action] within [timeframe]</li>
        <li>System must support [scale/performance requirement] for [user segment]</li>
        <li>Product must maintain [compliance/security] standards as defined in [reference]</li>
        <li>User data must be [retention policy] according to [privacy policy]</li>
      </ol>
      <h2>Success metrics</h2>
      <ul>
        <li><strong>Adoption:</strong> 40% of active users try feature within 2 weeks</li>
        <li><strong>Engagement:</strong> 25% weekly active usage among adopters</li>
        <li><strong>Satisfaction:</strong> 4.0+ NPS score from beta users</li>
      </ul>
      <h2>Open questions</h2>
      <ul>
        <li>Should we support [feature variant]? Depends on customer feedback.</li>
        <li>Timeline for [dependent feature]?</li>
      </ul>
    `),
  },
  {
    id: 'meeting-notes',
    name: 'Meeting notes',
    description: 'Record decisions and action items from team meetings',
    type: 'doc',
    content: doc(`
      <h1>Meeting notes — [Date]</h1>
      <p><strong>Attendees:</strong> [Name], [Name], [Name], [Name]</p>
      <h2>Agenda</h2>
      <ol>
        <li>Project status update and blockers</li>
        <li>Design review for [feature name]</li>
        <li>Sprint planning for next iteration</li>
      </ol>
      <h2>Notes</h2>
      <p>The team aligned on prioritizing [feature] based on customer feedback. Design mockups received approval, with minor adjustments requested on [specific element].</p>
      <p>We discussed the technical approach for [system component]. The proposal to use [technology] was well-received, and we will begin prototyping next week.</p>
      <p>[Name] raised concerns about timeline impact from [dependency]. Team will reassess resource allocation and get back to stakeholders by [date].</p>
      <h2>Decisions</h2>
      <ul>
        <li>Approved moving forward with [approach] as primary solution</li>
        <li>Decided to defer [lower-priority item] to Q3 roadmap</li>
      </ul>
      <h2>Action items</h2>
      <ul>
        <li><strong>[Name]</strong> — Finalize technical design doc and share with team by Friday</li>
        <li><strong>[Name]</strong> — Collect feedback from customer advisory group on [topic]</li>
        <li><strong>[Name]</strong> — Update project timeline and publish updated roadmap</li>
      </ul>
    `),
  },
  {
    id: 'project-brief',
    name: 'Project brief',
    description: 'High-level overview of project scope and milestones',
    type: 'doc',
    content: doc(`
      <h1>[Project Name] Brief</h1>
      <h2>Summary</h2>
      <p>[Project Name] is a [duration] initiative to [primary objective]. Success will be measured by [key success criterion], enabling [business impact].</p>
      <h2>Background</h2>
      <p>We identified [problem/opportunity] through [how we discovered it]. This aligns with our strategic priority to [strategic goal]. Early validation shows [validation result], confirming market demand.</p>
      <h2>Scope</h2>
      <ul>
        <li><strong>In:</strong> [Feature/component], [Feature/component], [Feature/component]</li>
        <li><strong>Out:</strong> [Non-included item], [Non-included item]</li>
      </ul>
      <h2>Timeline</h2>
      <ul>
        <li><strong>Discovery & Design:</strong> Week 1-2</li>
        <li><strong>Development & Testing:</strong> Week 3-6</li>
        <li><strong>Launch & Iteration:</strong> Week 7+</li>
      </ul>
      <h2>Team</h2>
      <ul>
        <li><strong>Product Lead:</strong> [Name]</li>
        <li><strong>Engineering Lead:</strong> [Name]</li>
        <li><strong>Design Lead:</strong> [Name]</li>
        <li><strong>Marketing:</strong> [Name]</li>
      </ul>
      <h2>Risks</h2>
      <ul>
        <li><strong>[Risk]:</strong> [Description]. Mitigation: [Action]</li>
        <li><strong>[Risk]:</strong> [Description]. Mitigation: [Action]</li>
      </ul>
    `),
  },
  {
    id: 'decision-log',
    name: 'Decision log',
    description: 'Record significant architectural and strategic decisions',
    type: 'doc',
    content: doc(`
      <h1>Decision log</h1>
      <p>This log documents key decisions made during the project, including the context, decision, and consequences of each choice. It serves as a reference for understanding why certain technical and strategic directions were chosen.</p>
      <h2>ADR-001: Use PostgreSQL for primary data store</h2>
      <p><strong>Status:</strong> Approved | <strong>Date:</strong> 2026-01-15</p>
      <p><strong>Context:</strong> We needed to select a relational database that could scale to millions of records while maintaining ACID compliance and supporting complex queries.</p>
      <p><strong>Decision:</strong> Adopt PostgreSQL as the primary data store, leveraging its reliability, JSON support, and proven performance at scale.</p>
      <p><strong>Consequences:</strong> Requires PostgreSQL expertise in hiring. Enables rich data modeling. Increases operational responsibility for backups and replication.</p>
      <h2>ADR-002: Monorepo for shared packages</h2>
      <p><strong>Status:</strong> Approved | <strong>Date:</strong> 2026-02-03</p>
      <p><strong>Context:</strong> Multiple products share common utilities and components. Managing dependencies across separate repositories was becoming a bottleneck.</p>
      <p><strong>Decision:</strong> Migrate to a monorepo structure using Pnpm workspaces to centralize shared code while maintaining clear module boundaries.</p>
      <p><strong>Consequences:</strong> Simplified dependency management and atomic updates across products. Requires disciplined module organization to prevent tight coupling.</p>
      <h2>ADR-003: Design tokens over hardcoded colors</h2>
      <p><strong>Status:</strong> Approved | <strong>Date:</strong> 2026-02-20</p>
      <p><strong>Context:</strong> Design system consistency was difficult to maintain with colors scattered across component files. Brand updates required manual refactoring.</p>
      <p><strong>Decision:</strong> Implement a centralized design token system for colors, spacing, and typography, consumed by React components and CSS.</p>
      <p><strong>Consequences:</strong> Single source of truth for design properties. Enables rapid theme changes and a/b testing. Requires tooling investment and team training.</p>
    `),
  },
]
