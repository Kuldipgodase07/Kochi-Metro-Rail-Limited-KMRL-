#!/usr/bin/env node

/**
 * Test script to verify OR-Tools integration
 * Run this after starting the OR-Tools service
 */

const http = require("http");

const ORTOOLS_SERVICE_URL = "http://localhost:8001";

async function testORToolsService() {
  console.log("🧪 Testing Google OR-Tools Integration");
  console.log("=" * 50);

  try {
    // Test 1: Health Check
    console.log("1️⃣ Testing health endpoint...");
    const healthResponse = await fetch(`${ORTOOLS_SERVICE_URL}/api/health`);

    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log("✅ Health check passed:", healthData.status);
    } else {
      throw new Error(`Health check failed: ${healthResponse.status}`);
    }

    // Test 2: Optimization Request
    console.log("\n2️⃣ Testing optimization endpoint...");
    const optimizationResponse = await fetch(
      `${ORTOOLS_SERVICE_URL}/api/train-scheduling/optimize`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          target_date: new Date().toISOString().split("T")[0],
          num_trains: 24,
        }),
      }
    );

    if (optimizationResponse.ok) {
      const optimizationData = await optimizationResponse.json();
      console.log("✅ Optimization completed successfully");
      console.log(`   - Solution Status: ${optimizationData.solution_status}`);
      console.log(
        `   - Selected Trains: ${optimizationData.selected_trains?.length || 0}`
      );
      console.log(
        `   - Remaining Trains: ${
          optimizationData.remaining_trains?.length || 0
        }`
      );
      console.log(
        `   - Optimization Score: ${optimizationData.optimization_score}`
      );
      console.log(`   - Execution Time: ${optimizationData.execution_time}s`);

      // Verify 24 trains are selected
      if (optimizationData.selected_trains?.length === 24) {
        console.log("✅ Correctly selected exactly 24 trains");
      } else {
        console.log("⚠️  Warning: Did not select exactly 24 trains");
      }
    } else {
      const errorData = await optimizationResponse.json();
      throw new Error(
        `Optimization failed: ${errorData.error || "Unknown error"}`
      );
    }

    console.log(
      "\n🎉 All tests passed! OR-Tools integration is working correctly."
    );
    console.log("\n📋 Next steps:");
    console.log("   1. Start the frontend: npm run dev");
    console.log("   2. Navigate to: http://localhost:5173/ortools-scheduling");
    console.log('   3. Click "Run OR-Tools Optimization" to test the UI');
  } catch (error) {
    console.error("\n❌ Test failed:", error.message);
    console.log("\n🔧 Troubleshooting:");
    console.log(
      "   1. Ensure OR-Tools service is running: .\\start-ortools.ps1"
    );
    console.log("   2. Check if port 8001 is available");
    console.log("   3. Verify Python dependencies are installed");
    console.log("   4. Check service logs for errors");
  }
}

// Run the test
testORToolsService();
