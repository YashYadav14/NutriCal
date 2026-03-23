const http = require('http');

async function testApis() {
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
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(data) });
          } catch (e) {
            resolve({ status: res.statusCode, data });
          }
        });
      });
      req.on('error', reject);
      if (options.body) req.write(options.body);
      req.end();
    });
  };

  try {
    const timestamp = Date.now();
    // 1. Register
    const regRes = await fetchJson('http://localhost:8080/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: `verify${timestamp}`, email: `verify${timestamp}@example.com`, password: 'password', name: 'Verify User' })
    });

    // 2. Login
    const loginRes = await fetchJson('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: regRes.data.user ? regRes.data.user.username : `verify${timestamp}`, password: 'password' })
    });
    
    const token = loginRes.data.token;
    const authHeaders = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

    // 3. Diet GENERATION
    console.log("=== ACTUAl DIET API RESPONSE ===");
    const dietRes = await fetchJson('http://localhost:8080/api/ai/diet', {
      method: 'POST', headers: authHeaders, body: JSON.stringify({ age: 25, weight: 70, height: 175, goal: "muscle gain", activityLevel: "moderate", preferences: "veg" })
    });
    console.log(JSON.stringify(dietRes.data, null, 2));
    
    // 4. History
    console.log("\n=== ACTUAL HISTORY RESPONSE ===");
    // First try the mapped path in controller, usually /api/ai/diet/history
    let histRes = await fetchJson('http://localhost:8080/api/ai/diet/history', { method: 'GET', headers: authHeaders });
    if(histRes.status === 404) {
      histRes = await fetchJson('http://localhost:8080/api/ai/history', { method: 'GET', headers: authHeaders });
    }
    console.log(JSON.stringify(histRes.data, null, 2));

  } catch (e) {
    console.error("Test script failed:", e);
  }
}

testApis();
