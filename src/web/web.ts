import express, { type Express, type Request, type Response } from "express";
import path from "node:path";
import { fileURLToPath } from "url";
import domainRouter from "../domain/domain.routes";

const server: Express = express();
server.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

server.use("/static", express.static(path.join(__dirname, "static")));

server.use("/domain", domainRouter);

server.get("/", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

export const Web = {
  start: async (port: number = 80) => {
    try {
      server.listen({
        port,
      });
      console.log("Web server listening on port: ", port);
    } catch (err) {
      console.error("Failed to start the web server:", err);
      throw err;
    }
  },
};
