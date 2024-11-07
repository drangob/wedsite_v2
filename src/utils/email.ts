import { CreateBatchResponse, Resend } from "resend";

export const substituteEmailVariables = (
  email: string,
  variables: Record<string, string>,
): string => {
  let newEmail = email;
  for (const [key, value] of Object.entries(variables)) {
    newEmail = newEmail.replace(new RegExp(`\`${key}\``, "g"), value);
  }
  return newEmail;
};

export const prepareEmailBody = (
  email: string,
  variables: Record<string, string>,
) => {
  let newEmail = substituteEmailVariables(email, variables);

  newEmail = newEmail.replace(/\n/g, "<br />");

  // wrap the email in <html> and <body> tags to ensure it's rendered correctly
  newEmail = `<html><body>${newEmail}</body></html>`;
  return newEmail;
};

function sleep(rateLimitDelay: number) {
  return new Promise((resolve) => setTimeout(resolve, rateLimitDelay));
}

export const bulkResendInBatches = async (
  resend: Resend,
  emails: {
    from: string;
    to: string;
    subject: string;
    html: string;
    text: string;
  }[],
) => {
  const batchSize = 100;
  const rateLimitDelay = 500; // 2 requests per second = 500ms between requests

  const batches = [];
  for (let i = 0; i < emails.length; i += batchSize) {
    batches.push(emails.slice(i, i + batchSize));
  }

  const results: CreateBatchResponse[] = [];
  for (const batch of batches) {
    const batchResult = await resend.batch.send(batch);
    results.push(batchResult);

    // Respect rate limit
    await sleep(rateLimitDelay);
  }

  return results;
};
