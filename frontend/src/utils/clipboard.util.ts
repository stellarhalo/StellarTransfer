/**
 * Clipboard utility that works in both secure and non-secure contexts.
 * Falls back to document.execCommand('copy') when Clipboard API is unavailable.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  // Try Clipboard API first (works in secure context)
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to fallback
    }
  }

  // Fallback: use document.execCommand('copy') (works in non-secure context)
  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    textarea.style.top = "-9999px";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const success = document.execCommand("copy");
    document.body.removeChild(textarea);
    return success;
  } catch {
    return false;
  }
}
