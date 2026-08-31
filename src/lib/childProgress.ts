// Утилита чтения прогресса детского модуля.
// Источник правды — сервер (member.safetyProgress / member.regionProgress),
// localStorage используется только как быстрый локальный кэш до подгрузки данных.

import { YAROSLAVL_REGION_STORAGE_KEY, type YaroslavlRegionProgress } from "@/data/yaroslavlRegionData";

// ─── Safety Tests ──────────────────────────────────────────────────────────────

const LS_RESULTS_KEY = "safety_tests_results_v2";
const LS_AGE_KEY = "safety_tests_age_group";

export type AgeGroup = "7_10" | "11_15";

export type SafetyResults = Record<string, number>; // { fire: 75, scam: 100, ... }
export type SavedSafetyResults = Record<AgeGroup, SafetyResults>;

export interface SafetyProgress {
  ageGroup: AgeGroup | null;
  results: SafetyResults;         // результаты текущей группы
  doneCount: number;              // пройдено тестов (0–4)
  totalCount: number;             // всего тестов
  overallPct: number | null;      // средний % (null если ни одного)
  bestLevel: string | null;       // лучший уровень по средней оценке
  bestLevelEmoji: string | null;
}

const TEST_IDS = ["fire", "scam", "internet", "water"];
const TOTAL = TEST_IDS.length;

const LEVEL_CONFIG = [
  { min: 0,  max: 49,  label: "Начинающий",   emoji: "🌱" },
  { min: 50, max: 74,  label: "Знает основы", emoji: "📘" },
  { min: 75, max: 99,  label: "Уверенно знает", emoji: "⭐" },
  { min: 100, max: 100, label: "Эксперт!",    emoji: "🏆" },
];

function getLevel(pct: number) {
  return LEVEL_CONFIG.find(l => pct >= l.min && pct <= l.max) ?? LEVEL_CONFIG[0];
}

/**
 * Читает прогресс тестов по безопасности.
 * @param serverResults — результаты с сервера (member.safetyProgress), приоритетнее localStorage
 */
export function readSafetyProgress(serverResults?: SavedSafetyResults | null): SafetyProgress {
  try {
    const ageRaw = localStorage.getItem(LS_AGE_KEY);
    const ageGroup: AgeGroup | null = ageRaw === "7_10" || ageRaw === "11_15" ? ageRaw : null;

    let allResults: SavedSafetyResults;
    if (serverResults) {
      allResults = serverResults;
    } else {
      const raw = localStorage.getItem(LS_RESULTS_KEY);
      allResults = raw ? JSON.parse(raw) : { "7_10": {}, "11_15": {} };
    }

    const results: SafetyResults = ageGroup ? (allResults[ageGroup] ?? {}) : {};
    const doneScores = Object.values(results);
    const doneCount = doneScores.length;
    const overallPct = doneCount > 0
      ? Math.round(doneScores.reduce((a, b) => a + b, 0) / doneCount)
      : null;
    const level = overallPct !== null ? getLevel(overallPct) : null;

    return {
      ageGroup,
      results,
      doneCount,
      totalCount: TOTAL,
      overallPct,
      bestLevel: level?.label ?? null,
      bestLevelEmoji: level?.emoji ?? null,
    };
  } catch {
    return { ageGroup: null, results: {}, doneCount: 0, totalCount: TOTAL, overallPct: null, bestLevel: null, bestLevelEmoji: null };
  }
}

// ─── Region ───────────────────────────────────────────────────────────────────

export interface RegionProgress {
  bestScore: number | null;  // 0–100, null если не начато
  levelTitle: string | null;
  completed: boolean;
}

/**
 * Читает прогресс квиза "Мой край".
 * @param serverProgress — прогресс с сервера (member.regionProgress), приоритетнее localStorage
 */
export function readRegionProgress(serverProgress?: YaroslavlRegionProgress | null): RegionProgress {
  try {
    let p: YaroslavlRegionProgress | null = serverProgress ?? null;
    if (!p) {
      const raw = localStorage.getItem(YAROSLAVL_REGION_STORAGE_KEY);
      p = raw ? JSON.parse(raw) : null;
    }
    if (!p) return { bestScore: null, levelTitle: null, completed: false };
    return {
      bestScore: p.bestScore ?? null,
      levelTitle: p.levelTitle ?? null,
      completed: p.completed ?? false,
    };
  } catch {
    return { bestScore: null, levelTitle: null, completed: false };
  }
}

// ─── Общий статус «есть ли вообще прогресс» ───────────────────────────────────

export function hasAnyProgress(serverSafety?: SavedSafetyResults | null, serverRegion?: YaroslavlRegionProgress | null): boolean {
  const s = readSafetyProgress(serverSafety);
  const r = readRegionProgress(serverRegion);
  return s.doneCount > 0 || r.bestScore !== null;
}
