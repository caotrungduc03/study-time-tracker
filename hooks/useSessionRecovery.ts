"use client";

import { useEffect, useState } from "react";
import { getUnfinishedSessions } from "@/lib/db/operations";
import type { StudySession } from "@/types";

export function useSessionRecovery() {
  const [unfinishedSession, setUnfinishedSession] = useState<StudySession | null>(null);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function check() {
      try {
        const sessions = await getUnfinishedSessions();

        if (mounted && sessions.length > 0) {
          // Take the most recent unfinished session
          const latestSession = sessions.sort(
            (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
          )[0];

          setUnfinishedSession(latestSession);
          setShowRecoveryModal(true);
        }
      } catch (error) {
        console.error("Failed to check for unfinished sessions:", error);
      }
    }

    check();

    return () => {
      mounted = false;
    };
  }, []);

  function hideModal() {
    setShowRecoveryModal(false);
  }

  function clearSession() {
    setUnfinishedSession(null);
    setShowRecoveryModal(false);
  }

  return {
    unfinishedSession,
    showRecoveryModal,
    hideModal,
    clearSession,
  };
}
