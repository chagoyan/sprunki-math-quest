import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { HomeScreen } from "@/components/screens/HomeScreen";
import { PracticeScreen } from "@/components/screens/PracticeScreen";
import { CollectionScreen } from "@/components/screens/CollectionScreen";
import { SettingsScreen } from "@/components/screens/SettingsScreen";
import { ParentScreen } from "@/components/screens/ParentScreen";
import { useGameState } from "@/hooks/useGameState";

export type Screen = "home" | "practice" | "collection" | "settings" | "parent";

export function MathQuestApp() {
  const [screen, setScreen] = useState<Screen>("home");
  const game = useGameState();

  return (
    <AppShell screenKey={screen}>
      {screen === "home" && <HomeScreen game={game} go={setScreen} />}
      {screen === "practice" && <PracticeScreen game={game} go={setScreen} />}
      {screen === "collection" && <CollectionScreen game={game} go={setScreen} />}
      {screen === "settings" && <SettingsScreen game={game} go={setScreen} />}
      {screen === "parent" && <ParentScreen game={game} go={setScreen} />}
    </AppShell>
  );
}
