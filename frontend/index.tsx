import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Root bulunamadı');

function showError(msg: string, detail?: string) {
  rootEl.innerHTML = '<div style="padding:2rem;font-family:sans-serif;max-width:600px;color:#0f172a">' +
    '<h1 style="color:#b91c1c;margin-bottom:0.5rem">Hata</h1>' +
    '<p style="margin-bottom:1rem">' + msg.replace(/</g, '&lt;') + '</p>' +
    (detail ? '<pre style="background:#e2e8f0;padding:1rem;overflow:auto;font-size:12px;border-radius:8px">' + detail.replace(/</g, '&lt;') + '</pre>' : '') +
    '<p style="margin-top:1rem;font-size:14px;color:#64748b">F12 ile Console sekmesini açıp hata detayına bakabilirsin.</p></div>';
}

async function bootstrap() {
  try {
    const { AuthProvider } = await import('./context/AuthContext');
    const { ThemeProvider } = await import('./context/ThemeContext');
    const { ErrorBoundary } = await import('./components/ErrorBoundary');
    const App = (await import('./App')).default;
    const root = ReactDOM.createRoot(rootEl);
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <ThemeProvider>
            <AuthProvider>
              <App />
            </AuthProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </React.StrictMode>
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : '';
    showError(message, stack || undefined);
    console.error(err);
  }
}

bootstrap();
