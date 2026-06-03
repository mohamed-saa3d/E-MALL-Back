const fs = require("fs");

const filePath = __dirname + "/e-mall.openapi.json";
const jsonData = JSON.parse(fs.readFileSync(filePath, "utf8"));

function removeHeaders(obj) {
  if (typeof obj !== "object" || obj === null) return;
  delete obj.headers;
  for (const key in obj) {
    removeHeaders(obj[key]);
  }
}

removeHeaders(jsonData);

fs.writeFileSync(__dirname + "/output.json", JSON.stringify(jsonData, null, 2));
console.log("Headers removed successfully. Output saved to output.json");
