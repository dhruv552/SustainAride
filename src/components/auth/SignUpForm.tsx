import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import authService from '../../api/authService';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Loader2, ServerCrash, UserPlus, Mail, Phone, Lock, User } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const SignUpForm: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');
    const [networkError, setNetworkError] = useState<string | null>(null);
    const { register, loading, error, clearError, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const checkServerStatus = async () => {
            setServerStatus('checking');
            try {
                const isRunning = await authService.checkServerStatus();
                setServerStatus(isRunning ? 'online' : 'offline');
            } catch (err) {
                setServerStatus('offline');
            }
        };

        checkServerStatus();
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    const validateForm = () => {
        if (password !== confirmPassword) {
            setPasswordError('Passwords do not match');
            return false;
        }

        if (password.length < 8) {
            setPasswordError('Password must be at least 8 characters long');
            return false;
        }

        setPasswordError('');
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setNetworkError(null);
        clearError();

        if (serverStatus === 'offline') {
            setNetworkError('Server is not running. Please contact an administrator.');
            return;
        }

        if (!validateForm()) {
            return;
        }

        try {
            await register(name, email, password, phone);
            navigate('/');
        } catch (err: any) {
            console.error('Registration error:', err);
            if (!navigator.onLine) {
                setNetworkError('Network connection error. Please check your internet connection and try again.');
            } else if (!err.response) {
                setNetworkError('Cannot connect to the server. The server may not be running.');
            }
        }
    };

    const cardContainerClass = "w-full max-w-md mx-auto shadow-lg rounded-xl border-t-4 border-t-primary";

    if (serverStatus === 'checking') {
        return (
            <div className="flex min-h-[70vh] items-center justify-center px-2 sm:px-4">
                <Card className={cardContainerClass}>
                    <CardHeader className="space-y-1 text-center p-4 sm:p-6">
                        <div className="flex justify-center mb-2">
                            <div className="rounded-full bg-primary/10 p-2 sm:p-3">
                                <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 animate-spin text-primary" />
                            </div>
                        </div>
                        <CardTitle className="text-xl sm:text-2xl font-bold">SustainAride</CardTitle>
                        <CardDescription className="text-sm">Checking server connection...</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center py-4 sm:py-6 px-4 sm:px-6">
                        <p className="text-center text-sm text-muted-foreground">
                            Please wait while we connect to the server...
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (serverStatus === 'offline') {
        return (
            <div className="flex min-h-[70vh] items-center justify-center px-2 sm:px-4">
                <Card className={cardContainerClass}>
                    <CardHeader className="space-y-1 text-center p-4 sm:p-6">
                        <div className="flex justify-center mb-2">
                            <div className="rounded-full bg-destructive/10 p-2 sm:p-3">
                                <ServerCrash className="h-8 w-8 sm:h-10 sm:w-10 text-destructive" />
                            </div>
                        </div>
                        <CardTitle className="text-xl sm:text-2xl font-bold">Server Offline</CardTitle>
                        <CardDescription className="text-sm">Cannot connect to the SustainAride server</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center py-4 sm:py-6 px-4 sm:px-6">
                        <h3 className="text-base sm:text-lg font-semibold">Server Connection Error</h3>
                        <p className="mt-2 text-center text-sm text-muted-foreground">
                            We couldn't connect to the SustainAride server. Please make sure the server is running or contact support.
                        </p>
                        <Button
                            className="mt-4 sm:mt-6 w-full"
                            onClick={() => window.location.reload()}
                        >
                            Try Again
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-950 px-2 sm:px-4 py-4">
            <Card className="w-full max-w-sm mx-auto bg-gray-950 border border-gray-800 rounded-lg shadow-xl">
                <CardHeader className="space-y-1 text-center p-4 sm:p-6">
                    <div className="flex justify-center mb-3 sm:mb-4">
                        <div className="rounded-full bg-gray-800 p-2 sm:p-3">
                            <UserPlus className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                        </div>
                    </div>
                    <CardTitle className="text-xl sm:text-2xl font-bold text-white">Create Account</CardTitle>
                    <CardDescription className="text-sm text-gray-400">Join SustainAride and start your journey</CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                        {error && (
                            <Alert variant="destructive" className="mb-3 sm:mb-4">
                                <AlertDescription className="text-sm">{error}</AlertDescription>
                            </Alert>
                        )}
                        {networkError && (
                            <Alert variant="destructive" className="mb-3 sm:mb-4">
                                <AlertDescription className="text-sm">{networkError}</AlertDescription>
                            </Alert>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-medium text-gray-300">Full Name</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-2.5 h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={(e) => {
                                        setName(e.target.value);
                                        clearError();
                                        setNetworkError(null);
                                    }}
                                    required
                                    autoComplete="name"
                                    className="pl-9 sm:pl-10 bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 text-sm sm:text-base h-10 sm:h-11"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium text-gray-300">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="your.email@example.com"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        clearError();
                                        setNetworkError(null);
                                    }}
                                    required
                                    autoComplete="email"
                                    className="pl-9 sm:pl-10 bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 text-sm sm:text-base h-10 sm:h-11"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone" className="text-sm font-medium text-gray-300">Phone Number (optional)</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-2.5 h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                                <Input
                                    id="phone"
                                    type="tel"
                                    placeholder="+1 (123) 456-7890"
                                    value={phone}
                                    onChange={(e) => {
                                        setPhone(e.target.value);
                                        clearError();
                                        setNetworkError(null);
                                    }}
                                    autoComplete="tel"
                                    className="pl-9 sm:pl-10 bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 text-sm sm:text-base h-10 sm:h-11"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm font-medium text-gray-300">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-2.5 h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        clearError();
                                        setNetworkError(null);
                                        if (confirmPassword && e.target.value !== confirmPassword) {
                                            setPasswordError('Passwords do not match');
                                        } else {
                                            setPasswordError('');
                                        }
                                    }}
                                    required
                                    autoComplete="new-password"
                                    className="pl-9 sm:pl-10 bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 text-sm sm:text-base h-10 sm:h-11"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirm-password" className="text-sm font-medium text-gray-300">Confirm Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-2.5 h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                                <Input
                                    id="confirm-password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => {
                                        setConfirmPassword(e.target.value);
                                        clearError();
                                        setNetworkError(null);
                                        if (password !== e.target.value) {
                                            setPasswordError('Passwords do not match');
                                        } else {
                                            setPasswordError('');
                                        }
                                    }}
                                    required
                                    autoComplete="new-password"
                                    className="pl-9 sm:pl-10 bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 text-sm sm:text-base h-10 sm:h-11"
                                />
                            </div>
                            {passwordError && (
                                <p className="text-xs sm:text-sm text-red-500 mt-1">{passwordError}</p>
                            )}
                        </div>
                        <Button
                            type="submit"
                            className="w-full bg-white hover:bg-gray-100 text-black font-medium text-sm sm:text-base h-10 sm:h-11"
                            disabled={loading || !!passwordError}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating account...
                                </>
                            ) : (
                                'Sign Up'
                            )}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center py-3 sm:py-4 border-t border-gray-800 px-4 sm:px-6">
                    <p className="text-xs sm:text-sm text-center text-gray-400">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary font-medium hover:underline">
                            Login
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
};

export default SignUpForm;