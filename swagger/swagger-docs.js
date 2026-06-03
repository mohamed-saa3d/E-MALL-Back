"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = swaggerDocs;
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const fs_1 = require("fs");
const swaggerDocument = JSON.parse((0, fs_1.readFileSync)(`${__dirname}/output.json`, "utf-8"));
function swaggerDocs(app) {
    app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocument));
    console.log(`Swagger docs available at http://localhost:4000/api-docs`);
}
