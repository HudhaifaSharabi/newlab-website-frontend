"use client";

import { useState } from "react";
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from "@react-google-maps/api";
import { MapPin, Phone, Mail, Facebook, Twitter, Instagram, Linkedin, ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";

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

export function LocationsAndFooter() {
  const t = useTranslations("locations");
  const tFooter = useTranslations("footer");
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [hoveredBranchId, setHoveredBranchId] = useState<number | null>(null);

  const branches: Branch[] = [
    {
      id: 1,
      name: t("branches.main.name"),
      address: t("branches.main.address"),
      phone: "+967 1 234 567",
      lat: 15.342095832175126,
      lng: 44.17050633863272,
      type: "main",
    },
    {
      id: 2,
      name: t("branches.haddah.name"),
      address: t("branches.haddah.address"),
      phone: "+967 1 234 568",
      lat: 15.352095,
      lng: 44.18050633,
      type: "branch",
    },
    {
      id: 3,
      name: t("branches.algeria.name"),
      address: t("branches.algeria.address"),
      phone: "+967 1 234 569",
      lat: 15.332095,
      lng: 44.16050633,
      type: "branch",
    },
  ];

  const { isLoaded } = useJsApiLoader({
    id: MAPS_SCRIPT_ID,
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: ["geometry", "drawing", "places"],
  });

  const mapCenter = {
    lat: branches[0].lat,
    lng: branches[0].lng,
  };

  const mapOptions = {
    disableDefaultUI: false,
    zoomControl: true,
    mapTypeControl: true,
    streetViewControl: true,
    fullscreenControl: true,
    scrollwheel: false,
    gestureHandling: "cooperative",
  };

  return (
    <>
      {/* Locations Section */}
      <section className="relative bg-white py-20 dark:bg-[#020617]">
        <div className="mx-auto max-w-7xl px-6">
          {/* Section Header */}
          <div className="mb-12 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#1a658d] dark:text-[#1a658d]">
              {t("title")}
            </p>
            <h2 className="mt-4 text-4xl font-black leading-tight text-slate-900 dark:text-white sm:text-5xl">
              {t("subtitle")}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-600 dark:text-slate-400">
              {t("description")}
            </p>
          </div>

          {/* Map & List Container */}
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Branch List */}
            <div className="space-y-4 h-[500px] overflow-y-auto pr-2 pb-2 custom-scrollbar">
              {branches.map((branch) => (
                <div
                  key={branch.id}
                  onClick={() => setSelectedBranchId(branch.id === selectedBranchId ? null : branch.id)}
                  onMouseEnter={() => setHoveredBranchId(branch.id)}
                  onMouseLeave={() => setHoveredBranchId(null)}
                  className={`group cursor-pointer rounded-2xl border p-6 transition-all duration-300 ${
                    selectedBranchId === branch.id || hoveredBranchId === branch.id
                      ? "border-[#1a658d] bg-[#1a658d]/5 shadow-lg dark:border-[#1a658d] dark:bg-[#1a658d]/10"
                      : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/50"
                  }`}
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                        {branch.name}
                      </h3>
                      {branch.type === "main" && (
                        <span className="mt-1 inline-block rounded-full bg-[#b9292f]/10 px-3 py-1 text-xs font-semibold text-[#b9292f] dark:bg-[#b9292f]/20">
                          {t("mainCenterBadge")}
                        </span>
                      )}
                    </div>
                    <MapPin className="h-5 w-5 text-[#1a658d]" />
                  </div>

                  <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
                    {branch.address}
                  </p>

                  <div className="mb-4 flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <Phone className="h-4 w-4" />
                    <span>{branch.phone}</span>
                  </div>

                  <button className="flex items-center gap-2 text-sm font-semibold text-[#1a658d] transition-colors hover:text-[#b9292f] dark:text-[#1a658d]">
                    {t("getDirections")}
                    <ExternalLink className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Google Map */}
            <div className="h-[500px] overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 lg:h-auto">
              {isLoaded ? (
                <GoogleMap
                  mapContainerStyle={{ width: "100%", height: "100%" }}
                  center={mapCenter}
                  zoom={13}
                  options={mapOptions}
                >
                  {branches.map((branch) => (
                    <Marker
                      key={branch.id}
                      position={{ lat: branch.lat, lng: branch.lng }}
                      title={branch.name}
                      icon={{
                        url: branch.type === "main" ? mainMarkerIcon : branchMarkerIcon,
                        scaledSize: { width: 48, height: 64 } as any,
                        anchor: { x: 24, y: 64 } as any,
                      }}
                      animation={hoveredBranchId === branch.id ? 1 : undefined} // BOUNCE animation
                      onMouseOver={() => setHoveredBranchId(branch.id)}
                      onMouseOut={() => setHoveredBranchId(null)}
                      onClick={() => setSelectedBranchId(selectedBranchId === branch.id ? null : branch.id)}
                    >
                      {selectedBranchId === branch.id && (
                        <InfoWindow
                          position={{ lat: branch.lat, lng: branch.lng }}
                          onCloseClick={() => setSelectedBranchId(null)}
                        >
                          <div className="p-2 min-w-[200px]">
                            <h3 className="text-lg font-bold text-slate-900 mb-2">
                              {branch.name}
                            </h3>
                            {branch.type === "main" && (
                              <span className="inline-block mb-2 rounded-full bg-[#b9292f]/10 px-3 py-1 text-xs font-semibold text-[#b9292f]">
                                {t("mainCenterBadge")}
                              </span>
                            )}
                            <div className="space-y-2 text-sm text-slate-700">
                              <div className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-[#1a658d]" />
                                <span>{branch.address}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 flex-shrink-0 text-[#1a658d]" />
                                <span>{branch.phone}</span>
                              </div>
                            </div>
                            <button className="mt-3 flex items-center gap-2 text-sm font-semibold text-[#1a658d] transition-colors hover:text-[#b9292f]">
                              {t("getDirections")}
                              <ExternalLink className="h-4 w-4" />
                            </button>
                          </div>
                        </InfoWindow>
                      )}
                    </Marker>
                  ))}
                </GoogleMap>
              ) : (
                <div className="flex h-full items-center justify-center bg-slate-100 dark:bg-slate-800">
                  <div className="text-center">
                    <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-300 border-t-[#1a658d]" />
                    <p className="text-sm text-slate-600 dark:text-slate-400">{t("loadingMap")}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
     
    </>
  );
}
