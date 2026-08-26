import type { ClientRepository } from "../client.repository";
import { RemoveExpiredClientsUseCase } from "../use-cases/remove-expired-clients.use-case";

export class ClientCleanupWorker {
  private intervalId: NodeJS.Timeout | null = null;
  private readonly clientRepository: ClientRepository;
  private readonly intervalMs: number = 60000;

  constructor(clientRepository: ClientRepository, intervalMs: number = 60000) {
    this.clientRepository = clientRepository;
    this.intervalMs = intervalMs;
  }

  public start() {
    if (this.intervalId) return;

    this.intervalId = setInterval(() => {
      const count = RemoveExpiredClientsUseCase(this.clientRepository);
      console.log("removed: ", count);
    }, this.intervalMs);
  }

  public stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
