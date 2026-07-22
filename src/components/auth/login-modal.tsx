"use client";

import { useEffect } from "react";
import { Cancel01Icon } from "@/lib/icons";
import { LoginForm } from "@/components/auth/login-form";
import { AppIcon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close login modal"
        className="absolute inset-0 bg-background/75 backdrop-blur-xl"
        onClick={close}
      />
      <Card className="relative z-10 w-full max-w-md border-primary/15 shadow-panel">
        <CardContent className="p-6">
          <div className="mb-4 flex items-start justify-between gap-4">
            {message ? <p className="text-sm text-muted-foreground">{message}</p> : <span />}
            <Button variant="ghost" size="icon" aria-label="Close" onClick={close}>
              <AppIcon icon={Cancel01Icon} size={18} />
            </Button>
          </div>
          <LoginForm onSuccess={close} onDismiss={close} showLinks />
        </CardContent>
      </Card>
    </div>
  );
}
