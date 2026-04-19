import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleRecover = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-boundary-card">
            <div className="error-boundary-icon">
              <AlertTriangle size={32} />
            </div>
            <h2 className="error-boundary-title">Something went wrong</h2>
            <p className="error-boundary-message">
              An unexpected error occurred. Your projects are safe in local storage.
            </p>
            {this.state.error && (
              <pre className="error-boundary-detail">
                {this.state.error.toString()}
              </pre>
            )}
            <div className="error-boundary-actions">
              <button className="pill-btn primary" onClick={this.handleRecover}>
                <RefreshCw size={14} /> Try to Recover
              </button>
              <button className="pill-btn ghost" onClick={this.handleReload}>
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
