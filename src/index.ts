import { argv } from "node:process";
import { DNS } from "./dns";
import { Web } from "./web/web";

let port: number = Number(argv[2]) || 53;

DNS.start(port);
Web.start(8081);
