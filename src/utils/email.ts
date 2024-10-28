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
