import { type Database } from "better-sqlite3";
import type { DomainEntity } from "./domain.entity";

import { Database as SqliteDatabase } from "../db";

export class DomainRepository {
  private static instance: DomainRepository;
  private db: Database;
  private cachedDomains: DomainEntity[] = [];
  private dnsCache: Set<string> | null = null;
  private isCacheValid = false;

  private constructor() {
    this.db = SqliteDatabase.getInstance().db;
  }

  public static getInstance() {
    if (!DomainRepository.instance) {
      DomainRepository.instance = new DomainRepository();
    }
    return DomainRepository.instance;
  }

  public add(domain: string) {
    const stmt = this.db.prepare(
      `
      INSERT OR IGNORE INTO domains (domain) VALUES (?);
      `,
    );

    stmt.run(domain);

    this.isCacheValid = false;
    if (this.dnsCache) {
      this.dnsCache.add(domain);
    }
  }

  public remove(domain: string) {
    const stmt = this.db.prepare(
      `
      DELETE FROM domains WHERE domain=(?); 
      `,
    );

    stmt.run(domain);

    this.isCacheValid = false;
    if (this.dnsCache) {
      this.dnsCache.delete(domain);
    }
  }

  public isBlocked(domain: string) {
    if (!this.dnsCache) {
      const allDomains = this.getAll().map(({ domain }) => domain);
      this.dnsCache = new Set(allDomains);
    }

    console.log(Array(...this.dnsCache!));
    return this.dnsCache?.has(domain);
  }

  public getAll(): DomainEntity[] {
    if (this.isCacheValid) return this.cachedDomains;

    const stmt = this.db.prepare(
      `
      SELECT * FROM domains;
      `,
    );

    const result = stmt.all() as DomainEntity[];

    this.cachedDomains = result;
    this.isCacheValid = true;

    return this.cachedDomains;
  }
}
