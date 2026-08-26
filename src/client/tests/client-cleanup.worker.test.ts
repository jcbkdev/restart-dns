import { ClientCleanupWorker } from "../workers/client-cleanup.worker";
import { RemoveExpiredClientsUseCase } from "../use-cases/remove-expired-clients.use-case";
import type { ClientRepository } from "../client.repository";

jest.mock("../use-cases/remove-expired-clients.use-case");

const mockUseCase = RemoveExpiredClientsUseCase as jest.MockedFunction<
  typeof RemoveExpiredClientsUseCase
>;

describe("ClientCleanupWorker", () => {
  let repo: ClientRepository;

  beforeEach(() => {
    jest.useFakeTimers();
    mockUseCase.mockReset();
    repo = {} as ClientRepository;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("start", () => {
    it("does not call the use-case immediately", () => {
      const worker = new ClientCleanupWorker(repo, 1000);

      worker.start();

      expect(mockUseCase).not.toHaveBeenCalled();
    });

    it("calls the use-case on each interval tick", () => {
      const worker = new ClientCleanupWorker(repo, 1000);

      worker.start();
      jest.advanceTimersByTime(3000);

      expect(mockUseCase).toHaveBeenCalledTimes(3);
      expect(mockUseCase).toHaveBeenCalledWith(repo);
    });

    it("does not start a second interval if start() is called twice", () => {
      const worker = new ClientCleanupWorker(repo, 1000);

      worker.start();
      worker.start();

      jest.advanceTimersByTime(1000);

      expect(mockUseCase).toHaveBeenCalledTimes(1);
    });

    it("uses the default interval when none is provided", () => {
      const worker = new ClientCleanupWorker(repo);

      worker.start();
      jest.advanceTimersByTime(59999);
      expect(mockUseCase).not.toHaveBeenCalled();

      jest.advanceTimersByTime(1);
      expect(mockUseCase).toHaveBeenCalledTimes(1);
    });
  });

  describe("stop", () => {
    it("stops further calls after stop()", () => {
      const worker = new ClientCleanupWorker(repo, 1000);

      worker.start();
      jest.advanceTimersByTime(2000);
      worker.stop();
      jest.advanceTimersByTime(5000);

      expect(mockUseCase).toHaveBeenCalledTimes(2);
    });

    it("is safe to call stop() when never started", () => {
      const worker = new ClientCleanupWorker(repo, 1000);

      expect(() => worker.stop()).not.toThrow();
    });

    it("is safe to call stop() twice", () => {
      const worker = new ClientCleanupWorker(repo, 1000);

      worker.start();
      worker.stop();

      expect(() => worker.stop()).not.toThrow();
    });

    it("allows restarting after stop()", () => {
      const worker = new ClientCleanupWorker(repo, 1000);

      worker.start();
      jest.advanceTimersByTime(1000);
      worker.stop();

      worker.start();
      jest.advanceTimersByTime(1000);

      expect(mockUseCase).toHaveBeenCalledTimes(2);
    });
  });
});
