<script>

	import { _ } from 'svelte-i18n';

	import { useToast } from '$lib/toast';

	import axios from 'axios';

	import api from "$lib/api"; // Import API helper

	const toast = useToast();

	let fields = { email: '', password: '' };

	let loading = false;

    const onSubmit = async () => {
        if (loading) return;
        loading = true;

        console.log("🟡 Sending login request with:", fields);

        try {
            const response = await fetch('http://localhost:8000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // Ensures cookies are sent
                body: JSON.stringify(fields)
            });
            console.log("🟢 Fetch request sent. Awaiting response...");
            const data = await response.json();
            console.log("🟢 API Response:", data);

            if (data.success) {
                console.log("✅ Token stored in localStorage:", data.access_token);
                localStorage.setItem("token", data.access_token);

                // Redirect to ADMIN dashboard
                window.location.href = "/";
            } else {
                console.error("🔴 Login failed:", data);
            }
        } catch (error) {
            console.error("🔴 Fetch error:", error);
        } finally {
            loading = false;
        }
    };

</script>

<div class="mb-6">
	<h3 class="h3">{$_('accountlogin')}</h3>
	<p> {$_('ban') }</p>
</div>

<form action="" on:submit|preventDefault={onSubmit}>
	<div class="mb-4">
		<label class="label">
			<span>Email</span>
			<input
				class="input"
				bind:value={fields.email}
				name="email"
				type="email"
				disabled={loading}
				placeholder="john@doe.com"
				required
			/>
		</label>
	</div>

	<div class="mb-6">
		<label class="label">
			<span>{$_('psw')}</span>
			<input
				class="input"
				bind:value={fields.password}
				name="password"
				type="password"
				placeholder=""
				disabled={loading}
				required
			/>
		</label>
	</div>
	<button
		type="submit"
		disabled={loading}
		class="btn variant-filled-primary w-full font-bold text-white">{$_('loin')}</button
	>
	<a href="/forgot" class="block pt-2 text-center">{$_('fp')} </a>
</form>
