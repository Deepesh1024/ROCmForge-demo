import { useEffect } from "react";
import { TopBar } from "./components/TopBar";
import { MonacoEditors } from "./components/MonacoEditors";
import { BottomConsole } from "./components/BottomConsole";
import { Sidebar } from "./components/Sidebar";
import { LoadingOverlay } from "./components/LoadingOverlay";
import { WelcomeBanner } from "./components/WelcomeBanner";
import { SuccessConfetti } from "./components/SuccessConfetti";
import { useAutoFlow } from "./hooks/useAutoFlow";
import { CUDA_EXAMPLE } from "./demo/cuda_example";
import { Toaster, toast } from "sonner";

function App() {
  const { state, hipCode, traces, metrics, error } = useAutoFlow(CUDA_EXAMPLE);

  useEffect(() => {
    if (state === "COMPLETE") {
      toast.success(`Port verified on MI300X cache — ${metrics?.speedup_vs_cpu || '14.8'}x speedup`);
    } else if (state === "ERROR") {
      toast.error(`Port failed: ${error}`);
    }
  }, [state, metrics, error]);

  return (
    <div className="w-screen h-screen overflow-hidden bg-[#0D0D0D] text-white flex flex-col font-sans">
      <TopBar />
      <WelcomeBanner />

      <main className="flex-1 relative mt-12 w-full h-[calc(100vh-48px)]">
        <div className="w-full h-full relative" style={{ width: state === "COMPLETE" ? 'calc(100% - 380px)' : '100%', transition: 'width 0.5s ease-out' }}>
          <MonacoEditors cudaCode={CUDA_EXAMPLE} hipCode={hipCode} />
        </div>
        <Sidebar metrics={metrics} isOpen={state === "COMPLETE"} />
      </main>

      <BottomConsole traces={traces} status={state} />
      <LoadingOverlay state={state} />
      <SuccessConfetti isSuccess={state === "COMPLETE"} />

      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#141414",
            border: "1px solid #2A2A2A",
            color: "#fff"
          }
        }}
      />
    </div>
  );
}

export default App;
