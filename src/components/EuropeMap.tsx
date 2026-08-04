import React from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';

const geoUrl = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json";

const COUNTRY_NAME_TO_CODE: Record<string, string> = {
  "Germany": "de",
  "France": "fr",
  "Italy": "it",
  "Spain": "es",
  "Austria": "at",
  "Switzerland": "ch",
  "Netherlands": "nl",
  "Belgium": "be",
  "Denmark": "dk",
  "Sweden": "se",
  "Norway": "no",
  "Finland": "fi",
  "Poland": "pl"
};

interface EuropeMapProps {
  selectedCountry: string;
  onSelectCountry: (country: string) => void;
}

export function EuropeMap({ selectedCountry, onSelectCountry }: EuropeMapProps) {
  return (
    <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-[#f8fafc] rounded-lg overflow-hidden border border-slate-100 relative">
      <ComposableMap
        projection="geoAzimuthalEqualArea"
        projectionConfig={{
          rotate: [-15.0, -52.0, 0],
          center: [0, 0],
          scale: 1200
        }}
        className="w-full h-full absolute inset-0"
      >
        <ZoomableGroup zoom={1} minZoom={1} maxZoom={4}>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const countryName = geo.properties.name;
                const iso2 = COUNTRY_NAME_TO_CODE[countryName];
                const isSupported = !!iso2;
                const isSelected = selectedCountry === iso2;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() => {
                      if (isSupported) {
                        onSelectCountry(iso2);
                      }
                    }}
                    style={{
                      default: {
                        fill: isSelected ? "#10b981" : isSupported ? "#cbd5e1" : "#f1f5f9",
                        stroke: "#ffffff",
                        strokeWidth: 0.5,
                        outline: "none",
                        cursor: isSupported ? "pointer" : "default",
                      },
                      hover: {
                        fill: isSupported ? (isSelected ? "#059669" : "#94a3b8") : "#f1f5f9",
                        stroke: "#ffffff",
                        strokeWidth: 0.5,
                        outline: "none",
                        cursor: isSupported ? "pointer" : "default",
                      },
                      pressed: {
                        fill: isSupported ? "#059669" : "#f1f5f9",
                        stroke: "#ffffff",
                        strokeWidth: 0.5,
                        outline: "none",
                      }
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
      
      {/* Legend / Overlay */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur p-3 rounded shadow-sm border border-slate-200 text-[10px]">
        <p className="font-bold tracking-widest mb-2 text-slate-900 uppercase">Map Legend</p>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-[#10b981]"></span>
            <span className="text-slate-600 font-medium">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-[#cbd5e1]"></span>
            <span className="text-slate-600 font-medium">Supported</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-[#f1f5f9] border border-slate-200"></span>
            <span className="text-slate-600 font-medium">Unavailable</span>
          </div>
        </div>
      </div>
    </div>
  );
}
