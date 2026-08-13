import newsData from '../../data/news.json';

export type NewsItem = {
  slug: string;
  title: string;
  summary: string;
  category: string;
  source: string;
  date: string;
  url: string;
  featured?: boolean;
};

export function getNews(): NewsItem[] {
  return [...(newsData as NewsItem[])].sort((a, b) => b.date.localeCompare(a.date));
}
