"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";
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
        className="absolute inset-0 bg-background/70 backdrop-blur-md"
        onClick={close}
      />
      <Card className="relative z-10 w-full max-w-md shadow-2xl">
        <CardContent className="p-6">
          <div className="mb-4 flex items-start justify-between gap-4">
            {message ? <p className="text-sm text-muted-foreground">{message}</p> : <span />}
            <Button variant="ghost" size="icon" aria-label="Close" onClick={close}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <LoginForm onSuccess={close} showLinks />
        </CardContent>
      </Card>
    </div>
  );
}
