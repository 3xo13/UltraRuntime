import { NextRequest, NextResponse } from "next/server";

const supportedLanguages = ["en", "ar"] as const;
const defaultLanguage = "en";

type SupportedLanguage = (typeof supportedLanguages)[number];

function isSupportedLanguage(language: string): language is SupportedLanguage {
  return supportedLanguages.includes(language as SupportedLanguage);
}

function detectLanguage(request: NextRequest): SupportedLanguage {
  const acceptLanguage = request.headers.get("accept-language");

  if (!acceptLanguage) {
    return defaultLanguage;
  }

  const preferredLanguages = acceptLanguage
    .split(",")
    .map((entry) => {
      const [tag, qualityValue] = entry.trim().split(";q=");
      return {
        language: tag.toLowerCase().split("-")[0],
        quality: qualityValue ? Number.parseFloat(qualityValue) : 1,
      };
    })
    .filter(({ quality }) => Number.isFinite(quality))
    .sort((a, b) => b.quality - a.quality);

  for (const preference of preferredLanguages) {
    if (isSupportedLanguage(preference.language)) {
      return preference.language;
    }
  }

  return defaultLanguage;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const pathnameHasLanguage = supportedLanguages.some(
    (language) => pathname === `/${language}` || pathname.startsWith(`/${language}/`),
  );

  if (pathnameHasLanguage) {
    return NextResponse.next();
  }

  const language = detectLanguage(request);
  const destination = request.nextUrl.clone();
  destination.pathname = `/${language}${pathname}`;

  return NextResponse.redirect(destination);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon|.*\\..*).*)"],
};
