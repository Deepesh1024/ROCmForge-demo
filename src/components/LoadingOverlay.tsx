import { motion, AnimatePresence } from "framer-motion";

interface LoadingOverlayProps {
    state: "IDLE" | "PARSING" | "GENERATING" | "VERIFYING" | "COMPLETE" | "ERROR";
}

export function LoadingOverlay({ state }: LoadingOverlayProps) {
    const isVisible = ["PARSING", "GENERATING", "VERIFYING"].includes(state);

    let text = "Initializing...";
    let step = "0/3";
    let subtext = "";
    if (state === "PARSING") { text = "Porting… 1/3"; subtext = "Parse"; step = "1/3"; }
    else if (state === "GENERATING") { text = "Porting… 2/3"; subtext = "Generate"; step = "2/3"; }
    else if (state === "VERIFYING") { text = "Porting… 3/3"; subtext = "Verify"; step = "3/3"; }

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
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                className="w-10 h-10 border-4 border-[#2A2A2A] border-t-[#ED1C24] rounded-full"
                            />
                        </div>

                        <div className="flex flex-col items-center gap-2">
                            <span className="text-white font-medium">{text} ({subtext})</span>
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
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
