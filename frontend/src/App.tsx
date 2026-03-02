import { useState } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { RegistrationForm } from './components/RegistrationForm';
import { VotingInterface } from './components/VotingInterface';
import { LogOut } from 'lucide-react';

function App() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const { address, isConnected } = useAccount();
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col w-full font-sans">
      <header className="w-full p-6 flex justify-between items-center border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/50">
            V
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">VoteIt</h1>
        </div>

        {isConnected && formSubmitted && (
          <div className="flex items-center gap-4">
            <div className="px-3 py-1.5 bg-slate-800 rounded-lg text-sm font-mono text-slate-300 border border-slate-700">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </div>
            <button
              onClick={() => disconnect()}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Disconnect"
            >
              <LogOut size={18} />
            </button>
          </div>
        )}
      </header>

      <main className="flex-1 w-full flex items-center justify-center p-6">
        {!formSubmitted ? (
          <div className="w-full max-w-md animate-fade-in">
            <RegistrationForm onSuccess={() => setFormSubmitted(true)} />
          </div>
        ) : !isConnected ? (
          <div className="text-center p-8 bg-slate-800 rounded-2xl shadow-xl max-w-md w-full border border-slate-700 animate-fade-in">
            <h2 className="text-2xl font-bold mb-4 text-white">Connect Wallet</h2>
            <p className="text-slate-400 mb-8">
              Your details have been registered. Please connect your Web3 wallet to access the voting terminal.
            </p>
            <div className="flex flex-col gap-3">
              {connectors.map((connector) => (
                <button
                  key={connector.uid}
                  onClick={() => connect({ connector })}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-all shadow-md hover:scale-[1.02] hover:shadow-blue-500/20 active:scale-[0.98]"
                >
                  Connect {connector.name}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="w-full max-w-3xl animate-fade-in">
            <VotingInterface />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
