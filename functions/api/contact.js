export async function onRequestPost(context) {
    const { request, env } = context;

    // CORS headers
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    };

    let data;
    try {
        data = await request.json();
    } catch (e) {
        return new Response(JSON.stringify({ error: 'Invalid request' }), { status: 400, headers });
    }

    const { name, email, message } = data;

    if (!name || !email || !message) {
        return new Response(JSON.stringify({ error: 'All fields are required.' }), { status: 400, headers });
    }

    if (name.length > 200 || email.length > 200 || message.length > 5000) {
        return new Response(JSON.stringify({ error: 'Input too long.' }), { status: 400, headers });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return new Response(JSON.stringify({ error: 'Invalid email address.' }), { status: 400, headers });
    }

    // Discord webhook notification
    const webhookUrl = env.DISCORD_WEBHOOK_URL;
    if (webhookUrl) {
        try {
            await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    embeds: [{
                        title: 'New Contact — purplesquirrelmedia.io',
                        color: 0x7C3AED,
                        fields: [
                            { name: 'Name', value: name, inline: true },
                            { name: 'Email', value: email, inline: true },
                            { name: 'Message', value: message.slice(0, 1024) }
                        ],
                        timestamp: new Date().toISOString()
                    }]
                })
            });
        } catch (e) {
            console.error('Discord webhook failed:', e);
        }
    }

    // Optional: store in KV if binding exists
    if (env.CONTACT_KV) {
        try {
            await env.CONTACT_KV.put(
                'msg:' + Date.now() + ':' + email.replace(/[^a-z0-9]/gi, ''),
                JSON.stringify({ name, email, message, ts: new Date().toISOString(), ip: request.headers.get('CF-Connecting-IP') }),
                { expirationTtl: 60 * 60 * 24 * 90 }
            );
        } catch (e) {
            console.error('KV write failed:', e);
        }
    }

    return new Response(JSON.stringify({ message: 'Message sent! We\'ll get back to you soon.' }), { status: 200, headers });
}

export async function onRequestOptions() {
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    });
}
