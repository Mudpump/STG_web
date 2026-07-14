// Vercel Serverless Function: Nemotron(NVIDIA) 프록시
// 브라우저에서 NVIDIA 엔드포인트를 직접 호출하면 CORS로 차단되므로,
// 같은 도메인의 이 함수를 거쳐 서버-사이드에서 NVIDIA로 요청을 전달한다.
// 클라이언트는 Authorization 헤더(사용자가 입력한 nvapi 키)와 NVIDIA 요청 바디를 그대로 보낸다.

const NVIDIA_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method Not Allowed' });
        return;
    }

    const auth = req.headers['authorization'];
    if (!auth) {
        res.status(401).json({ error: 'Missing Authorization header' });
        return;
    }

    try {
        const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});

        const upstream = await fetch(NVIDIA_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: auth,
            },
            body,
        });

        const text = await upstream.text();
        res.status(upstream.status);
        res.setHeader('Content-Type', 'application/json');
        res.send(text);
    } catch (e: any) {
        res.status(502).json({ error: `Proxy error: ${e?.message || 'unknown'}` });
    }
}
