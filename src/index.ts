import { argv } from "node:process";
import { DNS } from "./dns";
import { Web } from "./web/web";
import { ClientCleanupWorker } from "./client/workers/client-cleanup.worker";
import { ClientRepository } from "./client/client.repository";
import { readConsoleArgument } from "./utils/console";

DNS.start(readConsoleArgument("dns-port", 53));
Web.start(readConsoleArgument("web-port", 80));

const clientRepository = ClientRepository.getInstance();
const clientCleanupWorker = new ClientCleanupWorker(clientRepository);
clientCleanupWorker.start();
