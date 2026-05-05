import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { createStore, get, set, del, keys, clear, type UseStore } from 'idb-keyval';
import type { AlgorithmType, ChampionV2, PreferencesV2 } from '../shared/models/algorithm.types';

// idb-keyval's createStore(dbName, storeName) initializes a database with a
// SINGLE object store. Reusing the same dbName across calls with different
// storeNames fails on subsequent invocations because the existing database
// version does not declare the new store. Use one database per store.
const DB_CHAMPIONS = 'n-rainhas-champions';
const DB_PREFERENCES = 'n-rainhas-preferences';
const DB_META = 'n-rainhas-metadata';
const STORE_CHAMPIONS = 'champions';
const STORE_PREFERENCES = 'preferences';
const STORE_META = 'metadata';

const LEGACY_KEY = 'nqueens_champions';
const MIGRATION_FLAG = '__migrated_v1_to_v2__';
const PREFS_KEY = 'global';

const DEFAULT_PREFS: PreferencesV2 = {
  schemaVersion: 2,
  theme: 'dark',
  lastQueensCount: 8,
  lastAlgorithm: 'backtracking',
  autoSaveChampions: true,
  championsView: 'cards',
  updatedAt: Date.now()
};

@Injectable({ providedIn: 'root' })
export class PersistenceService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private championsStore: UseStore | null = null;
  private prefsStore: UseStore | null = null;
  private metaStore: UseStore | null = null;
  private initialized = false;

  private readonly _changeTick = signal(0);
  readonly changeTick = this._changeTick.asReadonly();

  async initialize(): Promise<void> {
    if (!this.isBrowser || this.initialized) return;
    this.championsStore = createStore(DB_CHAMPIONS, STORE_CHAMPIONS);
    this.prefsStore = createStore(DB_PREFERENCES, STORE_PREFERENCES);
    this.metaStore = createStore(DB_META, STORE_META);
    await this.migrateFromV1();
    this.initialized = true;
  }

  private async migrateFromV1(): Promise<void> {
    if (!this.metaStore) return;
    const flag = await get<boolean>(MIGRATION_FLAG, this.metaStore);
    if (flag) return;

    let raw: string | null = null;
    try {
      raw = localStorage.getItem(LEGACY_KEY);
    } catch {
      raw = null;
    }

    if (raw && this.championsStore) {
      try {
        const parsed = JSON.parse(raw) as Record<string, Record<string, ChampionV1>>;
        for (const [algorithm, byN] of Object.entries(parsed)) {
          for (const [nKey, c] of Object.entries(byN)) {
            const id = `${algorithm}:${nKey}:${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
            const v2: ChampionV2 = {
              id,
              schemaVersion: 2,
              algorithm: algorithm as AlgorithmType,
              n: Number(nKey),
              solveTime: c.solveTime,
              generations: c.generations,
              iterations: c.iterations,
              createdAt: Date.parse(c.date) || Date.now(),
              updatedAt: Date.now(),
              board: c.board,
              evolutionHistory: c.evolutionHistory,
              trainingHistory: c.trainingHistory,
              brainHistory: c.brainHistory
            };
            await set(id, v2, this.championsStore);
          }
        }
      } catch (err) {
        console.warn('[PersistenceV2] migration parse failed', err);
      }
      try {
        localStorage.removeItem(LEGACY_KEY);
      } catch {
        /* noop */
      }
    }
    await set(MIGRATION_FLAG, true, this.metaStore);
  }

  // ---------- Champions ----------

  async getChampions(filter?: { algorithm?: AlgorithmType; n?: number }): Promise<ChampionV2[]> {
    if (!this.championsStore) return [];
    const allKeys = await keys(this.championsStore);
    const items: ChampionV2[] = [];
    for (const k of allKeys) {
      const c = await get<ChampionV2>(k as string, this.championsStore);
      if (!c) continue;
      if (filter?.algorithm && c.algorithm !== filter.algorithm) continue;
      if (filter?.n !== undefined && c.n !== filter.n) continue;
      items.push(c);
    }
    items.sort((a, b) => (a.n - b.n) || a.algorithm.localeCompare(b.algorithm));
    return items;
  }

  async getBestChampion(algorithm: AlgorithmType, n: number): Promise<ChampionV2 | null> {
    const list = await this.getChampions({ algorithm, n });
    if (list.length === 0) return null;
    return list.reduce((best, cur) => {
      const bestMetric = best.generations ?? best.iterations ?? best.solveTime;
      const curMetric = cur.generations ?? cur.iterations ?? cur.solveTime;
      return curMetric < bestMetric ? cur : best;
    });
  }

  async saveChampion(champion: ChampionV2): Promise<boolean> {
    if (!this.championsStore) return false;
    const existing = await this.getBestChampion(champion.algorithm, champion.n);
    if (existing) {
      const existingMetric = existing.generations ?? existing.iterations ?? existing.solveTime;
      const newMetric = champion.generations ?? champion.iterations ?? champion.solveTime;
      if (newMetric >= existingMetric) {
        return false;
      }
      await del(existing.id, this.championsStore);
    }
    await set(champion.id, champion, this.championsStore);
    this.bump();
    return true;
  }

  async deleteChampion(id: string): Promise<void> {
    if (!this.championsStore) return;
    await del(id, this.championsStore);
    this.bump();
  }

  async clearAllChampions(): Promise<void> {
    if (!this.championsStore) return;
    await clear(this.championsStore);
    this.bump();
  }

  // ---------- Preferences ----------

  async getPreferences(): Promise<PreferencesV2> {
    if (!this.prefsStore) return { ...DEFAULT_PREFS };
    const stored = await get<PreferencesV2>(PREFS_KEY, this.prefsStore);
    return stored ?? { ...DEFAULT_PREFS };
  }

  async setPreference<K extends keyof PreferencesV2>(key: K, value: PreferencesV2[K]): Promise<void> {
    if (!this.prefsStore) return;
    const current = await this.getPreferences();
    const next: PreferencesV2 = { ...current, [key]: value, updatedAt: Date.now() };
    await set(PREFS_KEY, next, this.prefsStore);
    this.bump();
  }

  // ---------- Bulk ----------

  async exportAll(): Promise<{ champions: ChampionV2[]; preferences: PreferencesV2 }> {
    const champions = await this.getChampions();
    const preferences = await this.getPreferences();
    return { champions, preferences };
  }

  async importAll(payload: { champions?: ChampionV2[]; preferences?: PreferencesV2 }): Promise<void> {
    if (!this.championsStore || !this.prefsStore) return;
    if (payload.champions) {
      for (const c of payload.champions) {
        if (c.schemaVersion !== 2 || !c.id) continue;
        await set(c.id, c, this.championsStore);
      }
    }
    if (payload.preferences && payload.preferences.schemaVersion === 2) {
      await set(PREFS_KEY, payload.preferences, this.prefsStore);
    }
    this.bump();
  }

  private bump(): void {
    this._changeTick.update(v => v + 1);
  }
}

interface ChampionV1 {
  algorithm: AlgorithmType;
  n: number;
  generations?: number;
  iterations?: number;
  solveTime: number;
  date: string;
  board: number[][];
  evolutionHistory?: ChampionV2['evolutionHistory'];
  trainingHistory?: ChampionV2['trainingHistory'];
  brainHistory?: ChampionV2['brainHistory'];
}
