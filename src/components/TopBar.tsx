import { Code2, Server } from "lucide-react";

export function TopBar() {
    return (
        <div className="fixed top-0 left-0 right-0 h-12 bg-[#0A0A0A] border-b border-[#2A2A2A] flex items-center justify-between px-6 z-50">
            <div className="flex items-center gap-3">
                <div className="flex items-center justify-center p-1 bg-[#ED1C24]/10 rounded-md">
                    <Code2 size={20} className="text-[#ED1C24]" />
                </div>
                <h1 className="text-white font-semibold flex items-center gap-2">
                    ROCmForge QuickPort
                    <span className="text-xs text-[#A0A0A0] font-normal border border-[#2A2A2A] bg-[#1A1A1A] px-2 py-0.5 rounded-full hidden sm:inline-block">
                        CUDA → ROCm in seconds. Responsible. Verified.
                    </span>
                </h1>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#A0A0A0]">
                <Server size={14} className="text-[#10B981]" />
                <span>Connected to MI300X Cache</span>
                <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse ml-1" />
            </div>
        </div>
    );
}
