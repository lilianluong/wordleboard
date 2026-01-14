"use client";

import { useState } from "react";

interface UserAvatarProps {
  username: string;
  avatarUrl?: string | null;
  size?: "sm" | "md" | "lg";
  showUsername?: boolean;
}

export default function UserAvatar({
  username,
  avatarUrl,
  size = "md",
  showUsername = true,
}: UserAvatarProps) {
  const [imageError, setImageError] = useState(false);

  // Size mappings.
  const sizeMap = {
    sm: { container: 24, icon: 16, text: "0.75rem" },
    md: { container: 32, icon: 20, text: "0.875rem" },
    lg: { container: 48, icon: 28, text: "1rem" },
  };

  const dimensions = sizeMap[size];
  const shouldShowImage = avatarUrl && !imageError;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: size === "sm" ? "0.375rem" : "0.5rem",
      }}
      title={username}
    >
      {/* Avatar image or default icon */}
      <div
        style={{
          width: `${dimensions.container}px`,
          height: `${dimensions.container}px`,
          borderRadius: "50%",
          overflow: "hidden",
          background: shouldShowImage ? "transparent" : "var(--slate-200)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {shouldShowImage ? (
          <img
            src={avatarUrl}
            alt={username}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
            onError={() => setImageError(true)}
          />
        ) : (
          // Default silhouette icon (user SVG)
          <svg
            width={dimensions.icon}
            height={dimensions.icon}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
              fill="var(--slate-400)"
            />
            <path
              d="M12 14C6.477 14 2 18.477 2 24H22C22 18.477 17.523 14 12 14Z"
              fill="var(--slate-400)"
            />
          </svg>
        )}
      </div>

      {/* Username text */}
      {showUsername && (
        <span
          style={{
            fontSize: dimensions.text,
            fontWeight: "500",
            color: "var(--slate-700)",
          }}
        >
          {username}
        </span>
      )}
    </div>
  );
}
