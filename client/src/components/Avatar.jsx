import React from "react";

export function Avatar({ player }) {
  return (
    <img
      className="bunny-avatar"
      src={`avatars/${player.get("color")}_bunny_avatar.png`}
      alt="Avatar"
    />
  );
}
