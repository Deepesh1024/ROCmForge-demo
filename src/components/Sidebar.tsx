import { motion, AnimatePresence } from "framer-motion";
import Plot from "react-plotly.js";
import { CheckCircle, Cpu, Clock, Zap, Activity, Gauge, Database } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

interface SidebarProps {
    metrics: any;
    isOpen: boolean;
}

export function Sidebar({ metrics, isOpen }: SidebarProps) {
    if (!metrics) return null;

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
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: 0.4 }}
                                        className="flex items-center justify-center gap-3 p-4 mb-8 bg-[#10B981]/10 border border-[#10B981] rounded-lg badge-pulse cursor-help"
                                    >
                                        <CheckCircle className="text-[#10B981]" size={28} />
                                        <div className="text-center">
                                            <h3 className="text-[#10B981] font-bold text-xl tracking-wide">VERIFIED</h3>
                                            <p className="text-[#10B981]/80 text-sm font-mono">{metrics.execution_confidence}/100 CONFIDENCE</p>
                                        </div>
                                    </motion.div>
                                </TooltipTrigger>
                                <TooltipContent>Confidence in result (95% on cache hit, 70% on CPU fallback)</TooltipContent>
                            </Tooltip>

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <MetricTile
                                    icon={<Cpu size={16} />}
                                    label="TARGET GPU"
                                    value={metrics.hardware_backend_used}
                                    delay={0.5}
                                    tooltip="Hardware backend used for execution"
                                />
                                <MetricTile
                                    icon={<Zap size={16} />}
                                    label="SPEEDUP"
                                    value={`${metrics.speedup_vs_cpu}x`}
                                    delay={0.6}
                                    highlight
                                    tooltip="GPU speedup factor vs CPU baseline"
                                />
                                <MetricTile
                                    icon={<Clock size={16} />}
                                    label="CPU TIME"
                                    value={`${metrics.cpu_reference_time_ms} ms`}
                                    delay={0.7}
                                    tooltip="Real measured CPU reference execution time"
                                />
                                <MetricTile
                                    icon={<Activity size={16} />}
                                    label="GPU TIME"
                                    value={`${metrics.gpu_time_ms} ms`}
                                    delay={0.8}
                                    tooltip="Cached MI300X GPU kernel time"
                                />
                                <MetricTile
                                    icon={<Database size={16} />}
                                    label="CACHE HIT"
                                    value={metrics.cache_hit ? "YES" : "NO"}
                                    delay={0.9}
                                    tooltip={metrics.cache_hit ? "Found in MI300X verification cache" : "Cache miss, recomputing"}
                                />
                                <MetricTile
                                    icon={<Gauge size={16} />}
                                    label="L2 NORM"
                                    value={metrics.l2_norm.toExponential(1)}
                                    delay={1.0}
                                    tooltip="Numerical equivalence check (L2 norm < 1e-5 = PASS)"
                                />
                            </div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.1 }}
                                className="mb-6 p-4 bg-[#141414] rounded-lg border border-[#2A2A2A]"
                            >
                                <h4 className="text-xs text-[#A0A0A0] mb-4 font-mono">EXECUTION TIME (LOWER IS BETTER)</h4>
                                <div className="h-[120px] w-full">
                                    <Plot
                                        data={[
                                            {
                                                x: ['CPU', 'GPU (MI300X)'],
                                                y: [metrics.cpu_reference_time_ms, metrics.gpu_time_ms],
                                                type: 'bar',
                                                marker: { color: ['#ED1C24', '#10B981'] },
                                                text: [`${metrics.cpu_reference_time_ms}ms`, `${metrics.gpu_time_ms}ms`],
                                                textposition: 'auto',
                                            }
                                        ]}
                                        layout={{
                                            margin: { t: 10, r: 10, l: 30, b: 30 },
                                            paper_bgcolor: 'transparent',
                                            plot_bgcolor: 'transparent',
                                            font: { color: '#A0A0A0', size: 10 },
                                            xaxis: { fixedrange: true },
                                            yaxis: { fixedrange: true, gridcolor: '#2A2A2A' },
                                            showlegend: false
                                        }}
                                        config={{ displayModeBar: false, responsive: true }}
                                        style={{ width: "100%", height: "100%" }}
                                    />
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.2 }}
                                className="p-4 bg-[#141414] rounded-lg border border-[#2A2A2A]"
                            >
                                <h4 className="text-xs text-[#A0A0A0] mb-4 font-mono">HARDWARE UTILIZATION</h4>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="cursor-help">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-sm">Occupancy</span>
                                                <span className="text-sm font-mono">{(metrics.occupancy * 100).toFixed(1)}%</span>
                                            </div>
                                            <div className="w-full bg-[#2A2A2A] h-2 rounded-full mb-4">
                                                <div className="bg-[#3B82F6] h-2 rounded-full transition-all duration-1000 ease-out" style={{ width: `${metrics.occupancy * 100}%` }} />
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
                                                <span className="text-sm font-mono">{(metrics.mfma_util * 100).toFixed(1)}%</span>
                                            </div>
                                            <div className="w-full bg-[#2A2A2A] h-2 rounded-full">
                                                <div className="bg-[#8B5CF6] h-2 rounded-full transition-all duration-1000 ease-out" style={{ width: `${metrics.mfma_util * 100}%` }} />
                                            </div>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>Matrix Fused Multiply-Add utilization</TooltipContent>
                                </Tooltip>

                                {metrics.bandwidth_gbps && (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="cursor-help mt-4">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-sm">Bandwidth</span>
                                                    <span className="text-sm font-mono">{metrics.bandwidth_gbps} GB/s</span>
                                                </div>
                                                <div className="w-full bg-[#2A2A2A] h-2 rounded-full">
                                                    <div className="bg-[#10B981] h-2 rounded-full transition-all duration-1000 ease-out" style={{ width: `${Math.min(100, (metrics.bandwidth_gbps / 5300) * 100)}%` }} />
                                                </div>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>Memory bandwidth achieved on MI300X (max ~5.3 TB/s)</TooltipContent>
                                    </Tooltip>
                                )}
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </TooltipProvider>
    );
}

function MetricTile({ icon, label, value, delay, highlight = false, tooltip }: { icon: React.ReactNode, label: string, value: string | number, delay: number, highlight?: boolean, tooltip: string }) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
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
