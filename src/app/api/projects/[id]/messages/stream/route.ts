import { getCurrentUser } from '@/app/(auth)/actions/login';
import { subscribeProjectMessages } from '@/lib/projectMessageEvents';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function formatEvent(eventName: string, data: unknown) {
  return `event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`;
}

export async function GET(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return new Response('Unauthorized', { status: 401 });
  }

  const url = new URL(request.url);
  const projectId = Number(url.pathname.split('/')[3]);

  if (!Number.isInteger(projectId) || projectId <= 0) {
    return new Response('Invalid project id', { status: 400 });
  }

  const encoder = new TextEncoder();
  let unsubscribe: (() => void) | null = null;
  let heartbeatId: ReturnType<typeof setInterval> | null = null;

  const stream = new ReadableStream({
    start(controller) {
      const send = (eventName: string, data: unknown) => {
        controller.enqueue(encoder.encode(formatEvent(eventName, data)));
      };

      const cleanup = () => {
        unsubscribe?.();
        unsubscribe = null;

        if (heartbeatId) {
          clearInterval(heartbeatId);
          heartbeatId = null;
        }
      };

      send('connected', { projectId });

      unsubscribe = subscribeProjectMessages(projectId, (event) => {
        send(event.type, event);
      });

      heartbeatId = setInterval(() => {
        controller.enqueue(encoder.encode(': keep-alive\n\n'));
      }, 25000);

      request.signal.addEventListener('abort', cleanup);
    },
    cancel() {
      unsubscribe?.();
      unsubscribe = null;

      if (heartbeatId) {
        clearInterval(heartbeatId);
        heartbeatId = null;
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
