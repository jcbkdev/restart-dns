import { Router } from "express";
import { ClientController } from "./client.controller";
import { ClientRepository } from "./client.repository";

const router: Router = Router();

const clientRepository = ClientRepository.getInstance();
const clientController = new ClientController(clientRepository);

router.post("/register", clientController.register);

export default router;
