import os from "os";
import type { RemoteInfo } from "dgram";
import type { Socket } from "net";
import type { IncomingMessage } from "http";
import { Result } from "../shared/result";

export function getLocalIp(): string {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === "IPv4" && !net.internal) return net.address;
    }
  }
  return "127.0.0.1";
}

export function getClientIp(
  source: RemoteInfo | Socket | IncomingMessage,
): Result<string> {
  if ("address" in source && typeof source.address === "string") {
    return Result.success(normalizeIp(source.address));
  }

  if ("remoteAddress" in source && typeof source.remoteAddress === "string") {
    return Result.success(normalizeIp(source.remoteAddress));
  }

  if ("socket" in source && source.socket?.remoteAddress) {
    return Result.success(normalizeIp(source.socket.remoteAddress));
  }

  return Result.error(new Error("Unable to determine client IP"));
}

export function normalizeIp(ip: string): string {
  return ip.startsWith("::ffff:") ? ip.slice(7) : ip;
}
