import { useEffect, useRef, useState } from 'react';

interface Place {
  name: string;
  coordinates?: {
    lat: number;
    lon: number;
  };
}

interface LeisureMapProps {
  places: Place[];
  center?: [number, number];
  zoom?: number;
  onPlaceClick?: (place: Place) => void;
}

declare global {
  interface Window {
    ymaps: any;
  }
}

export function LeisureMap({ places, center = [55.7558, 37.6173], zoom = 10, onPlaceClick }: LeisureMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const [apiKey, setApiKey] = useState<string>('');

  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const response = await fetch('https://functions.poehali.dev/343f0236-3163-4243-89e9-fc7d1bd7dde7');
        const data = await response.json();
        setApiKey(data.apiKey || '');
      } catch (error) {
        console.error('Error loading Yandex Maps API key:', error);
      }
    };

    fetchApiKey();
  }, []);

  useEffect(() => {
    if (!apiKey) return;

    const loadYandexMaps = () => {
      if (document.getElementById('yandex-maps-script')) {
        initMap();
        return;
      }

      const script = document.createElement('script');
      script.id = 'yandex-maps-script';
      script.src = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=ru_RU`;
      script.async = true;
      script.onload = () => {
        window.ymaps.ready(initMap);
      };
      document.body.appendChild(script);
    };

    const initMap = () => {
      if (!mapRef.current || !window.ymaps) return;

      if (mapInstance.current) {
        mapInstance.current.destroy();
      }

      mapInstance.current = new window.ymaps.Map(mapRef.current, {
        center,
        zoom,
        controls: ['zoomControl', 'geolocationControl']
      });

      places.forEach((place) => {
        if (place.coordinates) {
          const placemark = new window.ymaps.Placemark(
            [place.coordinates.lat, place.coordinates.lon],
            {
              balloonContent: place.name,
              hintContent: place.name
            },
            {
              preset: 'islands#blueDotIcon'
            }
          );

          if (onPlaceClick) {
            placemark.events.add('click', () => onPlaceClick(place));
          }

          mapInstance.current.geoObjects.add(placemark);
        }
      });

      if (places.length > 0 && places[0].coordinates) {
        const bounds: [number, number][] = places
          .filter(p => p.coordinates)
          .map(p => [p.coordinates!.lat, p.coordinates!.lon]);
        
        if (bounds.length > 1) {
          mapInstance.current.setBounds(bounds, { checkZoomRange: true, zoomMargin: 50 });
        }
      }
    };

    loadYandexMaps();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.destroy();
        mapInstance.current = null;
      }
    };
  }, [places, center, zoom, onPlaceClick, apiKey]);

  return (
    <div ref={mapRef} className="w-full h-full min-h-[400px] rounded-lg" />
  );
}