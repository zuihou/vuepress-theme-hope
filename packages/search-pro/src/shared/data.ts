import type MiniSearch from "minisearch";

export interface PageSectionIndex {
  id: string;
  title: string;
  header: string;
  text?: string[];
}

export interface PageIndex {
  id: string;
  title: string;
  text?: string[];
  customFields?: Record<string, string[]>;
}

export type IndexItem = PageIndex | PageSectionIndex;

export type LocaleIndex = Record<string, IndexItem[]>;

export type SearchIndex = Record<string, MiniSearch<IndexItem>>;
