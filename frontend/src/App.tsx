import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAccount, useDisconnect } from 'wagmi';
import { LogOut } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { VotingInterface } from './components/VotingInterface';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

function AppContent() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  return (
    <div className="min-h-screen relative text-slate-100 flex flex-col w-full font-sans antialiased selection:bg-blue-500/30">
      {/* Background gradients */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a1930] to-slate-950 -z-20" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-blue-600/10 blur-[120px] -z-10 pointer-events-none rounded-full" />

      <header className="w-full px-6 py-4 sm:px-8 border-b border-white/5 bg-slate-900/40 backdrop-blur-xl sticky top-0 z-50 transition-all">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(59,130,246,0.5)] border border-white/10">
              V
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300">VoteIt</h1>
          </div>

          {isConnected && (
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full text-sm font-medium tracking-wide text-slate-300 border border-white/10 shadow-inner flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                <span className="hidden sm:inline">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
                <span className="sm:hidden">{address?.slice(0, 4)}...{address?.slice(-3)}</span>
              </div>
              <button
                onClick={() => disconnect()}
                className="p-2 sm:p-2.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-all hover:scale-105 active:scale-95"
                title="Disconnect Wallet"
              >
                <LogOut size={18} />
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 w-full flex flex-col items-center justify-center p-4 sm:p-8 md:p-12 max-w-6xl mx-auto">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/vote/:pollId" element={<VotingInterface />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
