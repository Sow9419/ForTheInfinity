'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { Input } from "@/components/ui/input";

interface AddressInputProps {
  id?: string;
  name?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  onCoordinatesChange?: (coords: { lat: number; lon: number } | null) => void;
}

export function AddressInput({ id = "address", name = "address", required, value, onChange, onCoordinatesChange }: AddressInputProps) {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchAddress = async (query: string) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5`);
      const data = await res.json();
      setSuggestions(data.features || []);
      setShowDropdown(true);
    } catch (error) {
      console.error("Photon search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (showDropdown || value.length >= 3) {
        searchAddress(value);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [value]);

  const handleSelect = (feature: any) => {
    const props = feature.properties;
    const addressStr = [props.name, props.street, props.city, props.country]
      .filter(Boolean)
      .join(', ');

    onChange(addressStr);
    setShowDropdown(false);

    if (feature.geometry?.coordinates && onCoordinatesChange) {
      onCoordinatesChange({
        lon: feature.geometry.coordinates[0],
        lat: feature.geometry.coordinates[1]
      });
    }
  };

  const handleGPSLocation = () => {
    if (!navigator.geolocation) {
      alert("La géolocalisation n'est pas supportée par votre navigateur.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        if (onCoordinatesChange) {
          onCoordinatesChange({ lat: latitude, lon: longitude });
        }

        try {
          const res = await fetch(`https://photon.komoot.io/reverse?lon=${longitude}&lat=${latitude}`);
          const data = await res.json();
          if (data.features && data.features.length > 0) {
            const props = data.features[0].properties;
            const addressStr = [props.name, props.street, props.city, props.country]
              .filter(Boolean)
              .join(', ');
            onChange(addressStr);
          } else {
            onChange(`Position GPS: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          }
        } catch (error) {
          console.error("Photon reverse error:", error);
          onChange(`Position GPS: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        } finally {
          setIsLocating(false);
          setShowDropdown(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Impossible de récupérer votre position.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="relative flex items-center w-full">
        <Input
          id={id}
          name={name}
          required={required}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setShowDropdown(true);
            if (onCoordinatesChange) onCoordinatesChange(null); // Reset coords if manually changed
          }}
          placeholder="Ex: Bamako, ACI 2000..."
          className="h-12 rounded-xl border-white/50 border-2 bg-transparent focus:ring-2 focus:ring-[#00D632] focus:ring-offset-0 transition-all pr-12 w-full"
          autoComplete="off"
        />
        <button
          type="button"
          onClick={handleGPSLocation}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg bg-white/60 hover:bg-[#00D632]/20 hover:text-[#00D632] transition-colors"
          title="Utiliser ma position GPS"
          disabled={isLocating}
        >
          {isLocating ? (
            <div className="w-4 h-4 border-2 border-[#00D632] border-t-transparent rounded-full animate-spin" />
          ) : (
            <Navigation className="w-4 h-4 text-gray-500 hover:text-[#00D632] transition-colors" />
          )}
        </button>
      </div>

      {showDropdown && suggestions.length > 0 && (
        <div className="absolute z-[100] w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl max-h-60 overflow-y-auto custom-scrollbar">
          {suggestions.map((feature, idx) => {
            const props = feature.properties;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelect(feature)}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 flex items-start gap-3 transition-colors"
              >
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900">
                    {props.name || props.street || props.city}
                  </span>
                  <span className="text-xs text-gray-500">
                    {[props.city, props.state, props.country].filter(Boolean).join(', ')}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
