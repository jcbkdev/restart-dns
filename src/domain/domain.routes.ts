import { Router } from "express";
import { DomainRepository } from "./domain.repository";
import { DomainController } from "./domain.controller";

const router: Router = Router();

const domainRepository = DomainRepository.getInstance();
const domainController = new DomainController(domainRepository);

router.post("/", domainController.add);
router.get("/", domainController.getAll);
router.delete("/", domainController.remove);

export default router;
