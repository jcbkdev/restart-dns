import { argv } from "node:process";
import { DNS } from "./dns";

let port: number = Number(argv[2]) || 53;

DNS.start(port);
