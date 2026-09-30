"use client";

import { useEffect } from "react";
import { Cancel01Icon } from "@/lib/icons";
import { LoginForm } from "@/components/auth/login-form";
import { AppIcon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { useLoginModalStore } from "@/stores/login-modal-store";

export function LoginModal() {
  const { isOpen, message, close } = useLoginModalStore();

  useEffect(() => {
    if (!isOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close();
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [close, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label="Log in">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px] dark:bg-black/70"
        onClick={close}
      />
      {/* Sheet on phones, centred dialog from sm up. Separated from the scrim
          by surface colour and a hairline, not a shadow. --field-bg keeps
          autofilled inputs matching the raised surface. */}
      <div className="relative z-10 w-full max-w-[440px] rounded-t-2xl border border-border bg-popover px-6 pb-8 pt-4 [--field-bg:var(--popover)] dark:border-white/10 sm:rounded-2xl sm:px-10 sm:pb-10">
        <div className="-mr-2 mb-2 flex justify-end">
          <Button variant="ghost" size="icon" aria-label="Close" onClick={close}>
            <AppIcon icon={Cancel01Icon} size={20} />
          </Button>
        </div>
        <LoginForm onSuccess={close} onDismiss={close} showLinks subtitle={message ?? undefined} />
      </div>
    </div>
  );
}
