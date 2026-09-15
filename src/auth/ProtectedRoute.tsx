import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { supabase } from "../lib/supabase";

const KIRAL_EMAIL = "kiral.admin@gmail.com";

/*
 * Auto logout setelah 30 menit tanpa aktivitas.
 * Aktivitas yang dihitung:
 * - klik
 * - keyboard
 * - touch
 * - scroll
 * - pointer/touch interaction
 */
const INACTIVITY_LIMIT = 30 * 60 * 1000;
const ACTIVITY_CHECK_INTERVAL = 15 * 1000;
const LAST_ACTIVITY_KEY = "kiral_last_activity";

type ProtectedRouteProps = {
  children: ReactNode;
};

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkAccess() {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;

      if (!user) {
        window.location.replace("/login");
        return;
      }

      if (user.email?.toLowerCase() !== KIRAL_EMAIL) {
        await supabase.auth.signOut({ scope: "local" });
        window.location.replace("/login");
        return;
      }

      if (mounted) {
        setAllowed(true);
        setChecking(false);
      }
    }

    checkAccess();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        window.location.replace("/login");
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!allowed) return;

    const markActivity = () => {
      window.sessionStorage.setItem(
        LAST_ACTIVITY_KEY,
        String(Date.now())
      );
    };

    const checkInactivity = async () => {
      const storedActivity = window.sessionStorage.getItem(
        LAST_ACTIVITY_KEY
      );

      const lastActivity = storedActivity
        ? Number(storedActivity)
        : Date.now();

      if (!storedActivity) {
        markActivity();
        return;
      }

      const inactiveFor = Date.now() - lastActivity;

      if (inactiveFor >= INACTIVITY_LIMIT) {
        window.sessionStorage.removeItem(LAST_ACTIVITY_KEY);

        await supabase.auth.signOut({ scope: "local" });

        window.location.replace("/login");
      }
    };

    markActivity();

    const activityEvents = [
      "click",
      "keydown",
      "pointerdown",
      "touchstart",
      "scroll",
    ];

    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, markActivity, {
        passive: true,
      });
    });

    const intervalId = window.setInterval(
      checkInactivity,
      ACTIVITY_CHECK_INTERVAL
    );

    return () => {
      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, markActivity);
      });

      window.clearInterval(intervalId);
    };
  }, [allowed]);

  if (checking) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#062c51",
          color: "#fff",
          fontFamily: "Arial, sans-serif",
        }}
      >
        Memeriksa akses...
      </div>
    );
  }

  return allowed ? <>{children}</> : null;
}
