"use client";

import { motion } from "framer-motion";

export interface LessonIntroVizProps {
  phase: "history" | "why" | "realWorld";
  heading: string;
  body?: string;
  items?: string[];
}

const PHASE_ICON: Record<LessonIntroVizProps["phase"], string> = {
  history: "📜",
  why: "🎯",
  realWorld: "🌍",
};

// A short, animated "mini-scene" instead of a static text wall -- items
// reveal one at a time so a student with focus difficulties gets one idea
// at a time, not a page of text to parse all at once.
export function LessonIntroViz({ phase, heading, body, items }: LessonIntroVizProps) {
  return (
    <div className="mx-auto max-w-md space-y-4 py-2 text-center">
      <motion.div
        initial={{ scale: 0.3, rotate: -20, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 14 }}
        className="text-6xl"
      >
        {PHASE_ICON[phase]}
      </motion.div>

      <motion.h2
        initial={{ y: 14, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="text-lg font-semibold"
      >
        {heading}
      </motion.h2>

      {body && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="text-sm leading-relaxed text-muted-foreground"
        >
          {body}
        </motion.p>
      )}

      {items && items.length > 0 && (
        <ul className="space-y-2 text-left">
          {items.map((item, i) => (
            <motion.li
              key={item}
              initial={{ x: -24, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 + i * 0.18, duration: 0.4 }}
              className="flex items-start gap-2 rounded-md bg-accent px-3 py-2 text-sm text-accent-foreground"
            >
              <span aria-hidden="true">✦</span>
              <span>{item}</span>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}
