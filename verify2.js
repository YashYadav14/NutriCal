const http = require('http');

async function getTokensAndDump() {
  const fetchJson = (url, options = {}) => {
    return new Promise((resolve, reject) => {
      const { URL } = require('url');
      const targetUrl = new URL(url);
      const reqOptions = {
        hostname: targetUrl.hostname,
        port: targetUrl.port,
        path: targetUrl.pathname,
        method: options.method || 'GET',
        headers: options.headers || {}
      };

      const req = http.request(reqOptions, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data));
      });
      req.on('error', reject);
      if (options.body) req.write(options.body);
      req.end();
    });
  };

  try {
    const ts = Date.now();
    await fetchJson('http://localhost:8080/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: `user${ts}`, email: `user${ts}@example.com`, password: 'password', name: 'User' })
    });

    const loginStr = await fetchJson('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: `user${ts}`, password: 'password' })
    });
    
    const token = JSON.parse(loginStr).token;
    const authHeaders = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

    console.log("===ACTUAL DIET API RESPONSE===");
    const dietRaw = await fetchJson('http://localhost:8080/api/ai/diet', {
      method: 'POST', headers: authHeaders, body: JSON.stringify({ age: 25, weight: 70, height: 175, goal: "muscle gain", activityLevel: "moderate", preferences: "veg" })
    });
    console.log(dietRaw);
    try {
      console.log("FULL ERROR LOG:", JSON.parse(dietRaw).error);
    } catch(e) {}
    
    console.log("===ACTUAL HISTORY RESPONSE===");
    const histRaw = await fetchJson('http://localhost:8080/api/ai/diet/history', { method: 'GET', headers: authHeaders });
    console.log(histRaw);

  } catch (e) {
    console.error(e);
  }
}

getTokensAndDump();
