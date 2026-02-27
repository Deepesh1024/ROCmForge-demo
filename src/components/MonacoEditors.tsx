import Editor, { useMonaco } from "@monaco-editor/react";
import { useEffect, useRef } from "react";
import { Play } from "lucide-react";
import { useFlowStore } from "../store/flowStore";
import { motion, AnimatePresence } from "framer-motion";

interface MonacoEditorsProps {
    cudaCode: string;
    hipCode: string;
    isManualMode?: boolean;
    onManualToggle?: (val: boolean) => void;
    onCudaChange?: (code: string) => void;
    onPortVerify?: () => void;
}

export function MonacoEditors({
    cudaCode,
    hipCode,
    isManualMode = false,
    onManualToggle,
    onCudaChange,
    onPortVerify
}: MonacoEditorsProps) {
    const monaco = useMonaco();
    const { timeline } = useFlowStore();

    useEffect(() => {
        if (monaco) {
            // Register custom language tokens for CUDA and ROCm if possible, or just theme standard C++ tokens
            monaco.editor.defineTheme("forgeDark", {
                base: "vs-dark",
                inherit: true,
                rules: [
                    { token: 'keyword', foreground: '#ED1C24' },             // AMD Red keywords
                    { token: 'identifier', foreground: '#D4D4D4' },          // Neutral Grayscale
                    { token: 'type.identifier', foreground: '#00FFFF' },     // Cyan for types (CUDA approx)
                    { token: 'string', foreground: '#A0A0A0' },              // Grayscale strings
                    { token: 'number', foreground: '#808080' },              // Grayscale numbers
                    { token: 'comment', foreground: '#404040' },             // Very dark comments
                ],
                colors: {
                    "editor.background": "#00000000", // Transparent to show micro-grid
                    "editorLineNumber.foreground": "#404040",
                    "editorIndentGuide.background": "#202020",
                    "editor.lineHighlightBackground": "#1A1A1A",
                },
            });
            monaco.editor.setTheme("forgeDark");
        }
    }, [monaco]);

    const editorOptions = {
        minimap: { enabled: false },
        fontSize: 14,
        fontFamily: "'JetBrains Mono', monospace",
        lineHeight: 24,
        padding: { top: 24 },
        scrollBeyondLastLine: false,
        readOnly: !isManualMode,
        domReadOnly: !isManualMode,
        wordWrap: "on" as const,
        scrollbar: { vertical: 'hidden' as const, horizontal: 'hidden' as const },
    };

    return (
        <div className="flex w-full h-full pt-12 pb-[30vh] relative bg-[#0D0D0D]">
            {/* Micro-grid dots background */}
            <div className="absolute inset-x-0 top-12 bottom-[30vh] opacity-20 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #A0A0A0 1px, transparent 0)', backgroundSize: '24px 24px' }}
            />

            {/* Left: CUDA Editor */}
            <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={isManualMode || timeline.showCode ? { x: 0, opacity: 1 } : { x: -50, opacity: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} // Soft easing
                className="w-[50%] relative flex flex-col pt-10"
            >
                <div className="absolute top-0 left-0 right-0 h-10 border-b border-[#2A2A2A] bg-[#0A0A0A]/80 backdrop-blur-sm flex items-center justify-between px-4 z-10 w-full rounded-tr-lg">
                    <div className="flex items-center gap-2">
                        <span className="text-[#3B82F6] text-xs font-bold">🔷 CUDA</span>
                        <span className="text-xs font-mono text-[#A0A0A0]">src/kernel.cu</span>
                    </div>

                    <div className="flex items-center gap-4">
                        {onManualToggle && (
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <span className="text-xs font-mono text-[#606060] group-hover:text-[#A0A0A0] transition-colors font-semibold">
                                    Auto Demo →
                                </span>
                                <span className={`text-xs font-mono font-bold transition-colors ${isManualMode ? 'text-[#ED1C24]' : 'text-[#606060]'}`}>
                                    Manual Mode
                                </span>
                                <div className="relative inline-block w-8 h-4 ml-1">
                                    <input
                                        type="checkbox"
                                        className="opacity-0 w-0 h-0 absolute"
                                        checked={isManualMode}
                                        onChange={(e) => onManualToggle(e.target.checked)}
                                    />
                                    <span className={`absolute cursor-pointer inset-0 rounded-full transition-colors duration-300 ${isManualMode ? 'bg-[#ED1C24]' : 'bg-[#2A2A2A]'}`}></span>
                                    <span className={`absolute left-0.5 top-0.5 bg-white w-3 h-3 rounded-full transition-transform duration-300 ${isManualMode ? 'translate-x-4' : 'translate-x-0'}`}></span>
                                </div>
                            </label>
                        )}
                        {isManualMode && (
                            <button
                                disabled={!cudaCode.trim()}
                                onClick={onPortVerify}
                                className="flex items-center gap-1.5 px-3 py-1 bg-[#ED1C24] hover:bg-[#D1181F] disabled:bg-[#2A2A2A] disabled:text-[#606060] text-white text-xs font-bold font-mono rounded-md transition-all shadow-md disabled:shadow-none"
                            >
                                {!cudaCode.trim() ? "Paste code first" : (
                                    <>
                                        <Play size={12} fill="currentColor" /> Port & Verify
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
                <div className="flex-1 w-full relative z-0 mix-blend-screen drop-shadow-md">
                    <Editor
                        height="100%"
                        defaultLanguage="cpp"
                        language="cpp"
                        theme="forgeDark"
                        value={cudaCode}
                        options={editorOptions}
                        onChange={(val) => {
                            if (isManualMode && onCudaChange) {
                                onCudaChange(val || "");
                            }
                        }}
                    />
                </div>
            </motion.div>

            {/* Glowing Vertical Separator */}
            <div className="w-[1px] bg-[#2A2A2A] relative z-20">
                <AnimatePresence>
                    {(timeline.showCode || isManualMode) && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: '100%' }}
                            transition={{ duration: 1, ease: "easeInOut" }}
                            className="absolute top-0 bottom-0 left-1/2 -content-x-1/2 w-[2px] bg-gradient-to-b from-transparent via-[#ED1C24]/80 to-transparent shadow-[0_0_20px_rgba(237,28,36,1)]"
                        />
                    )}
                </AnimatePresence>
            </div>

            {/* Right: HIP Editor */}
            <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={isManualMode || timeline.typewriterCode ? { x: 0, opacity: 1 } : { x: 50, opacity: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="w-[50%] relative flex flex-col pt-10"
            >
                <div className="absolute top-0 right-0 left-0 h-10 border-b border-[#2A2A2A] bg-[#0A0A0A]/80 backdrop-blur-sm flex items-center px-4 z-10 w-full rounded-tl-lg">
                    <div className="flex items-center gap-2">
                        <span className="text-[#ED1C24] text-xs font-bold">🟥 ROCm</span>
                        <span className="text-xs font-mono text-[#ED1C24] font-semibold">src/kernel.hip</span>
                    </div>
                </div>
                <div className="flex-1 w-full relative z-0 mix-blend-screen drop-shadow-md">
                    <Editor
                        height="100%"
                        defaultLanguage="cpp"
                        language="cpp"
                        theme="forgeDark"
                        value={hipCode}
                        options={{
                            ...editorOptions,
                            readOnly: true,
                            domReadOnly: true,
                            lineNumbers: "off",
                        }}
                    />
                    {!hipCode && !isManualMode && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                            <span className="text-[#404040] font-mono text-sm tracking-widest bg-[#0D0D0D]/80 backdrop-blur-sm px-4 py-2 rounded-lg">AWAITING /GENERATE...</span>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
