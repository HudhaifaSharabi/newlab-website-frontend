"use client";

import { useTranslations, useLocale } from "next-intl";
import { Play, X } from "lucide-react";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Pagination from "@/components/ui/Pagination";
import { VideoItemData } from "@/types/api";

interface VideosClientProps {
  initialVideos: VideoItemData[];
}

export default function VideosClient({ initialVideos }: VideosClientProps) {
  const locale = useLocale();
  const isRTL = locale === "ar";
  const container = useRef(null);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const totalPages = Math.ceil(initialVideos.length / itemsPerPage);

  // Get current posts
  const indexOfLastPost = currentPage * itemsPerPage;
  const indexOfFirstPost = indexOfLastPost - itemsPerPage;
  const currentPosts = initialVideos.slice(indexOfFirstPost, indexOfLastPost);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  useGSAP(() => {
    gsap.fromTo(".video-card", 
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.1, duration: 0.6, ease: "power2.out" }
    );
  }, { scope: container, dependencies: [currentPage] });

  // Utility to extract YouTube ID from various URL formats
  const extractYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  return (
    <main ref={container} className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {currentPosts.map((video) => {
          const ytId = extractYouTubeId(video.url);
          return (
            <div 
              key={video.id} 
              className="video-card group relative cursor-pointer overflow-hidden rounded-2xl bg-[#1a658d] shadow-lg"
              onClick={() => setActiveVideo(ytId)}
            >
              {/* Thumbnail */}
              <div className="relative aspect-video w-full overflow-hidden opacity-90 transition-opacity duration-300 group-hover:opacity-100 bg-slate-900 border border-slate-200 dark:border-slate-800">
                {ytId && (
                  <Image
                    src={`https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`}
                    alt={isRTL ? video.titleAr : video.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                      // Fallback to hqdefault if maxresdefault is unavailable
                      const target = e.target as HTMLImageElement;
                      if (target.src.includes('maxresdefault')) {
                        target.src = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
                      }
                    }}
                  />
                )}
                
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300" />
                
                {/* Play Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-md transition-transform duration-300 group-hover:scale-110 group-hover:bg-[#b9292f]">
                    <Play className="h-6 w-6 ml-1 text-white fill-white" />
                  </div>
                </div>

                {/* Duration Badge */}
                <div className="absolute bottom-4 right-4 rounded bg-black/60 px-2 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                  {isRTL ? video.durationAr : video.duration}
                </div>
              </div>

              {/* Title Slide-up */}
              <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 transition-transform duration-300 group-hover:translate-y-0">
                <h3 className="text-lg font-bold text-white leading-tight">
                  {isRTL ? video.titleAr : video.title}
                </h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Video Modal (YouTube Embed) */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm" onClick={() => setActiveVideo(null)}>
          <div className="relative w-full max-w-5xl overflow-hidden rounded-2xl bg-black shadow-2xl ring-1 ring-white/10" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setActiveVideo(null)}
              className="absolute -top-12 right-0 z-20 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors sm:top-4 sm:right-4"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="aspect-video w-full bg-[#1a658d]">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${activeVideo}?autoplay=1`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
