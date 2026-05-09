type IconProps = {
  className?: string;
};

type IconPath = {
  d?: string;
  points?: string;
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  cx?: number;
  cy?: number;
  r?: number;
};

function makeIcon(paths: IconPath[], viewBox = "0 0 24 24") {
  return function Icon({ className }: IconProps) {
    return (
      <svg
        aria-hidden="true"
        className={className}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox={viewBox}
      >
        {paths.map((path, index) => {
          if (path.points) return <polyline key={index} points={path.points} />;
          if (path.cx) return <circle key={index} cx={path.cx} cy={path.cy} r={path.r} />;
          if (path.x1) return <line key={index} x1={path.x1} y1={path.y1} x2={path.x2} y2={path.y2} />;
          return <path key={index} d={path.d} />;
        })}
      </svg>
    );
  };
}

export const Activity = makeIcon([{ d: "M3 12h4l3-8 4 16 3-8h4" }]);
export const AlertTriangle = makeIcon([{ d: "M12 3 2 21h20L12 3Z" }, { d: "M12 9v5" }, { d: "M12 17h.01" }]);
export const Award = makeIcon([{ cx: 12, cy: 8, r: 5 }, { d: "m8.5 12.5-2 8 5.5-3 5.5 3-2-8" }]);
export const BarChart3 = makeIcon([{ d: "M3 3v18h18" }, { d: "M7 16v-5" }, { d: "M12 16V7" }, { d: "M17 16v-8" }]);
export const BookOpen = makeIcon([{ d: "M4 5.5A3.5 3.5 0 0 1 7.5 2H21v17H8a4 4 0 0 0-4 4V5.5Z" }, { d: "M4 19V5.5" }]);
export const CalendarDays = makeIcon([{ d: "M7 2v4" }, { d: "M17 2v4" }, { d: "M4 7h16" }, { d: "M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2Z" }]);
export const CheckCircle2 = makeIcon([{ cx: 12, cy: 12, r: 9 }, { d: "m8 12 2.5 2.5L16 9" }]);
export const ClipboardCheck = makeIcon([{ d: "M9 3h6l1 2h3v16H5V5h3l1-2Z" }, { d: "m8 13 2 2 5-5" }]);
export const ClipboardList = makeIcon([{ d: "M9 3h6l1 2h3v16H5V5h3l1-2Z" }, { d: "M8 11h8" }, { d: "M8 15h8" }, { d: "M8 19h5" }]);
export const Clock = makeIcon([{ cx: 12, cy: 12, r: 9 }, { d: "M12 7v6l4 2" }]);
export const FileText = makeIcon([{ d: "M6 2h9l5 5v15H6V2Z" }, { d: "M14 2v6h6" }, { d: "M9 13h6" }, { d: "M9 17h6" }]);
export const Flame = makeIcon([{ d: "M12 22c4 0 7-3 7-7 0-3-2-5-4-7 .5 3-1 4-3 5 1-4-1-7-4-10 0 5-4 7-4 12 0 4 4 7 8 7Z" }]);
export const Gauge = makeIcon([{ d: "M4 15a8 8 0 1 1 16 0" }, { d: "M12 15l4-4" }, { d: "M5 19h14" }]);
export const Github = makeIcon([{ d: "M9 19c-5 1-5-2-7-3" }, { d: "M15 22v-4a4 4 0 0 0-1-3c3 0 6-1 6-6 0-1-.5-2-1-3 .2-1 .2-2-.3-3 0 0-1 0-3 1a10 10 0 0 0-6 0C7 3 6 3 6 3c-.5 1-.5 2-.3 3-.5 1-1 2-1 3 0 5 3 6 6 6a4 4 0 0 0-1 3v4" }]);
export const LayoutDashboard = makeIcon([{ d: "M3 3h8v8H3V3Z" }, { d: "M13 3h8v5h-8V3Z" }, { d: "M13 10h8v11h-8V10Z" }, { d: "M3 13h8v8H3v-8Z" }]);
export const Library = makeIcon([{ d: "M4 19V5a2 2 0 0 1 2-2h3v18H6a2 2 0 0 1-2-2Z" }, { d: "M12 3h3v18h-3Z" }, { d: "M18 4l3 1v15l-3 1V4Z" }]);
export const Link2 = makeIcon([{ d: "M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1" }, { d: "M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1" }]);
export const ExternalLink = makeIcon([{ d: "M7 7h10v10" }, { d: "M17 7 7 17" }, { d: "M7 7H5v12h12v-2" }]);
export const ListChecks = makeIcon([{ d: "m4 6 1.5 1.5L8 5" }, { d: "M11 6h9" }, { d: "m4 12 1.5 1.5L8 11" }, { d: "M11 12h9" }, { d: "m4 18 1.5 1.5L8 17" }, { d: "M11 18h9" }]);
export const LockKeyhole = makeIcon([{ d: "M7 10V7a5 5 0 0 1 10 0v3" }, { d: "M5 10h14v11H5V10Z" }, { d: "M12 15v2" }]);
export const LogOut = makeIcon([{ d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" }, { d: "M16 17l5-5-5-5" }, { d: "M21 12H9" }]);
export const Menu = makeIcon([{ d: "M4 6h16" }, { d: "M4 12h16" }, { d: "M4 18h16" }]);
export const Plus = makeIcon([{ d: "M12 5v14" }, { d: "M5 12h14" }]);
export const Rocket = makeIcon([{ d: "M5 19c1-4 3-8 7-12 3-3 6-4 9-4 0 3-1 6-4 9-4 4-8 6-12 7Z" }, { d: "M9 15l-2 2" }, { d: "M14 6l4 4" }]);
export const Search = makeIcon([{ cx: 11, cy: 11, r: 7 }, { d: "m16 16 5 5" }]);
export const Send = makeIcon([{ d: "M22 2 11 13" }, { d: "m22 2-7 20-4-9-9-4 20-7Z" }]);
export const ShieldAlert = makeIcon([{ d: "M12 2 4 5v6c0 5 3 9 8 11 5-2 8-6 8-11V5l-8-3Z" }, { d: "M12 8v5" }, { d: "M12 16h.01" }]);
export const ShieldCheck = makeIcon([{ d: "M12 2 4 5v6c0 5 3 9 8 11 5-2 8-6 8-11V5l-8-3Z" }, { d: "m8.5 12 2 2 5-5" }]);
export const Target = makeIcon([{ cx: 12, cy: 12, r: 9 }, { cx: 12, cy: 12, r: 5 }, { cx: 12, cy: 12, r: 1 }]);
export const Trophy = makeIcon([{ d: "M8 4h8v5a4 4 0 0 1-8 0V4Z" }, { d: "M6 6H3v2a4 4 0 0 0 5 4" }, { d: "M18 6h3v2a4 4 0 0 1-5 4" }, { d: "M12 13v5" }, { d: "M8 22h8" }]);
export const Upload = makeIcon([{ d: "M12 3v12" }, { d: "m7 8 5-5 5 5" }, { d: "M5 21h14" }]);
export const UploadCloud = makeIcon([{ d: "M16 16 12 12 8 16" }, { d: "M12 12v9" }, { d: "M20 16a5 5 0 0 0-4-8 7 7 0 0 0-13 3 4 4 0 0 0 1 8h3" }]);
export const Users = makeIcon([{ cx: 9, cy: 8, r: 4 }, { d: "M2 21a7 7 0 0 1 14 0" }, { d: "M17 11a3 3 0 1 0-1-5" }, { d: "M22 21a5 5 0 0 0-5-5" }]);
export const X = makeIcon([{ d: "M18 6 6 18" }, { d: "m6 6 12 12" }]);
export const Zap = makeIcon([{ d: "M13 2 4 14h7l-1 8 10-13h-7l0-7Z" }]);
