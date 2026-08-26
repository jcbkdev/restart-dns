import dns2, { Packet } from "dns2";
import { DomainRepository } from "./domain/domain.repository";
import { CONSTANTS } from "./constants";
import { getLocalIp } from "./utils/network";

const upstreamDNS = new dns2({
  nameServers: ["8.8.8.8"],
  port: 53,
  recursive: true,
  timeout: 3000,
});

const server = dns2.createServer({
  udp: true,
});

const domainRepository = DomainRepository.getInstance();

server.on("request", async (request, send, rinfo) => {
  console.log(request.header.id, request.questions[0]);
  let response = Packet.createResponseFromRequest(request);

  const [question] = request.questions;
  if (!question) return;

  if (question.name === CONSTANTS.HOSTNAME) {
    console.log(`[INTERNAL URL] ${question.name}`);
    response.answers.push({
      name: question.name,
      type: question.type,
      class: question.class,
      ttl: 30,
      address: getLocalIp(),
    } as any);
    send(response);
    return;
  }

  if (domainRepository.isBlocked(question.name)) {
    console.log(`[URL BLOCKED] ${question.name}`);
    response.answers.push({
      name: question.name,
      type: question.type,
      class: question.class,
      ttl: 5,
      address: "0.0.0.0",
    } as any);
  } else {
    const typeString =
      Object.keys(dns2.Packet.TYPE).find(
        (key) => (dns2.Packet.TYPE as any)[key] === question.type,
      ) || "A";

    const realResponse = await upstreamDNS.resolve(question.name, typeString);

    response.answers = realResponse.answers;
    for (let answer of response.answers) {
      answer.ttl = 5;
    }
    response.authorities = realResponse.authorities || [];
    response.additionals = realResponse.additionals || [];
  }

  send(response);
});

server.on("requestError", (error) => {
  console.log("Client sent an invalid request", error);
});

server.on("listening", () => {
  console.log("Server listening: ", server.addresses());
});

server.on("close", () => {
  console.log("server closed");
});

export const DNS = {
  start: async (port: number = 53) => {
    try {
      await server.listen({
        udp: {
          port: port,
          address: "127.0.0.1",
        },
        tcp: {
          port: port,
          address: "127.0.0.1",
        },
      });
    } catch (err) {
      console.error("Failed to start the DNS server:", err);
      throw err;
    }
  },
  stop: () => server.close(),
};
