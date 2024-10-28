import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    setupFiles: ["./setupTests.ts"],
    env: {
      DATABASE_URL: "postgresql://fakeuser:fakepassword@fakeurl/fakedb",
      NEXTAUTH_URL: "http://localhost:3000",
      DISCORD_CLIENT_ID: "fake_discord_client_id",
      DISCORD_CLIENT_SECRET: "fake_discord_client_secret",
      NEXTAUTH_SECRET: "fake_nextauth_secret",
      EMAIL_RESEND_API_KEY: "fake_email_api_key",
      EMAIL_DOMAIN: "fake_email_domain",
      EMAIL_RESEND_SENDER:
        "Fake Sender <fake_EMAIL_RESEND_SENDER_email@example.com>",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
