import { useEffect, useRef } from 'react';

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

  useEffect(() => {
    const loadYandexMaps = () => {
      if (document.getElementById('yandex-maps-script')) {
        initMap();
        return;
      }

      const script = document.createElement('script');
      script.id = 'yandex-maps-script';
      script.src = 'https://api-maps.yandex.ru/2.1/?apikey=&lang=ru_RU';
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
  }, [places, center, zoom, onPlaceClick]);

  return (
    <div ref={mapRef} className="w-full h-full min-h-[400px] rounded-lg" />
  );
}
