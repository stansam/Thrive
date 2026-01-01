"use client"

import React, { useState, useRef, useEffect } from "react";
import { Eye, EyeOff, ArrowRight, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
                "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 transition-colors focus:border-blue-500",
                className
            )}
            ref={ref}
            {...props}
        />
    );
});
Input.displayName = "Input";

// DotMap Component for Sign Up (Slightly adjusted routes for variety if desired, kept same for consistency)
type RoutePoint = {
    x: number;
    y: number;
    delay: number;
};

const DotMap = () => {
    // Same implementation as Sign In for consistency across auth pages
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    // ... Routes and Animation Logic (Identical to Sign In for brand consistency)
    const routes: { start: RoutePoint; end: RoutePoint; color: string }[] = [
        { start: { x: 100, y: 150, delay: 0 }, end: { x: 200, y: 80, delay: 2 }, color: "#3b82f6" },
        { start: { x: 200, y: 80, delay: 2 }, end: { x: 260, y: 120, delay: 4 }, color: "#3b82f6" },
        { start: { x: 50, y: 50, delay: 1 }, end: { x: 150, y: 180, delay: 3 }, color: "#3b82f6" },
        { start: { x: 280, y: 60, delay: 0.5 }, end: { x: 180, y: 180, delay: 2.5 }, color: "#3b82f6" },
    ];

    const generateDots = (width: number, height: number) => {
        const dots = [];
        const gap = 12;
        for (let x = 0; x < width; x += gap) {
            for (let y = 0; y < height; y += gap) {
                const isInMapShape =
                    ((x < width * 0.25 && x > width * 0.05) && (y < height * 0.4 && y > height * 0.1)) ||
                    ((x < width * 0.25 && x > width * 0.15) && (y < height * 0.8 && y > height * 0.4)) ||
                    ((x < width * 0.45 && x > width * 0.3) && (y < height * 0.35 && y > height * 0.15)) ||
                    ((x < width * 0.5 && x > width * 0.35) && (y < height * 0.65 && y > height * 0.35)) ||
                    ((x < width * 0.7 && x > width * 0.45) && (y < height * 0.5 && y > height * 0.1)) ||
                    ((x < width * 0.8 && x > width * 0.65) && (y < height * 0.8 && y > height * 0.6));

                if (isInMapShape && Math.random() > 0.3) {
                    dots.push({ x, y, radius: 1, opacity: Math.random() * 0.5 + 0.1 });
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
        const ctx = canvas?.getContext("2d");
        if (!ctx || !canvas) return;

        const dots = generateDots(dimensions.width, dimensions.height);
        let animationFrameId: number;
        let startTime = Date.now();

        function animate() {
            ctx!.clearRect(0, 0, dimensions.width, dimensions.height);

            // Draw Dots
            dots.forEach(dot => {
                ctx!.beginPath();
                ctx!.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
                ctx!.fillStyle = `rgba(255, 255, 255, ${dot.opacity})`;
                ctx!.fill();
            });

            // Draw Routes
            const currentTime = (Date.now() - startTime) / 1000;
            routes.forEach(route => {
                const elapsed = currentTime - route.start.delay;
                if (elapsed <= 0) return;
                const progress = Math.min(elapsed / 3, 1);
                const x = route.start.x + (route.end.x - route.start.x) * progress;
                const y = route.start.y + (route.end.y - route.start.y) * progress;

                ctx!.beginPath();
                ctx!.moveTo(route.start.x, route.start.y);
                ctx!.lineTo(x, y);
                ctx!.strokeStyle = route.color;
                ctx!.lineWidth = 1.5;
                ctx!.stroke();

                ctx!.beginPath();
                ctx!.arc(x, y, 3, 0, Math.PI * 2);
                ctx!.fillStyle = "#60a5fa";
                ctx!.fill();

                // Glow
                ctx!.beginPath();
                ctx!.arc(x, y, 6, 0, Math.PI * 2);
                ctx!.fillStyle = "rgba(96, 165, 250, 0.3)";
                ctx!.fill();

                if (progress === 1) {
                    ctx!.beginPath();
                    ctx!.arc(route.end.x, route.end.y, 3, 0, Math.PI * 2);
                    ctx!.fillStyle = route.color;
                    ctx!.fill();
                }
            });

            if (currentTime > 15) startTime = Date.now();
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

// SignUpCard Component
const SignUpCard = () => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    const [isHovered, setIsHovered] = useState(false);

    // Validation States
    const isPasswordMatch = formData.password && formData.confirmPassword && formData.password === formData.confirmPassword;
    const isPasswordLength = formData.password.length >= 8;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isPasswordMatch) {
            console.error("Passwords do not match");
            return;
        }
        console.log("Sign up attempts with:", formData);
    };

    return (
        <div className="flex w-full h-full items-center justify-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-4xl overflow-hidden rounded-2xl flex bg-[#090b13] text-white shadow-2xl border border-white/5"
            >
                {/* Left side - Map (Brand Identity) */}
                <div className="hidden md:block w-1/2 h-[750px] relative overflow-hidden border-r border-[#1f2130]">
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
                                Start Your Journey
                            </motion.h2>
                            <motion.p
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8, duration: 0.5 }}
                                className="text-sm text-center text-gray-400 max-w-xs"
                            >
                                Join Thrive Travel today. Create custom itineraries and book exclusive tours.
                            </motion.p>
                        </div>
                    </div>
                </div>

                {/* Right side - Sign Up Form */}
                <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-center bg-[#090b13]">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-2xl md:text-3xl font-bold mb-1">Create Account</h1>
                        <p className="text-gray-400 mb-8">Get started with Thrive Travel</p>

                        <div className="mb-6">
                            <button
                                className="w-full flex items-center justify-center gap-2 bg-[#13151f] border border-[#2a2d3a] rounded-lg p-3 hover:bg-[#1a1d2b] transition-all duration-300 cursor-pointer"
                                onClick={() => console.log("Google sign-up")}
                            >
                                <svg className="h-5 w-5" viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fillOpacity=".54" />
                                    <path fill="#4285F4" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#34A853" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#FBBC05" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    <path fill="#EA4335" d="M1 1h22v22H1z" fillOpacity="0" />
                                </svg>
                                <span>Sign up with Google</span>
                            </button>
                        </div>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-[#2a2d3a]"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-[#090b13] text-gray-400">or register with email</span>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
                                <Input
                                    type="text"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    placeholder="John Doe"
                                    required
                                    className="bg-[#13151f] border-[#2a2d3a] placeholder:text-gray-500 text-gray-900 w-full"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                                <Input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="john@example.com"
                                    required
                                    className="bg-[#13151f] border-[#2a2d3a] placeholder:text-gray-500 text-gray-900 w-full"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                                    <div className="relative">
                                        <Input
                                            type={isPasswordVisible ? "text" : "password"}
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            placeholder="••••••••"
                                            required
                                            className="bg-[#13151f] border-[#2a2d3a] placeholder:text-gray-500 text-gray-200 w-full pr-10"
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-300 cursor-pointer"
                                            onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                                        >
                                            {isPasswordVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Confirm</label>
                                    <div className="relative">
                                        <Input
                                            type={isConfirmPasswordVisible ? "text" : "password"}
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                            placeholder="••••••••"
                                            required
                                            className={cn(
                                                "bg-[#13151f] border-[#2a2d3a] placeholder:text-gray-500 text-gray-200 w-full pr-10 transition-colors",
                                                formData.confirmPassword.length > 0 && !isPasswordMatch ? "border-red-500 focus:border-red-500" :
                                                    formData.confirmPassword.length > 0 && isPasswordMatch ? "border-green-500 focus:border-green-500" : ""
                                            )}
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-300 cursor-pointer"
                                            onClick={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
                                        >
                                            {isConfirmPasswordVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Real-time Feedback Area */}
                            <div className="text-xs space-y-1 mt-1">
                                <div className={cn("flex items-center gap-1.5 transition-colors", isPasswordLength ? "text-green-500" : "text-gray-500")}>
                                    {isPasswordLength ? <Check size={12} /> : <div className="w-3 h-3 rounded-full border border-current" />}
                                    At least 8 characters
                                </div>
                                <div className={cn("flex items-center gap-1.5 transition-colors",
                                    formData.confirmPassword.length > 0 ? (isPasswordMatch ? "text-green-500" : "text-red-400") : "text-gray-500"
                                )}>
                                    {formData.confirmPassword.length > 0 && isPasswordMatch ? <Check size={12} /> :
                                        formData.confirmPassword.length > 0 && !isPasswordMatch ? <X size={12} /> :
                                            <div className="w-3 h-3 rounded-full border border-current" />}
                                    Passwords match
                                </div>
                            </div>

                            <motion.div
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                                onHoverStart={() => setIsHovered(true)}
                                onHoverEnd={() => setIsHovered(false)}
                                className="pt-4"
                            >
                                <Button
                                    type="submit"
                                    disabled={!isPasswordMatch || !isPasswordLength}
                                    className={cn(
                                        "w-full bg-gradient-to-r relative overflow-hidden from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-2 rounded-lg transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
                                        isHovered ? "shadow-lg shadow-blue-500/25" : ""
                                    )}
                                >
                                    <span className="flex items-center justify-center">
                                        Create Account
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </span>
                                    {isHovered && (
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

                            <div className="text-center mt-6 text-sm text-gray-400">
                                Already have an account?{" "}
                                <Link href="/sign-in" className="text-blue-500 hover:text-blue-400 transition-colors">
                                    Sign in
                                </Link>
                            </div>
                        </form>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};

export default SignUpCard;
