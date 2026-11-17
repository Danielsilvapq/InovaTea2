"use client";

import { useState } from "react";

export const AVATARS = ["🦊", "🐼", "🐢", "🦉", "🐬", "🦁", "🐸", "🐱", "🐶", "🦕", "🚀", "🌈"];

export function AvatarPicker({ name = "avatar", defaultValue = "🦊" }: { name?: string; defaultValue?: string }) {
  const [value, setValue] = useState(defaultValue);
  return (
    <div className="field">
      <label>Avatar</label>
      <input type="hidden" name={name} value={value} />
      <div className="row" role="radiogroup" aria-label="Escolha um avatar">
        {AVATARS.map((a) => (
          <button
            key={a}
            type="button"
            role="radio"
            aria-checked={value === a}
            onClick={() => setValue(a)}
            className="avatar"
            style={{
              cursor: "pointer",
              border: `3px solid ${value === a ? "var(--primary)" : "transparent"}`,
            }}
          >
            {a}
          </button>
        ))}
      </div>
    </div>
  );
}
