
const AUTH_CONFIG = {
    authorization_endpoint: 'https://pnb-auth-stage.isupay.in/application/o/authorize/',
    token_endpoint: 'https://pnb-auth-stage.isupay.in/application/o/token/',
    userinfo_endpoint: 'https://pnb-auth-stage.isupay.in/application/o/userinfo/',
    client_id: 'SaDG8kozoNOUC07Uv46et8',
    redirect_uri: 'http://localhost:3000/redirected',
    scope: 'path openid profile email offline_access authorities privileges user_name created adminName bankCode goauthentik.io/api',
    response_type: 'code',
};

const generateRandom = (length) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

const sha256 = async (plain) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    return await window.crypto.subtle.digest('SHA-256', data);
};

const base64urlencode = (arrayBuffer) => {
    return btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
};

export const login = async () => {
    try {
        const state = generateRandom(32);
        const codeVerifier = generateRandom(64);
        const hashed = await sha256(codeVerifier);
        const codeChallenge = base64urlencode(hashed);

        // Save for the callback step
        sessionStorage.setItem('oauth_state', state);
        sessionStorage.setItem('code_verifier', codeVerifier);

        const params = new URLSearchParams({
            response_type: AUTH_CONFIG.response_type,
            client_id: AUTH_CONFIG.client_id,
            redirect_uri: AUTH_CONFIG.redirect_uri,
            scope: AUTH_CONFIG.scope,
            state: state,
            code_challenge: codeChallenge,
            code_challenge_method: 'S256',
        });

        // Redirect user to PNB Auth Server
        window.location.href = `${AUTH_CONFIG.authorization_endpoint}?${params.toString()}`;
    } catch (err) {
        console.error('Login error:', err);
    }
};

export const handleCallback = async () => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');
    const savedState = sessionStorage.getItem('oauth_state');
    const codeVerifier = sessionStorage.getItem('code_verifier');

    if (!code) throw new Error('No code in callback');
    if (state !== savedState) throw new Error('State mismatch security error');

    const response = await fetch(AUTH_CONFIG.token_endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: AUTH_CONFIG.client_id,
            redirect_uri: AUTH_CONFIG.redirect_uri,
            code: code,
            code_verifier: codeVerifier,
        }),
    });

    const tokens = await response.json();
    if (tokens.error) throw new Error(tokens.error_description || tokens.error);

    // Store tokens and User info in Session Storage
    sessionStorage.setItem('access_token', tokens.access_token);
    sessionStorage.setItem('id_token', tokens.id_token);

    const payload = tokens.id_token.split('.')[1];
    const user = JSON.parse(atob(payload));
    sessionStorage.setItem('user', JSON.stringify(user));

    return user;
};


export const getUser = () => {
    const user = sessionStorage.getItem('user');
    return user ? JSON.parse(user) : null;
};


export const logout = () => {
    sessionStorage.clear();
    window.location.href = 'https://pnb-auth-stage.isupay.in/application/o/pnb/end-session/';
};