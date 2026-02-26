import Editor, { useMonaco } from "@monaco-editor/react";
import { useEffect } from "react";

interface MonacoEditorsProps {
    cudaCode: string;
    hipCode: string;
}

export function MonacoEditors({ cudaCode, hipCode }: MonacoEditorsProps) {
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
        readOnly: true,
        domReadOnly: true,
        wordWrap: "on" as const,
    };

    return (
        <div className="flex w-full h-full pt-12 pb-[30vh]">
            <div className="w-[55%] border-r border-[#2A2A2A] relative">
                <div className="absolute top-0 right-0 z-10 p-2 bg-[#0D0D0D]/80 backdrop-blur text-xs font-mono text-[#A0A0A0] border-b border-l border-[#2A2A2A] rounded-bl-md">
                    src/kernel.cu
                </div>
                <Editor
                    height="100%"
                    defaultLanguage="cuda"
                    language="cpp"
                    theme="forgeDark"
                    value={cudaCode}
                    options={editorOptions}
                />
            </div>
            <div className="w-[45%] relative bg-[#0a0a0a]">
                <div className="absolute top-0 right-0 z-10 p-2 bg-[#0a0a0a]/80 backdrop-blur text-xs font-mono text-[#ED1C24] border-b border-l border-[#2A2A2A] rounded-bl-md">
                    src/kernel.hip
                </div>
                <Editor
                    height="100%"
                    defaultLanguage="cpp"
                    language="cpp"
                    theme="forgeDark"
                    value={hipCode}
                    options={{
                        ...editorOptions,
                        lineNumbers: "off",
                        folding: false
                    }}
                />
                {!hipCode && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="text-[#404040] font-mono text-sm tracking-widest">AWAITING /GENERATE...</span>
                    </div>
                )}
            </div>
        </div>
    );
}
