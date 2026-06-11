export type AppIconName =
   | "dashboard"
   | "users"
   | "departments"
   | "specializations"
   | "doctors"
   | "patients"
   | "categories"
   | "menu"
   | "collapse"
   | "logout"
   | "chevron"
   | "profile"
   | "shield"
   | "refresh"
   | "check"
   | "close"
   | "plus"
   | "edit"
   | "medicines";

export function AppIcon({
  name,
  className = "h-5 w-5",
}: {
  name: AppIconName;
  className?: string;
}) {
  const common = "fill-none stroke-current";
  switch (name) {
    case "dashboard":
      return (
        <svg viewBox="0 0 24 24" className={`${className} ${common}`} strokeWidth="1.8">
          <path d="M4 12.5h7.5V4H4z" />
          <path d="M12.5 4H20v6.5h-7.5z" />
          <path d="M12.5 14H20v6H12.5z" />
          <path d="M4 16h7.5v4H4z" />
        </svg>
      );
    case "users":
      return (
        <svg viewBox="0 0 24 24" className={`${className} ${common}`} strokeWidth="1.8">
          <path d="M17 21v-1a4 4 0 00-4-4H8a4 4 0 00-4 4v1" />
          <circle cx="10.5" cy="8" r="3.2" />
          <path d="M19 21v-1.5a3.5 3.5 0 00-2.5-3.35" />
          <path d="M15.5 4.5a3 3 0 010 5.9" />
        </svg>
      );
    case "departments":
      return (
        <svg viewBox="0 0 24 24" className={`${className} ${common}`} strokeWidth="1.8">
          <path d="M4 20V5a1 1 0 011-1h8v16" />
          <path d="M13 8h6a1 1 0 011 1v11H13" />
          <path d="M7 7h2" />
          <path d="M7 11h2" />
          <path d="M7 15h2" />
        </svg>
      );
    case "specializations":
      return (
        <svg viewBox="0 0 24 24" className={`${className} ${common}`} strokeWidth="1.8">
          <path d="M12 3l2.7 5.5 6.1.9-4.4 4.3 1 6.1L12 17.9 6.6 19.8l1-6.1-4.4-4.3 6.1-.9z" />
        </svg>
      );
    case "doctors":
      return (
        <svg viewBox="0 0 24 24" className={`${className} ${common}`} strokeWidth="1.8">
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5.5 21v-1a6.5 6.5 0 0113 0v1" />
          <path d="M12 12v6" />
          <path d="M9 15h6" />
        </svg>
      );
    case "patients":
      return (
        <svg viewBox="0 0 24 24" className={`${className} ${common}`} strokeWidth="1.8">
          <circle cx="10" cy="8" r="3.2" />
          <path d="M4 21v-1a4.8 4.8 0 014.8-4.8h2.4A4.8 4.8 0 0116 20v1" />
          <path d="M16 6h6" />
          <path d="M19 3v6" />
        </svg>
      );
    case "categories":
      return (
        <svg viewBox="0 0 24 24" className={`${className} ${common}`} strokeWidth="1.8">
          <path d="M4 6h16" />
          <path d="M4 12h10" />
          <path d="M4 18h14" />
        </svg>
      );
    case "menu":
      return (
        <svg viewBox="0 0 24 24" className={`${className} ${common}`} strokeWidth="1.9">
          <path d="M4 7h16" />
          <path d="M4 12h16" />
          <path d="M4 17h16" />
        </svg>
      );
    case "collapse":
      return (
        <svg viewBox="0 0 24 24" className={`${className} ${common}`} strokeWidth="1.9">
          <path d="M15 6l-6 6 6 6" />
        </svg>
      );
    case "logout":
      return (
        <svg viewBox="0 0 24 24" className={`${className} ${common}`} strokeWidth="1.8">
          <path d="M10 17l1.5-1.5" />
          <path d="M10 7V5a1 1 0 011-1h7a1 1 0 011 1v14a1 1 0 01-1 1h-7a1 1 0 01-1-1v-2" />
          <path d="M3 12h10" />
          <path d="M6.5 8.5L3 12l3.5 3.5" />
        </svg>
      );
    case "chevron":
      return (
        <svg viewBox="0 0 24 24" className={`${className} ${common}`} strokeWidth="1.8">
          <path d="M6 9l6 6 6-6" />
        </svg>
      );
    case "profile":
      return (
        <svg viewBox="0 0 24 24" className={`${className} ${common}`} strokeWidth="1.8">
          <circle cx="12" cy="8" r="3.25" />
          <path d="M5 20a7 7 0 0114 0" />
        </svg>
      );
    case "shield":
      return (
        <svg viewBox="0 0 24 24" className={`${className} ${common}`} strokeWidth="1.8">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      );
    case "refresh":
      return (
        <svg viewBox="0 0 24 24" className={`${className} ${common}`} strokeWidth="1.8">
          <path d="M20 11a8.1 8.1 0 00-15.5-2m-.5-5v5h5" />
          <path d="M4 13a8.1 8.1 0 0015.5 2m.5 5v-5h-5" />
        </svg>
      );
    case "check":
      return (
        <svg viewBox="0 0 24 24" className={`${className} ${common}`} strokeWidth="2">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      );
    case "close":
      return (
        <svg viewBox="0 0 24 24" className={`${className} ${common}`} strokeWidth="2">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      );
    case "plus":
      return (
        <svg viewBox="0 0 24 24" className={`${className} ${common}`} strokeWidth="1.8">
          <path d="M12 5v14M5 12h14" />
        </svg>
      );
    case "edit":
      return (
        <svg viewBox="0 0 24 24" className={`${className} ${common}`} strokeWidth="1.8">
          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      );
    case "medicines":
      return (
        <svg viewBox="0 0 24 24" className={`${className} ${common}`} strokeWidth="1.8">
          <path d="M4.5 12.5l8-8a4.95 4.95 0 017 7l-8 8a4.95 4.95 0 01-7-7z" />
          <path d="M8.5 11.5l4 4" />
        </svg>
      );
    default:
      return null;
  }
}
