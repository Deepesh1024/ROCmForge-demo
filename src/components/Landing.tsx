import { motion } from "framer-motion";
import { CODE_EXAMPLES } from "../demo/examples";
import { useFlowStore } from "../store/flowStore";

interface LandingProps {
    onSelect: (example: typeof CODE_EXAMPLES[0], index: number) => void;
    onRandom: () => void;
    onManual: () => void;
}

export function Landing({ onSelect, onRandom, onManual }: LandingProps) {
    const { timeline } = useFlowStore();

    return (
        <div className="relative flex flex-col items-center justify-center h-full w-full overflow-hidden px-6 pb-[20vh]">
            {/* Subtle AMD-red animated grid background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
                <motion.div
                    animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.05, 1] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(237,28,36,0.08)_0%,_transparent_60%)]"
                />
                <div className="absolute inset-0"
                    style={{
                        backgroundImage: `radial-gradient(rgba(237, 28, 36, 0.15) 1px, transparent 1px)`,
                        backgroundSize: '24px 24px',
                        maskImage: 'radial-gradient(ellipse at center, black 20%, transparent 70%)',
                        WebkitMaskImage: 'radial-gradient(ellipse at center, black 20%, transparent 70%)'
                    }}
                />
            </div>

            {/* Center headlines */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                className="relative z-10 text-center mb-16"
            >
                <h2 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight mb-4">
                    CUDA → ROCm <span className="text-[#ED1C24]">in seconds.</span>
                </h2>
                <h3 className="text-xl md:text-2xl font-medium text-[#A0A0A0]">
                    Verified. Responsible. MI300X-ready.
                </h3>
            </motion.div>

            {/* Configured 2x2 grid of cards */}
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl mb-12">
                {CODE_EXAMPLES.map((ex, i) => {
                    const isPulsing = timeline.cardPulseIndex === i;
                    return (
                        <motion.button
                            key={ex.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 + i * 0.1 }}
                            onClick={() => onSelect(ex, i)}
                            className={`relative text-left p-8 rounded-2xl border bg-[#141414]/90 backdrop-blur-sm transition-all duration-300 group
                                ${isPulsing
                                    ? 'border-[#ED1C24] shadow-[0_0_40px_rgba(237,28,36,0.3)] bg-[#1A1A1A] scale-[1.02]'
                                    : 'border-[#2A2A2A] hover:border-[#ED1C24]/50 hover:bg-[#1A1A1A] hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(237,28,36,0.1)]'
                                }`}
                        >
                            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#ED1C24] transition-colors">{ex.title}</h3>
                            <p className="text-sm font-mono text-[#606060] line-clamp-2 max-w-[90%] opacity-80">{ex.code.split('\n')[0]}</p>
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#ED1C24]/0 to-[#ED1C24]/0 group-hover:from-[#ED1C24]/5 group-hover:to-transparent pointer-events-none transition-all duration-500" />
                        </motion.button>
                    );
                })}
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="relative z-10 flex flex-col items-center gap-4"
            >
                <button
                    onClick={onRandom}
                    className="px-8 py-3 rounded-full text-sm font-bold text-white bg-[#ED1C24] hover:bg-[#D1181F] shadow-[0_0_20px_rgba(237,28,36,0.3)] hover:shadow-[0_0_30px_rgba(237,28,36,0.5)] transition-all uppercase tracking-wider"
                >
                    Run Random Example
                </button>
                <button
                    onClick={onManual}
                    className="text-xs text-[#606060] hover:text-[#A0A0A0] underline underline-offset-4 transition-colors font-mono"
                >
                    Or start with an empty editor (Manual Mode)
                </button>
            </motion.div>
        </div>
    );
}
