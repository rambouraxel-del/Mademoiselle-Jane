import Link, { type LinkProps } from "next/link";
import type { AnchorHTMLAttributes } from "react";
import { buttonStyles, type ButtonSize, type ButtonVariant } from "./buttonStyles";

type ButtonLinkProps = LinkProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    variant?: ButtonVariant;
    size?: ButtonSize;
  };

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonLinkProps) {
  return <Link className={buttonStyles(variant, size, className)} {...props} />;
}
