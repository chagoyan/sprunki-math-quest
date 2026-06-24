import { createFileRoute } from "@tanstack/react-router";
import { MathQuestApp } from "@/components/MathQuestApp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MathQuest — A playful math adventure" },
      { name: "description", content: "A bright, friendly math game where kids practice addition and collect adorable Sprunki friends." },
      { property: "og:title", content: "MathQuest" },
      { property: "og:description", content: "A bright, friendly math game where kids practice addition and collect Sprunki friends." },
    ],
  }),
  component: Index,
});

function Index() {
  return <MathQuestApp />;
}
