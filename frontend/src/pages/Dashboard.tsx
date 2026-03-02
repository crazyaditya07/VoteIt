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
        <div className="w-full max-w-4xl mx-auto p-6 animate-fade-in flex flex-col items-center">
            <div className="flex justify-between items-center mb-8 w-full border-b border-slate-700 pb-4">
                <h1 className="text-3xl font-bold text-white">Welcome, {user.name}</h1>
                <button
                    onClick={logout}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors border border-slate-700"
                >
                    Logout
                </button>
            </div>

            {!showCreate ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg">
                        <h2 className="text-xl font-bold text-white mb-4">Create New Poll</h2>
                        <p className="text-slate-400 mb-6">Deploy a new dynamically linked poll directly to the Sepolia blockchain.</p>
                        <button
                            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-all shadow-md"
                            onClick={() => setShowCreate(true)}
                        >
                            Create Poll
                        </button>
                    </div>

                    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg">
                        <h2 className="text-xl font-bold text-white mb-4">Your Polls</h2>
                        <p className="text-slate-400">Database synchronization coming in Phase 6.</p>
                    </div>
                </div>
            ) : (
                <div className="w-full">
                    <button onClick={() => setShowCreate(false)} className="text-blue-400 mb-4 hover:text-blue-300">
                        &larr; Back to Dashboard
                    </button>
                    <CreatePoll />
                </div>
            )}
        </div>
    );
};
