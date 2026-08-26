import type { Request, Response } from "express";
import type { ClientRepository } from "./client.repository";
import { Client } from "./client.entity";
import { RegisterClientUseCase } from "./use-cases/register-client.use-case";

export class ClientController {
  private clientRepository: ClientRepository;

  constructor(clientRepository: ClientRepository) {
    this.clientRepository = clientRepository;
  }

  register = (req: Request, res: Response) => {
    if (!req.ip) {
      return res.sendStatus(400);
    }

    const result = RegisterClientUseCase(this.clientRepository, req.ip);

    if (result.isFailure()) {
      return res.status(409).send(result.getError()!.message);
    }

    const client = result.getValue() as Client;

    return res.status(200).json(
      JSON.stringify({
        expirationDate: client.expirationDate,
      }),
    );
  };
}
