"use client";

import { useEffect, useState } from "react";
import {
  isPushNotificationSupported,
  getNotificationPermission,
  subscribeToPush,
  unsubscribeFromPush,
  checkSubscriptionStatus,
} from "@/lib/push-notifications-client";

export default function NotificationSettings() {
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Setup.
    const checkSupport = async () => {
      const isSupported = isPushNotificationSupported();
      setSupported(isSupported);

      if (isSupported) {
        setPermission(getNotificationPermission());
        if (getNotificationPermission() === "granted") {
          const status = await checkSubscriptionStatus();
          setSubscribed(status);
        }
      }
      setLoading(false);
    };

    checkSupport();
  }, []);

  const handleToggle = async () => {
    setError(null);
    setProcessing(true);

    try {
      if (subscribed) {
        // Act.
        // Unsubscribe.
        await unsubscribeFromPush();
        setSubscribed(false);
      } else {
        // Act.
        // Subscribe - fetch VAPID public key from server.
        const keyResponse = await fetch("/api/notifications/vapid-public-key");
        if (!keyResponse.ok) {
          throw new Error("Failed to fetch VAPID public key");
        }
        const { publicKey } = await keyResponse.json();

        if (!publicKey) {
          throw new Error("VAPID public key not configured");
        }

        await subscribeToPush(publicKey);
        setSubscribed(true);
        setPermission("granted");
      }
    } catch (err: any) {
      // Assert.
      console.error("Notification toggle error:", err);
      if (err.message === "Notification permission denied") {
        setError("Notification permission was denied. Please enable notifications in your browser settings.");
        setPermission("denied");
      } else {
        setError(err.message || "Failed to update notification settings");
      }
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return null;
  }

  if (!supported) {
    return (
      <div style={{ marginBottom: "2rem" }}>
        <label
          style={{
            display: "block",
            fontSize: "0.875rem",
            fontWeight: "600",
            color: "var(--navy)",
            marginBottom: "0.75rem",
          }}
        >
          Push Notifications
        </label>
        <p
          style={{
            fontSize: "0.875rem",
            color: "var(--charcoal)",
          }}
        >
          Push notifications are not supported in this browser.
          {typeof window !== "undefined" &&
            /iPad|iPhone|iPod/.test(navigator.userAgent) &&
            !window.matchMedia("(display-mode: standalone)").matches && (
              <span>
                {" "}
                On iOS, you need to install this app to your home screen first.
              </span>
            )}
        </p>
      </div>
    );
  }

  if (permission === "denied") {
    return (
      <div style={{ marginBottom: "2rem" }}>
        <label
          style={{
            display: "block",
            fontSize: "0.875rem",
            fontWeight: "600",
            color: "var(--navy)",
            marginBottom: "0.75rem",
          }}
        >
          Push Notifications
        </label>
        <p
          style={{
            fontSize: "0.875rem",
            color: "var(--charcoal)",
            marginBottom: "0.5rem",
          }}
        >
          Notifications are blocked. To enable notifications, please update your browser
          settings and reload the page.
        </p>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: "2rem" }}>
      <label
        style={{
          display: "block",
          fontSize: "0.875rem",
          fontWeight: "600",
          color: "var(--navy)",
          marginBottom: "0.75rem",
        }}
      >
        Push Notifications
      </label>

      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <button
          onClick={handleToggle}
          disabled={processing}
          style={{
            position: "relative",
            width: "3rem",
            height: "1.5rem",
            borderRadius: "9999px",
            border: "none",
            cursor: processing ? "not-allowed" : "pointer",
            background: subscribed ? "var(--purple)" : "var(--charcoal)",
            transition: "background 0.2s",
            opacity: processing ? 0.6 : subscribed ? 1 : 0.3,
          }}
        >
          <span
            style={{
              position: "absolute",
              top: "0.125rem",
              left: subscribed ? "1.625rem" : "0.125rem",
              width: "1.25rem",
              height: "1.25rem",
              borderRadius: "9999px",
              background: "white",
              transition: "left 0.2s",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
            }}
          />
        </button>

        <span
          style={{
            fontSize: "0.875rem",
            color: "var(--navy)",
          }}
        >
          {processing
            ? "Updating..."
            : subscribed
            ? "Enabled"
            : "Disabled"}
        </span>
      </div>

      <p
        style={{
          fontSize: "0.75rem",
          color: "var(--charcoal)",
          marginTop: "0.5rem",
        }}
      >
        Get notified when someone submits a Wordle result.
      </p>

      {error && (
        <div
          style={{
            marginTop: "0.75rem",
            padding: "0.75rem",
            borderRadius: "8px",
            background: "#fee",
            color: "#c00",
            fontSize: "0.875rem",
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}
