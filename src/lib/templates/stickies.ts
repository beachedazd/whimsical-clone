import { board, label, sticky, type Template } from './template'

export const STICKY_TEMPLATES: Template[] = [
  {
    id: 'retrospective',
    name: 'Sprint retrospective',
    description: 'Organize team feedback in three columns.',
    type: 'sticky',
    content: board([
      label('l1', 80, 60, 'What went well 🎉'),
      label('l2', 380, 60, 'What to improve 🔧'),
      label('l3', 680, 60, 'Action items ✅'),
      sticky('s1', 80, 120, 'Shipped the new editor ahead of schedule', '#a8e6cf'),
      sticky('s2', 80, 270, 'Great cross-team collaboration this sprint', '#a8e6cf'),
      sticky('s3', 80, 420, 'Onboarding process smooth and clear', '#a8e6cf'),
      sticky('s4', 380, 120, 'Core documentation needs significant updates', '#ffb3c1'),
      sticky('s5', 380, 270, 'Testing coverage gaps remain', '#ffb3c1'),
      sticky('s6', 380, 420, 'Meetings running long and unfocused', '#ffb3c1'),
      sticky('s7', 680, 120, 'Timebox standup to 10 minutes', '#b7d8ff'),
      sticky('s8', 680, 270, 'Schedule doc review session', '#b7d8ff'),
      sticky('s9', 680, 420, 'Add tests for payment module', '#b7d8ff'),
    ])
  },
  {
    id: 'brainstorm',
    name: 'Brainstorm board',
    description: 'Generate and organize ideas around a challenge.',
    type: 'sticky',
    content: board([
      label('l1', 380, 60, 'How might we improve onboarding?', 420, 32),
      sticky('s1', 120, 140, 'Build interactive product walkthrough tutorial', '#ffe28a'),
      sticky('s2', 300, 200, 'In-app tutorial with tooltips', '#ffb3c1'),
      sticky('s3', 150, 380, 'Create simplified and faster sign-up flow', '#a8e6cf'),
      sticky('s4', 480, 160, 'Send personalized welcome email series', '#b7d8ff'),
      sticky('s5', 680, 280, 'Live onboarding chat support available', '#ffe28a'),
      sticky('s6', 250, 520, 'Create video quick-start guide for users', '#ffb3c1'),
      sticky('s7', 580, 420, 'Build customizable onboarding setup checklist', '#a8e6cf'),
      sticky('s8', 810, 470, 'Peer buddy matching system launch', '#b7d8ff'),
    ])
  },
  {
    id: 'swot',
    name: 'SWOT analysis',
    description: 'Evaluate strengths, weaknesses, opportunities, threats.',
    type: 'sticky',
    content: board([
      label('l1', 80, 60, 'Strengths'),
      label('l2', 560, 60, 'Weaknesses'),
      label('l3', 80, 420, 'Opportunities'),
      label('l4', 560, 420, 'Threats'),
      sticky('s1', 80, 120, 'Strong brand recognition in market', '#ffe28a'),
      sticky('s2', 80, 270, 'Excellent customer support and retention', '#ffe28a'),
      sticky('s3', 560, 120, 'Limited budget for R&D', '#ffb3c1'),
      sticky('s4', 560, 270, 'Small team for market size', '#ffb3c1'),
      sticky('s5', 80, 480, 'Rapidly emerging new market segments', '#a8e6cf'),
      sticky('s6', 80, 630, 'New AI integration opportunities available', '#a8e6cf'),
      sticky('s7', 560, 480, 'New aggressive competitors entering market', '#b7d8ff'),
      sticky('s8', 560, 630, 'Changing regulatory landscape and compliance', '#b7d8ff'),
    ])
  },
  {
    id: 'project-kickoff',
    name: 'Project kickoff',
    description: 'Establish goals, risks, and open questions.',
    type: 'sticky',
    content: board([
      label('l1', 80, 60, 'Goals'),
      label('l2', 380, 60, 'Risks'),
      label('l3', 680, 60, 'Open questions'),
      sticky('s1', 80, 120, 'Launch MVP by March 31', '#ffe28a'),
      sticky('s2', 80, 270, 'Support 10K concurrent users', '#ffe28a'),
      sticky('s3', 80, 420, 'Achieve 95% uptime SLA', '#ffe28a'),
      sticky('s4', 380, 120, 'Major database scaling technical challenges', '#ffb3c1'),
      sticky('s5', 380, 270, 'Key team member availability', '#ffb3c1'),
      sticky('s6', 380, 420, 'Unexpected third-party API changes impact', '#ffb3c1'),
      sticky('s7', 680, 120, 'Has budget allocation been approved?', '#b7d8ff'),
      sticky('s8', 680, 270, 'What is the dependency timeline?', '#b7d8ff'),
      sticky('s9', 680, 420, 'Are infrastructure specs finalized?', '#b7d8ff'),
    ])
  }
]
