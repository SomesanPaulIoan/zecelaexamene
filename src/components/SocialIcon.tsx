export function SocialIcon({ type }: { type: "facebook" | "instagram" | "linkedin" }) {
  if (type === "facebook") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M13.5 21v-7.5H16l.5-3H13.5V8.2c0-.87.24-1.46 1.5-1.46H16.6V4.14C16.2 4.1 14.9 4 13.4 4c-3 0-5 1.83-5 5.2v2.3H5.9v3h2.5V21h5.1Z" />
      </svg>
    );
  }
  if (type === "instagram") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M6.94 8.5a1.94 1.94 0 1 0 0-3.88 1.94 1.94 0 0 0 0 3.88ZM5.25 10h3.38v10.5H5.25V10Zm5.63 0h3.24v1.44h.05c.45-.85 1.56-1.75 3.2-1.75 3.42 0 4.06 2.25 4.06 5.17v5.64h-3.38v-5c0-1.2-.02-2.73-1.67-2.73-1.67 0-1.93 1.3-1.93 2.64v5.09h-3.37V10Z" />
    </svg>
  );
}
