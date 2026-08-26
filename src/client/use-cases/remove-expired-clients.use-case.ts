import type { ClientRepository } from "../client.repository";

export function RemoveExpiredClientsUseCase(
  clientRepository: ClientRepository,
): number {
  const expiredClients = clientRepository.getExpiredClients();

  for (let client of expiredClients) {
    const result = clientRepository.removeClient(client.ip);
    if (result.isFailure()) {
      console.error(result.getError());
    }
  }

  return expiredClients.length;
}
