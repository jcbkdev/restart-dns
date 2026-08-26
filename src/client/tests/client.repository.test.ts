import { getFutureDate } from "../../utils/date";
import { Client } from "../client.entity";
import { ClientRepository } from "../client.repository";

jest.mock("../../utils/date");

const mockGetFutureDate = getFutureDate as jest.MockedFunction<
  typeof getFutureDate
>;

function makeClient(ip: string): Client {
  return { ip } as Client;
}

function createFreshRepo(): ClientRepository {
  return new (ClientRepository as any)();
}

describe("ClientRepository", () => {
  let repo: ClientRepository;

  beforeEach(() => {
    repo = createFreshRepo();
    mockGetFutureDate.mockReset();
  });

  describe("getInstance", () => {
    it("always returns the same instance", () => {
      const a = ClientRepository.getInstance();
      const b = ClientRepository.getInstance();

      expect(a).toBe(b);
    });
  });

  describe("addClient", () => {
    it("adds a new client successfully", () => {
      const client = makeClient("1.1.1.1");

      const result = repo.addClient(client);

      expect(result.isSuccess()).toBe(true);
      expect(result.isFailure()).toBe(false);
      expect(result.getError()).toBeUndefined();
      expect(repo.hasClient("1.1.1.1")).toBe(true);
    });

    it("returns an error if the client is already registered", () => {
      const client = makeClient("1.1.1.1");
      repo.addClient(client);

      const result = repo.addClient(client);

      expect(result.isSuccess()).toBe(false);
      expect(result.isFailure()).toBe(true);
      expect(result.getError()).toBeInstanceOf(Error);
    });
  });

  describe("updateClient", () => {
    it("returns an error if the client does not exist", () => {
      const client = makeClient("1.1.1.1");

      const result = repo.updateClient(client);

      expect(result.isSuccess()).toBe(false);
      expect(result.isFailure()).toBe(true);
      expect(result.getError()).toBeInstanceOf(Error);
    });

    it("updates an existing client", () => {
      const original = makeClient("1.1.1.1");
      repo.addClient(original);

      const updated = makeClient("1.1.1.1");
      const result = repo.updateClient(updated);

      expect(result.isSuccess()).toBe(true);
      expect(repo.getClient("1.1.1.1").getValue()).toBe(updated);
    });
  });

  describe("removeClient", () => {
    it("removes an existing client", () => {
      const client = makeClient("1.1.1.1");
      repo.addClient(client);

      const result = repo.removeClient("1.1.1.1");

      expect(result.isSuccess()).toBe(true);
      expect(result.isFailure()).toBe(false);
      expect(result.getError()).toBeUndefined();
      expect(repo.hasClient("1.1.1.1")).toBe(false);
    });

    it("returns an error if the client does not exist", () => {
      const result = repo.removeClient("9.9.9.9");

      expect(result.isSuccess()).toBe(false);
      expect(result.isFailure()).toBe(true);
      expect(result.getError()).toBeInstanceOf(Error);
    });
  });

  describe("getClient", () => {
    it("returns the client if it exists", () => {
      const client = makeClient("1.1.1.1");
      repo.addClient(client);

      const result = repo.getClient("1.1.1.1");

      expect(result.isSuccess()).toBe(true);
      expect(result.isFailure()).toBe(false);
      expect(result.getError()).toBeUndefined();
      expect(result.getValue()).toBe(client);
    });

    it("returns an error if the client does not exist", () => {
      const result = repo.getClient("1.1.1.1");

      expect(result.isSuccess()).toBe(false);
      expect(result.isFailure()).toBe(true);
      expect(result.getError()).toBeInstanceOf(Error);
      expect(result.getValue()).toBeUndefined();
    });
  });

  describe("getExpiredClients", () => {
    it("returns expired clients array", () => {
      mockGetFutureDate.mockReturnValue(new Date(Date.now() - 10000));
      const ipAddresses = ["1.1.1.1", "1.1.1.2", "1.1.1.3", "192.168.1.1"];
      for (let ipAddress of ipAddresses) {
        repo.addClient(new Client(ipAddress));
      }

      const expiredClients = repo.getExpiredClients();

      expect(expiredClients).toHaveLength(4);
      expect(expiredClients.map((c) => c.ip)).toEqual(
        expect.arrayContaining(ipAddresses),
      );
    });
  });

  describe("hasClient", () => {
    it("returns true if client exists", () => {
      const client = makeClient("1.1.1.1");
      repo.addClient(client);

      expect(repo.hasClient("1.1.1.1")).toBe(true);
    });

    it("returns false if client does not exist", () => {
      expect(repo.hasClient("9.9.9.9")).toBe(false);
    });
  });
});
