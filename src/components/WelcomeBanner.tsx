import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Info } from "lucide-react";

export function WelcomeBanner() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const hasSeen = localStorage.getItem("hasSeenWelcomeBanner");
        if (!hasSeen) {
            const timer = setTimeout(() => setIsVisible(true), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="fixed top-16 left-1/2 -translate-x-1/2 z-40 w-fit max-w-lg flex items-start gap-3 p-4 bg-[#141414] border border-[#2A2A2A] rounded-lg shadow-2xl"
                >
                    <Info size={18} className="text-[#A0A0A0] mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                        <h5 className="text-sm font-medium text-white mb-1">Demo Running</h5>
                        <p className="text-sm text-[#A0A0A0]">
                            This demo auto-ports a CUDA example to ROCm — no input needed. Refresh to retry.
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            setIsVisible(false);
                            localStorage.setItem("hasSeenWelcomeBanner", "true");
                        }}
                        className="p-1 hover:bg-[#2A2A2A] rounded-md transition-colors ml-2 -mt-1 -mr-1"
                    >
                        <X size={16} className="text-[#A0A0A0]" />
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
