"use client";

import { useState, useEffect } from "react";
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from "@react-google-maps/api";
import { MapPin, Phone, ExternalLink, Navigation, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { LocationsData } from "@/types/api";

const MAPS_API_SRC = `https://maps.googleapis.com/maps/api/js?v=3.exp&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=geometry,drawing,places`;
const MAPS_SCRIPT_ID = "google-maps-js";

type Branch = {
  id: number;
  name: string;
  address: string;
  phone: string;
  lat: number;
  lng: number;
  type: "main" | "branch";
};

// Custom marker icons with brand colors - large and highly visible
const createMarkerIcon = (color: string, type: "main" | "branch") => {
  const svgMarker = `
    <svg width="48" height="64" viewBox="0 0 48 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Drop shadow -->
      <ellipse cx="24" cy="60" rx="8" ry="3" fill="black" opacity="0.3"/>
      
      <!-- Main marker shape -->
      <path d="M24 0C10.7452 0 0 10.7452 0 24C0 37.2548 24 64 24 64C24 64 48 37.2548 48 24C48 10.7452 37.2548 0 24 0Z" 
            fill="${color}"/>
      
      <!-- White inner circle -->
      <circle cx="24" cy="22" r="10" fill="white"/>
      
      <!-- Icon based on type -->
      ${type === "main" 
        ? `<path d="M24 14L26.5 19L32 20L28 24L29 29.5L24 27L19 29.5L20 24L16 20L21.5 19L24 14Z" fill="${color}"/>`
        : `<circle cx="24" cy="22" r="6" fill="${color}"/>`
      }
    </svg>
  `;
  
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svgMarker)}`;
};

const mainMarkerIcon = createMarkerIcon("#b9292f", "main");
const branchMarkerIcon = createMarkerIcon("#1a658d", "branch");

export function Locations({ locationsData }: { locationsData?: LocationsData }) {
  const t = useTranslations("locations");
  const locale = useLocale();
  const isRTL = locale === "ar";
  
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [hoveredBranchId, setHoveredBranchId] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#branches') {
      setTimeout(() => {
        const el = document.getElementById('branches');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 500); // Small delay to let the layout settle
    }
  }, []);

  const branches: Branch[] = locationsData?.branches?.map(b => ({
    id: b.id,
    name: isRTL ? b.name_ar : b.name_en,
    address: isRTL ? b.address_ar : b.address_en,
    phone: b.phone,
    lat: b.lat,
    lng: b.lng,
    type: b.isMain ? "main" : "branch"
  })) || [];

  const { isLoaded } = useJsApiLoader({
    id: MAPS_SCRIPT_ID,
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: ["geometry", "drawing", "places"],
  });

  const mapCenter = branches.length > 0 ? {
    lat: branches[0].lat,
    lng: branches[0].lng,
  } : {
    lat: 15.3694,
    lng: 44.1910, // Sana'a coordinates
  };

  const mapOptions = {
    disableDefaultUI: false,
    zoomControl: true,
    mapTypeControl: false,
    scaleControl: false,
    streetViewControl: false,
    rotateControl: false,
    fullscreenControl: true,
  };

  return (
    <section
      dir={isRTL ? "rtl" : "ltr"}
      className="relative bg-gradient-to-b from-white to-slate-50 py-20 dark:from-slate-900 dark:to-slate-800"
    >
      {/* Override default Google Maps InfoWindow padding, header gap, and ugly scrollbars */}
      <style jsx global>{`
        .gm-style .gm-style-iw-c {
          padding: 0 !important;
          border-radius: 18px !important;
          box-shadow: 0 20px 45px -10px rgba(15, 23, 42, 0.28) !important;
          overflow: hidden !important;
          background: transparent !important;
          max-width: 300px !important;
        }
        .gm-style .gm-style-iw-d {
          overflow: hidden !important;
          padding: 0 !important;
          max-height: none !important;
        }
        .gm-style .gm-style-iw-chr {
          display: none !important;
        }
        .gm-style .gm-style-iw-tc::after {
          background: #ffffff !important;
        }
        .dark .gm-style .gm-style-iw-tc::after {
          background: #0f172a !important;
        }
      `}</style>
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-4xl font-bold text-slate-900 dark:text-white flex justify-center w-full">
            {locationsData ? (
              (isRTL ? locationsData.title_ar : locationsData.title_en) || <div className="h-10 w-64 rounded bg-slate-200 dark:bg-slate-700 animate-pulse mt-1" />
            ) : t("title")}
          </h2>
          <div className="mx-auto max-w-2xl text-lg text-slate-600 dark:text-slate-300 flex justify-center w-full">
            {locationsData ? (
              (isRTL ? locationsData.subtitle_ar : locationsData.subtitle_en) || (
                <div className="flex flex-col gap-2 mt-2 w-full max-w-lg mx-auto">
                  <div className="h-5 w-full rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
                  <div className="h-5 w-4/5 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
                </div>
              )
            ) : t("subtitle")}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Map */}
          <div className="order-2 lg:order-1">
            <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-xl dark:border-slate-700 h-[500px] relative">
              {branches.length > 0 ? (
                isLoaded ? (
                  <GoogleMap
                    mapContainerStyle={{
                      width: "100%",
                      height: "100%",
                    }}
                    center={mapCenter}
                    zoom={13}
                    options={mapOptions}
                  >
                    {branches.map((branch) => (
                      <Marker
                        key={branch.id}
                        position={{ lat: branch.lat, lng: branch.lng }}
                        onClick={() => setSelectedBranchId(branch.id)}
                        icon={{
                          url: branch.type === "main" ? mainMarkerIcon : branchMarkerIcon,
                          scaledSize: new window.google.maps.Size(48, 64),
                          anchor: new window.google.maps.Point(24, 64),
                        }}
                        animation={
                          hoveredBranchId === branch.id
                            ? window.google.maps.Animation.BOUNCE
                            : undefined
                        }
                      >
                        {selectedBranchId === branch.id && (
                          <InfoWindow
                            onCloseClick={() => setSelectedBranchId(null)}
                            options={{
                              pixelOffset: new window.google.maps.Size(0, -4),
                            }}
                          >
                            <div
                              dir={isRTL ? "rtl" : "ltr"}
                              className="w-[265px] overflow-hidden rounded-[18px] border border-slate-200/80 bg-white text-slate-900 dark:border-slate-700/80 dark:bg-[#0f172a] dark:text-white"
                            >
                              {/* Top Brand Accent Bar */}
                              <div
                                className={`h-1.5 w-full ${
                                  branch.type === "main"
                                    ? "bg-gradient-to-r from-[#b9292f] via-[#e11d48] to-[#1a658d]"
                                    : "bg-gradient-to-r from-[#1a658d] via-[#0284c7] to-[#b9292f]"
                                }`}
                              />

                              <div className="p-4">
                                {/* Header: Title, Badge, & Custom Close Button */}
                                <div className="mb-3 flex items-start justify-between gap-2">
                                  <div>
                                    <h3 className="text-base font-extrabold leading-snug text-slate-900 dark:text-white">
                                      {branch.name}
                                    </h3>
                                    {branch.type === "main" && (
                                      <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-[#b9292f]/10 px-2.5 py-0.5 text-[11px] font-bold text-[#b9292f] dark:bg-[#b9292f]/20 dark:text-red-300">
                                        <span className="h-1.5 w-1.5 rounded-full bg-[#b9292f] dark:bg-red-400" />
                                        {t("mainBranch")}
                                      </span>
                                    )}
                                  </div>

                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedBranchId(null);
                                    }}
                                    aria-label="Close"
                                    className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-800 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </button>
                                </div>

                                {/* Details */}
                                <div className="space-y-2 border-t border-slate-100 pt-3 text-xs dark:border-slate-800">
                                  <div className="flex items-start gap-2.5 text-slate-600 dark:text-slate-300">
                                    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-[#1a658d]/10 text-[#1a658d] dark:bg-sky-500/15 dark:text-sky-400">
                                      <MapPin className="h-3.5 w-3.5" />
                                    </div>
                                    <span className="mt-0.5 leading-relaxed font-medium">
                                      {branch.address}
                                    </span>
                                  </div>

                                  {branch.phone && (
                                    <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
                                      <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-[#1a658d]/10 text-[#1a658d] dark:bg-sky-500/15 dark:text-sky-400">
                                        <Phone className="h-3.5 w-3.5" />
                                      </div>
                                      <span
                                        dir="ltr"
                                        className="font-semibold tracking-wide text-slate-700 dark:text-slate-200"
                                      >
                                        {branch.phone}
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {/* Action Buttons */}
                                <div className="mt-3.5 flex items-center gap-2 pt-1">
                                  <a
                                    href={`https://www.google.com/maps/dir/?api=1&destination=${branch.lat},${branch.lng}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#1a658d] px-3 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-[#145070] active:scale-[0.98]"
                                  >
                                    <Navigation className="h-3.5 w-3.5" />
                                    <span>{t("getDirections")}</span>
                                  </a>

                                  {branch.phone && (
                                    <a
                                      href={`tel:${branch.phone}`}
                                      className="flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-700 transition-colors hover:border-[#b9292f]/40 hover:bg-[#b9292f]/10 hover:text-[#b9292f] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                                      title={branch.phone}
                                    >
                                      <Phone className="h-3.5 w-3.5" />
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                          </InfoWindow>
                        )}
                      </Marker>
                    ))}
                  </GoogleMap>
                ) : (
                  <div className="flex h-full items-center justify-center bg-slate-100 dark:bg-slate-800">
                    <p className="text-slate-500 dark:text-slate-400">{t("loadingMap")}</p>
                  </div>
                )
              ) : (
                <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800 animate-pulse" />
              )}
            </div>
          </div>

          {/* Branches List */}
          <div className="order-1 space-y-4 lg:order-2 h-[500px] overflow-y-auto pr-2 pb-2 custom-scrollbar">
            {branches.length > 0 ? (
              branches.map((branch) => (
                <div
                  key={branch.id}
                  className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800"
                  onClick={() => setSelectedBranchId(branch.id)}
                  onMouseEnter={() => setHoveredBranchId(branch.id)}
                  onMouseLeave={() => setHoveredBranchId(null)}
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <h3 className="mb-1 text-xl font-bold text-slate-900 dark:text-white">
                        {branch.name}
                      </h3>
                      {branch.type === "main" && (
                        <span className="inline-block rounded-full bg-[#b9292f]/10 px-3 py-1 text-xs font-semibold text-[#b9292f]">
                          {t("mainBranch")}
                        </span>
                      )}
                    </div>
                    <ExternalLink className="h-5 w-5 text-slate-400 transition-colors group-hover:text-[#1a658d]" />
                  </div>

                  <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                    <div className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#1a658d]" />
                      <span>{branch.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 flex-shrink-0 text-[#1a658d]" />
                      <span dir="ltr">{branch.phone}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              // Skeletons
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800 animate-pulse">
                  <div className="h-6 w-1/2 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full bg-slate-200 dark:bg-slate-700" />
                      <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded" />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full bg-slate-200 dark:bg-slate-700" />
                      <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-700 rounded" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
