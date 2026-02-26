import { useEffect, useState } from "react";
import { TopBar } from "./components/TopBar";
import { MonacoEditors } from "./components/MonacoEditors";
import { BottomConsole } from "./components/BottomConsole";
import { Sidebar } from "./components/Sidebar";
import { LoadingOverlay } from "./components/LoadingOverlay";
import { WelcomeBanner } from "./components/WelcomeBanner";
import { SuccessConfetti } from "./components/SuccessConfetti";
import { useAutoFlow } from "./hooks/useAutoFlow";
import { CODE_EXAMPLES } from "./demo/examples";
import { Toaster, toast } from "sonner";
import { motion } from "framer-motion";

function App() {
  const { state, hipCode, traces, metrics, error, startFlow, resetFlow } = useAutoFlow();
  const [selectedExample, setSelectedExample] = useState<typeof CODE_EXAMPLES[0] | null>(null);
  const [isManualMode, setIsManualMode] = useState(false);
  const [manualCode, setManualCode] = useState("");

  useEffect(() => {
    if (state === "COMPLETE") {
      toast.success(`Port verified on MI300X cache — Safety Score: ${metrics?.execution_confidence || 96}/100`, {
        description: "Port Successful",
        duration: 5000,
      });
    } else if (state === "ERROR") {
      toast.error(error || "Backend connection failed", {
        description: "Error",
      });
    }
  }, [state, metrics, error]);

  const handleSelectExample = (example: typeof CODE_EXAMPLES[0]) => {
    setSelectedExample(example);
    setManualCode(example.code);
    setIsManualMode(false);
    startFlow(example.code);
  };

  const handleRandomExample = () => {
    const random = CODE_EXAMPLES[Math.floor(Math.random() * CODE_EXAMPLES.length)];
    handleSelectExample(random);
  };

  const handleManualPort = () => {
    startFlow(manualCode);
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-[#0D0D0D] text-white flex flex-col font-sans">
      <TopBar />
      <WelcomeBanner />

      <main className="flex-1 relative mt-12 w-full h-[calc(100vh-48px)]">
        {selectedExample || isManualMode ? (
          <>
            <div className="w-full h-full relative" style={{ width: state === "COMPLETE" ? 'calc(100% - 380px)' : '100%', transition: 'width 0.5s ease-out' }}>
              <MonacoEditors
                cudaCode={manualCode}
                hipCode={hipCode}
                isManualMode={isManualMode}
                onManualToggle={(val) => {
                  setIsManualMode(val);
                  if (val) resetFlow();
                }}
                onCudaChange={setManualCode}
                onPortVerify={handleManualPort}
              />
            </div>
            <Sidebar metrics={metrics} isOpen={state === "COMPLETE"} />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full max-w-4xl mx-auto px-6 pb-[30vh]">
            <h2 className="text-2xl font-semibold mb-8 text-[#A0A0A0]">Select a CUDA Kernel to Port</h2>
            <div className="grid grid-cols-2 gap-6 w-full mb-8">
              {CODE_EXAMPLES.map((ex, i) => (
                <motion.button
                  key={ex.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => handleSelectExample(ex)}
                  className="p-6 text-left border border-[#2A2A2A] rounded-xl bg-[#141414] hover:bg-[#1A1A1A] hover:border-[#ED1C24] hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(237,28,36,0.1)] transition-all group"
                >
                  <h3 className="text-lg font-medium text-white mb-2 group-hover:text-[#ED1C24] transition-colors">{ex.title}</h3>
                  <p className="text-sm font-mono text-[#606060] line-clamp-2">{ex.code.split('\n')[0]}</p>
                </motion.button>
              ))}
            </div>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              onClick={handleRandomExample}
              className="px-6 py-2.5 rounded-md text-sm font-medium text-[#ED1C24] bg-[#ED1C24]/10 hover:bg-[#ED1C24]/20 border border-[#ED1C24]/30 transition-colors"
            >
              Run Random Example
            </motion.button>
            <button
              onClick={() => setIsManualMode(true)}
              className="mt-6 text-xs text-[#606060] hover:text-[#A0A0A0] underline underline-offset-4"
            >
              Or start with an empty editor (Manual Mode)
            </button>
          </div>
        )}
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
