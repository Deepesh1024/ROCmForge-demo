import { create } from 'zustand';

export type FlowState = "IDLE" | "PARSING" | "GENERATING" | "VERIFYING" | "COMPLETE" | "ERROR";

interface TimelineState {
    cardPulseIndex: number;
    showCode: boolean;
    showTrace: boolean;
    typewriterCode: boolean;
    showSidebar: boolean;
    flashBadge: boolean;
    animateMetrics: boolean;
    sweepBar: boolean;
    showToast: boolean;
    runToken: number | null;
}

interface FlowStore {
    state: FlowState;
    hipCode: string;
    traces: string[];
    metrics: any;
    error: string | null;
    timeline: TimelineState;
    selectedExampleId: string | null;

    setState: (s: FlowState) => void;
    setHipCode: (code: string | ((prev: string) => string)) => void;
    addTrace: (trace: string) => void;
    setMetrics: (metrics: any) => void;
    setError: (error: string | null) => void;
    setTimeline: (partial: Partial<TimelineState>) => void;
    setSelectedExampleId: (id: string | null) => void;
    reset: () => void;
}

const initialTimeline: TimelineState = {
    cardPulseIndex: -1,
    showCode: false,
    showTrace: false,
    typewriterCode: false,
    showSidebar: false,
    flashBadge: false,
    animateMetrics: false,
    sweepBar: false,
    showToast: false,
    runToken: null,
};

export const useFlowStore = create<FlowStore>((set) => ({
    state: "IDLE",
    hipCode: "",
    traces: [],
    metrics: null,
    error: null,
    timeline: initialTimeline,
    selectedExampleId: null,

    setState: (s) => set({ state: s }),
    setHipCode: (code) => set((state) => ({
        hipCode: typeof code === 'function' ? code(state.hipCode) : code
    })),
    addTrace: (trace) => set((state) => ({ traces: [...state.traces, trace] })),
    setMetrics: (m) => set({ metrics: m }),
    setError: (e) => set({ error: e }),
    setTimeline: (partial) => set((state) => ({ timeline: { ...state.timeline, ...partial } })),
    setSelectedExampleId: (id) => set({ selectedExampleId: id }),
    reset: () => set({
        state: "IDLE",
        hipCode: "",
        traces: [],
        metrics: null,
        error: null,
        timeline: initialTimeline,
        selectedExampleId: null
    })
}));
