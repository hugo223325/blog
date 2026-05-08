export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  excerpt: string;
  content: string;
}

export interface BlogFrontmatter {
  title: string;
  date: string;
  tags?: string[];
  excerpt?: string;
}
