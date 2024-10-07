export const prepareEmailBody = (
  email: string,
  variables: Record<string, string>,
) => {
  let newEmail = email;
  for (const [key, value] of Object.entries(variables)) {
    newEmail = newEmail.replace(new RegExp(`\`${key}\``, "g"), value);
  }
  newEmail = newEmail.replace(/\n/g, "<br />");
  return newEmail;
};
