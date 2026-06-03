declare module "swagger-ui-express" {
  import { RequestHandler } from "express";

  const swaggerUi: {
    serve: RequestHandler[];
    setup(document: unknown): RequestHandler;
  };

  export default swaggerUi;
}
