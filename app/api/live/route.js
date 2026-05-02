import { requireUser } from "@/lib/auth";
import { GLOBAL_CHANNEL, subscribeToLiveEvents } from "@/lib/live-events";

const encoder = new TextEncoder();

function toSseMessage(event, data) {
  return encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

export async function GET(request) {
  try {
    const user = await requireUser();
    let closed = false;
    let heartbeat = null;
    let unsubscribeUser = () => {};
    let unsubscribeGlobal = () => {};
    let close = () => {};

    const stream = new ReadableStream({
      start(controller) {
        const safeEnqueue = (event, data) => {
          if (closed) {
            return;
          }

          try {
            controller.enqueue(toSseMessage(event, data));
          } catch {
            close();
          }
        };

        const sendEvent = (data) => {
          safeEnqueue("message", data);
        };

        unsubscribeUser = subscribeToLiveEvents(user.id, sendEvent);
        unsubscribeGlobal = subscribeToLiveEvents(GLOBAL_CHANNEL, sendEvent);

        heartbeat = setInterval(() => {
          safeEnqueue("heartbeat", { timestamp: new Date().toISOString() });
        }, 25000);

        close = () => {
          if (closed) {
            return;
          }

          closed = true;
          if (heartbeat) {
            clearInterval(heartbeat);
            heartbeat = null;
          }
          unsubscribeUser();
          unsubscribeGlobal();
          request.signal.removeEventListener("abort", close);
          try {
            controller.close();
          } catch {}
        };

        safeEnqueue("connected", { ok: true, timestamp: new Date().toISOString() });
        request.signal.addEventListener("abort", close);
      },
      cancel() {
        close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: error.message === "UNAUTHORIZED" ? 401 : 500 });
  }
}
