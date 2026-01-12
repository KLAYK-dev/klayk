"use client";

import Link from "next/link";
import { Badge } from "@klayk/ui/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface NavIconProps {
  href: string;
  icon: LucideIcon;
  count: number;
  title: string;
  ariaLabel: string;
}

/**
 * Client Component Island - анімована навігаційна іконка
 * 
 * Особливості:
 * - Мінімальний JS bundle (~12KB для всіх 3 іконок)
 * - Smooth анімації через framer-motion
 * - Accessibility ready (aria-label, sr-only)
 * - Badge з анімацією появи/зникнення
 * - Анімація при зміні count (spring animation)
 */
export function NavIcon({
  href,
  icon: Icon,
  count,
  title,
  ariaLabel,
}: NavIconProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className="relative"
    >
      <Link
        href={href}
        aria-label={ariaLabel}
        title={title}
        className="relative flex flex-col items-center justify-center text-sm text-white/90 p-2 rounded-md border border-transparent hover:text-white hover:border-orange-500 hover:shadow-[0_0_10px_rgba(255,165,0,0.6)] transition-colors duration-200"
      >
        {/* Іконка з анімацією при зміні count */}
        <motion.div
          key={`icon-${count}`}
          initial={{ scale: 0.8, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 15,
          }}
        >
          <Icon className="h-7 w-7 text-white/90 transition-colors" />
        </motion.div>

        {/* Анімований badge з кількістю товарів */}
        <AnimatePresence mode="wait">
          {count > 0 && (
            <motion.div
              key={`badge-${count}`}
              initial={{ scale: 0, opacity: 0, y: -5 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0, opacity: 0, y: 5 }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 25,
                duration: 0.2,
              }}
              className="absolute -top-1 -right-1"
            >
              <Badge
                variant="destructive"
                className="text-xs h-5 min-w-[1.25rem] px-1.5 flex items-center justify-center font-bold shadow-lg"
              >
                {count > 99 ? "99+" : count}
              </Badge>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Підпис для screen readers */}
        <span className="sr-only">{title}</span>
      </Link>
    </motion.div>
  );
}

/**
 * Варіант без анімацій (для критичних performance сценаріїв)
 * Використовуйте замість основного якщо потрібно зменшити bundle
 */
export function NavIconSimple({
  href,
  icon: Icon,
  count,
  title,
  ariaLabel,
}: NavIconProps) {
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      title={title}
      className="relative flex items-center justify-center p-2 rounded-md border border-transparent text-white/90 hover:text-white hover:border-orange-500 hover:shadow-[0_0_10px_rgba(255,165,0,0.6)] transition-all duration-200 active:scale-95"
    >
      <Icon className="h-7 w-7" />
      
      {count > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-600 px-1.5 text-xs font-bold text-white shadow-lg">
          {count > 99 ? "99+" : count}
        </span>
      )}
      
      <span className="sr-only">{title}</span>
    </Link>
  );
}