import ReactDOM from "react-dom/client";

import { TelegramMiniApp } from "@telegram/app/App";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

ReactDOM.createRoot(rootElement).render(<TelegramMiniApp />);
