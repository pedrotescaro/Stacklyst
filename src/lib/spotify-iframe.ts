export interface SpotifyPlaybackEvent {
  data: {
    playingURI?: string;
    isPaused?: boolean;
    isBuffering?: boolean;
    position?: number;
    duration?: number;
  };
}

export interface SpotifyEmbedController {
  loadEntity?: (uri: string) => void;
  loadUri: (uri: string) => void;
  play: () => void;
  resume?: () => void;
  pause: () => void;
  seek: (seconds: number) => void;
  destroy: () => void;
  addListener: (event: string, listener: (event: SpotifyPlaybackEvent) => void) => void;
}

export interface SpotifyIframeApi {
  createController: (
    element: HTMLElement,
    options: { uri: string; width: number; height: number },
    callback: (controller: SpotifyEmbedController) => void
  ) => void;
}

type SpotifyWindow = Window & {
  SpotifyIframeApi?: SpotifyIframeApi;
  onSpotifyIframeApiReady?: (api: SpotifyIframeApi) => void;
};

const SCRIPT_URL = 'https://open.spotify.com/embed/iframe-api/v1';
let pendingApi: Promise<SpotifyIframeApi> | null = null;

/** Share a single script request; failed requests can be retried on the next click. */
export function loadSpotifyIframeApi(): Promise<SpotifyIframeApi> {
  const spotifyWindow = window as SpotifyWindow;
  if (spotifyWindow.SpotifyIframeApi) return Promise.resolve(spotifyWindow.SpotifyIframeApi);
  if (pendingApi) return pendingApi;

  const request = new Promise<SpotifyIframeApi>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_URL}"]`);
    const script = existing || document.createElement('script');
    const previousReady = spotifyWindow.onSpotifyIframeApiReady;
    const cleanup = () => {
      clearTimeout(timeout);
      script.removeEventListener('error', onError);
      if (spotifyWindow.onSpotifyIframeApiReady === onReady) {
        spotifyWindow.onSpotifyIframeApiReady = previousReady;
      }
    };
    const onError = () => {
      cleanup();
      script.remove();
      reject(new Error('Spotify iframe API unavailable'));
    };
    const onReady = (api: SpotifyIframeApi) => {
      spotifyWindow.SpotifyIframeApi = api;
      cleanup();
      resolve(api);
      try {
        previousReady?.(api);
      } catch {
        /* Do not break this loader. */
      }
    };
    const timeout = window.setTimeout(onError, 10000);
    spotifyWindow.onSpotifyIframeApiReady = onReady;
    script.addEventListener('error', onError, { once: true });
    if (!existing) {
      script.src = SCRIPT_URL;
      script.async = true;
      document.head.appendChild(script);
    }
  });
  pendingApi = request;
  // Handle both outcomes even when this request is only a background preload.
  void request.then(
    () => {
      if (pendingApi === request) pendingApi = null;
    },
    () => {
      if (pendingApi === request) pendingApi = null;
    }
  );
  return request;
}
