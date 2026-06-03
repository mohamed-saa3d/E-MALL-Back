import { Express } from "express";
import swaggerUi from "swagger-ui-express";
import { readFileSync } from "fs";

const swaggerDocument =  JSON.parse(readFileSync(`${__dirname}/output.json`, "utf-8"));

export default function swaggerDocs(app: Express): void {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  console.log(`Swagger docs available at http://localhost:4000/api-docs`);
}