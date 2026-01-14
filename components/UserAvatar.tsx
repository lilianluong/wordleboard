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

  // Size mappings with responsive mobile sizes.
  const sizeMap = {
    sm: {
      container: { mobile: 32, desktop: 24 },
      icon: { mobile: 20, desktop: 16 },
      text: { mobile: "0.875rem", desktop: "0.75rem" }
    },
    md: {
      container: { mobile: 40, desktop: 32 },
      icon: { mobile: 24, desktop: 20 },
      text: { mobile: "1rem", desktop: "0.875rem" }
    },
    lg: {
      container: { mobile: 56, desktop: 48 },
      icon: { mobile: 32, desktop: 28 },
      text: { mobile: "1.125rem", desktop: "1rem" }
    },
  };

  const dimensions = sizeMap[size];
  const shouldShowImage = avatarUrl && !imageError;

  return (
    <div
      className="flex items-center"
      style={{
        gap: size === "sm" ? "0.375rem" : "0.5rem",
      }}
      title={username}
    >
      {/* Avatar image or default icon */}
      <div
        className="rounded-full overflow-hidden flex items-center justify-center flex-shrink-0"
        style={{
          width: `${dimensions.container.mobile}px`,
          height: `${dimensions.container.mobile}px`,
          background: shouldShowImage ? "transparent" : "var(--slate-200)",
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
            width={dimensions.icon.mobile}
            height={dimensions.icon.mobile}
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
            fontSize: dimensions.text.mobile,
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
