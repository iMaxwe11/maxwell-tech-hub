/**
 * Global toast system. A small pub/sub over a CustomEvent so any file can
 * call `toast(message)` without threading context through the component tree.
 * The `<Toast />` component in the root layout listens and renders.
 */

export type ToastIntent = "default" | "success" | "error" | "info";

export interface ToastPayload {
  id: string;
  message: string;
  intent: ToastIntent;
}

export const TOAST_EVENT_NAME = "mnx-toast";

export function toast(message: string, intent: ToastIntent = "success") {
  if (typeof window === "undefined") return;
  const detail: ToastPayload = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    message,
    intent,
  };
  window.dispatchEvent(new CustomEvent<ToastPayload>(TOAST_EVENT_NAME, { detail }));
}

/**
 * Copy text to the clipboard and fire a confirmation toast. Returns a promise
 * that resolves to whether the copy succeeded — useful when a caller wants to
 * drive additional UI (e.g. local "copied" state on a button).
 */
export async function copyToClipboard(
  text: string,
  confirmMessage = "Copied to clipboard",
): Promise<boolean> {
  if (typeof window === "undefined") return false;
  try {
    await navigator.clipboard.writeText(text);
    toast(confirmMessage, "success");
    return true;
  } catch {
    toast("Copy failed — clipboard access denied", "error");
    return false;
  }
}
