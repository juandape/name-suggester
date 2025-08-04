export interface ProgressConfig {
  total: number;
  prefix?: string;
  suffix?: string;
  length?: number;
}

export interface MenuItem {
  name: string;
  value: string;
}

export interface NavigationItem extends MenuItem {
  isDir?: boolean;
}

export interface FileSearchResult {
  files: string[];
  pattern?: string;
}
