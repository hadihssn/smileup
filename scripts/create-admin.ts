// One-off provisioning script for the single dentist/admin account. There's
// no public sign-up page by design — this is the only way to create an
// account, run manually and only once (or again later if credentials need
// resetting). Requires ADMIN_EMAIL and ADMIN_PASSWORD in the environment;
// never hardcode credentials here.
//
// Usage: ADMIN_EMAIL=... ADMIN_PASSWORD=... npm run auth:create-admin

import { auth } from "../src/lib/auth/server";

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME ?? "Clinic Admin";

  if (!email || !password) {
    console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD before running this script.");
    process.exitCode = 1;
    return;
  }

  const { error } = await auth.signUp.email({ email, name, password });
  if (error) {
    console.error("Failed to create admin account:", error.message);
    process.exitCode = 1;
    return;
  }

  console.log(`Admin account created for ${email}.`);
}

main();
