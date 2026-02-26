import { motion, AnimatePresence } from "framer-motion";

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
                    <div className="flex flex-col items-center gap-6 bg-[#141414] border border-[#2A2A2A] p-8 rounded-xl shadow-2xl min-w-[300px]">
                        <div className="relative">
                            <img src="/logo.png" alt="Loading..." className="h-10 object-contain drop-shadow-md" />
                            <div className="absolute inset-0 bg-white/20 blur-md rounded-full animate-pulse mix-blend-overlay"></div>
                        </div>

                        <div className="flex flex-col items-center gap-2">
                            <span className="text-white font-medium">{text}</span>
                            <div className="w-full h-1 bg-[#2A2A2A] rounded-full overflow-hidden mt-2">
                                <motion.div
                                    className="h-full bg-[#ED1C24]"
                                    initial={{ width: 0 }}
                                    animate={{
                                        width: state === "PARSING" ? "33%" :
                                            state === "GENERATING" ? "66%" :
                                                "100%"
                                    }}
                                    transition={{ duration: 0.5 }}
                                />
                            </div>
                            <span className="text-xs text-[#A0A0A0] font-mono mt-1 pt-2 border-t border-[#2A2A2A] w-full text-center">STEP {step}</span>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
