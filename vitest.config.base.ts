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
      MAILGUN_API_KEY: "fake_mailgun_api_key",
      MAILGUN_DOMAIN: "fake_mailgun_domain",
      MAILGUN_SENDER_EMAIL:
        "Fake Sender <fake_mailgun_sender_email@example.com>",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
