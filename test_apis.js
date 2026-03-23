const http = require('http');

async function testApis() {
  console.log("Starting API tests...");

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
    console.log("Attempting Registration...");
    const regRes = await fetchJson('http://localhost:8080/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: `test${timestamp}`, email: `test${timestamp}@example.com`, password: 'password', name: 'Test User' })
    });
    console.log("Registration Response:", regRes.status, regRes.data);

    // 2. Login
    console.log("Attempting Login...");
    const loginRes = await fetchJson('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: regRes.data.user ? regRes.data.user.username : `test${timestamp}`, password: 'password' })
    });
    console.log("Login Response:", loginRes.status);
    
    if (loginRes.status !== 200) {
      console.error("Login failed, stopping test.", loginRes.data);
      return;
    }
    
    const token = loginRes.data.token;
    const authHeaders = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

    // 3. BMI
    console.log("Testing BMI Calculation...");
    const bmiRes = await fetchJson('http://localhost:8080/api/bmi/calculate', {
      method: 'POST', headers: authHeaders, body: JSON.stringify({ heightCm: 175, weightKg: 70 })
    });
    console.log("BMI Response:", bmiRes.status);

    // 4. Calories
    console.log("Testing Calories Calculation...");
    const calRes = await fetchJson('http://localhost:8080/api/calories/calculate', {
      method: 'POST', headers: authHeaders, body: JSON.stringify({ age: 28, sex: 'MALE', heightCm: 175, weightKg: 70, activityLevel: 'MODERATE', goal: 'MAINTAIN' })
    });
    console.log("Calories Response:", calRes.status);

    // 5. Diet GENERATION (Takes time)
    console.log("Testing Diet AI Generation...");
    const dietRes = await fetchJson('http://localhost:8080/api/ai/diet', {
      method: 'POST', headers: authHeaders, body: JSON.stringify({ age: 28, gender: 'MALE', height: 175, weight: 70, activityLevel: 'MODERATE', goal: 'MAINTAIN', preferences: 'None' })
    });
    console.log("Diet Status:", dietRes.status);
    if (dietRes.status === 200) {
      console.log("Diet Payload Keys:", Object.keys(dietRes.data));
      if (dietRes.data.weekly_plan || dietRes.data.weeklyPlan) {
        console.log("Weekly Plan exists!");
      } else {
        console.log("Weekly Plan is missing!");
      }
    } else {
      console.log("Diet failed:", dietRes.data);
    }
    
    // 6. History
    console.log("Testing History...");
    const histRes = await fetchJson('http://localhost:8080/api/ai/diet/history', { method: 'GET', headers: authHeaders });
    console.log("History Status:", histRes.status);
    if (histRes.status === 200) {
      console.log("History count:", histRes.data.length);
      if (histRes.data.length > 0) {
        console.log("Latest History Item Keys:", Object.keys(histRes.data[0]));
      }
    }

  } catch (e) {
    console.error("Test script failed:", e);
  }
}

testApis();
