#!/usr/bin/env node
/**
 * Test script to verify frontend API calls
 * This simulates the exact requests the frontend makes
 */

import http from "http";

const API_BASE = "http://localhost:5000/api/data";

// Test function to make API calls like the frontend
async function testFrontendAPI() {
  console.log("🧪 Testing Frontend API Calls...");
  console.log("================================");

  // Test 1: Trainsets endpoint
  console.log("\n1. Testing /api/data/trainsets...");
  try {
    const trainsetsResponse = await makeRequest("/trainsets");
    console.log("✅ Trainsets endpoint working");
    console.log(`   Status: ${trainsetsResponse.status}`);
    console.log(
      `   Content-Type: ${trainsetsResponse.headers["content-type"]}`
    );
    console.log(`   Data length: ${trainsetsResponse.data.length} items`);
  } catch (error) {
    console.log("❌ Trainsets endpoint failed:", error.message);
  }

  // Test 2: Metrics endpoint
  console.log("\n2. Testing /api/data/metrics...");
  try {
    const metricsResponse = await makeRequest("/metrics");
    console.log("✅ Metrics endpoint working");
    console.log(`   Status: ${metricsResponse.status}`);
    console.log(`   Content-Type: ${metricsResponse.headers["content-type"]}`);
    console.log(
      `   Data keys: ${Object.keys(metricsResponse.data).join(", ")}`
    );
  } catch (error) {
    console.log("❌ Metrics endpoint failed:", error.message);
  }

  // Test 3: Health endpoint
  console.log("\n3. Testing /health...");
  try {
    const healthResponse = await makeRequest("http://localhost:5000/health");
    console.log("✅ Health endpoint working");
    console.log(`   Status: ${healthResponse.status}`);
    console.log(`   Service: ${healthResponse.data.message}`);
  } catch (error) {
    console.log("❌ Health endpoint failed:", error.message);
  }

  console.log("\n🎉 Frontend API test completed!");
}

// Helper function to make HTTP requests
function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
    const urlObj = new URL(url);

    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    };

    const req = http.request(options, (res) => {
      let body = "";

      res.on("data", (chunk) => {
        body += chunk;
      });

      res.on("end", () => {
        try {
          const data = JSON.parse(body);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data,
          });
        } catch (error) {
          reject(
            new Error(
              `Failed to parse JSON: ${error.message}. Body: ${body.substring(
                0,
                100
              )}...`
            )
          );
        }
      });
    });

    req.on("error", (error) => {
      reject(new Error(`Request failed: ${error.message}`));
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error("Request timeout"));
    });

    req.end();
  });
}

// Run the test
testFrontendAPI().catch(console.error);
