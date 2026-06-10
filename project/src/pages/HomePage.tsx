import { Link } from './Router';
import { Heart, MapPin, BedDouble, Maximize } from 'lucide-react';
import {
  type Property,
  formatPrice,
  formatArea,
  pricePerMeter,
  PROPERTY_TYPES,
  TRANSACTION_TYPES
} from '../lib/types';
import { useAuth } from '../hooks/useAuth';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

export function PropertyCard({ property }: { property: Property }) {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);

  const images =
    property.images?.length > 0
      ? property.images
      : [
          'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800'
        ];

  useEffect(() => {
    if (!user) return;

    let active = true;

    (async () => {
      const { data } = await supabase
        .from('favorites')
        .select('id')
        .eq('property_id', property.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (active) setIsFavorite(!!data);
    })();

    return () => {
      active = false;
    };
  }, [user, property.id]);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) return;

    const next = !isFavorite;
    setIsFavorite(next);

    if (next) {
      await supabase.from('favorites').insert({
        property_id: property.id,
        user_id: user.id
      });
    } else {
      await supabase
        .from('favorites')
        .delete()
        .eq('property_id', property.id)
        .eq('user_id', user.id);
    }
  };

  // ✅ SEO SAFE SLUG (DB FIRST, fallback only)
  const slug =
    (property as any).slug || slugify(property.title);

  return (
    <Link
      to={`/property/${property.id}/${slug}`}
      className="group block no-underline"
    >
      <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100">

        {/* IMAGE */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          <img
            src={images[imgIndex]}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* dots */}
          {images.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {images.slice(0, 5).map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setImgIndex(i);
                  }}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    i === imgIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}

          {/* tags */}
          <div className="absolute top-3 left-3 flex gap-2">
            <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-teal-600 text-white">
              {TRANSACTION_TYPES[property.transaction_type]}
            </span>
            <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-white/90 text-gray-700 backdrop-blur-sm">
              {PROPERTY_TYPES[property.property_type]}
            </span>
          </div>

          {/* favorite */}
          {user && (
            <button
              onClick={toggleFavorite}
              className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-colors"
            >
              <Heart
                className={`w-4 h-4 ${
                  isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-500'
                }`}
              />
            </button>
          )}
        </div>

        {/* CONTENT */}
        <div className="p-4">
          <div className="text-xl font-bold text-gray-900 mb-1">
            {formatPrice(property.price)}
          </div>

          {property.transaction_type === 'sale' && property.area > 0 && (
            <div className="text-xs text-gray-400 mb-2">
              {pricePerMeter(property.price, property.area)}
            </div>
          )}

          <h3 className="text-sm font-medium text-gray-800 mb-2 line-clamp-1">
            {property.title}
          </h3>

          <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">
              {property.city}
              {property.district ? `, ${property.district}` : ''}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs text-gray-500 pt-3 border-t border-gray-50">
            {property.area > 0 && (
              <div className="flex items-center gap-1">
                <Maximize className="w-3.5 h-3.5" />
                <span>{formatArea(property.area)}</span>
              </div>
            )}

            {property.rooms > 0 && (
              <div className="flex items-center gap-1">
                <BedDouble className="w-3.5 h-3.5" />
                <span>
                  {property.rooms}{' '}
                  {property.rooms === 1
                    ? 'pokój'
                    : property.rooms < 5
                    ? 'pokoje'
                    : 'pokoi'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}