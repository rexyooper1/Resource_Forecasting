import OpenAI from "openai";
import { buildAiContext } from "@/lib/ai-context";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT_TEMPLATE = `You are an AI resource planning assistant for an engineering services firm using StaffCast.
You help the Engineering Manager make staffing and resource decisions.
Answer questions about projects, employees, availability, skill matches, and assignments.
Be concise and data-driven. Reference specific names and numbers from the data below.

Current workforce data:
{CONTEXT}`;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(request: Request) {
  try {
    const { messages } = (await request.json()) as { messages: ChatMessage[] };

    const context = buildAiContext();
    const systemPrompt = SYSTEM_PROMPT_TEMPLATE.replace("{CONTEXT}", context);

    const stream = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
      stream: true,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta?.content;
          if (delta) {
            controller.enqueue(encoder.encode(delta));
          }
        }
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response("Failed to process chat request", { status: 500 });
  }
}
