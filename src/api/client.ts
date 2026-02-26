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

    const res = await fetch(`${API_BASE}/generate`, {
      method: "POST",
      headers,
      body: JSON.stringify({ cuda_code: code, parse_result: astData })
    });
    if (!res.ok) throw new Error("Generate failed");
    return res.json();
  },

  async verifyPort(cudaCode: string, hipCode: string) {
    if (IS_DEMO) return DEMO_RESPONSES.verify;

    const res = await fetch(`${API_BASE}/verify`, {
      method: "POST",
      headers,
      body: JSON.stringify({ cuda_code: cudaCode, hip_code: hipCode })
    });
    if (!res.ok) throw new Error("Verify failed");
    return res.json();
  }
};
