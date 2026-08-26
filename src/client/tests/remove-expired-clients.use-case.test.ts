import { Result } from "../../shared/result";
import { getFutureDate } from "../../utils/date";
import { Client } from "../client.entity";
import type { ClientRepository } from "../client.repository";
import { RemoveExpiredClientsUseCase } from "../use-cases/remove-expired-clients.use-case";

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
    getExpiredClients: jest.fn(),
  } as unknown as jest.Mocked<ClientRepository>;
}

describe("RemoveExpiredClientsUseCase", () => {
  let repo: jest.Mocked<ClientRepository>;

  beforeEach(() => {
    repo = mockRepository();
  });

  it("removes expired clients from repository", () => {
    mockGetFutureDate.mockReturnValue(new Date(Date.now() - 10000));
    const ipAddresses = ["1.1.1.1", "1.1.1.2", "1.1.1.3", "192.168.1.1"];

    const expiredClients = ipAddresses.map((ip) => ({ ip }) as Client);

    repo.getExpiredClients.mockReturnValue(expiredClients);
    repo.removeClient.mockReturnValue(Result.success());

    const count = RemoveExpiredClientsUseCase(repo);

    expect(repo.removeClient).toHaveBeenCalledWith("1.1.1.1");
    expect(repo.removeClient).toHaveBeenCalledWith("1.1.1.2");
    expect(repo.removeClient).toHaveBeenCalledWith("1.1.1.3");
    expect(repo.removeClient).toHaveBeenCalledWith("192.168.1.1");
    expect(repo.removeClient).toHaveBeenCalledTimes(4);
    expect(count).toBe(4);
  });

  it("returns 0 and removes nothing when there are no expired clients", () => {
    repo.getExpiredClients.mockReturnValue([]);

    const count = RemoveExpiredClientsUseCase(repo);

    expect(repo.removeClient).not.toHaveBeenCalled();
    expect(count).toBe(0);
  });

  it("logs an error but continues if removeClient fails for one client", () => {
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    repo.getExpiredClients.mockReturnValue([{ ip: "1.1.1.1" } as Client]);
    repo.removeClient.mockReturnValue(Result.error(new Error("remove failed")));

    const count = RemoveExpiredClientsUseCase(repo);

    expect(errorSpy).toHaveBeenCalled();
    expect(count).toBe(1);

    errorSpy.mockRestore();
  });
});
