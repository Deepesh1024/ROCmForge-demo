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

        // 0.5s: Card Pulse
        setTimeout(() => {
            if (isActive()) store.setTimeline({ cardPulseIndex: cardIndex });
        }, 500);

        // 1.0s: Code Slides in (if manual mode, this just ensures visibility)
        setTimeout(() => {
            if (isActive()) store.setTimeline({ showCode: true });
        }, 1000);

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

        // 1.5s: Trace Streaming Begins
        const traceStartDelay = Math.max(0, 1500 - elapsed);
        setTimeout(() => {
            if (!isActive()) return;
            store.setState("GENERATING");
            store.setTimeline({ showTrace: true });

            const traceDelay = 500 / Math.max(reasoning.length, 1);
            reasoning.forEach((line, i) => {
                setTimeout(() => {
                    if (isActive()) store.addTrace(line);
                }, i * traceDelay);
            });
        }, traceStartDelay);

        // 2.0s: HIP Code Typewriter
        const typewriterDelay = Math.max(0, 2000 - elapsed);
        setTimeout(() => {
            if (!isActive()) return;
            store.setTimeline({ typewriterCode: true });
            const lines = generatedCode.split('\n');
            store.setHipCode("");
            for (let i = 0; i < Math.min(10, lines.length); i++) {
                setTimeout(() => {
                    if (isActive()) store.setHipCode(prev => prev + (prev ? '\n' : '') + lines[i]);
                }, i * 100);
            }
            setTimeout(() => {
                if (isActive()) store.setHipCode(generatedCode);
            }, 1000);
        }, typewriterDelay);

        // 3.0s: Sidebar slides in
        const sidebarDelay = Math.max(0, 3000 - elapsed);
        setTimeout(() => {
            if (!isActive()) return;
            store.setState("VERIFYING");
            store.setTimeline({ showSidebar: true });
        }, sidebarDelay);

        // 3.2s: VERIFIED Badge
        const badgeDelay = Math.max(0, 3200 - elapsed);
        setTimeout(() => {
            if (isActive()) store.setTimeline({ flashBadge: true });
        }, badgeDelay);

        // 3.5s: Metrics Animate
        const metricsDelay = Math.max(0, 3500 - elapsed);
        setTimeout(() => {
            if (!isActive()) return;
            store.setMetrics(verifyRes.metrics || DEMO_RESPONSES.verify.metrics);
            store.setTimeline({ animateMetrics: true });
        }, metricsDelay);

        // 3.8s: Sweep Bar
        const sweepDelay = Math.max(0, 3800 - elapsed);
        setTimeout(() => {
            if (isActive()) store.setTimeline({ sweepBar: true });
        }, sweepDelay);

        // 4.2s: Success Toast (COMPLETED)
        const toastDelay = Math.max(0, 4200 - elapsed);
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
