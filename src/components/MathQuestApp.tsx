import { useState, useEffect, useRef } from "react";
import { AppShell } from "@/components/AppShell";
import { HomeScreen } from "@/components/screens/HomeScreen";
import { PracticeScreen } from "@/components/screens/PracticeScreen";
import { CollectionScreen } from "@/components/screens/CollectionScreen";
import { SettingsScreen } from "@/components/screens/SettingsScreen";
import { ParentScreen } from "@/components/screens/ParentScreen";
import { useGameState } from "@/hooks/useGameState";
import { music } from "@/lib/music";
import { sound } from "@/lib/sound";

export type Screen = "home" | "practice" | "collection" | "settings" | "parent";

export function MathQuestApp() {
  const [screen, setScreen] = useState<Screen>("home");
  const game = useGameState();
  const startedRef = useRef(false);

  // Preload all Sprunki audio on mount so taps respond instantly.
  useEffect(() => {
    music.preloadAll();
  }, []);

  // Start music after first user interaction (browser autoplay policy).
  useEffect(() => {
    const onInteraction = () => {
      if (!startedRef.current && game.state.settings.music && !game.state.settings.muted) {
        startedRef.current = true;
        music.start();
      }
    };
    window.addEventListener("pointerdown", onInteraction, { once: true });
    return () => window.removeEventListener("pointerdown", onInteraction);
  }, [game.state.settings.music, game.state.settings.muted]);

  // React to music and mute toggle changes after it has already started.
  useEffect(() => {
    if (!startedRef.current) return;
    if (game.state.settings.music && !game.state.settings.muted) {
      music.start();
    } else {
      music.stop();
    }
  }, [game.state.settings.music, game.state.settings.muted]);

  // Sync mute state with sound effects.
  useEffect(() => {
    sound.setMuted(game.state.settings.muted);
  }, [game.state.settings.muted]);

  return (
    <AppShell
      screenKey={screen}
      muted={game.state.settings.muted}
      onToggleMute={() => game.updateSettings({ muted: !game.state.settings.muted })}
    >
      {screen === "home" && <HomeScreen game={game} go={setScreen} />}
      {screen === "practice" && <PracticeScreen game={game} go={setScreen} />}
      {screen === "collection" && <CollectionScreen game={game} go={setScreen} />}
      {screen === "settings" && <SettingsScreen game={game} go={setScreen} />}
      {screen === "parent" && <ParentScreen game={game} go={setScreen} />}
    </AppShell>
  );
}
