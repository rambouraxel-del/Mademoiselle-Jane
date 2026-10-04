import type { SVGProps } from "react";

/** Pictogrammes au trait fin, dessinés pour rappeler ceux des maquettes. */
type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 24, children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export const SearchIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="m15.5 15.5 5 5" />
  </Svg>
);

export const UserIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4.5 20.5c.8-4 3.8-6 7.5-6s6.7 2 7.5 6" />
  </Svg>
);

export const BagIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 8h14l-1 12.5H6L5 8Z" />
    <path d="M9 10V6.5a3 3 0 0 1 6 0V10" />
  </Svg>
);

export const ArrowRightIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 12h15" />
    <path d="m14 7 5 5-5 5" />
  </Svg>
);

export const ChevronDownIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="m6 9 6 6 6-6" />
  </Svg>
);

export const ChevronRightIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="m9 6 6 6-6 6" />
  </Svg>
);

export const ChevronLeftIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="m15 6-6 6 6 6" />
  </Svg>
);

export const MinusIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 12h14" />
  </Svg>
);

export const PlusIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
);

export const CloseIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="m6 6 12 12M18 6 6 18" />
  </Svg>
);

export const MenuIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Svg>
);

export const CheckIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </Svg>
);

export const MailIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="5.5" width="18" height="13" rx="1.5" />
    <path d="m3.5 6.5 8.5 6.5 8.5-6.5" />
  </Svg>
);

export const TrashIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
  </Svg>
);

export const HeartIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20Z" />
  </Svg>
);

export const HeartFilledIcon = ({ size = 16, ...p }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...p}>
    <path
      fill="currentColor"
      d="M12 20.5s-8-4.9-8-10.9A4.6 4.6 0 0 1 12 6.9a4.6 4.6 0 0 1 8 2.7c0 6-8 10.9-8 10.9Z"
    />
  </svg>
);

export const PencilIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="m15.5 4.5 4 4L8.5 19.5 4 20l.5-4.5 11-11Z" />
    <path d="m13.5 6.5 4 4" />
  </Svg>
);

export const RingsIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="9" cy="12.5" r="5.5" />
    <circle cx="15" cy="12.5" r="5.5" />
  </Svg>
);

export const HandsHeartIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 9.8S8.8 7.8 8.8 5.6A1.8 1.8 0 0 1 12 4.6a1.8 1.8 0 0 1 3.2 1C15.2 7.8 12 9.8 12 9.8Z" />
    <path d="M3 9.5c.8 2.5 2 4.7 3.6 6.4 1.2 1.3 2.6 2.4 4.1 3.3" />
    <path d="M5.2 8.6c.6 2 1.7 3.8 3 5.2.9 1 2 1.8 3.1 2.4" />
    <path d="M21 9.5c-.8 2.5-2 4.7-3.6 6.4-1.2 1.3-2.6 2.4-4.1 3.3" />
    <path d="M18.8 8.6c-.6 2-1.7 3.8-3 5.2-.9 1-2 1.8-3.1 2.4" />
  </Svg>
);

export const PawIcon = (p: IconProps) => (
  <Svg {...p}>
    <ellipse cx="7.3" cy="9.3" rx="1.7" ry="2.3" />
    <ellipse cx="10.6" cy="6.3" rx="1.7" ry="2.4" />
    <ellipse cx="14.2" cy="6.3" rx="1.7" ry="2.4" />
    <ellipse cx="17.3" cy="9.4" rx="1.7" ry="2.3" />
    <path d="M12.3 11.5c-2.6 0-5 3.4-5 5.6 0 1.7 1.3 2.4 2.6 2.4 1.1 0 1.6-.6 2.4-.6s1.3.6 2.4.6c1.3 0 2.6-.7 2.6-2.4 0-2.2-2.4-5.6-5-5.6Z" />
  </Svg>
);

export const SparkleIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3.5 13.8 10l6.7 2-6.7 2L12 20.5 10.2 14 3.5 12l6.7-2L12 3.5Z" />
  </Svg>
);

export const GiftIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="4" y="9" width="16" height="11" rx="1" />
    <path d="M3 9h18M12 9v11M12 9S10.5 4 8 4.5 7.5 9 12 9ZM12 9s1.5-5 4-4.5S16.5 9 12 9Z" />
  </Svg>
);

export const LeafIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14Z" />
    <path d="M5 19 13 11" />
  </Svg>
);

export const InstagramIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" />
  </Svg>
);

export const PinterestIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.75" />
    <path d="M11 9.6c.4-1.6 3.6-1.9 4.2.2.5 1.9-.8 4.2-2.6 4.2-1 0-1.6-.7-1.4-1.6M11.3 11.3 9.4 19.5" />
  </Svg>
);

export const FacebookIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M14.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.3H9v3h2.5V21" />
  </Svg>
);

export const ICON_COMPONENTS = {
  heart: HeartIcon,
  pencil: PencilIcon,
  rings: RingsIcon,
  hands: HandsHeartIcon,
  paw: PawIcon,
  sparkle: SparkleIcon,
  gift: GiftIcon,
  leaf: LeafIcon,
} as const;

export function NamedIcon({ name, ...props }: IconProps & { name: string }) {
  const Component = ICON_COMPONENTS[name as keyof typeof ICON_COMPONENTS] ?? HeartIcon;
  return <Component {...props} />;
}
