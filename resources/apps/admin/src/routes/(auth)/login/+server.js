import { json } from '@sveltejs/kit';
import api from '$lib/api.js';

export const POST = async ({ request, cookies }) => {
    try {
        const body = await request.json();
        console.log("🟡 Sending login request with:", body);

        const response = await api.post('/auth/login', body);
        const data = response.data;

        console.log("🟢 Laravel API Response:", data);

        if (!data.success) {
            console.log("🔴 Login failed:", data);
            return json({ success: false, message: "Invalid login credentials" }, 401);
        }

        cookies.set('token', data.access_token, {
            path: '/',
            httpOnly: true,
            secure: false, // 🔴 Set to false for local development!
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7 // 7 days
        });

        console.log("✅ Token stored in cookies:", data.access_token); // Debugging log

        return json({ success: true, user: data.user });
    } catch (error) {
        console.log("🔴 Server Error in +server.js:", error);
        return json({ success: false, message: "Server error" }, 500);
    }
};
