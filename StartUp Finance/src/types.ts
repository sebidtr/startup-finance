/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface LearningTheory {
  intel: string;
  bullets: string[];
  example: string;
}

export interface LearningNode {
  id: string;
  title: string;
  type: string;
  xp: number;
  desc: string;
  theory: LearningTheory;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  questions?: {
    question: string;
    options: string[];
    correct: number;
    explanation: string;
  }[];
}

export interface Branch {
  title: string;
  category: string;
  nodes: LearningNode[];
}

export interface UserProfile {
  name: string;
  xp: number;
  streak: number;
  completedNodes: string[];
  lastLoginDate?: string;
  unlockedItems?: string[];
  profilePhotoUrl?: string;
  profilePhotoZoom?: number;
  accountCode?: string;
  gems?: number;
  xpBoosterActiveUntil?: string;
  xpBoosterNextBuyAvailable?: string;
  dailyQuests?: {
    chatAsked: boolean;
    nodeCompleted: boolean;
    articleRead: boolean;
    scenarioAnswered?: boolean;
    selectedScenarioOption?: number | null;
    budgetCreated?: boolean;
    shopVisited?: boolean;
    lastResetDate?: string;
  };
}

export interface Article {
  category: string;
  title: string;
  readTime: string;
  excerpt: string;
  content?: string;
  source?: string;
}
