import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

interface LoadingOverlayProps {
    state: "IDLE" | "PARSING" | "GENERATING" | "VERIFYING" | "COMPLETE" | "ERROR";
}

export function LoadingOverlay({ state }: LoadingOverlayProps) {
    const isVisible = ["PARSING", "GENERATING", "VERIFYING"].includes(state);

    let text = "Initializing...";
    let step = "0/3";
    if (state === "PARSING") { text = "Parsing CUDA constraints..."; step = "1/3"; }
    else if (state === "GENERATING") { text = "Generating safe ROCm mapping..."; step = "2/3"; }
    else if (state === "VERIFYING") { text = "Verifying numerical semantics on MI300X..."; step = "3/3"; }

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D0D0D]/60 backdrop-blur-sm pointer-events-none"
                >
                    <div className="flex flex-col items-center gap-4 bg-[#141414] border border-[#2A2A2A] p-6 rounded-xl shadow-2xl">
                        <Loader2 className="animate-spin text-[#ED1C24]" size={36} />
                        <div className="flex flex-col items-center">
                            <span className="text-white font-medium">{text}</span>
                            <span className="text-xs text-[#A0A0A0] font-mono mt-1">STEP {step}</span>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
