import { Link } from 'react-router-dom'
import './marketing.css'

export default function MarketingPage() {
  return (
    <div className="marketing-container">
      {/* Navigation */}
      <nav className="marketing-nav">
        <div className="marketing-nav-left">
          <div className="marketing-nav-logo"></div>
          <div className="marketing-nav-wordmark">breeze</div>
        </div>

        <div className="marketing-nav-center">
          <a href="#product">Product</a>
          <a href="#templates">Templates</a>
          <a href="#pricing">Pricing</a>
          <a href="#blog">Blog</a>
        </div>

        <div className="marketing-nav-right">
          <Link to="/login" className="marketing-nav-login">
            Log in
          </Link>
          <Link to="/login?mode=signup" className="marketing-nav-button">
            Start free
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="marketing-hero">
        <h1 className="marketing-headline">Think together, on one shared canvas</h1>
        <p className="marketing-subtext">
          Flowcharts, wireframes, docs and sticky notes — one fast workspace where your team's ideas take shape.
        </p>

        <div className="marketing-buttons">
          <Link to="/login?mode=signup" className="marketing-button-primary">
            Start for free
          </Link>
          <button className="marketing-button-outline">Watch demo</button>
        </div>

        <div className="marketing-screenshot">
          <span className="marketing-screenshot-label">product screenshot — canvas editor</span>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="marketing-features">
        {/* Flowcharts */}
        <div className="feature-card">
          <div className="feature-icon-box violet">
            <div className="feature-icon-inner violet"></div>
          </div>
          <h3 className="feature-title">Flowcharts</h3>
          <p className="feature-description">
            Map processes with smart connectors that stay tidy as you move things.
          </p>
        </div>

        {/* Wireframes */}
        <div className="feature-card">
          <div className="feature-icon-box teal">
            <div className="feature-icon-inner circle teal"></div>
          </div>
          <h3 className="feature-title">Wireframes</h3>
          <p className="feature-description">
            Sketch product ideas fast with a built-in library of UI elements.
          </p>
        </div>

        {/* Docs */}
        <div className="feature-card">
          <div className="feature-icon-box violet">
            <div className="feature-icon-inner docs violet"></div>
          </div>
          <h3 className="feature-title">Docs</h3>
          <p className="feature-description">
            Write specs and notes with live embeds of your boards.
          </p>
        </div>

        {/* Sticky notes */}
        <div className="feature-card">
          <div className="feature-icon-box teal">
            <div className="feature-icon-inner sticky teal"></div>
          </div>
          <h3 className="feature-title">Sticky notes</h3>
          <p className="feature-description">
            Brainstorm, cluster and vote — retros and workshops made easy.
          </p>
        </div>
      </section>

      {/* CTA Band */}
      <section className="marketing-cta">
        <div className="marketing-cta-content">
          <h2 className="marketing-cta-heading">Bring your team's thinking together</h2>
          <p className="marketing-cta-subtext">Free for up to 3 boards. No credit card required.</p>
        </div>
        <Link to="/login?mode=signup" className="marketing-cta-button">
          Get started
        </Link>
      </section>

      {/* Footer */}
      <footer className="marketing-footer">
        <span>© 2026 Breeze Labs</span>
        <div className="marketing-footer-links">
          <a href="#privacy">Privacy</a>
          <a href="#terms">Terms</a>
          <a href="#contact">Contact</a>
        </div>
      </footer>
    </div>
  )
}
