import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { locales } from '@/lib/i18n';
import { decrypt } from '@/modules/blog/lib/auth';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Protect admin routes
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const sessionCookie = request.cookies.get('blog_session')?.value;

    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    try {
      const session = await decrypt(sessionCookie);
      if (!session || !session.id) {
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }
    } catch (error) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // Skip middleware for language switching route
  if (pathname.startsWith('/ln/')) {
    return NextResponse.next();
  }

  // Check if the pathname starts with a locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    // Extract locale from pathname
    const locale = pathname.split('/')[1];

    // Get the path without locale
    const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/';

    // Create a response that rewrites to the path without locale
    const response = NextResponse.rewrite(new URL(pathWithoutLocale, request.url));

    // Set locale in a cookie for the application to use
    response.cookies.set('NEXT_LOCALE', locale, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });

    // Also set it in a header that can be read by server components
    response.headers.set('x-locale', locale);

    return response;
  }

  // Handle old query param URLs and redirect to SEO-friendly URLs
  const { searchParams } = request.nextUrl;

  // Redirect /providers?category=X to /providers/x
  if (pathname === '/providers' && searchParams.has('category')) {
    const category = searchParams.get('category');
    if (category) {
      const seoCategory = category.toLowerCase().replace(/\s+/g, '-');
      return NextResponse.redirect(new URL(`/providers/${seoCategory}`, request.url));
    }
  }

  // Redirect /games?provider_name=X&category=Y to /games/x/y
  // Redirect /games?provider_name=X to /games/x
  if (pathname === '/games' && searchParams.has('provider_name')) {
    const provider = searchParams.get('provider_name');
    const category = searchParams.get('category');

    if (provider) {
      const seoProvider = provider.toLowerCase().replace(/\s+/g, '-').replace(/\+/g, '-');
      if (category) {
        const seoCategory = category.toLowerCase().replace(/\s+/g, '-');
        return NextResponse.redirect(new URL(`/games/${seoProvider}/${seoCategory}`, request.url));
      } else {
        return NextResponse.redirect(new URL(`/games/${seoProvider}`, request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|assets|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
