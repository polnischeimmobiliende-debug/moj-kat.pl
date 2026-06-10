import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { type Property } from '../lib/types';
import { PropertyCard } from '../components/PropertyCard';
import { Heart } from 'lucide-react';
import { Link, navigate } from '../components/Router';

export function FavoritesPage() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    setLoading(true);

    (async () => {
      const { data: favs } = await supabase
        .from('favorites')
        .select('property_id')
        .eq('user_id', user.id);

      if (favs && favs.length > 0) {
        const ids = favs.map(f => f.property_id);

        const { data } = await supabase
          .from('properties')
          .select('*')
          .in('id', ids);

        if (data) setProperties(data as Property[]);
        else setProperties([]);
      } else {
        setProperties([]);
      }

      setLoading(false);
    })();
  }, [user]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user]);

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Ulubione oferty
      </h1>

      <p className="text-gray-500 text-sm mb-8">
        {properties.length}{' '}
        {properties.length === 1
          ? 'oferta'
          : properties.length < 5
          ? 'oferty'
          : 'ofert'}
      </p>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl overflow-hidden border border-gray-100 animate-pulse"
            >
              <div className="aspect-[4/3] bg-gray-200" />
              <div className="p-4 space-y-3">
                <div className="h-5 bg-gray-200 rounded w-2/3" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : properties.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {properties.map(p => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
          <Heart className="w-16 h-16 mx-auto text-gray-200 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            Brak ulubionych ofert
          </h3>
          <p className="text-gray-400 text-sm mb-4">
            Kliknij ikonę serca przy ofercie, aby ją zapisać
          </p>
          <Link
            to="/search"
            className="text-teal-600 font-medium hover:underline no-underline text-sm"
          >
            Przeglądaj oferty
          </Link>
        </div>
      )}
    </div>
  );
}