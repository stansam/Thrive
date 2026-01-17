"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import { ArrowRight, AlertCircle, Eye, EyeOff, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

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

// DotMap Component (Duplicated for consistency)
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
const API_BASE_URL = "/api/auth";

// ResetPasswordCard Component
const ResetPasswordCardContent = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [isHovered, setIsHovered] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Validation
    const isPasswordMatch = password && confirmPassword && password === confirmPassword;
    const isPasswordLength = password.length >= 8;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!token) {
            setError("Missing reset token. Please request a new link.");
            return;
        }

        if (!isPasswordMatch) {
            setError("Passwords do not match.");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token,
                    password,
                    confirmPassword
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Reset failed');
            }

            setSuccess('Password reset successful! Redirecting to login...');

            setTimeout(() => {
                router.push('/sign-in');
            }, 2000);

        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="flex w-full h-full items-center justify-center p-4">
                <div className="text-white">
                    <Alert variant="error">Invalid link. Token missing.</Alert>
                    <div className="mt-4 text-center">
                        <Link href="/forgot-password" className="text-blue-500 hover:text-blue-400">Request new link</Link>
                    </div>
                </div>
            </div>
        );
    }

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
                                Welcome Back
                            </motion.h2>
                            <motion.p
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8, duration: 0.5 }}
                                className="text-sm text-center text-gray-400 max-w-xs"
                            >
                                Secure your account with a new password and continue your adventure.
                            </motion.p>
                        </div>
                    </div>
                </div>

                {/* Right side - Form */}
                <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-2xl md:text-3xl font-bold mb-1">Set New Password</h1>
                        <p className="text-gray-400 mb-8">Please choose a strong password</p>

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

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                                    New Password <span className="text-blue-500">*</span>
                                </label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={isPasswordVisible ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Min. 8 characters"
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

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                                    Confirm Password <span className="text-blue-500">*</span>
                                </label>
                                <div className="relative">
                                    <Input
                                        id="confirmPassword"
                                        type={isConfirmPasswordVisible ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Repeat password"
                                        required
                                        disabled={isLoading}
                                        className="bg-[#13151f] border-[#2a2d3a] placeholder:text-gray-500 text-gray-900 w-full pr-10"
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-300 cursor-pointer"
                                        onClick={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
                                        disabled={isLoading}
                                    >
                                        {isConfirmPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* Real-time Feedback Area */}
                            <div className="text-xs space-y-1 mt-1">
                                <div className={cn("flex items-center gap-1.5 transition-colors", isPasswordLength ? "text-green-500" : "text-gray-500")}>
                                    {isPasswordLength ? <Check size={12} /> : <div className="w-3 h-3 rounded-full border border-current" />}
                                    At least 8 characters
                                </div>
                                <div className={cn("flex items-center gap-1.5 transition-colors",
                                    confirmPassword.length > 0 ? (isPasswordMatch ? "text-green-500" : "text-red-400") : "text-gray-500"
                                )}>
                                    {confirmPassword.length > 0 && isPasswordMatch ? <Check size={12} /> :
                                        confirmPassword.length > 0 && !isPasswordMatch ? <X size={12} /> :
                                            <div className="w-3 h-3 rounded-full border border-current" />}
                                    Passwords match
                                </div>
                            </div>

                            <motion.div
                                whileHover={{ scale: isLoading ? 1 : 1.01 }}
                                whileTap={{ scale: isLoading ? 1 : 0.98 }}
                                onHoverStart={() => !isLoading && setIsHovered(true)}
                                onHoverEnd={() => setIsHovered(false)}
                                className="pt-2"
                            >
                                <Button
                                    type="submit"
                                    disabled={isLoading || !isPasswordMatch || !isPasswordLength}
                                    className={cn(
                                        "w-full bg-gradient-to-r relative overflow-hidden from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-2 rounded-lg transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
                                        isHovered && !isLoading ? "shadow-lg shadow-blue-500/25" : "",
                                        isLoading ? "opacity-70" : ""
                                    )}
                                >
                                    <span className="flex items-center justify-center">
                                        {isLoading ? 'Reseting...' : 'Reset Password'}
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
                        </form>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};

const ResetPasswordCard = () => {
    return (
        <Suspense fallback={<div className="text-white text-center">Loading...</div>}>
            <ResetPasswordCardContent />
        </Suspense>
    );
};

export default ResetPasswordCard;
