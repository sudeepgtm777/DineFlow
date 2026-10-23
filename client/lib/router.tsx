"use client";

import Link from "next/link";
import {
  useParams as useNextParams,
  usePathname,
  useRouter,
  useSearchParams as useNextSearchParams,
} from "next/navigation";
import { useMemo } from "react";
import type React from "react";

type NavigateOptions = { replace?: boolean };

export const useNavigate = () => {
  const router = useRouter();

  return (to: string | number, options?: NavigateOptions) => {
    if (typeof to === "number") {
      if (to < 0) {
        router.back();
      }
      return;
    }

    if (options?.replace) {
      router.replace(to);
      return;
    }

    router.push(to);
  };
};

export const useParams = useNextParams;

export const useSearchParams = () => {
  const router = useRouter();
  const pathname = usePathname();
  const params = useNextSearchParams();

  const setSearchParams = (nextParams: URLSearchParams | string | Record<string, string>) => {
    const query =
      typeof nextParams === "string"
        ? nextParams
        : nextParams instanceof URLSearchParams
          ? nextParams.toString()
          : new URLSearchParams(nextParams).toString();
    const safePath = pathname ?? "/";
    router.push(query ? `${safePath}?${query}` : safePath);
  };

  return [params, setSearchParams] as const;
};

type LinkProps = Omit<React.ComponentProps<typeof Link>, "href"> & {
  to?: string;
  href?: React.ComponentProps<typeof Link>["href"];
};

export const RouterLink = ({ to, href, ...props }: LinkProps) => (
  <Link href={to ?? href ?? "#"} {...props} />
);

type NavLinkProps = Omit<LinkProps, "className"> & {
  className?: string | ((args: { isActive: boolean }) => string);
};

export const NavLink = ({ className, to, href, ...props }: NavLinkProps) => {
  const pathname = usePathname();
  const safePath = pathname ?? "/";
  const target = (to ?? href ?? "#") as string;
  const isActive = useMemo(
    () => safePath === target || safePath.startsWith(`${target}/`),
    [safePath, target]
  );
  const computedClassName =
    typeof className === "function" ? className({ isActive }) : className;

  return <Link href={target} className={computedClassName} {...props} />;
};

export const Outlet = () => null;

export { RouterLink as Link };
