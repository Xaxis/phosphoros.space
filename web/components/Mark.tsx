/** The morning star: Venus with the light it brings. */
/** `id` keeps the gradient unique when the mark appears twice on a page. */
export function Mark({ size = 28, id = "mark" }: { size?: number; id?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      className="mark"
    >
      <defs>
        <radialGradient id={`${id}-g`} cx="38%" cy="34%" r="70%">
          <stop offset="0" stopColor="#fff4d6" />
          <stop offset="0.45" stopColor="#f3c463" />
          <stop offset="1" stopColor="#d9792f" />
        </radialGradient>
      </defs>
      <path
        d="M16 1.5 L17.6 13.2 L29.5 16 L17.6 18.8 L16 30.5 L14.4 18.8 L2.5 16 L14.4 13.2 Z"
        fill="currentColor"
        opacity="0.35"
      />
      <circle cx="16" cy="16" r="7.2" fill={`url(#${id}-g)`} />
    </svg>
  );
}
