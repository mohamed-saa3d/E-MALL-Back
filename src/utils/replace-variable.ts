function replaceVar(template: string, key: string, value: string) {
  const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
  return template.replace(regex, value);
}

export default replaceVar;