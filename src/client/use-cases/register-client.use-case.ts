import { Result } from "../../shared/result";
import { Client } from "../client.entity";
import { CONSTANTS } from "../../constants";

import type { ClientRepository } from "../client.repository";

export function RegisterClientUseCase(
  clientRepository: ClientRepository,
  ip: string,
): Result<Client> {
  if (clientRepository.hasClient(ip)) {
    const getClientResult = clientRepository.getClient(ip);

    if (getClientResult.isFailure()) {
      return Result.error(getClientResult.getError()!);
    }

    const client = getClientResult.getValue() as Client;

    const renewClientResult = client.renew();

    if (renewClientResult.isSuccess()) {
      return Result.success(client);
    }
  }

  const client = new Client(ip, CONSTANTS.CLIENT_TTL_SECONDS);

  const addClientResult = clientRepository.addClient(client);

  if (addClientResult.isFailure()) {
    return Result.error(addClientResult.getError()!);
  }

  return Result.success(client);
}
