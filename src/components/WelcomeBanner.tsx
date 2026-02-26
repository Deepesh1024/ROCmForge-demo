import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";

export function WelcomeBanner() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 1000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="fixed top-16 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-4 py-2 bg-[#1A1A1A]/90 backdrop-blur border border-[#3A3A3A] rounded-full shadow-lg"
                >
                    <Sparkles size={16} className="text-[#ED1C24]" />
                    <span className="text-sm text-gray-200">This demo auto-ports CUDA to ROCm — no input needed</span>
                    <button
                        onClick={() => setIsVisible(false)}
                        className="p-1 hover:bg-[#3A3A3A] rounded-full transition-colors ml-2"
                    >
                        <X size={14} className="text-gray-400" />
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
