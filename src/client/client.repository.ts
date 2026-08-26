import { Result } from "../shared/result";
import type { Client } from "./client.entity";

export class ClientRepository {
  private static instance: ClientRepository;
  private clients: Map<string, Client> = new Map<string, Client>();

  private constructor() {}

  public static getInstance() {
    if (!ClientRepository.instance) {
      ClientRepository.instance = new ClientRepository();
    }
    return ClientRepository.instance;
  }

  public addClient(client: Client): Result<void> {
    if (this.hasClient(client.ip)) {
      return Result.error(new Error("Client already registered"));
    }

    this.clients.set(client.ip, client);

    return Result.success();
  }

  public updateClient(client: Client): Result<void> {
    if (!this.hasClient(client.ip)) {
      return Result.error(new Error("Client does not exist"));
    }

    this.clients.set(client.ip, client);
    return Result.success();
  }

  public removeClient(ip: string): Result<void> {
    const result = this.clients.delete(ip);

    if (!result) {
      return Result.error(new Error("Client does not exist"));
    }

    return Result.success();
  }

  public getClient(ip: string): Result<Client> {
    const client = this.clients.get(ip);

    if (!client) {
      return Result.error(new Error("Client does not exist"));
    }

    return Result.success(client);
  }

  public getExpiredClients(): Client[] {
    const expiredClients: Client[] = [];
    for (let client of this.clients.values()) {
      if (client.isExpired()) expiredClients.push(client);
    }

    return expiredClients;
  }

  public hasClient(ip: string): boolean {
    return this.clients.has(ip);
  }
}
