import { argv } from "node:process";
import { DNS } from "./dns";
import { Web } from "./web/web";
import { ClientCleanupWorker } from "./client/workers/client-cleanup.worker";
import { ClientRepository } from "./client/client.repository";

let port: number = Number(argv[2]) || 53;

DNS.start(port);
Web.start(8081);

const clientRepository = ClientRepository.getInstance();
const clientCleanupWorker = new ClientCleanupWorker(clientRepository);
clientCleanupWorker.start();
