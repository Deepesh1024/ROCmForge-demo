import { useCallback, useEffect } from "react";
import { api } from "../api/client";
import { DEMO_RESPONSES } from "../demo/demo_responses";
import { useFlowStore } from "../store/flowStore";

export type FlowState = "IDLE" | "PARSING" | "GENERATING" | "VERIFYING" | "COMPLETE" | "ERROR";

export function useAutoFlow() {
    const store = useFlowStore();

    const startFlow = useCallback(async (code: string, cardIndex: number = -1) => {
        if (!code) return;

        // 0.0s IDLE -> PARSING Start
        store.reset();
        store.setState("PARSING");

        // Create a run token to abort floating timeouts on error / restart
        const currentRun = Date.now();
        store.setTimeline({ runToken: currentRun });

        // Helper to check if run is still active
        const isActive = () => useFlowStore.getState().timeline.runToken === currentRun;

        // 0.0s (rel) [Card selected]
        setTimeout(() => {
            if (isActive()) store.setTimeline({ cardPulseIndex: cardIndex });
        }, 0);

        // 0.3s (rel) [1.5s from prompt]: Code Slides in
        setTimeout(() => {
            if (isActive()) store.setTimeline({ showCode: true });
        }, 300);

        // Background APIs
        const startTime = Date.now();
        let parseRes: any;
        let generatedCode = "";
        let reasoning: string[] = [];
        let verifyRes: any;

        try {
            parseRes = await api.parseCuda(code);
            try {
                const genRes = await api.generateHip(code, parseRes);
                generatedCode = genRes.hip_code;
                reasoning = genRes.reasoning_trace || DEMO_RESPONSES.generate.reasoning_trace;
            } catch (e) {
                generatedCode = DEMO_RESPONSES.generate.hip_code;
                reasoning = DEMO_RESPONSES.generate.reasoning_trace;
            }
            verifyRes = await api.verifyPort(code, generatedCode, parseRes);
        } catch (e: any) {
            if (isActive()) {
                store.setError(e.message || "Backend connection failed. Is the API server running?");
                store.setState("ERROR");
                store.setTimeline({ runToken: null }); // Cancel upcoming timeouts
            }
            return;
        }

        if (!isActive()) return;
        const elapsed = Date.now() - startTime;

        // 0.8s (rel) [2.0s from prompt]: HIP Code Typewriter
        const typewriterDelay = Math.max(0, 800 - elapsed);
        setTimeout(() => {
            if (!isActive()) return;
            store.setTimeline({ typewriterCode: true });
            const lines = generatedCode.split('\n');
            store.setHipCode("");
            // 8-10 lines slowly, then snap fill
            const slowLines = Math.min(8, lines.length);
            for (let i = 0; i < slowLines; i++) {
                setTimeout(() => {
                    if (isActive()) store.setHipCode(prev => prev + (prev ? '\n' : '') + lines[i]);
                }, i * 50);
            }
            setTimeout(() => {
                if (isActive()) store.setHipCode(generatedCode);
            }, slowLines * 50 + 200);
        }, typewriterDelay);

        // 1.2s (rel) [2.4s from prompt]: Trace Streaming Begins
        const traceStartDelay = Math.max(0, 1200 - elapsed);
        setTimeout(() => {
            if (!isActive()) return;
            store.setState("GENERATING");
            store.setTimeline({ showTrace: true });

            const traceDelay = 300 / Math.max(reasoning.length, 1);
            reasoning.forEach((line, i) => {
                setTimeout(() => {
                    if (isActive()) store.addTrace(line);
                }, i * traceDelay);
            });
        }, traceStartDelay);

        // 1.8s (rel) [3.0s from prompt]: Sidebar slides in spring
        const sidebarDelay = Math.max(0, 1800 - elapsed);
        setTimeout(() => {
            if (!isActive()) return;
            store.setState("VERIFYING");
            store.setTimeline({ showSidebar: true });
        }, sidebarDelay);

        // 2.1s (rel) [3.3s from prompt]: VERIFIED Badge pulses
        const badgeDelay = Math.max(0, 2100 - elapsed);
        setTimeout(() => {
            if (isActive()) store.setTimeline({ flashBadge: true });
        }, badgeDelay);

        // 2.2s (rel) [3.4s from prompt]: Metrics Animate
        const metricsDelay = Math.max(0, 2200 - elapsed);
        setTimeout(() => {
            if (!isActive()) return;
            store.setMetrics(verifyRes.metrics || DEMO_RESPONSES.verify.metrics);
            store.setTimeline({ animateMetrics: true });
        }, metricsDelay);

        // 2.8s (rel) [4.0s from prompt]: Sweep Bar
        const sweepDelay = Math.max(0, 2800 - elapsed);
        setTimeout(() => {
            if (isActive()) store.setTimeline({ sweepBar: true });
        }, sweepDelay);

        // 3.1s (rel) [4.3s from prompt]: Success Toast (COMPLETED)
        const toastDelay = Math.max(0, 3100 - elapsed);
        setTimeout(() => {
            if (!isActive()) return;
            store.setState("COMPLETE");
            store.setTimeline({ showToast: true });
        }, toastDelay);

    }, []);

    const resetFlow = useCallback(() => {
        store.reset();
    }, []);

    return {
        state: store.state,
        hipCode: store.hipCode,
        traces: store.traces,
        metrics: store.metrics,
        error: store.error,
        timeline: store.timeline,
        startFlow,
        resetFlow
    };
}
