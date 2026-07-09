'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Compass, X, ZoomIn, ZoomOut } from 'lucide-react';
import { VacancyProperty } from '../types';

interface MapTabProps {
  vacancies: VacancyProperty[];
  circleCenter: { lat: number; lng: number } | null;
  onSetCircleCenter: (val: { lat: number; lng: number } | null) => void;
  circleRadius: number;
  onSetCircleRadius: (val: number) => void;
  leafletLoaded: boolean;
}

export default function MapTab({
  vacancies,
  circleCenter,
  onSetCircleCenter,
  circleRadius,
  onSetCircleRadius,
  leafletLoaded
}: MapTabProps) {
  const router = useRouter();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const circleInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // Local helper to access Leaflet from window
  const getL = () => (window as any).L;

  // Initialize Map
  useEffect(() => {
    if (!leafletLoaded || !mapContainerRef.current) return;
    const L = getL();
    if (!L) return;

    // Clean up previous map if initialized
    if (mapInstance.current) {
      mapInstance.current.remove();
      mapInstance.current = null;
    }

    // Default view Nairobi
    const defaultLat = -1.2921;
    const defaultLng = 36.8219;

    const map = L.map(mapContainerRef.current, {
      zoomControl: false // Custom controls
    }).setView([defaultLat, defaultLng], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    mapInstance.current = map;

    // Listen to Map Clicks to draw search circle
    map.on('click', (e: any) => {
      onSetCircleCenter({ lat: e.latlng.lat, lng: e.latlng.lng });
    });

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [leafletLoaded]);

  // Update Markers when vacancies or map updates
  useEffect(() => {
    const L = getL();
    if (!L || !mapInstance.current) return;

    // Clear previous markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Create marker icon
    const defaultIcon = L.divIcon({
      className: 'custom-leaflet-pin',
      html: `<div style="background-color: #ff6b6b; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 6px rgba(0,0,0,0.4);"></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7]
    });

    vacancies.forEach(v => {
      if (!v.latitude || !v.longitude) return;

      const marker = L.marker([v.latitude, v.longitude], { icon: defaultIcon })
        .addTo(mapInstance.current);

      // Create Custom popup window
      const popupContent = document.createElement('div');
      popupContent.className = 'p-2 space-y-1.5 text-xs font-sans text-paper-900';
      popupContent.style.minWidth = '160px';
      popupContent.innerHTML = `
        <div style="font-weight: bold; font-size: 13px;">${v.propertyName}</div>
        <div style="color: #6b7280; font-size: 10px;">Unit ${v.label} | ${v.unitType}</div>
        <div style="color: #ff6b6b; font-weight: bold; font-size: 12px; margin-top: 4px;">KSh ${v.rent.toLocaleString()}</div>
        <button id="marker-btn-${v.id}" style="width: 100%; margin-top: 6px; padding: 4px 8px; background: #ff6b6b; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 10px;">
          View Details &rarr;
        </button>
      `;

      marker.bindPopup(popupContent);

      // Add routing handler to details page on popup open
      marker.on('popupopen', () => {
        const btn = document.getElementById(`marker-btn-${v.id}`);
        if (btn) {
          btn.addEventListener('click', () => {
            router.push(`/tenant/vacancies/${v.id}`);
          });
        }
      });

      markersRef.current.push(marker);
    });
  }, [vacancies, leafletLoaded]);

  // Update Radius Circle Layer
  useEffect(() => {
    const L = getL();
    if (!L || !mapInstance.current) return;

    // Clear old circle
    if (circleInstance.current) {
      circleInstance.current.remove();
      circleInstance.current = null;
    }

    if (circleCenter) {
      const circle = L.circle([circleCenter.lat, circleCenter.lng], {
        color: '#ff6b6b',
        fillColor: '#ff6b6b',
        fillOpacity: 0.15,
        radius: circleRadius * 1000, // in meters
        weight: 1.5
      }).addTo(mapInstance.current);

      circleInstance.current = circle;

      // Fit map to circle bounds
      mapInstance.current.fitBounds(circle.getBounds(), { padding: [20, 20] });
    }
  }, [circleCenter, circleRadius, leafletLoaded]);

  // Map Controls Helpers
  const zoomIn = () => {
    if (mapInstance.current) mapInstance.current.zoomIn();
  };
  const zoomOut = () => {
    if (mapInstance.current) mapInstance.current.zoomOut();
  };

  return (
    <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 p-4 rounded-3xl shadow-sm space-y-4">
      {/* Search Circle Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-paper-50 dark:bg-ink-950 p-3 rounded-2xl border border-paper-150 dark:border-ink-850">
        <div className="space-y-0.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-paper-800 dark:text-white flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-coral-500" /> Interactive OSM Map Radial Search
          </h3>
          <p className="text-[10px] text-paper-500 dark:text-ink-400">
            {circleCenter 
              ? `Filtering listings within ${circleRadius}km circle around selection.` 
              : 'Click anywhere on OpenStreetMap grid to place search circle (Capped at 5km).'
            }
          </p>
        </div>

        {/* Sliders */}
        <div className="flex items-center gap-4 flex-wrap">
          {circleCenter && (
            <div className="flex items-center gap-2 bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 px-3 py-1 rounded-xl text-[10px]">
              <span className="text-paper-500 font-medium">Radius:</span>
              <input 
                type="range"
                min="0.5"
                max="5.0"
                step="0.5"
                value={circleRadius}
                onChange={e => onSetCircleRadius(Number(e.target.value))}
                className="w-24 accent-coral-500 cursor-pointer"
              />
              <span className="font-bold text-coral-500">{circleRadius.toFixed(1)} km</span>
              <button 
                type="button"
                onClick={() => onSetCircleCenter(null)}
                className="p-0.5 hover:bg-paper-100 dark:hover:bg-ink-800 rounded-full text-paper-400 hover:text-coral-500 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Map Mapbox Layout */}
      <div className="w-full h-[550px] rounded-2xl overflow-hidden border border-paper-200 dark:border-ink-800 relative z-10">
        {!leafletLoaded && (
          <div className="absolute inset-0 bg-ink-950/20 backdrop-blur-sm flex items-center justify-center text-xs text-paper-500">
            Initializing Leaflet map engine...
          </div>
        )}
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Custom Zoom Control Overlay */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-1.5 z-20">
          <button 
            type="button"
            onClick={zoomIn}
            className="w-8 h-8 rounded-lg bg-white hover:bg-paper-50 dark:bg-ink-900 dark:hover:bg-ink-800 border border-paper-250 dark:border-ink-700 flex items-center justify-center shadow-md font-bold text-paper-800 dark:text-white transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button 
            type="button"
            onClick={zoomOut}
            className="w-8 h-8 rounded-lg bg-white hover:bg-paper-50 dark:bg-ink-900 dark:hover:bg-ink-800 border border-paper-250 dark:border-ink-700 flex items-center justify-center shadow-md font-bold text-paper-800 dark:text-white transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
