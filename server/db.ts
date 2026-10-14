import fs from 'fs';
import path from 'path';
import { initialUsers, initialCases } from './seedData.ts';
import { User, MedicalCase } from '../src/types/index.ts';

export interface DbSchema {
  users: (User & { password_hash: string })[];
  cases: MedicalCase[];
  tokens: { token: string; user_id: number; created_at: string }[];
}

const DATA_DIR = path.resolve(process.cwd(), '.data');
const DB_FILE = path.resolve(DATA_DIR, 'db.json');

class Database {
  private data: DbSchema = {
    users: [],
    cases: [],
    tokens: [],
  };

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        // Ensure initial users exist
        if (!this.data.users || this.data.users.length < 2) {
          this.reset();
        }
      } else {
        this.reset();
      }
    } catch {
      this.reset();
    }
  }

  public save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write db.json:', err);
    }
  }

  public reset() {
    this.data = {
      users: JSON.parse(JSON.stringify(initialUsers)),
      cases: JSON.parse(JSON.stringify(initialCases)),
      tokens: [
        {
          token: 'sanctum_token_admin_predefined_key',
          user_id: 1,
          created_at: new Date().toISOString(),
        },
        {
          token: 'sanctum_token_viewer_predefined_key',
          user_id: 2,
          created_at: new Date().toISOString(),
        },
      ],
    };
    this.save();
  }

  public getUsers() {
    return this.data.users;
  }

  public getUserById(id: number) {
    return this.data.users.find((u) => u.id === id);
  }

  public getUserByEmail(email: string) {
    return this.data.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase().trim()
    );
  }

  public createToken(userId: number): string {
    const token = `sct_${Math.random().toString(36).substring(2)}_${Date.now()}`;
    this.data.tokens.push({
      token,
      user_id: userId,
      created_at: new Date().toISOString(),
    });
    this.save();
    return token;
  }

  public getUserByToken(tokenStr: string): (User & { password_hash: string }) | null {
    const cleanToken = tokenStr.replace('Bearer ', '').trim();
    const tokenRecord = this.data.tokens.find((t) => t.token === cleanToken);
    if (!tokenRecord) return null;
    return this.getUserById(tokenRecord.user_id) || null;
  }

  public revokeToken(tokenStr: string): boolean {
    const cleanToken = tokenStr.replace('Bearer ', '').trim();
    const beforeCount = this.data.tokens.length;
    this.data.tokens = this.data.tokens.filter((t) => t.token !== cleanToken);
    this.save();
    return this.data.tokens.length < beforeCount;
  }

  public getCases(): MedicalCase[] {
    // Populate creator info
    return this.data.cases.map((c) => {
      const creator = this.getUserById(c.created_by);
      return {
        ...c,
        creator: creator
          ? {
              id: creator.id,
              name: creator.name,
              email: creator.email,
              role: creator.role,
            }
          : undefined,
      };
    });
  }

  public getCaseById(id: number): MedicalCase | null {
    const found = this.data.cases.find((c) => c.id === id);
    if (!found) return null;
    const creator = this.getUserById(found.created_by);
    return {
      ...found,
      creator: creator
        ? {
            id: creator.id,
            name: creator.name,
            email: creator.email,
            role: creator.role,
          }
        : undefined,
    };
  }

  public getCaseByNumber(caseNumber: string): MedicalCase | null {
    return (
      this.data.cases.find(
        (c) => c.case_number.toUpperCase() === caseNumber.toUpperCase().trim()
      ) || null
    );
  }

  public createCase(data: Omit<MedicalCase, 'id' | 'created_at' | 'updated_at'>): MedicalCase {
    const nextId =
      this.data.cases.length > 0
        ? Math.max(...this.data.cases.map((c) => c.id)) + 1
        : 1;

    const newCase: MedicalCase = {
      ...data,
      id: nextId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.data.cases.unshift(newCase);
    this.save();
    return this.getCaseById(newCase.id)!;
  }

  public updateCase(id: number, updates: Partial<Omit<MedicalCase, 'id' | 'created_by' | 'created_at'>>): MedicalCase | null {
    const idx = this.data.cases.findIndex((c) => c.id === id);
    if (idx === -1) return null;

    const existing = this.data.cases[idx];
    this.data.cases[idx] = {
      ...existing,
      ...updates,
      id: existing.id,
      created_by: existing.created_by, // Protect against mass assignment
      created_at: existing.created_at,
      updated_at: new Date().toISOString(),
    };

    this.save();
    return this.getCaseById(id);
  }

  public deleteCase(id: number): boolean {
    const idx = this.data.cases.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    this.data.cases.splice(idx, 1);
    this.save();
    return true;
  }
}

export const db = new Database();
