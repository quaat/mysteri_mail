import * as React from "react";
import { cn } from "@/lib/cn";

const emojiMap: Record<string, string> = {
  // Case 1 suspects
  portrait_lady_gigglesnort: "🤹‍♀️",
  portrait_professor_pumpernickel: "🧑‍🔬",
  portrait_captain_honk: "🪿",

  // Case 2 suspects
  portrait_countess_coinella: "👑🪙",
  portrait_clockwork_squirrel: "🐿️⏰",
  portrait_crate_mole: "🦫📦",

  // Evidence
  sticker_postage_receipt: "🧾",
  sticker_balanced_bags: "⚖️",
  sticker_pigeon_bubble: "🫧",
  sticker_tire_tracks: "🛞",

  sticker_banana_invoice: "🍌🧾",
  sticker_sandwich_split: "🥪➗",
  sticker_coin_trail: "🪙🧭",
  sticker_clock_smudge: "🕒🫳",

  // Stamps
  stamp_10: "🔟",
  stamp_20: "2️⃣0️⃣",
  stamp_5: "🖐️",
  stamp_2: "🦆",
  stamp_1: "1️⃣",
  stamp_glitter_3: "✨3️⃣",
  stamp_coupon_worm: "🪱",

  // Parcels
  parcel_sealed_16: "📦",
  parcel_sealed_12: "📦",
  parcel_9: "📦",
  parcel_5: "📦",
  parcel_8: "📦",

  // Bubble sprites
  bubble_pigeon: "🕊️",
  bubble_bread: "🍞",
  bubble_goose: "🪿",
  bubble_unicycle: "🎪",
  bubble_sock: "🧦",

  // Cards
  card_plus10: "+10",
  card_plus5: "+5",
  card_minus2: "-2",
  card_plus3: "+3",
  card_plus1: "+1",
  card_minus1: "-1",

  // Coins
  coin_25: "🪙",
  coin_10: "🪙",
  coin_5: "🪙",
  coin_1: "🪙",

  // Quiz sprites
  crate_3x4: "📦×🍌",
  crate_5x6: "📦×✨",
  crate_7x2: "🎩×HONK",
  sandwich_24_6: "🥪➗",
  stamps_18_3: "📮➗",
  coins_20_5: "🪙➗",

  // Rewards
  reward_sticker_ferret_mustache: "🦦😎",
  badge_magnifier_star: "🔎⭐",

  reward_sticker_banana_no_mail: "🍌🚫📮",
  badge_clock_star: "🕰️⭐",
};

export function Sprite({
  spriteKey,
  className,
  label,
}: {
  spriteKey: string;
  className?: string;
  label?: string;
}) {
  const emoji = emojiMap[spriteKey] ?? "🕵️";
  return (
    <span
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-black/10 bg-black/5 text-xl",
        className
      )}
      aria-label={label ?? spriteKey}
      title={label ?? spriteKey}
    >
      {emoji}
    </span>
  );
}
