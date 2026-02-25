import { NewsPageResponse } from '@/types/api';
import NewsDetailClient from '@/components/media/NewsDetailClient';
import { notFound } from 'next/navigation';

async function getNewsData(): Promise<NewsPageResponse['message']['message']['news'] | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ;
  try {
    const res = await fetch(`${apiUrl}/api/method/newlab_site.api.get_news`, {
      next: { revalidate: 60 } // Revalidate every minute
    });

    if (!res.ok) {
      console.error("Failed to fetch news data");
      return null;
    }
    const data = await res.json();
    return data.message.message.news;
  } catch (error) {
    console.error("Error fetching news data:", error);
    return null;
  }
}

export default async function NewsDetailPage({ params }: { params: { id: string } }) {
  const data = await getNewsData();
  
  if (!data) {
    return notFound();
  }

  const newsItem = data.find(item => item.id === params.id || item.id === String(params.id));

  if (!newsItem) {
    return notFound();
  }

  return <NewsDetailClient newsItem={newsItem} />;
}
