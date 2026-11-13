export type SubjectVisual = {
  gradient: string; // card header background
  solid: string; // solid accent bg (badges, buttons)
  text: string; // accent text color
  ring: string;
  glow: string; // soft background tint for hero sections
  icon: React.ReactNode;
};

function IconSigma() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="h-full w-full">
      <path
        d="M13 13h20l-9 11 9 11H13l7-7"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconBook() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="h-full w-full">
      <path
        d="M10 12c4-2 9-2 14 0v22c-5-2-10-2-14 0V12ZM38 12c-4-2-9-2-14 0v22c5-2 10-2 14 0V12Z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconColumns() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="h-full w-full">
      <path
        d="M9 40h30M12 40V19M18 40V19M24 40V19M30 40V19M36 40V19M8 19l16-9 16 9H8Z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconCode() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="h-full w-full">
      <path
        d="M17 14 7 24l10 10M31 14l10 10-10 10M27 11l-6 26"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconLeaf() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="h-full w-full">
      <path
        d="M12 36C10 22 20 10 38 10c2 18-10 28-24 26Zm0 0c4-8 10-14 18-18"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconAtom() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="h-full w-full">
      <circle cx="24" cy="24" r="3" fill="currentColor" />
      <ellipse
        cx="24"
        cy="24"
        rx="18"
        ry="7"
        stroke="currentColor"
        strokeWidth="2.5"
        transform="rotate(0 24 24)"
      />
      <ellipse
        cx="24"
        cy="24"
        rx="18"
        ry="7"
        stroke="currentColor"
        strokeWidth="2.5"
        transform="rotate(60 24 24)"
      />
      <ellipse
        cx="24"
        cy="24"
        rx="18"
        ry="7"
        stroke="currentColor"
        strokeWidth="2.5"
        transform="rotate(120 24 24)"
      />
    </svg>
  );
}

export const SUBJECT_VISUALS: Record<string, SubjectVisual> = {
  MATEMATICA: {
    gradient: "bg-gradient-to-br from-amber-400 via-orange-500 to-orange-600",
    solid: "bg-orange-500",
    text: "text-orange-700",
    ring: "ring-orange-600/20",
    glow: "bg-orange-50",
    icon: <IconSigma />,
  },
  ROMANA: {
    gradient: "bg-gradient-to-br from-rose-400 via-pink-500 to-fuchsia-600",
    solid: "bg-rose-500",
    text: "text-rose-700",
    ring: "ring-rose-600/20",
    glow: "bg-rose-50",
    icon: <IconBook />,
  },
  ISTORIE: {
    gradient: "bg-gradient-to-br from-emerald-400 via-teal-500 to-teal-600",
    solid: "bg-teal-600",
    text: "text-teal-700",
    ring: "ring-teal-600/20",
    glow: "bg-teal-50",
    icon: <IconColumns />,
  },
  INFORMATICA: {
    gradient: "bg-gradient-to-br from-indigo-400 via-violet-500 to-purple-600",
    solid: "bg-violet-600",
    text: "text-violet-700",
    ring: "ring-violet-600/20",
    glow: "bg-violet-50",
    icon: <IconCode />,
  },
  BIOLOGIE: {
    gradient: "bg-gradient-to-br from-teal-400 via-cyan-500 to-cyan-600",
    solid: "bg-cyan-600",
    text: "text-cyan-700",
    ring: "ring-cyan-600/20",
    glow: "bg-cyan-50",
    icon: <IconLeaf />,
  },
  FIZICA: {
    gradient: "bg-gradient-to-br from-blue-400 via-blue-500 to-sky-600",
    solid: "bg-blue-600",
    text: "text-blue-700",
    ring: "ring-blue-600/20",
    glow: "bg-blue-50",
    icon: <IconAtom />,
  },
};

export function subjectVisual(subject: string): SubjectVisual {
  return SUBJECT_VISUALS[subject] ?? SUBJECT_VISUALS.MATEMATICA;
}
