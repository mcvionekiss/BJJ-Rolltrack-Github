// @ts-nocheck
import { redirect } from '@sveltejs/kit';

const PUBLIC_PAGES = ['/login', '/reset', '/forgot', '/activate', '/register', '/resend'];

const isPublicPage = (pathname) => {
	for (let i = 0; i < PUBLIC_PAGES.length; i++) {
		if (pathname.startsWith(PUBLIC_PAGES[i])) return true;
	}
	return false;
};

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
    console.log("🔵 All Cookies in hooks.server.js:", event.cookies.getAll());
    const token = event.cookies.get('token');

    console.log("🔵 Checking auth token in hooks.server.js:", token);

    if (!token && event.url.pathname !== '/login') {
        console.log("🔴 No token found, redirecting to login.");
        throw redirect(302, '/login');
    }

    return await resolve(event);
}
