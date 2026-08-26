import { Result } from "../../shared/result";
import { getFutureDate } from "../../utils/date";
import { Client } from "../client.entity";
import type { ClientRepository } from "../client.repository";
import { RegisterClientUseCase } from "../use-cases/register-client.use-case";

jest.mock("../../utils/date");

const mockGetFutureDate = getFutureDate as jest.MockedFunction<
  typeof getFutureDate
>;

function mockRepository(): jest.Mocked<ClientRepository> {
  return {
    hasClient: jest.fn(),
    getClient: jest.fn(),
    addClient: jest.fn(),
    updateClient: jest.fn(),
    removeClient: jest.fn(),
  } as unknown as jest.Mocked<ClientRepository>;
}

describe("RegisterClientUseCase", () => {
  let repo: jest.Mocked<ClientRepository>;

  beforeEach(() => {
    repo = mockRepository();
    mockGetFutureDate.mockReset();
  });

  describe("when the client already exists", () => {
    it("returns error Result if getClient fails", () => {
      repo.hasClient.mockReturnValue(true);
      repo.getClient.mockReturnValue(Result.error(new Error("lookup failed")));

      const result = RegisterClientUseCase(repo, "1.1.1.1");

      expect(result.isFailure()).toBe(true);
      expect(result.isSuccess()).toBe(false);
      expect(result.getValue()).toBeUndefined();
      expect(result.getError()).toBeInstanceOf(Error);
      expect(result.getError()!.message).toBe("lookup failed");
    });

    it("returns error Result if renew fails", () => {
      const client = new Client("1.1.1.1", 3600);
      jest
        .spyOn(client, "renew")
        .mockReturnValue(Result.error(new Error("renew failed")));

      repo.hasClient.mockReturnValue(true);
      repo.getClient.mockReturnValue(Result.success(client));

      const result = RegisterClientUseCase(repo, "1.1.1.1");

      expect(result.isFailure()).toBe(true);
      expect(result.isSuccess()).toBe(false);
      expect(result.getValue()).toBeUndefined();
      expect(result.getError()).toBeInstanceOf(Error);
      expect(result.getError()!.message).toBe("renew failed");
    });

    it("returns Client with new expiration date if renew succeeds", () => {
      const client = new Client("1.1.1.1", 3600);
      const newExpirationDate = new Date("2026-01-01T00:00:00Z");
      mockGetFutureDate.mockReturnValue(newExpirationDate);

      repo.hasClient.mockReturnValue(true);
      repo.getClient.mockReturnValue(Result.success(client));

      const result = RegisterClientUseCase(repo, "1.1.1.1");

      expect(result.isSuccess()).toBe(true);
      expect(result.isFailure()).toBe(false);
      expect(result.getError()).toBeUndefined();
      expect(result.getValue()).toBe(client);
      expect(result.getValue()!.expirationDate).toBe(newExpirationDate);
    });
  });

  describe("when client does not exist", () => {
    it("adds a new client and returns with the expiration date", () => {
      const expirationDate = new Date("2026-01-01T00:00:00Z");
      mockGetFutureDate.mockReturnValue(expirationDate);

      repo.hasClient.mockReturnValue(false);
      repo.addClient.mockReturnValue(Result.success());

      const result = RegisterClientUseCase(repo, "1.1.1.1");

      expect(result.isSuccess()).toBe(true);
      expect(result.isFailure()).toBe(false);
      expect(result.getError()).toBeUndefined();
      expect(result.getValue()).toMatchObject({
        expirationDate: expirationDate,
      });
      expect(repo.addClient).toHaveBeenCalledWith(
        expect.objectContaining({ ip: "1.1.1.1" }),
      );
    });

    it("returns error Result if addClient fails", () => {
      repo.hasClient.mockReturnValue(false);
      repo.addClient.mockReturnValue(Result.error(new Error("add failed")));

      const result = RegisterClientUseCase(repo, "1.1.1.1");

      expect(result.isFailure()).toBe(true);
      expect(result.isSuccess()).toBe(false);
      expect(result.getValue()).toBeUndefined();
      expect(result.getError()).toBeInstanceOf(Error);
      expect(result.getError()!.message).toBe("add failed");
    });
  });
});
