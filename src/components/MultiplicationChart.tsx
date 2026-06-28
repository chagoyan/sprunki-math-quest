import { motion } from "framer-motion";

interface Props {
  /** Up to which factor to show (default 10). */
  size?: number;
  /** Optional cell highlight: a × b. */
  highlight?: { a: number; b: number };
}

function hue(product: number, max: number) {
  // Map products to a rainbow so children can see patterns.
  const t = product / max;
  return `oklch(0.88 0.12 ${Math.round(30 + t * 300)})`;
}

export function MultiplicationChart({ size = 10, highlight }: Props) {
  const factors = Array.from({ length: size }, (_, i) => i + 1);
  const maxProduct = size * size;

  return (
    <div className="overflow-x-auto rounded-3xl bg-card p-3 ring-1 ring-border shadow-sm sm:p-5">
      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: `auto repeat(${size}, minmax(2rem, 1fr))` }}
      >
        <div />
        {factors.map((b) => (
          <div
            key={`h-${b}`}
            className="grid h-8 place-items-center rounded-md bg-muted text-xs font-black tabular-nums text-muted-foreground sm:h-10 sm:text-sm"
          >
            {b}
          </div>
        ))}
        {factors.map((a) => (
          <ContextRow
            key={`r-${a}`}
            a={a}
            factors={factors}
            maxProduct={maxProduct}
            highlight={highlight}
          />
        ))}
      </div>
    </div>
  );
}

function ContextRow({
  a,
  factors,
  maxProduct,
  highlight,
}: {
  a: number;
  factors: number[];
  maxProduct: number;
  highlight?: { a: number; b: number };
}) {
  return (
    <>
      <div className="grid h-8 place-items-center rounded-md bg-muted text-xs font-black tabular-nums text-muted-foreground sm:h-10 sm:text-sm">
        {a}
      </div>
      {factors.map((b) => {
        const product = a * b;
        const isHi =
          highlight && ((highlight.a === a && highlight.b === b) || (highlight.a === b && highlight.b === a));
        return (
          <motion.div
            key={`c-${a}-${b}`}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: (a * factors.length + b) * 0.005 }}
            className={`grid h-8 place-items-center rounded-md text-xs font-black tabular-nums text-foreground/85 ring-1 sm:h-10 sm:text-sm ${
              isHi ? "ring-2 ring-amber-500 scale-105 shadow-md" : "ring-black/5"
            }`}
            style={{ background: hue(product, maxProduct) }}
          >
            {product}
          </motion.div>
        );
      })}
    </>
  );
}
