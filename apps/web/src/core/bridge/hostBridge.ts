export type HostPlatform = "browser" | "webview" | "telegram";

export type HostEventName =
  | "game:ready"
  | "game:state"
  | "game:action"
  | "game:error";

type TelegramWebApp = {
  ready(): void;
  expand(): void;
  sendData(data: string): void;
};

type BrowserWindow = Window & {
  ReactNativeWebView?: {
    postMessage(message: string): void;
  };
  Telegram?: {
    WebApp?: TelegramWebApp;
  };
};

export type HostBridge = {
  platform: HostPlatform;
  ready(): void;
  send<TPayload>(event: HostEventName, payload?: TPayload): void;
};

function getBrowserWindow(windowRef: Window = window): BrowserWindow {
  return windowRef as BrowserWindow;
}

export function detectHost(windowRef: Window = window): HostPlatform {
  const browserWindow = getBrowserWindow(windowRef);

  if (browserWindow.Telegram?.WebApp) {
    return "telegram";
  }

  if (browserWindow.ReactNativeWebView) {
    return "webview";
  }

  return "browser";
}

export function createHostBridge(windowRef: Window = window): HostBridge {
  const browserWindow = getBrowserWindow(windowRef);
  const platform = detectHost(windowRef);

  return {
    platform,
    ready() {
      if (platform === "telegram") {
        browserWindow.Telegram?.WebApp?.ready();
        browserWindow.Telegram?.WebApp?.expand();
      }
    },
    send<TPayload>(event: HostEventName, payload?: TPayload) {
      const message = JSON.stringify({
        event,
        payload,
        platform,
        source: "mtbank-web",
        timestamp: Date.now(),
      });

      if (platform === "telegram") {
        browserWindow.Telegram?.WebApp?.sendData(message);
        return;
      }

      if (platform === "webview") {
        browserWindow.ReactNativeWebView?.postMessage(message);
        return;
      }

      console.debug("[mtbank-web]", message);
    },
  };
}