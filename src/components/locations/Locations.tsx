"use client";

import { useState } from "react";
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from "@react-google-maps/api";
import { MapPin, Phone, ExternalLink } from "lucide-react";
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
    <section className="relative bg-gradient-to-b from-white to-slate-50 py-20 dark:from-slate-900 dark:to-slate-800">
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
                          <InfoWindow onCloseClick={() => setSelectedBranchId(null)}>
                            <div className="p-2">
                              <h3 className="mb-2 font-bold text-slate-900">{branch.name}</h3>
                              <p className="mb-1 text-sm text-slate-600">{branch.address}</p>
                              <p className="text-sm text-slate-600">{branch.phone}</p>
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
                      <span>{branch.phone}</span>
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
