import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import MediaHeader from "@/components/media/MediaHeader";
import AlternativeNavbar from "@/components/nav/AlternativeNavbar";
import { NewLabFooter } from "@/components/footer/NewLabFooter";
import VideosClient from "@/components/media/VideosClient";
import { VideosPageResponse } from "@/types/api";

export const metadata = {
  title: 'Media Center | Videos | New Lab Specialized',
  description: 'Watch our latest videos, facility tours, patient guides, and health awareness content from New Lab Specialized Medical Center.',
};

async function getVideosData(): Promise<VideosPageResponse['message']['message']['videos'] | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ;
  try {
    const res = await fetch(`${apiUrl}/api/method/newlab_site.api.get_videos`, {
      next: { revalidate: 60 } // Revalidate every minute
    });

    if (!res.ok) {
      console.error("Failed to fetch videos data");
      return null;
    }
    const data = await res.json();
    // Return empty array if videos is undefined/null
    return data.message?.message?.videos || [];
  } catch (error) {
    console.error("Error fetching videos data:", error);
    return null;
  }
}

export default async function VideosPage({ params: { locale } }: { params: { locale: string } }) {
  unstable_setRequestLocale(locale);
  const t = await getTranslations("media.videos");
  
  const videos = await getVideosData();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#1a658d]">
      <AlternativeNavbar />
      <MediaHeader title={t("title")} breadcrumb={t("breadcrumb")} />

      {videos && videos.length > 0 ? (
        <VideosClient initialVideos={videos} />
      ) : (
        <div className="mx-auto max-w-7xl px-6 py-32 text-center lg:px-8">
          <p className="text-lg text-slate-500 dark:text-slate-300">
            {locale === "ar" ? "لا توجد فيديوهات متاحة حالياً." : "No videos available at the moment."}
          </p>
        </div>
      )}

      <NewLabFooter />
    </div>
  );
}
