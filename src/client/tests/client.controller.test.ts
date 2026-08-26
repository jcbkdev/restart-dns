import type { Request, Response } from "express";
import type { ClientRepository } from "../client.repository";
import { ClientController } from "../client.controller";
import { RegisterClientUseCase } from "../use-cases/register-client.use-case";
import { Result } from "../../shared/result";
import { getFutureDate } from "../../utils/date";
import { Client } from "../client.entity";

jest.mock("../use-cases/register-client.use-case.ts");

const mockRegisterClientUseCase = RegisterClientUseCase as jest.MockedFunction<
  typeof RegisterClientUseCase
>;

jest.mock("../../utils/date");

const mockGetFutureDate = getFutureDate as jest.MockedFunction<
  typeof getFutureDate
>;

function mockResponse(): jest.Mocked<Response> {
  const res: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    sendStatus: jest.fn().mockReturnThis(),
  };

  return res as jest.Mocked<Response>;
}

function mockRequest(ip?: string): Request {
  return { ip } as Request;
}

function mockRepository(): jest.Mocked<ClientRepository> {
  return {
    hasClient: jest.fn(),
    getClient: jest.fn(),
    addClient: jest.fn(),
    updateClient: jest.fn(),
    removeClient: jest.fn(),
  } as unknown as jest.Mocked<ClientRepository>;
}

describe("ClientController", () => {
  let repo: jest.Mocked<ClientRepository>;
  let controller: ClientController;
  let res: jest.Mocked<Response>;

  beforeEach(() => {
    repo = mockRepository();
    controller = new ClientController(repo);
    res = mockResponse();
    mockGetFutureDate.mockReset();
    mockRegisterClientUseCase.mockReset();
  });

  describe("register", () => {
    it("returns 400 if req.ip is missing", () => {
      const req = mockRequest(undefined);

      controller.register(req, res);

      expect(res.sendStatus).toHaveBeenCalledWith(400);
    });

    it("returns 409 if RegisterClientUseCase fails", () => {
      const req = mockRequest("1.1.1.1");
      mockRegisterClientUseCase.mockReturnValue(
        Result.error(new Error("register failed")),
      );

      controller.register(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.send).toHaveBeenCalledWith("register failed");
    });

    it("returns 200 and expirationDate if succeeds", () => {
      const expirationDate = new Date("2026-01-01T00:00:00Z");
      mockGetFutureDate.mockReturnValue(expirationDate);
      const req = mockRequest("1.1.1.1");
      const client = new Client("1.1.1.1");
      mockRegisterClientUseCase.mockReturnValue(Result.success(client));

      controller.register(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        JSON.stringify({
          expirationDate: expirationDate,
        }),
      );
    });
  });
});
