import "dotenv/config";
import { glmText, glmJSON } from "../lib/glm";

console.log("========================================");
console.log("   GLM connection test");
console.log("========================================\n");

async function testGLMText() {
  console.log("1️⃣ Testing text mode...");
  try {
    const response = await glmText(
      "You are a friendly assistant",
      "Say a short greeting"
    );
    console.log("✅ Text mode succeeded:");
    console.log(`   ${response}\n`);
  } catch (error) {
    console.error("❌ Text mode failed:");
    console.error(`   ${error}\n`);
  }
}

async function testGLMJSON() {
  console.log("2️⃣ Testing JSON mode...");
  try {
    const response = await glmJSON(
      "Return a JSON object containing name and greeting",
      "Generate a greeting"
    ) as { name?: string; greeting?: string };
    console.log("✅ JSON mode succeeded:");
    console.log(`   ${JSON.stringify(response, null, 2)}\n`);
  } catch (error) {
    console.error("❌ JSON mode failed:");
    console.error(`   ${error}\n`);
  }
}

async function main() {
  console.log(`Environment variables:`);
  console.log(`  GLM_BASE_URL: ${process.env.GLM_BASE_URL}`);
  console.log(`  GLM_MODEL: ${process.env.GLM_MODEL}`);
  console.log(`  GLM_OFFLINE: ${process.env.GLM_OFFLINE}\n`);

  if (process.env.GLM_OFFLINE === "true") {
    console.log("⚠️  GLM_OFFLINE=true, skipping test\n");
    return;
  }

  await testGLMText();
  await testGLMJSON();

  console.log("========================================");
  console.log("   Test complete");
  console.log("========================================");
}

main();
