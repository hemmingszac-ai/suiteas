"use client";

import { motion, useReducedMotion } from "motion/react";
import { PRODUCTS } from "@/lib/products";
import { ProductIcon } from "./product-icon";

const ORBIT_SECONDS = 50;

/** The hero visual: every member product orbiting the pitch. */
export function ToolCircle() {
  const reduceMotion = useReducedMotion();
  const orbit = reduceMotion
    ? undefined
    : { rotate: 360, transition: { duration: ORBIT_SECONDS, repeat: Infinity, ease: "linear" } };
  const counterOrbit = reduceMotion
    ? undefined
    : { rotate: -360, transition: { duration: ORBIT_SECONDS, repeat: Infinity, ease: "linear" } };

  return (
    <div className="relative mx-auto aspect-square w-full max-w-lg">
      <motion.div className="absolute inset-0" animate={orbit}>
        {PRODUCTS.map((p, i) => {
          const angle = (i / PRODUCTS.length) * 2 * Math.PI - Math.PI / 2;
          const x = 50 + 44 * Math.cos(angle);
          const y = 50 + 44 * Math.sin(angle);
          return (
            <div
              key={p.id}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              {/* Counter-rotates against the ring so every tile stays upright. */}
              <motion.div animate={counterOrbit}>
                <ProductIcon product={p} size={52} />
              </motion.div>
            </div>
          );
        })}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="absolute inset-0 flex flex-col items-center justify-center px-12 text-center"
      >
        <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
          All of your tools,
          <br />
          paid by <span className="text-accent">Koha</span>.
        </h1>
        <p className="mt-3 text-sm text-muted">Safe, secure, flexible.</p>
      </motion.div>
    </div>
  );
}
