"use client"

import React, { useState, useRef, useEffect } from "react";
import { Eye, EyeOff, ArrowRight, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Utils function to combine class names
const cn = (...classes: (string | boolean | undefined)[]) => {
    return classes.filter(Boolean).join(" ");
};

// Custom Button Component
const Button = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement> & {
        variant?: "default" | "outline" | "ghost";
        size?: "default" | "sm" | "lg";
    }
>(({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
        <button
            className={cn(
                "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
                size === "default" && "h-10 px-4 py-2",
                size === "sm" && "h-9 px-3",
                size === "lg" && "h-11 px-8",
                className
            )}
            ref={ref}
            {...props}
        />
    );
});
Button.displayName = "Button";

// Custom Input Component
const Input = React.forwardRef<
    HTMLInputElement,
    React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
    return (
        <input
            className={cn(
                "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
                className
            )}
            ref={ref}
            {...props}
        />
    );
});
Input.displayName = "Input";

// Alert Component
const Alert = ({ children, variant = "error" }: { children: React.ReactNode; variant?: "error" | "success" }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
                "flex items-start gap-2 p-3 rounded-lg text-sm",
                variant === "error" && "bg-red-500/10 text-red-400 border border-red-500/20",
                variant === "success" && "bg-green-500/10 text-green-400 border border-green-500/20"
            )}
        >
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div className="flex-1">{children}</div>
        </motion.div>
    );
};

// DotMap Component
type RoutePoint = {
    x: number;
    y: number;
    delay: number;
};

const DotMap = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    const routes: { start: RoutePoint; end: RoutePoint; color: string }[] = [
        {
            start: { x: 100, y: 150, delay: 0 },
            end: { x: 200, y: 80, delay: 2 },
            color: "#3b82f6",
        },
        {
            start: { x: 200, y: 80, delay: 2 },
            end: { x: 260, y: 120, delay: 4 },
            color: "#3b82f6",
        },
        {
            start: { x: 50, y: 50, delay: 1 },
            end: { x: 150, y: 180, delay: 3 },
            color: "#3b82f6",
        },
        {
            start: { x: 280, y: 60, delay: 0.5 },
            end: { x: 180, y: 180, delay: 2.5 },
            color: "#3b82f6",
        },
    ];

    const generateDots = (width: number, height: number) => {
        const dots = [];
        const gap = 12;
        const dotRadius = 1;

        for (let x = 0; x < width; x += gap) {
            for (let y = 0; y < height; y += gap) {
                const isInMapShape =
                    ((x < width * 0.25 && x > width * 0.05) &&
                        (y < height * 0.4 && y > height * 0.1)) ||
                    ((x < width * 0.25 && x > width * 0.15) &&
                        (y < height * 0.8 && y > height * 0.4)) ||
                    ((x < width * 0.45 && x > width * 0.3) &&
                        (y < height * 0.35 && y > height * 0.15)) ||
                    ((x < width * 0.5 && x > width * 0.35) &&
                        (y < height * 0.65 && y > height * 0.35)) ||
                    ((x < width * 0.7 && x > width * 0.45) &&
                        (y < height * 0.5 && y > height * 0.1)) ||
                    ((x < width * 0.8 && x > width * 0.65) &&
                        (y < height * 0.8 && y > height * 0.6));

                if (isInMapShape && Math.random() > 0.3) {
                    dots.push({
                        x,
                        y,
                        radius: dotRadius,
                        opacity: Math.random() * 0.5 + 0.1,
                    });
                }
            }
        }
        return dots;
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const resizeObserver = new ResizeObserver(entries => {
            const { width, height } = entries[0].contentRect;
            setDimensions({ width, height });
            canvas.width = width;
            canvas.height = height;
        });

        resizeObserver.observe(canvas.parentElement as Element);
        return () => resizeObserver.disconnect();
    }, []);

    useEffect(() => {
        if (!dimensions.width || !dimensions.height) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const dots = generateDots(dimensions.width, dimensions.height);
        let animationFrameId: number;
        let startTime = Date.now();

        function drawDots() {
            if (!ctx) return;
            ctx.clearRect(0, 0, dimensions.width, dimensions.height);

            dots.forEach(dot => {
                ctx.beginPath();
                ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${dot.opacity})`;
                ctx.fill();
            });
        }

        function drawRoutes() {
            if (!ctx) return;
            const currentTime = (Date.now() - startTime) / 1000;

            routes.forEach(route => {
                const elapsed = currentTime - route.start.delay;
                if (elapsed <= 0) return;

                const duration = 3;
                const progress = Math.min(elapsed / duration, 1);

                const x = route.start.x + (route.end.x - route.start.x) * progress;
                const y = route.start.y + (route.end.y - route.start.y) * progress;

                ctx.beginPath();
                ctx.moveTo(route.start.x, route.start.y);
                ctx.lineTo(x, y);
                ctx.strokeStyle = route.color;
                ctx.lineWidth = 1.5;
                ctx.stroke();

                ctx.beginPath();
                ctx.arc(route.start.x, route.start.y, 3, 0, Math.PI * 2);
                ctx.fillStyle = route.color;
                ctx.fill();

                ctx.beginPath();
                ctx.arc(x, y, 3, 0, Math.PI * 2);
                ctx.fillStyle = "#60a5fa";
                ctx.fill();

                ctx.beginPath();
                ctx.arc(x, y, 6, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(96, 165, 250, 0.3)";
                ctx.fill();

                if (progress === 1) {
                    ctx.beginPath();
                    ctx.arc(route.end.x, route.end.y, 3, 0, Math.PI * 2);
                    ctx.fillStyle = route.color;
                    ctx.fill();
                }
            });
        }

        function animate() {
            drawDots();
            drawRoutes();

            const currentTime = (Date.now() - startTime) / 1000;
            if (currentTime > 15) {
                startTime = Date.now();
            }

            animationFrameId = requestAnimationFrame(animate);
        }

        animate();

        return () => cancelAnimationFrame(animationFrameId);
    }, [dimensions]);

    return (
        <div className="relative w-full h-full overflow-hidden">
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        </div>
    );
};

// API Configuration
const API_BASE_URL = 'http://127.0.0.1:5000/api/auth';

// API Service
const authAPI = {
    login: async (email: string, password: string, rememberMe: boolean = false) => {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password, rememberMe }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }

        return data;
    },

    googleLogin: async (idToken: string) => {
        const response = await fetch(`${API_BASE_URL}/google`, {
            method: 'POST',
            // credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ idToken }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Google login failed');
        }

        return data;
    }
};

// SignInCard Component
const SignInCard = () => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleEmailLogin = async () => {
        setError(null);
        setSuccess(null);
        setIsLoading(true);

        try {
            const response = await authAPI.login(email, password, rememberMe);

            // Store tokens in memory (you can change this to use cookies or other storage methods)
            const tokens = {
                accessToken: response.data.tokens.accessToken,
                refreshToken: response.data.tokens.refreshToken,
                user: response.data.user
            };

            // Store in localStorage for demonstration
            localStorage.setItem('accessToken', tokens.accessToken);
            localStorage.setItem('refreshToken', tokens.refreshToken);
            localStorage.setItem('user', JSON.stringify(tokens.user));

            setSuccess(response.message || 'Login successful! Redirecting...');

            // Redirect after successful login
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 1500);

        } catch (err: any) {
            setError(err.message || 'An error occurred during login');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError(null);
        setSuccess(null);

        try {
            if (typeof window.google === 'undefined') {
                throw new Error('Google Sign-In SDK not loaded. Please refresh and try again.');
            }

            // Create a temporary container for the Google button
            const buttonContainer = document.createElement('div');
            buttonContainer.id = 'google-signin-button';
            document.body.appendChild(buttonContainer);

            window.google.accounts.id.initialize({
                client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!!,
                callback: async (response: any) => {
                    setIsLoading(true);
                    try {
                        const result = await authAPI.googleLogin(response.credential);

                        localStorage.setItem('accessToken', result.data.tokens.accessToken);
                        localStorage.setItem('refreshToken', result.data.tokens.refreshToken);
                        localStorage.setItem('user', JSON.stringify(result.data.user));

                        setSuccess(result.message || 'Google login successful! Redirecting...');

                        setTimeout(() => {
                            window.location.href = '/dashboard';
                        }, 1500);

                    } catch (err: any) {
                        setError(err.message || 'Google authentication failed');
                    } finally {
                        setIsLoading(false);
                        buttonContainer.remove();
                    }
                }
            });

            window.google.accounts.id.renderButton(
                buttonContainer,
                {
                    theme: 'filled_blue',
                    size: 'large',
                    width: 400
                }
            );

            // Programmatically click the rendered Google button
            setTimeout(() => {
                const googleBtn = buttonContainer.querySelector('div[role="button"]') as HTMLElement;
                if (googleBtn) {
                    googleBtn.click();
                }
            }, 100);

        } catch (err: any) {
            setError(err.message || 'Google login failed');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !isLoading) {
            handleEmailLogin();
        }
    };

    return (
        <div className="flex w-full h-full items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-4xl overflow-hidden rounded-2xl flex bg-[#090b13] text-white shadow-2xl"
            >
                {/* Left side - Map */}
                <div className="hidden md:block w-1/2 h-[600px] relative overflow-hidden border-r border-[#1f2130]">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#0f1120] to-[#151929]">
                        <DotMap />

                        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 z-10">
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6, duration: 0.5 }}
                                className="mb-6"
                            >
                                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                    <ArrowRight className="text-white h-6 w-6" />
                                </div>
                            </motion.div>
                            <motion.h2
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7, duration: 0.5 }}
                                className="text-3xl font-bold mb-2 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500"
                            >
                                Thrive Travel
                            </motion.h2>
                            <motion.p
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8, duration: 0.5 }}
                                className="text-sm text-center text-gray-400 max-w-xs"
                            >
                                Sign in to manage your bookings and custom itineraries.
                            </motion.p>
                        </div>
                    </div>
                </div>

                {/* Right side - Sign In Form */}
                <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-2xl md:text-3xl font-bold mb-1">Welcome back</h1>
                        <p className="text-gray-400 mb-8">Sign in to your account</p>

                        <AnimatePresence mode="wait">
                            {error && (
                                <div className="mb-4">
                                    <Alert variant="error">{error}</Alert>
                                </div>
                            )}
                            {success && (
                                <div className="mb-4">
                                    <Alert variant="success">{success}</Alert>
                                </div>
                            )}
                        </AnimatePresence>

                        <div className="mb-6">
                            <button
                                className="w-full flex items-center justify-center gap-2 bg-[#13151f] border border-[#2a2d3a] rounded-lg p-3 hover:bg-[#1a1d2b] transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={handleGoogleLogin}
                                disabled={isLoading}
                            >
                                <svg className="h-5 w-5" viewBox="0 0 24 24">
                                    <path
                                        fill="currentColor"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        fillOpacity=".54"
                                    />
                                    <path
                                        fill="#4285F4"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="#34A853"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />
                                    <path
                                        fill="#FBBC05"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                    <path fill="#EA4335" d="M1 1h22v22H1z" fillOpacity="0" />
                                </svg>
                                <span>{isLoading ? 'Connecting...' : 'Login with Google'}</span>
                            </button>
                        </div>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-[#2a2d3a]"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-[#090b13] text-gray-400">or</span>
                            </div>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                                    Email <span className="text-blue-500">*</span>
                                </label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Enter your email address"
                                    required
                                    disabled={isLoading}
                                    className="bg-[#13151f] border-[#2a2d3a] placeholder:text-gray-500 text-gray-900 w-full"
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                                    Password <span className="text-blue-500">*</span>
                                </label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={isPasswordVisible ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Enter your password"
                                        required
                                        disabled={isLoading}
                                        className="bg-[#13151f] border-[#2a2d3a] placeholder:text-gray-500 text-gray-900 w-full pr-10"
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-300 cursor-pointer"
                                        onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                                        disabled={isLoading}
                                    >
                                        {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="rememberMe"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    disabled={isLoading}
                                    className="h-4 w-4 rounded border-[#2a2d3a] bg-[#13151f] text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                                />
                                <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-300 cursor-pointer">
                                    Remember me for 30 days
                                </label>
                            </div>

                            <motion.div
                                whileHover={{ scale: isLoading ? 1 : 1.01 }}
                                whileTap={{ scale: isLoading ? 1 : 0.98 }}
                                onHoverStart={() => !isLoading && setIsHovered(true)}
                                onHoverEnd={() => setIsHovered(false)}
                                className="pt-2"
                            >
                                <Button
                                    type="button"
                                    onClick={handleEmailLogin}
                                    disabled={isLoading}
                                    className={cn(
                                        "w-full bg-gradient-to-r relative overflow-hidden from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-2 rounded-lg transition-all duration-300 cursor-pointer",
                                        isHovered && !isLoading ? "shadow-lg shadow-blue-500/25" : "",
                                        isLoading ? "opacity-70" : ""
                                    )}
                                >
                                    <span className="flex items-center justify-center">
                                        {isLoading ? 'Signing in...' : 'Sign in'}
                                        {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                                    </span>
                                    {isHovered && !isLoading && (
                                        <motion.span
                                            initial={{ left: "-100%" }}
                                            animate={{ left: "100%" }}
                                            transition={{ duration: 1, ease: "easeInOut" }}
                                            className="absolute top-0 bottom-0 left-0 w-20 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                            style={{ filter: "blur(8px)" }}
                                        />
                                    )}
                                </Button>
                            </motion.div>

                            <div className="text-center mt-6">
                                <a
                                    href="#"
                                    className="text-blue-500 hover:text-blue-400 text-sm transition-colors"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        alert('Password reset functionality coming soon!');
                                    }}
                                >
                                    Forgot password?
                                </a>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};

export default SignInCard;