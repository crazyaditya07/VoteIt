import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { CreatePoll } from '../components/CreatePoll';

export const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showCreate, setShowCreate] = useState(false);

    if (!user) {
        navigate('/login');
        return null;
    }

    return (
        <div className="w-full max-w-5xl mx-auto p-4 sm:p-8 animate-fade-in flex flex-col items-center">
            <div className="flex justify-between items-center mb-10 w-full border-b border-white/10 pb-6 relative">
                {/* Top subtle glow */}
                <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />

                <div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight">Overview</h1>
                    <p className="text-slate-400 font-medium mt-1">Welcome back, {user.name}</p>
                </div>

                <button
                    onClick={logout}
                    className="px-5 py-2.5 bg-slate-800/50 hover:bg-slate-800 text-white rounded-xl transition-all border border-white/5 hover:border-white/10 shadow-sm shadow-black/50 hover:shadow-md text-sm font-semibold active:scale-95 flex items-center gap-2"
                >
                    Sign Out
                </button>
            </div>

            {!showCreate ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                    {/* Create Poll Card */}
                    <div className="group bg-slate-800/40 backdrop-blur-xl p-8 rounded-[2rem] border border-white/5 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] hover:border-white/10 transition-all flex flex-col h-full relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10 blur-xl group-hover:opacity-30 transition-opacity bg-blue-500 w-32 h-32 rounded-full transform translate-x-10 -translate-y-10" />

                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-600/20 flex items-center justify-center mb-6 border border-white/5 shadow-inner">
                            <span className="text-blue-400 text-2xl">📝</span>
                        </div>

                        <h2 className="text-2xl font-bold text-white mb-2">Deploy Poll</h2>
                        <p className="text-slate-400 mb-8 flex-1 text-sm leading-relaxed">Instantiate a transparent, cryptographically secured voting contract directly onto the Sepolia layer.</p>

                        <button
                            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all shadow-[0_0_20px_rgba(59,130,246,0.2)] hover:shadow-[0_0_25px_rgba(59,130,246,0.4)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
                            onClick={() => setShowCreate(true)}
                        >
                            Initialize Contract
                        </button>
                    </div>

                    {/* Stats/Polls Card */}
                    <div className="bg-slate-800/40 backdrop-blur-xl p-8 rounded-[2rem] border border-white/5 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] flex flex-col h-full relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10 blur-xl bg-purple-500 w-32 h-32 rounded-full transform translate-x-10 -translate-y-10 pointer-events-none" />

                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-600/20 flex items-center justify-center mb-6 border border-white/5 shadow-inner">
                            <span className="text-purple-400 text-2xl">📊</span>
                        </div>

                        <h2 className="text-2xl font-bold text-white mb-2">Your Dashboard</h2>
                        <p className="text-slate-400 text-sm leading-relaxed mb-8 flex-1">Database synchronization mapping ownership natively is slated for Phase 7 implementation.</p>

                        <div className="w-full py-4 px-6 bg-slate-900/50 border border-white/5 rounded-xl flex items-center justify-between shadow-inner">
                            <span className="text-slate-400 font-medium">Active Polling Status</span>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-slate-500" />
                                <span className="text-slate-500 text-sm font-semibold tracking-wider uppercase">Pending</span>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="w-full max-w-2xl animate-fade-in relative z-10">
                    <button
                        onClick={() => setShowCreate(false)}
                        className="flex items-center gap-2 text-slate-400 mb-6 hover:text-white transition-colors group px-4 py-2 bg-slate-800/40 border border-white/5 rounded-full hover:bg-slate-800/60"
                    >
                        <span className="group-hover:-translate-x-1 transition-transform">&larr;</span>
                        <span className="font-medium text-sm">Return to Overview</span>
                    </button>
                    <div className="bg-slate-800/40 backdrop-blur-xl p-8 rounded-[2rem] border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] relative">
                        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-30" />
                        <CreatePoll />
                    </div>
                </div>
            )}
        </div>
    );
};
