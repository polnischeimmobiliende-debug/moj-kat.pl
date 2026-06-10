import { useState, useEffect } from 'react';
import { Link } from '../components/Router';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import {
  type Property,
  type Profile,
  formatPrice
} from '../lib/types';
import {
  MapPin,
  ChevronLeft,
  ChevronRight,
  Heart,
  ArrowLeft
} from 'lucide-react';

export function PropertyPage({ id }: { id: string }) {
  const { user } = useAuth();

  const [property, setProperty] = useState<Property | null>(null);
  const [owner, setOwner] = useState<Profile | null>(null);
  const [imgIndex, setImgIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    (async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error || !active) {
        setLoading(false);
        return;
      }

      if (data) {
        setProperty(data as Property);

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user_id)
          .maybeSingle();

        if (profile && active) {
          setOwner(profile as Profile);
        }
      }

      setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    if (!user || !property) return;

    let active = true;

    (async () => {
      const { data } = await supabase
        .from('favorites')
        .select('id')
        .eq('property_id', property.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (active) {
        setIsFavorite(!!data);
      }
    })();

    return () => {
      active = false;
    };
  }, [user, property]);

  const toggleFavorite = async () => {
    if (!user || !property) return;

    const next = !isFavorite;
    setIsFavorite(next);

    const res = next
      ? await supabase.from('favorites').insert({
          property_id: property.id,
          user_id: user.id
        })
      : await supabase
          .from('favorites')
          .delete()
          .eq('property_id', property.id)
          .eq('user_id', user.id);

    if (res.error) {
      setIsFavorite(!next);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-96 bg-gray-200 rounded-xl mb-6" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 mb-4">Nie znaleziono nieruchomości</p>
        <Link to="/search" className="text-teal-600 no-underline">
          Wróć do wyszukiwania
        </Link>
      </div>
    );
  }

  const images =
    property.images?.length
      ? property.images
      : [
          'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800'
        ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">

      <button onClick={() => window.history.back()} className="mb-4 text-sm text-gray-500">
        <ArrowLeft className="w-4 h-4 inline" /> Powrót
      </button>

      <div className="relative aspect-[16/9] bg-gray-100 rounded-xl overflow-hidden mb-8">
        <img src={images[imgIndex]} className="w-full h-full object-cover" />

        {images.length > 1 && (
          <>
            <button onClick={() => setImgIndex(i => (i - 1 + images.length) % images.length)}>
              <ChevronLeft />
            </button>

            <button onClick={() => setImgIndex(i => (i + 1) % images.length)}>
              <ChevronRight />
            </button>
          </>
        )}
      </div>

      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">{property.title}</h1>

        {user && (
          <button onClick={toggleFavorite}>
            <Heart className={isFavorite ? 'text-red-500 fill-red-500' : ''} />
          </button>
        )}
      </div>

      <p className="text-gray-500 flex items-center gap-1">
        <MapPin className="w-4 h-4" />
        {property.city}
      </p>

      <div className="text-xl font-bold mt-4">
        {formatPrice(property.price)}
      </div>
    </div>
  );
}