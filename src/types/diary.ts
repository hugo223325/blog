export interface DiaryEntry {
  date: string;
  mood?: string;
  tags: string[];
  content: string;
}

export interface DiaryFrontmatter {
  date: string;
  mood?: string;
  tags?: string[];
}
