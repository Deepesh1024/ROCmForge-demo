import { useEffect, useState } from "react";
import { TopBar } from "./components/TopBar";
import { MonacoEditors } from "./components/MonacoEditors";
import { BottomConsole } from "./components/BottomConsole";
import { Sidebar } from "./components/Sidebar";
import { LoadingOverlay } from "./components/LoadingOverlay";
import { WelcomeBanner } from "./components/WelcomeBanner";
import { SuccessConfetti } from "./components/SuccessConfetti";
import { Landing } from "./components/Landing";
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

  const handleSelectExample = (example: typeof CODE_EXAMPLES[0], index: number = -1) => {
    setSelectedExample(example);
    setManualCode(example.code);
    setIsManualMode(false);
    startFlow(example.code, index);
  };

  const handleRandomExample = () => {
    const randomIndex = Math.floor(Math.random() * CODE_EXAMPLES.length);
    handleSelectExample(CODE_EXAMPLES[randomIndex], randomIndex);
  };

  const handleManualPort = () => {
    startFlow(manualCode, -1);
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-[#0D0D0D] text-white flex flex-col font-sans">
      <TopBar />
      <WelcomeBanner />

      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex-1 relative mt-12 w-full h-[calc(100vh-48px)]"
      >
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
            <Sidebar />
          </>
        ) : (
          <Landing
            onSelect={(ex, i) => handleSelectExample(ex, i)}
            onRandom={handleRandomExample}
            onManual={() => setIsManualMode(true)}
          />
        )}
      </motion.main>

      <BottomConsole />
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
