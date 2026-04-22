import { MainMenu } from "@/features/game/components/MainMenu";
import { GameScreen } from "@/features/game/components/GameScreen";
import { useGameStore } from "@/features/game/domain/useGameStore";

export function App() {
  const phase = useGameStore((state) => state.phase);

  if (phase === "menu") {
    return <MainMenu />;
  }

  return <GameScreen />;
}
