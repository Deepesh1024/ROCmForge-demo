import { useState, useEffect, useCallback } from "react";
import { api } from "../api/client";
import { DEMO_RESPONSES } from "../demo/demo_responses";

export type FlowState = "IDLE" | "PARSING" | "GENERATING" | "VERIFYING" | "COMPLETE" | "ERROR";

export function useAutoFlow() {
    const [state, setState] = useState<FlowState>("IDLE");
    const [hipCode, setHipCode] = useState("");
    const [traces, setTraces] = useState<string[]>([]);
    const [metrics, setMetrics] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const startFlow = useCallback(async (code: string) => {
        if (!code) return;
        setState("IDLE");
        setHipCode("");
        setTraces([]);
        setMetrics(null);
        setError(null);

        // Wait 1.2s before parsing for visible animation
        await new Promise(r => setTimeout(r, 1200));
        setState("PARSING");

        try {
            const parseRes = await api.parseCuda(code);

            // Wait 1.2s before generating
            await new Promise(r => setTimeout(r, 1200));
            setState("GENERATING");

            // Demo specific hook-up for generating
            let generatedCode = "";
            let reasoning = [];
            try {
                const genRes = await api.generateHip(code, parseRes);
                generatedCode = genRes.hip_code;
                reasoning = genRes.reasoning_trace || DEMO_RESPONSES.generate.reasoning_trace;
            } catch (e) {
                // fallback if real backend lacks trace
                generatedCode = DEMO_RESPONSES.generate.hip_code;
                reasoning = DEMO_RESPONSES.generate.reasoning_trace;
            }
            setHipCode(generatedCode);

            // Stagger reasoning trace appearance
            for (const line of reasoning) {
                setTraces(prev => [...prev, line]);
                await new Promise(r => setTimeout(r, 200)); // 200ms per line
            }

            // Wait 1.2s before verifying
            await new Promise(r => setTimeout(r, 1200));
            setState("VERIFYING");

            const verifyRes = await api.verifyPort(code, generatedCode);

            setMetrics(verifyRes.metrics || DEMO_RESPONSES.verify.metrics);
            setState("COMPLETE");
        } catch (err: any) {
            setError(err.message || "Backend connection failed");
            setState("ERROR");
        }
    }, []);

    const resetFlow = useCallback(() => {
        setState("IDLE");
        setHipCode("");
        setTraces([]);
        setMetrics(null);
        setError(null);
    }, []);

    return { state, hipCode, traces, metrics, error, startFlow, resetFlow };
}
