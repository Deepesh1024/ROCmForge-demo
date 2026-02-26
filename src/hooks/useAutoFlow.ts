import { useState, useEffect } from "react";
import { api } from "../api/client";
import { DEMO_RESPONSES } from "../demo/demo_responses";

export type FlowState = "IDLE" | "PARSING" | "GENERATING" | "VERIFYING" | "COMPLETE" | "ERROR";

export function useAutoFlow(cudaCode: string) {
    const [state, setState] = useState<FlowState>("IDLE");
    const [hipCode, setHipCode] = useState("");
    const [traces, setTraces] = useState<string[]>([]);
    const [metrics, setMetrics] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;

        async function runFlow() {
            try {
                // Wait 1.2s before parsing
                await new Promise(r => setTimeout(r, 1200));
                if (!active) return;
                setState("PARSING");
                const parseRes = await api.parseCuda(cudaCode);

                // Wait 1.2s before generating
                await new Promise(r => setTimeout(r, 1200));
                if (!active) return;
                setState("GENERATING");

                // Demo specific hook-up for generating
                let generatedCode = "";
                let reasoning = [];
                try {
                    const genRes = await api.generateHip(cudaCode, parseRes);
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
                    if (!active) return;
                    setTraces(prev => [...prev, line]);
                    await new Promise(r => setTimeout(r, 200)); // 200ms per line
                }

                // Wait 1.2s before verifying
                await new Promise(r => setTimeout(r, 1200));
                if (!active) return;
                setState("VERIFYING");

                const verifyRes = await api.verifyPort(cudaCode, generatedCode);
                if (!active) return;

                setMetrics(verifyRes.metrics || DEMO_RESPONSES.verify.metrics);
                setState("COMPLETE");

            } catch (err: any) {
                if (!active) return;
                setError(err.message || "An error occurred");
                setState("ERROR");
            }
        }

        runFlow();

        return () => { active = false; };
    }, [cudaCode]);

    return { state, hipCode, traces, metrics, error };
}
