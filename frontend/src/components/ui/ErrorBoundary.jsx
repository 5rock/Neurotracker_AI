import { Component } from 'react';
import { Link } from 'react-router-dom';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    if (import.meta.env.DEV) {
      console.error('UI error:', error, info);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          padding: 24,
          textAlign: 'center',
        }}
        >
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>
            Something went wrong
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 420, fontSize: 14 }}>
            This page hit an unexpected error. Try refreshing, or return to your dashboard.
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <button type="button" className="btn-primary" onClick={() => window.location.reload()}>
              Refresh
            </button>
            <Link to="/dashboard" className="btn-ghost" style={{ padding: '10px 16px' }}>
              Go to Dashboard
            </Link>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
