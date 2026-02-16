import React from 'react';

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-8 max-w-lg">
            <h1 className="text-xl font-bold text-slate-800 mb-2">Bir hata oluştu</h1>
            <p className="text-slate-600 text-sm mb-4 font-mono break-all">
              {this.state.error.message}
            </p>
            <p className="text-slate-500 text-xs mb-4">
              Tarayıcıda F12 → Console sekmesinde daha fazla ayrıntı görebilirsiniz.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
            >
              Sayfayı yenile
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
