import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const HOP_BY_HOP = [
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "host",
  "content-length",
];

const backendUrl = () => {
  const raw =
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    "http://localhost:4000";
  return raw.replace(/\/$/, "").replace(/\/api\/v1$/i, "");
};

const applyUpstreamCookies = (response: NextResponse, cookies: string[]) => {
  const secure = process.env.NODE_ENV === "production";

  cookies.forEach((cookie) => {
    const parts = cookie.split(";").map((part) => part.trim());
    const [nameValue] = parts;
    const separator = nameValue.indexOf("=");
    if (separator < 1) return;

    const name = nameValue.slice(0, separator);
    const value = nameValue.slice(separator + 1);
    const attrs = Object.fromEntries(
      parts.slice(1).map((part) => {
        const eq = part.indexOf("=");
        if (eq === -1) return [part.toLowerCase(), true];
        return [part.slice(0, eq).trim().toLowerCase(), part.slice(eq + 1)];
      }),
    );

    const rawMaxAge = Number(attrs["max-age"]);
    const maxAge = Number.isFinite(rawMaxAge)
      ? rawMaxAge > 60 * 60 * 24 * 365
        ? Math.floor(rawMaxAge / 1000)
        : rawMaxAge
      : 60 * 60 * 24;

    if (!value || maxAge <= 0) {
      response.cookies.set(name, "", {
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        secure,
        maxAge: 0,
      });
      return;
    }

    response.cookies.set(name, value, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure,
      maxAge,
    });
  });
};

const proxy = async (
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) => {
  const { path } = await context.params;
  const target = `${backendUrl()}/api/v1/${path.join("/")}${req.nextUrl.search}`;

  const headers = new Headers();
  req.headers.forEach((value, key) => {
    if (!HOP_BY_HOP.includes(key.toLowerCase())) {
      headers.set(key, value);
    }
  });

  const init: RequestInit = {
    method: req.method,
    headers,
    redirect: "manual",
  };

  if (!["GET", "HEAD"].includes(req.method)) {
    init.body = req.body;
    (init as RequestInit & { duplex: "half" }).duplex = "half";
  }

  let upstream: Response;
  try {
    upstream = await fetch(target, init);
  } catch (error) {
    console.error("API proxy failed:", error);
    return NextResponse.json(
      { message: "Backend unavailable", success: false },
      { status: 502 },
    );
  }

  const responseHeaders = new Headers(upstream.headers);
  ["content-encoding", "content-length", "transfer-encoding", "connection"].forEach(
    (header) => responseHeaders.delete(header),
  );
  responseHeaders.delete("set-cookie");

  const response = new NextResponse(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });

  const cookies =
    typeof upstream.headers.getSetCookie === "function"
      ? upstream.headers.getSetCookie()
      : [];
  applyUpstreamCookies(response, cookies);

  return response;
};

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const OPTIONS = proxy;
export const HEAD = proxy;
