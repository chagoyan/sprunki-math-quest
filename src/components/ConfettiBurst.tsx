import { useEffect } from "react";
import confetti from "canvas-confetti";

export function fireConfetti(intensity: "small" | "big" = "small") {
  const colors = ["#F7931E", "#43A047", "#64B5F6", "#F48FB1", "#FFEB3B", "#7E57C2"];
  if (intensity === "big") {
    confetti({ particleCount: 160, spread: 100, origin: { y: 0.6 }, colors });
    setTimeout(() => confetti({ particleCount: 80, angle: 60, spread: 70, origin: { x: 0 }, colors }), 150);
    setTimeout(() => confetti({ particleCount: 80, angle: 120, spread: 70, origin: { x: 1 }, colors }), 250);
  } else {
    confetti({ particleCount: 70, spread: 65, startVelocity: 38, origin: { y: 0.7 }, colors });
  }
}

export function ConfettiOnMount({ big }: { big?: boolean }) {
  useEffect(() => {
    fireConfetti(big ? "big" : "small");
  }, [big]);
  return null;
}
