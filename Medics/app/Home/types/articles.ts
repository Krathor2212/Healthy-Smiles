export interface Article {
  id: number;
  category: string;
  title: string;
  date: string;
  readTime?: string;
  content: string;
  trending?: boolean;
}

export type ArticlesData = Record<string, Article[]>;

export default {} as any;
