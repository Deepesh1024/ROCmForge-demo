import Editor, { useMonaco } from "@monaco-editor/react";
import { useEffect } from "react";
import { Play } from "lucide-react";

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

    useEffect(() => {
        if (monaco) {
            monaco.editor.defineTheme("forgeDark", {
                base: "vs-dark",
                inherit: true,
                rules: [],
                colors: {
                    "editor.background": "#0D0D0D",
                    "editorLineNumber.foreground": "#404040",
                    "editorIndentGuide.background": "#202020",
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
    };

    return (
        <div className="flex w-full h-full pt-12 pb-[30vh]">
            <div className="w-[55%] border-r border-[#2A2A2A] relative flex flex-col">
                <div className="absolute top-0 left-0 right-0 h-10 border-b border-[#2A2A2A] bg-[#0A0A0A] flex items-center justify-between px-4 z-10 w-full">
                    <span className="text-xs font-mono text-[#A0A0A0]">src/kernel.cu</span>
                    <div className="flex items-center gap-4">
                        {onManualToggle && (
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <span className="text-xs font-mono text-[#606060] group-hover:text-[#A0A0A0] transition-colors font-semibold">
                                    Auto Demo →
                                </span>
                                <span className={`text-xs font-mono font-bold transition-colors ${isManualMode ? 'text-[#ED1C24]' : 'text-[#606060] group-hover:text-[#A0A0A0]'}`}>
                                    Manual Mode
                                </span>
                                <div className="relative inline-block w-8 h-4 ml-1">
                                    <input
                                        type="checkbox"
                                        className="opacity-0 w-0 h-0"
                                        checked={isManualMode}
                                        onChange={(e) => onManualToggle(e.target.checked)}
                                    />
                                    <span className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-colors duration-300 ${isManualMode ? 'bg-[#ED1C24]' : 'bg-[#2A2A2A]'}`}></span>
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
                <div className="pt-10 flex-1 w-full">
                    <Editor
                        height="100%"
                        defaultLanguage="cuda"
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
            </div>
            <div className="w-[45%] relative bg-[#0a0a0a] flex flex-col">
                <div className="absolute top-0 right-0 left-0 h-10 border-b border-[#2A2A2A] bg-[#0A0A0A] flex flex-row-reverse items-center justify-between px-4 z-10 w-full">
                    <span className="text-xs font-mono text-[#ED1C24]">src/kernel.hip</span>
                </div>
                <div className="pt-10 flex-1 w-full relative">
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
                            folding: false
                        }}
                    />
                    {!hipCode && !isManualMode && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                            <span className="text-[#404040] font-mono text-sm tracking-widest bg-[#0D0D0D] px-4 py-2 rounded-lg">AWAITING /GENERATE...</span>
                        </div>
                    )}
                    {!hipCode && isManualMode && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                            <span className="text-[#404040]/50 font-mono text-xs tracking-widest border border-[#2A2A2A] bg-[#0D0D0D] px-6 py-3 rounded-lg flex flex-col items-center gap-2">
                                <span className="text-[#A0A0A0]">MANUAL MODE ACTIVE</span>
                                <span>Paste CUDA kernel and click Port & Verify</span>
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
