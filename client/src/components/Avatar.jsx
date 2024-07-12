import React from "react";

export function Avatar({ playerColor }) {
  return (
    <img
      className="bunny-avatar"
      src={`avatars/${playerColor}_bunny_avatar.png`}
      alt="Avatar"
    />
  );
}
