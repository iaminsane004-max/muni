"use client";

import { motion } from "framer-motion";

interface AnimatedTitleFMProps {
  open?: boolean;
  title?: string;
  subtitle?: string;
}

export function AnimatedTitleFM({ 
  open = true, 
  title = "CIVICPULSE AI", 
  subtitle = "Next-Generation Autonomous Municipal Intelligence" 
}: AnimatedTitleFMProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={open ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "0 1.5rem",
        zIndex: 10,
        pointerEvents: "none"
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={open ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.35rem 0.9rem",
          borderRadius: "9999px",
          background: "rgba(165, 88, 251, 0.12)",
          border: "1px solid rgba(165, 88, 251, 0.3)",
          color: "#c084fc",
          fontSize: "0.78rem",
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginBottom: "1.25rem",
          boxShadow: "0 0 20px rgba(165, 88, 251, 0.25)"
        }}
      >
        <span>CIVIC INTELLIGENCE HORIZON</span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={open ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.8 }}
        style={{
          fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
          fontWeight: 800,
          letterSpacing: "-0.03em",
          lineHeight: 1.05,
          color: "#ffffff",
          textShadow: "0 0 40px rgba(165, 88, 251, 0.5), 0 0 80px rgba(73, 34, 229, 0.35)",
          marginBottom: "1rem"
        }}
      >
        {title}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={open ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 1, delay: 1 }}
        style={{
          fontSize: "clamp(0.95rem, 1.8vw, 1.25rem)",
          color: "#94a3b8",
          maxWidth: "600px",
          lineHeight: 1.6
        }}
      >
        {subtitle}
      </motion.p>
    </motion.div>
  );
}
