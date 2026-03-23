import { MapPin, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createActorWithConfig } from "../config";

const MAX_DENIALS = 4;
const RETRY_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

async function logVisitorGranted(lat: number, lng: number) {
  try {
    const actor = await createActorWithConfig();
    await actor.logVisitorLocation(lat, lng, navigator.userAgent);
  } catch (_) {}
}

async function logVisitorDenied() {
  try {
    const actor = await createActorWithConfig();
    await actor.logVisitorNoLocation(navigator.userAgent);
  } catch (_) {}
}

export default function LocationPromptBanner() {
  const [visible, setVisible] = useState(false);
  const [denialCount, setDenialCount] = useState(0);
  const [granted, setGranted] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const denialCountRef = useRef(0);

  const captureLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        logVisitorGranted(pos.coords.latitude, pos.coords.longitude);
        setGranted(true);
        setVisible(false);
        if (timerRef.current) clearTimeout(timerRef.current);
      },
      () => {},
      { timeout: 10000 },
    );
  }, []);

  const requestLocation = useCallback(() => {
    const handleDenial = () => {
      logVisitorDenied();
      const newCount = denialCountRef.current + 1;
      denialCountRef.current = newCount;
      setDenialCount(newCount);
      if (newCount < MAX_DENIALS) {
        setVisible(true);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          if (denialCountRef.current < MAX_DENIALS) {
            requestLocation();
          }
        }, RETRY_INTERVAL_MS);
      } else {
        setVisible(false);
      }
    };

    if (!navigator.geolocation) {
      handleDenial();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        logVisitorGranted(pos.coords.latitude, pos.coords.longitude);
        setGranted(true);
        setVisible(false);
        if (timerRef.current) clearTimeout(timerRef.current);
      },
      handleDenial,
      { timeout: 10000 },
    );
  }, []);

  useEffect(() => {
    // Check if permission is already granted before showing any banner
    if (navigator.permissions) {
      navigator.permissions
        .query({ name: "geolocation" })
        .then((result) => {
          if (result.state === "granted") {
            // Already approved — silently capture and never show banner
            captureLocation();
            setGranted(true);
          } else {
            // Not granted (prompt or denied) — start the banner flow
            setVisible(true);
            requestLocation();
          }
          setInitialized(true);
        })
        .catch(() => {
          // Permissions API not available — fall back to requesting directly
          setVisible(true);
          requestLocation();
          setInitialized(true);
        });
    } else {
      setVisible(true);
      requestLocation();
      setInitialized(true);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [requestLocation, captureLocation]);

  if (!initialized || granted || denialCount >= MAX_DENIALS || !visible)
    return null;

  return (
    <div
      data-ocid="location_banner.panel"
      className="fixed top-0 left-0 right-0 z-[9999] bg-amber-400 text-amber-900 px-4 py-3 flex items-center justify-between shadow-md"
    >
      <div className="flex items-center gap-3">
        <MapPin className="h-5 w-5 flex-shrink-0" />
        <p className="text-sm font-medium">
          This site requests your location for security purposes. Please allow
          location access.
          {denialCount > 0 && (
            <span className="ml-2 text-amber-700 text-xs">
              (Attempt {denialCount + 1} of {MAX_DENIALS})
            </span>
          )}
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 ml-4">
        <button
          type="button"
          data-ocid="location_banner.primary_button"
          onClick={requestLocation}
          className="bg-amber-900 text-amber-50 text-sm font-semibold px-4 py-1.5 rounded-md hover:bg-amber-800 transition-colors"
        >
          Allow Location
        </button>
        <button
          type="button"
          data-ocid="location_banner.close_button"
          onClick={() => setVisible(false)}
          className="p-1 rounded hover:bg-amber-500 transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
