console.log("Nutrition Tools frontend loaded.");

// ✅ Universal POST request helper
async function postData(url, data) {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      console.error("Request failed:", res.status, res.statusText);
      return null;
    }

    return await res.json();
  } catch (err) {
    console.error("Error in postData:", err);
    return null;
  }
}

// ✅ Universal GET request helper
async function getData(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error("GET failed:", res.status, res.statusText);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error("Error in getData:", err);
    return null;
  }
}
