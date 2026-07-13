import { useRegisterSW } from "virtual:pwa-register/react";

function PwaRegistrationInner() {
  useRegisterSW({
    immediate: true,
    onRegisteredSW(_swUrl, registration) {
      if (registration) {
        setInterval(() => {
          void registration.update();
        }, 60 * 60 * 1000);
      }
    },
  });

  return null;
}

/**
 * Registers the service worker on the client. TanStack Start renders HTML via SSR,
 * so registration must happen in React rather than index.html injection.
 */
export function PwaRegistration() {
  if (import.meta.env.DEV) return null;
  return <PwaRegistrationInner />;
}
