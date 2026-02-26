import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import Plot from "react-plotly.js";
import { CheckCircle, Cpu, Clock, Zap, Activity, Gauge, Database } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { useFlowStore } from "../store/flowStore";
import { useEffect } from "react";

function CountUp({ value, isFloat = false, suffix = "", startAnimate = false }: { value: number | null | undefined, isFloat?: boolean, suffix?: string, startAnimate: boolean }) {
    const count = useMotionValue(0);
    const safeValue = typeof value === 'number' ? value : 0;
    const isMissing = value === null || value === undefined;

    const rounded = useTransform(count, (latest) => {
        if (isMissing) return "N/A";
        if (isFloat) {
            if (safeValue === 0) return "0.0" + suffix;
            const absVal = Math.abs(safeValue);
            if (absVal < 0.001) return latest.toExponential(2) + suffix;
            if (absVal < 1) return latest.toFixed(3) + suffix;
            if (absVal < 10) return latest.toFixed(2) + suffix;
            return latest.toFixed(1) + suffix;
        }
        return Math.round(latest) + suffix;
    });

    useEffect(() => {
        if (startAnimate && !isMissing) {
            animate(count, safeValue, { duration: 0.8, ease: "easeOut" });
        } else {
            count.set(0);
        }
    }, [startAnimate, safeValue, isMissing, count]);

    return <motion.span>{rounded}</motion.span>;
}

export function Sidebar() {
    const { metrics, timeline, state } = useFlowStore();

    if (!metrics && !timeline.showSidebar) return null;

    const isOpen = timeline.showSidebar;

    return (
        <TooltipProvider delayDuration={200}>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 380, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ duration: 0.5, ease: "circOut" }}
                        className="fixed top-12 right-0 bottom-0 bg-[#0A0A0A] border-l border-[#2A2A2A] z-30 overflow-y-auto pb-[30vh] custom-scrollbar"
                    >
                        <div className="p-6">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <motion.div
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={
                                            timeline.flashBadge
                                                ? { scale: [1, 1.05, 1], opacity: 1, boxShadow: ["0px 0px 0px rgba(16,185,129,0)", "0px 0px 40px rgba(16,185,129,0.5)", "0px 0px 10px rgba(16,185,129,0.1)"] }
                                                : { scale: 1, opacity: 1 }
                                        }
                                        transition={{ duration: 0.6 }}
                                        className="flex items-center justify-center gap-3 p-4 mb-8 bg-[#10B981]/10 border border-[#10B981] rounded-lg cursor-help relative overflow-hidden"
                                    >
                                        {timeline.flashBadge && (
                                            <motion.div
                                                initial={{ left: '-100%' }}
                                                animate={{ left: '200%' }}
                                                transition={{ duration: 0.8, ease: "easeInOut" }}
                                                className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-[#10B981]/30 to-transparent skew-x-12"
                                            />
                                        )}
                                        <CheckCircle className="text-[#10B981]" size={28} />
                                        <div className="text-center relative z-10">
                                            <h3 className="text-[#10B981] font-bold text-xl tracking-wide">VERIFIED</h3>
                                            <p className="text-[#10B981]/80 text-sm font-mono">
                                                <CountUp value={metrics?.execution_confidence || 0} startAnimate={timeline.animateMetrics} />/100 CONFIDENCE
                                            </p>
                                        </div>
                                    </motion.div>
                                </TooltipTrigger>
                                <TooltipContent>Confidence in result (95% on cache hit, 70% on CPU fallback)</TooltipContent>
                            </Tooltip>

                            {metrics && (
                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <MetricTile
                                        icon={<Cpu size={16} />}
                                        label="TARGET GPU"
                                        value={metrics.hardware_backend_used}
                                        delay={0.1}
                                        tooltip="Hardware backend used for execution"
                                        animate={timeline.animateMetrics}
                                    />
                                    <MetricTile
                                        icon={<Zap size={16} />}
                                        label="SPEEDUP"
                                        value={<CountUp value={metrics.speedup_vs_cpu} isFloat suffix="x" startAnimate={timeline.animateMetrics} />}
                                        delay={0.2}
                                        highlight
                                        tooltip="GPU speedup factor vs CPU baseline"
                                        animate={timeline.animateMetrics}
                                    />
                                    <MetricTile
                                        icon={<Clock size={16} />}
                                        label="CPU TIME"
                                        value={<CountUp value={metrics.cpu_reference_time_ms} isFloat suffix=" ms" startAnimate={timeline.animateMetrics} />}
                                        delay={0.3}
                                        tooltip="Real measured CPU reference execution time"
                                        animate={timeline.animateMetrics}
                                    />
                                    <MetricTile
                                        icon={<Activity size={16} />}
                                        label="GPU TIME"
                                        value={<CountUp value={metrics.gpu_time_ms} isFloat suffix=" ms" startAnimate={timeline.animateMetrics} />}
                                        delay={0.4}
                                        tooltip="Cached MI300X GPU kernel time"
                                        animate={timeline.animateMetrics}
                                    />
                                    <MetricTile
                                        icon={<Database size={16} />}
                                        label="CACHE HIT"
                                        value={metrics.cache_hit ? "YES" : "NO"}
                                        delay={0.5}
                                        tooltip={metrics.cache_hit ? "Found in MI300X verification cache" : "Cache miss, recomputing"}
                                        animate={timeline.animateMetrics}
                                    />
                                    <MetricTile
                                        icon={<Gauge size={16} />}
                                        label="L2 NORM"
                                        value={<CountUp value={metrics.l2_norm} isFloat startAnimate={timeline.animateMetrics} />}
                                        delay={0.6}
                                        tooltip="Numerical equivalence check (L2 norm < 1e-5 = PASS)"
                                        animate={timeline.animateMetrics}
                                    />
                                </div>
                            )}

                            {metrics && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={timeline.animateMetrics ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                    transition={{ delay: 0.3 }}
                                    className="mb-6 p-4 bg-[#141414] rounded-lg border border-[#2A2A2A]"
                                >
                                    <h4 className="text-xs text-[#A0A0A0] mb-4 font-mono">EXECUTION TIME (LOWER IS BETTER)</h4>
                                    <div className="h-[120px] w-full mt-2">
                                        <Plot
                                            data={[
                                                {
                                                    y: ['CPU ', 'GPU '],
                                                    x: [metrics.cpu_reference_time_ms, metrics.gpu_time_ms],
                                                    type: 'bar',
                                                    orientation: 'h',
                                                    marker: { color: ['#ED1C24', '#10B981'] },
                                                    text: [`${metrics.cpu_reference_time_ms}ms`, `${metrics.gpu_time_ms}ms`],
                                                    textposition: 'auto',
                                                }
                                            ]}
                                            layout={{
                                                margin: { t: 0, r: 40, l: 40, b: 20 },
                                                paper_bgcolor: 'transparent',
                                                plot_bgcolor: 'transparent',
                                                font: { color: '#A0A0A0', size: 11 },
                                                xaxis: { fixedrange: true, gridcolor: '#2A2A2A', zerolinecolor: '#2A2A2A' },
                                                yaxis: { fixedrange: true },
                                                showlegend: false
                                            }}
                                            config={{ displayModeBar: false, responsive: true }}
                                            style={{ width: "100%", height: "100%" }}
                                        />
                                    </div>
                                </motion.div>
                            )}

                            {metrics && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={timeline.animateMetrics ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                    transition={{ delay: 0.4 }}
                                    className="p-4 bg-[#141414] rounded-lg border border-[#2A2A2A]"
                                >
                                    <h4 className="text-xs text-[#A0A0A0] mb-4 font-mono">HARDWARE UTILIZATION</h4>

                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="cursor-help">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-sm">Occupancy</span>
                                                    <span className="text-sm font-mono">
                                                        <CountUp value={metrics.occupancy * 100} isFloat suffix="%" startAnimate={timeline.animateMetrics} />
                                                    </span>
                                                </div>
                                                <div className="w-full bg-[#2A2A2A] h-2 rounded-full mb-4 overflow-hidden relative">
                                                    <motion.div
                                                        className={`h-2 rounded-full ${timeline.sweepBar ? 'bg-gradient-to-r from-[#ED1C24] to-[#10B981]' : 'bg-[#3B82F6]'}`}
                                                        initial={{ width: 0 }}
                                                        animate={timeline.animateMetrics ? { width: `${metrics.occupancy * 100}%` } : { width: 0 }}
                                                        transition={{ duration: 1, ease: "easeOut" }}
                                                    />
                                                </div>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>Wavefront occupancy percentage (higher = better)</TooltipContent>
                                    </Tooltip>

                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="cursor-help">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-sm">MFMA Util</span>
                                                    <span className="text-sm font-mono">
                                                        <CountUp value={metrics.mfma_util * 100} isFloat suffix="%" startAnimate={timeline.animateMetrics} />
                                                    </span>
                                                </div>
                                                <div className="w-full bg-[#2A2A2A] h-2 rounded-full relative overflow-hidden">
                                                    <motion.div
                                                        className={`h-2 rounded-full ${timeline.sweepBar ? 'bg-[#10B981]' : 'bg-[#8B5CF6]'}`}
                                                        initial={{ width: 0 }}
                                                        animate={timeline.animateMetrics ? { width: `${metrics.mfma_util * 100}%` } : { width: 0 }}
                                                        transition={{ duration: 1, ease: "easeOut" }}
                                                    />
                                                </div>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>Matrix Fused Multiply-Add utilization</TooltipContent>
                                    </Tooltip>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </TooltipProvider>
    );
}

function MetricTile({ icon, label, value, delay, highlight = false, tooltip, animate }: { icon: React.ReactNode, label: string, value: React.ReactNode, delay: number, highlight?: boolean, tooltip: string, animate: boolean }) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={animate ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                    transition={{ delay }}
                    className={`p-3 rounded-lg border ${highlight ? 'bg-[#ED1C24]/10 border-[#ED1C24]/30' : 'bg-[#141414] border-[#2A2A2A]'} flex flex-col gap-2 cursor-help`}
                >
                    <div className="flex items-center gap-2 text-xs text-[#A0A0A0]">
                        {icon}
                        <span className="font-mono">{label}</span>
                    </div>
                    <div className={`text-lg font-semibold ${highlight ? 'text-[#ED1C24]' : 'text-white'}`}>
                        {value}
                    </div>
                </motion.div>
            </TooltipTrigger>
            <TooltipContent>{tooltip}</TooltipContent>
        </Tooltip>
    );
}
