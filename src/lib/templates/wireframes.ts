import { board, wf, label, type Template } from './template'

export const WIREFRAME_TEMPLATES: Template[] = [
  {
    id: 'mobile-login',
    name: 'Mobile login screen',
    description: 'Simple auth screen with email, password, and forgot link',
    type: 'wireframe',
    content: board([
      // Phone frame
      wf('phone-login', 'wf-phone', 80, 60, 300, 620),

      // Logo area (centered at top inside phone)
      wf('logo', 'wf-image', 170, 100, 120, 80),

      // Welcome text
      wf('welcome', 'wf-text', 100, 190, 260, 40, 'Welcome back'),

      // Email input
      wf('email-input', 'wf-input', 100, 240, 260, 44, 'Email'),

      // Password input
      wf('password-input', 'wf-input', 100, 296, 260, 44, 'Password'),

      // Login button
      wf('login-btn', 'wf-button', 100, 360, 260, 44, 'Log in'),

      // Forgot password link
      wf('forgot-link', 'wf-text', 100, 420, 260, 24, 'Forgot password?'),

      // Annotation
      label('auth-label', 440, 200, 'Auth screen'),
    ]),
  },

  {
    id: 'mobile-home-feed',
    name: 'Mobile app home',
    description: 'Feed view with navigation, search, and stacked content cards',
    type: 'wireframe',
    content: board([
      // Phone frame
      wf('phone-feed', 'wf-phone', 80, 60, 300, 620),

      // Tab navigation at top
      wf('nav-tabs', 'wf-tabs', 100, 80, 260, 36),

      // Search input
      wf('search-input', 'wf-input', 100, 124, 260, 40, 'Search'),

      // Card 1 image
      wf('card1-image', 'wf-image', 100, 172, 260, 90),

      // Card 1 caption
      wf('card1-text', 'wf-text', 100, 270, 260, 40, 'Featured story'),

      // Card 2 image
      wf('card2-image', 'wf-image', 100, 318, 260, 90),

      // Card 2 caption
      wf('card2-text', 'wf-text', 100, 416, 260, 40, 'Recent update'),

      // Card 3 image
      wf('card3-image', 'wf-image', 100, 464, 260, 90),

      // Card 3 caption
      wf('card3-text', 'wf-text', 100, 562, 260, 40, 'Latest post'),
    ]),
  },

  {
    id: 'landing-page',
    name: 'Landing page',
    description: 'Desktop hero section with nav, features, and footer',
    type: 'wireframe',
    content: board([
      // Navigation bar
      wf('nav-bar', 'wf-tabs', 80, 60, 760, 44),

      // Hero headline
      wf('headline', 'wf-text', 80, 130, 420, 90, 'Welcome to our product'),

      // Hero CTA button
      wf('hero-cta', 'wf-button', 80, 240, 160, 44, 'Get started'),

      // Hero image
      wf('hero-image', 'wf-image', 540, 130, 300, 200),

      // Feature 1 image
      wf('feature1-image', 'wf-image', 80, 380, 220, 120),

      // Feature 1 text
      wf('feature1-text', 'wf-text', 80, 510, 220, 60, 'Fast & reliable'),

      // Feature 2 image
      wf('feature2-image', 'wf-image', 340, 380, 220, 120),

      // Feature 2 text
      wf('feature2-text', 'wf-text', 340, 510, 220, 60, 'Easy to use'),

      // Feature 3 image
      wf('feature3-image', 'wf-image', 600, 380, 220, 120),

      // Feature 3 text
      wf('feature3-text', 'wf-text', 600, 510, 220, 60, 'Always secure'),

      // Footer
      wf('footer', 'wf-text', 80, 610, 760, 40, 'Copyright 2024'),
    ]),
  },

  {
    id: 'settings-screen',
    name: 'Settings screen',
    description: 'Preferences with toggles, input field, and save action',
    type: 'wireframe',
    content: board([
      // Phone frame
      wf('phone-settings', 'wf-phone', 80, 60, 300, 620),

      // Settings title
      wf('settings-title', 'wf-text', 100, 88, 200, 32, 'Settings'),

      // Notifications toggle row
      wf('notif-label', 'wf-text', 100, 138, 180, 28, 'Notifications'),
      wf('notif-toggle', 'wf-toggle', 290, 140, 56, 28),

      // Dark mode toggle row
      wf('dark-label', 'wf-text', 100, 208, 180, 28, 'Dark mode'),
      wf('dark-toggle', 'wf-toggle', 290, 210, 56, 28),

      // Sounds toggle row
      wf('sound-label', 'wf-text', 100, 278, 180, 28, 'Sound effects'),
      wf('sound-toggle', 'wf-toggle', 290, 280, 56, 28),

      // Private mode toggle row
      wf('private-label', 'wf-text', 100, 348, 180, 28, 'Private mode'),
      wf('private-toggle', 'wf-toggle', 290, 350, 56, 28),

      // Display name input
      wf('displayname-input', 'wf-input', 100, 436, 260, 44, 'Display name'),

      // Save button
      wf('save-btn', 'wf-button', 100, 500, 260, 44, 'Save changes'),

      // Sign out text
      wf('signout-text', 'wf-text', 100, 560, 200, 24, 'Sign out'),
    ]),
  },
]
