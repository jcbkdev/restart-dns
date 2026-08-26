import { describe } from "node:test";
import { getFutureDate } from "../../utils/date";
import { Client } from "../client.entity";

jest.mock("../../utils/date");

const mockGetFutureDate = getFutureDate as jest.MockedFunction<
  typeof getFutureDate
>;

describe("Client", () => {
  beforeEach(() => {
    mockGetFutureDate.mockReset();
  });

  describe("constructor", () => {
    it("stores the ip", () => {
      const futureDate = new Date("2026-01-01T00:00:00Z");
      mockGetFutureDate.mockReturnValue(futureDate);

      const client = new Client("192.168.1.1", 3600);

      expect(client.ip).toBe("192.168.1.1");
    });

    it("sets expirationDate using getFutureDate with the given ttl", () => {
      const futureDate = new Date("2026-01-01T00:00:00Z");
      mockGetFutureDate.mockReturnValue(futureDate);

      const client = new Client("192.168.1.1", 3600);

      expect(mockGetFutureDate).toHaveBeenCalledWith(3600);
      expect(client.expirationDate).toBe(futureDate);
    });
  });

  describe("isExpired", () => {
    it("returns false when expirationDate is in the future", () => {
      mockGetFutureDate.mockReturnValue(new Date(Date.now() + 10000));

      const client = new Client("192.168.1.1");

      expect(client.isExpired()).toBe(false);
    });

    it("returns true when expirationDate is in the past", () => {
      mockGetFutureDate.mockReturnValue(new Date(Date.now() - 10000));

      const client = new Client("192.168.1.1");

      expect(client.isExpired()).toBe(true);
    });
  });

  describe("renew", () => {
    it("returns error Result if the client is already expired", () => {
      mockGetFutureDate.mockReturnValue(new Date(Date.now() - 10000));

      const client = new Client("192.168.1.1");

      const result = client.renew();

      expect(result.getError()).toBeInstanceOf(Error);
      expect(result.isFailure()).toBe(true);
      expect(result.isSuccess()).toBe(false);
      expect(result.getValue()).toBeUndefined();
    });

    it("renews expirationDate and returns success Result when not expired", () => {
      const initialDate = new Date(Date.now() + 10_000);
      const renewedDate = new Date(Date.now() + 20_000);
      mockGetFutureDate
        .mockReturnValueOnce(initialDate) // constructor
        .mockReturnValueOnce(renewedDate); // renew()

      const client = new Client("192.168.1.1", 3600);
      const result = client.renew();

      expect(mockGetFutureDate).toHaveBeenLastCalledWith(3600);
      expect(result.isSuccess()).toBe(true);
      expect(result.isFailure()).toBe(false);
      expect(result.getError()).toBeUndefined();
      expect(result.getValue()).toBe(renewedDate);
      expect(client.expirationDate).toBe(renewedDate);
    });

    it("does not mutate expirationDate if renew fails", () => {
      const expiredDate = new Date(Date.now() - 10000);
      mockGetFutureDate.mockReturnValue(expiredDate);
      const client = new Client("192.168.1.1");

      client.renew();

      expect(client.expirationDate).toBe(expiredDate);
    });
  });
});
