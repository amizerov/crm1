export interface ProjectMessageEvent {
  projectId: number;
  type: 'messages-changed';
  at: string;
}

type ProjectMessageSubscriber = (event: ProjectMessageEvent) => void;

const globalProjectMessageEvents = globalThis as typeof globalThis & {
  projectMessageSubscribers?: Map<number, Set<ProjectMessageSubscriber>>;
};

const subscribers =
  globalProjectMessageEvents.projectMessageSubscribers ??
  new Map<number, Set<ProjectMessageSubscriber>>();

globalProjectMessageEvents.projectMessageSubscribers = subscribers;

export function subscribeProjectMessages(
  projectId: number,
  subscriber: ProjectMessageSubscriber
) {
  const projectSubscribers = subscribers.get(projectId) ?? new Set<ProjectMessageSubscriber>();
  projectSubscribers.add(subscriber);
  subscribers.set(projectId, projectSubscribers);

  return () => {
    projectSubscribers.delete(subscriber);

    if (projectSubscribers.size === 0) {
      subscribers.delete(projectId);
    }
  };
}

export function notifyProjectMessagesChanged(projectId: number) {
  const projectSubscribers = subscribers.get(projectId);

  if (!projectSubscribers) {
    return;
  }

  const event: ProjectMessageEvent = {
    projectId,
    type: 'messages-changed',
    at: new Date().toISOString(),
  };

  for (const subscriber of [...projectSubscribers]) {
    subscriber(event);
  }
}
