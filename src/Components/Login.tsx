import { useState, useEffect } from 'react';
import { supabase } from '../SuperbaseConfig/supabaseClient';
import logoImg from '../assets/sogrinha_logo.png';
import katanaImg from '../assets/katana_desenho.png';

type LoginProps = {
    onLogin: () => void;
};

const Login = ({ onLogin }: LoginProps) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    // Easter egg states
    const [logoClickCount, setLogoClickCount] = useState(0);
    const [showKatana, setShowKatana] = useState(false);
    const [konamiSequence, setKonamiSequence] = useState<string[]>([]);
    const [showEasterEggMessage, setShowEasterEggMessage] = useState(false);

    // Konami code sequence: ↑↑↓↓←→←→BA
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const newSequence = [...konamiSequence, event.code].slice(-10);
            setKonamiSequence(newSequence);

            // Check if konami code is complete
            if (newSequence.length === 10 && newSequence.every((key, index) => key === konamiCode[index])) {
                triggerEasterEgg('Konami Code activated! 🎮');
                setKonamiSequence([]);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [konamiSequence]);

    const handleLogoClick = () => {
        const newCount = logoClickCount + 1;
        setLogoClickCount(newCount);

        if (newCount === 7) {
            triggerEasterEgg('Logo Master! 🐕');
            setLogoClickCount(0);
        } else if (newCount >= 3) {
            // Show a hint after 3 clicks
            setShowEasterEggMessage(true);
            setTimeout(() => setShowEasterEggMessage(false), 2000);
        }
    };

    const triggerEasterEgg = (message: string) => {
        setShowKatana(true);
        setShowEasterEggMessage(true);

        // Criar confetes
        const confettiContainer = document.createElement('div');
        confettiContainer.className = 'fixed top-0 left-0 w-full h-full pointer-events-none z-50';
        document.body.appendChild(confettiContainer);

        const colors = ['#f39200', '#742851', '#0067B1']; // Amarelo, Rosa, Azul

        for (let i = 0; i < 500; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = Math.random() * 2 + 's';
            confettiContainer.appendChild(confetti);
        }

        setTimeout(() => {
            document.body.removeChild(confettiContainer);
        }, 5000);

        // Show celebration message
        const celebration = document.createElement('div');
        celebration.innerHTML = message;
        celebration.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full shadow-lg z-50 animate-bounce font-bold';
        document.body.appendChild(celebration);

        setTimeout(() => {
            document.body.removeChild(celebration);
            setShowEasterEggMessage(false);
        }, 3000);

        // Reset after 10 seconds
        setTimeout(() => {
            setShowKatana(false);
        }, 10000);
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                setError(error.message);
            } else {
                onLogin();
            }
        } catch (err) {
            setError('Ocorreu um erro ao fazer login.');
            console.error('Erro de login:', err);
        } finally {
            setLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 relative">
            <style>
                {`
                .confetti {
                    position: absolute;
                    width: 10px;
                    height: 10px;
                    background-color: #f39200;
                    opacity: 0.7;
                    animation: fall 3s linear infinite;
                    border-radius: 50%;
                }

                @keyframes fall {
                    0% {
                        transform: translateY(-100vh) rotate(0deg);
                    }
                    100% {
                        transform: translateY(100vh) rotate(720deg);
                    }
                }
                `}
            </style>
            {/* Easter egg hint */}
            {showEasterEggMessage && logoClickCount >= 3 && logoClickCount < 7 && (
                <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-yellow-900 px-4 py-2 rounded-lg shadow-lg z-50 animate-pulse">
                    Continue clicando na logo... 🤔 ({7 - logoClickCount} restantes)
                </div>
            )}

            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl">
                <div className="flex flex-col items-center justify-center">
                    <div
                        onClick={handleLogoClick}
                        className={`cursor-pointer transition-all duration-500 transform hover:scale-105 ${showKatana ? '' : ''} ${logoClickCount >= 3 ? 'animate-bounce' : ''}`}
                        title={logoClickCount >= 3 ? `Cliques: ${logoClickCount}/7` : 'Sogrinha Logo'}
                    >
                        <img
                            src={showKatana ? katanaImg : logoImg}
                            alt={showKatana ? "Katana Desenho" : "Sogrinha Logo"}
                            className={`w-32 h-auto mb-6 transition-all duration-500 ${showKatana ? 'scale-110' : ''}`}
                        />
                    </div>
                    <h1 className={`text-3xl font-bold transition-all duration-500 ${showKatana ? 'text-pink-600 animate-pulse' : 'text-indigo-800'
                        }`}>
                        {showKatana ? 'Diga olá para a Katana! 🐕' : 'Bem-vindo'}
                    </h1>
                    <p className="mt-2 text-sm text-gray-600">
                        {showKatana
                            ? 'A cachorrinha mais fofa do mundo está aqui!'
                            : 'Faça login para acessar o sistema de gerenciamento de contratos'
                        }
                    </p>

                </div>

                {error && (
                    <div className="p-4 text-sm text-red-700 bg-red-100 rounded-lg border-l-4 border-red-500 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {error}
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <div className="space-y-5">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                    </svg>
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                                    placeholder="seu@email.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Senha
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={togglePasswordVisibility}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-indigo-600 focus:outline-none focus:text-indigo-600"
                                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                                    title={showPassword ? "Ocultar senha" : "Mostrar senha"}
                                >
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                                            <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                                Lembrar-me
                            </label>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white transition-all duration-200 ${showKatana
                                ? 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700'
                                : 'bg-indigo-600 hover:bg-indigo-700'
                                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                        >
                            {loading ? (
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                    </svg>
                                </span>
                            )}
                            {loading ? 'Entrando...' : (showKatana ? 'Entrar com Katana! 🐕' : 'Entrar')}
                        </button>
                    </div>
                </form>

                <div className="text-center mt-4">
                    <p className="text-sm text-gray-600">
                        &copy; {new Date().getFullYear()} Sogrinha. Todos os direitos reservados.
                    </p>
                    {showKatana && (
                        <p className="text-xs text-pink-500 mt-1 animate-pulse">
                            🎉 Easter egg activated! Reset in 10s 🎉
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Login;
