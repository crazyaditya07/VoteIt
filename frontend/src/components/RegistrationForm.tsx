import React, { useState } from 'react';

interface RegistrationFormProps {
    onSuccess: () => void;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({ onSuccess }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [id, setId] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!name.trim()) {
            setError('Name is required.');
            return;
        }

        if (!email.trim()) {
            setError('Email is required.');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address.');
            return;
        }

        // Validation passed, user info is not stored on-chain.
        // Proceed to allow wallet connection.
        onSuccess();
    };

    return (
        <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto p-6 bg-slate-800 rounded-xl shadow-lg border border-slate-700">
            <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-slate-100 mb-2">Voter Registration</h2>
                <p className="text-slate-400 text-sm">Please provide your details before voting. This information is kept local and NOT stored on the blockchain.</p>
            </div>

            <form onSubmit={handleSubmit} className="w-full space-y-4">
                {error && (
                    <div className="p-3 bg-red-900/50 border border-red-500 rounded text-red-200 text-sm">
                        {error}
                    </div>
                )}

                <div className="space-y-1">
                    <label htmlFor="name" className="text-sm font-medium text-slate-300">Full Name *</label>
                    <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-3 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        placeholder="Jane Doe"
                    />
                </div>

                <div className="space-y-1">
                    <label htmlFor="email" className="text-sm font-medium text-slate-300">Email Address *</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-3 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        placeholder="jane@example.com"
                    />
                </div>

                <div className="space-y-1">
                    <label htmlFor="id" className="text-sm font-medium text-slate-300">ID Number (Optional)</label>
                    <input
                        id="id"
                        type="text"
                        value={id}
                        onChange={(e) => setId(e.target.value)}
                        className="w-full p-3 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        placeholder="Optional identifier"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full mt-6 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800"
                >
                    Continue to Voting
                </button>
            </form>
        </div>
    );
};
