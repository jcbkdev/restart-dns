import type { Request, Response } from "express";
import type { DomainRepository } from "./domain.repository";

export class DomainController {
  private domainRepository: DomainRepository;

  constructor(domainRepository: DomainRepository) {
    this.domainRepository = domainRepository;
  }

  add = (req: Request, res: Response) => {
    const { domain }: { domain: string | undefined } = req.body;

    if (typeof domain !== "string" || !domain.trim()) {
      return res.status(400).json({ error: "domain is required" });
    }

    this.domainRepository.add(domain);
    res.sendStatus(201);
  };

  getAll = (req: Request, res: Response) => {
    const domains = this.domainRepository.getAll();
    const stripped = domains.map(({ domain }) => ({ domain }));
    res.status(200).json(stripped);
  };

  remove = (req: Request, res: Response) => {
    const { domain }: { domain: string | undefined } = req.body;

    if (typeof domain !== "string" || !domain.trim()) {
      return res.status(400).json({ error: "domain is required" });
    }

    this.domainRepository.remove(domain);
    res.sendStatus(204);
  };
}
