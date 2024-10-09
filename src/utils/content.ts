export const substituteContentHtml = (
  html: string,
  variables: Record<string, string>,
) => {
  let newHtml = html;
  for (const [key, value] of Object.entries(variables)) {
    newHtml = newHtml.replace(new RegExp(`\`${key}\``, "g"), value);
  }
  return newHtml;
};
