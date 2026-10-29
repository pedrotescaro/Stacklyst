import React from 'react';
import { createRoot } from 'react-dom/client';
import { AdventureHub } from '../../../../src/components/mundinho/AdventureHub';
import type {
  AdventureState,
  AdventureTransport,
  Course,
} from '../../../../src/lib/mundinho/types';

declare global {
  interface Window {
    ReactNativeWebView?: { postMessage: (message: string) => void };
    mundinhoReceive: (message: {
      id?: string;
      data?: AdventureState;
      error?: string;
      courses?: Course[];
    }) => void;
  }
}
const pending = new Map<
  string,
  {
    resolve: (data: AdventureState) => void;
    reject: (error: Error) => void;
    timer: ReturnType<typeof setTimeout>;
  }
>();
const transport: AdventureTransport = (action) =>
  new Promise((resolve, reject) => {
    const id = crypto.randomUUID();
    const timer = setTimeout(() => {
      pending.delete(id);
      reject(new Error('A conexão demorou. Tente novamente.'));
    }, 35000);
    pending.set(id, { resolve, reject, timer });
    window.ReactNativeWebView?.postMessage(JSON.stringify({ type: 'api', id, action }));
  });
const root = createRoot(document.getElementById('root')!);
window.mundinhoReceive = (message) => {
  if (message.id) {
    const request = pending.get(message.id);
    if (!request) return;
    clearTimeout(request.timer);
    pending.delete(message.id);
    if (message.error) request.reject(new Error(message.error));
    else if (message.data) request.resolve(message.data);
  } else if (message.courses)
    root.render(
      <AdventureHub
        transport={transport}
        courses={message.courses}
        onCourse={(language) =>
          window.ReactNativeWebView?.postMessage(JSON.stringify({ type: 'course', language }))
        }
      />
    );
};
window.ReactNativeWebView?.postMessage(JSON.stringify({ type: 'ready' }));
