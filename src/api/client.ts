import { DEMO_RESPONSES } from "../demo/demo_responses";

const API_BASE = import.meta.env.VITE_API_BASE || "http://3.80.41.142:8000";
const IS_DEMO = import.meta.env.VITE_DEMO_MODE === "true";
const AUTH_TOKEN = "dev-token";

const headers = {
  "Content-Type": "application/json",
  "Authorization": `Bearer ${AUTH_TOKEN}`
};

export const api = {
  async parseCuda(code: string) {
    if (IS_DEMO) return DEMO_RESPONSES.parse;

    const res = await fetch(`${API_BASE}/parse`, {
      method: "POST",
      headers,
      body: JSON.stringify({ cuda_code: code })
    });
    if (!res.ok) throw new Error("Parse failed");
    return res.json();
  },

  async generateHip(code: string, astData: any) {
    if (IS_DEMO) return DEMO_RESPONSES.generate;

    // Extract primitive from the parse result
    const primitive = astData?.data?.classification?.primitive || "elementwise";

    const res = await fetch(`${API_BASE}/generate`, {
      method: "POST",
      headers,
      body: JSON.stringify({ cuda_code: code, primitive })
    });
    if (!res.ok) throw new Error("Generate failed");

    const json = await res.json();
    return {
      hip_code: json.data?.generation?.rocm_code || json.data?.hip_code || "",
      reasoning_trace: json.reasoning_trace || []
    };
  },

  async verifyPort(code: string, hipCode: string, astData: any) {
    if (IS_DEMO) return DEMO_RESPONSES.verify;

    const primitive = astData?.data?.classification?.primitive || "elementwise";

    const res = await fetch(`${API_BASE}/verify`, {
      method: "POST",
      headers,
      body: JSON.stringify({ cuda_code: code, rocm_code: hipCode, primitive })
    });
    if (!res.ok) throw new Error("Verify failed");

    const json = await res.json();
    // Map the verification data to the metrics structure expected by UI
    const metrics = json.data?.verification || {};
    metrics.execution_confidence = json.execution_confidence || json.safety_score;
    metrics.hardware_backend_used = (json.hardware_backend_used || "").replace("_remote_cached", "") || "mi300x";

    return { metrics };
  }
};
