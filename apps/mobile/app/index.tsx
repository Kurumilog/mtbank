import { useEffect } from "react";

import { AuthScreen } from "../src/features/auth/AuthScreen";
import { useAuthStore } from "../src/features/auth/auth-store";
import { HomeScreen as HomeView } from "../src/features/home/HomeScreen";

export default function IndexScreen() {
  const { bootstrap, isAuthenticated, isReady } = useAuthStore((state) => ({
    bootstrap: state.bootstrap,
    isAuthenticated: state.isAuthenticated,
    isReady: state.isReady,
  }));

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  if (!isReady) {
    return null;
  }

  return isAuthenticated ? <HomeView /> : <AuthScreen />;
}
