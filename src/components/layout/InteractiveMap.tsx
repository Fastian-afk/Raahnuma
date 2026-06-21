'use client';
import React, { useEffect, useRef } from 'react';
import { Province } from '@/lib/rules-engine/types';
import * as topojson from 'topojson-client';
import type { FeatureCollection } from 'geojson';

interface InteractiveMapProps {
  selected: Province | null;
  onSelect: (province: Province) => void;
  language: string;
}

const PROVINCE_MAPPING: Record<string, Province | null> = {
  'Punjab': 'punjab',
  'Sind': 'sindh',
  'Sindh': 'sindh',
  'Baluchistan': 'balochistan',
  'Balochistan': 'balochistan',
  'N.W.F.P.': 'kpk',
  'Khyber Pakhtunkhwa': 'kpk',
  'F.A.T.A.': 'kpk', // FATA merged with KP
  'F.C.T.': 'islamabad',
  'Islamabad': 'islamabad',
  'Azad Kashmir': 'ajk',
  'Azad Jammu & Kashmir': 'ajk',
  'Northern Areas': 'gilgit_baltistan',
  'Gilgit-Baltistan': 'gilgit_baltistan'
};

const PROVINCE_COLORS: Record<Province, string> = {
  punjab: '#E3BE7E',
  sindh: '#5BBFA0',
  kpk: '#60A5FA',
  balochistan: '#C084FC',
  islamabad: '#FB7185',
  ajk: '#34D399',
  gilgit_baltistan: '#FBBF24',
};

export default function InteractiveMap({ selected, onSelect, language }: InteractiveMapProps) {
  const mapRef = useRef<any>(null);
  const geojsonLayerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    let L: any;

    async function initMap() {
      L = await import('leaflet');
      await import('leaflet/dist/leaflet.css');

      if (!isMounted || !containerRef.current) return;

      if (!mapRef.current) {
        const map = L.map(containerRef.current, {
          center: [30.3753, 69.3451],
          zoom: 5,
          zoomControl: true,
          attributionControl: false
        });

        const isLightTheme = document.documentElement.classList.contains('theme-light');
        const tileUrl = isLightTheme
          ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
          : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

        L.tileLayer(tileUrl, {
          maxZoom: 18,
        }).addTo(map);

        mapRef.current = map;
      }

      const map = mapRef.current;

      try {
        const response = await fetch('/pakistan-provinces.json');
        const topoData = await response.json();
        if (!isMounted) return;

        const geojson: FeatureCollection = topojson.feature(
          topoData,
          topoData.objects.PAK_adm1
        ) as any;

        if (geojsonLayerRef.current) {
          map.removeLayer(geojsonLayerRef.current);
        }

        const style = (feature: any) => {
          const name = feature.properties.NAME_1;
          const mappedKey = PROVINCE_MAPPING[name];
          const isSelected = mappedKey && selected === mappedKey;
          const color = mappedKey ? PROVINCE_COLORS[mappedKey] : '#cccccc';

          return {
            fillColor: color,
            weight: isSelected ? 3 : 1,
            opacity: 1,
            color: isSelected ? '#E3BE7E' : '#334155',
            fillOpacity: isSelected ? 0.6 : 0.25,
            dashArray: isSelected ? '' : '3',
          };
        };

        const onEachFeature = (feature: any, layer: any) => {
          const name = feature.properties.NAME_1;
          const mappedKey = PROVINCE_MAPPING[name];

          if (mappedKey) {
            const urduName = feature.properties.VARNAME_1 || name;
            const displayName = language === 'en' ? name : urduName;
            layer.bindTooltip(displayName, {
              permanent: false,
              direction: 'center',
              className: 'custom-map-tooltip'
            });
          }

          layer.on({
            mouseover: (e: any) => {
              const l = e.target;
              l.setStyle({
                fillOpacity: 0.5,
                weight: 2,
                color: '#E3BE7E'
              });
              if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                l.bringToFront();
              }
            },
            mouseout: (e: any) => {
              geojsonLayerRef.current.resetStyle(e.target);
            },
            click: (e: any) => {
              if (mappedKey) {
                onSelect(mappedKey);
              }
            }
          });
        };

        const geojsonLayer = L.geoJSON(geojson, {
          style,
          onEachFeature
        }).addTo(map);

        geojsonLayerRef.current = geojsonLayer;
      } catch (err) {
        console.error('Failed to load map boundaries:', err);
      }
    }

    initMap();

    return () => {
      isMounted = false;
    };
  }, [selected, onSelect, language]);

  return (
    <div className="w-full h-full relative overflow-hidden rounded-xl border border-border-subtle bg-surface-secondary/20">
      <div ref={containerRef} className="w-full h-full min-h-[450px]" />
      <style jsx global>{`
        .custom-map-tooltip {
          background: rgba(10, 31, 24, 0.9);
          border: 1px solid rgba(227, 190, 126, 0.3);
          color: #F7F2E7;
          font-weight: bold;
          font-size: 11px;
          padding: 4px 8px;
          border-radius: 6px;
        }
        .leaflet-container {
          background: transparent !important;
          font-family: inherit;
        }
        .leaflet-bar {
          border: 1px solid rgba(169, 201, 184, 0.2) !important;
          box-shadow: none !important;
        }
        .leaflet-bar a {
          background-color: rgba(14, 43, 34, 0.8) !important;
          color: #A9C9B8 !important;
          border-bottom: 1px solid rgba(169, 201, 184, 0.2) !important;
        }
        .leaflet-bar a:hover {
          background-color: rgba(31, 78, 61, 0.9) !important;
          color: #F7F2E7 !important;
        }
      `}</style>
    </div>
  );
}
