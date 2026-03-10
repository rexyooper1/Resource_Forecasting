import { Sparkles } from "lucide-react";
import { RecommendationsPanel } from "@/components/ai/recommendations-panel";
import { ChatInterface } from "@/components/ai/chat-interface";

export default function AiPage() {
  return (
    <div className="p-6 space-y-8 max-w-5xl">
      <div className="flex items-center gap-3">
        <Sparkles className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">AI Resource Advisor</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <RecommendationsPanel />
        <ChatInterface />
      </div>
    </div>
  );
}
