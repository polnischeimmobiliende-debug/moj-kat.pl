import { useState, useEffect, useRef } from 'react';
import { PropertyCard } from '../components/PropertyCard';
import { supabase } from '../lib/supabase';
import {
  type Property,
  PROPERTY_TYPES,
  TRANSACTION_TYPES
} from '../lib/types';
import { Search, SlidersHorizontal, Building2 } from 'lucide-react';

function useDebounce<T>(value: T, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debounced;
}

export function SearchPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const limit = 20;
  const pageRef = useRef(0);
  const requestRef = useRef(0);

  const [city, setCity] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [transactionType, setTransactionType] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [areaMin, setAreaMin] = useState('');
  const [areaMax, setAreaMax] = useState('');
  const [roomsMin, setRoomsMin] = useState('');
  const [roomsMax, setRoomsMax] = useState('');

  const debouncedCity = useDebounce(city);
  const debouncedPriceMin = useDebounce(priceMin);
  const debouncedPriceMax = useDebounce(priceMax);

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
    setCity(params.get('city') || '');
    setPropertyType(params.get('type') || '');
    setTransactionType(params.get('transaction') || '');
  }, []);

  useEffect(() => {
    setProperties([]);
    pageRef.current = 0;
    setHasMore(true);
    fetchMore(true);
  }, [
    debouncedCity,
    propertyType,
    transactionType,
    debouncedPriceMin,
    debouncedPriceMax,
    areaMin,
    areaMax,
    roomsMin,
    roomsMax
  ]);

  const fetchMore = async (reset = false) => {
    if (loadingMore && !reset) return;
    if (!hasMore && !reset) return;

    const currentRequest = ++requestRef.current;

    if (reset) {
      setLoading(true);
      pageRef.current = 0;
      setHasMore(true);
    } else {
      setLoadingMore(true);
    }

    const from = pageRef.current * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('properties')
      .select('*', { count: 'exact' })
      .eq('status', 'active')
      .range(from, to)
      .order('created_at', { ascending: false });

    if (debouncedCity) query = query.ilike('city', `%${debouncedCity}%`);
    if (propertyType) query = query.eq('property_type', propertyType);
    if (transactionType) query = query.eq('transaction_type', transactionType);
    if (debouncedPriceMin) query = query.gte('price', Number(debouncedPriceMin));
    if (debouncedPriceMax) query = query.lte('price', Number(debouncedPriceMax));
    if (areaMin) query = query.gte('area', Number(areaMin));
    if (areaMax) query = query.lte('area', Number(areaMax));
    if (roomsMin) query = query.gte('rooms', Number(roomsMin));
    if (roomsMax) query = query.lte('rooms', Number(roomsMax));

    const { data } = await query;

    if (currentRequest !== requestRef.current) return;

    const newItems = (data as Property[]) || [];

    setProperties(prev =>
      reset ? newItems : [...prev, ...newItems]
    );

    setHasMore(newItems.length === limit);
    pageRef.current += 1;

    setLoading(false);
    setLoadingMore(false);
  };

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!loadMoreRef.current) return;

    observerRef.current?.disconnect();

    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        fetchMore();
      }
    });

    const el = loadMoreRef.current;
    observerRef.current.observe(el);

    return () => observerRef.current?.disconnect();
  }, []);

  const clearFilters = () => {
    setCity('');
    setPropertyType('');
    setTransactionType('');
    setPriceMin('');
    setPriceMax('');
    setAreaMin('');
    setAreaMax('');
    setRoomsMin('');
    setRoomsMax('');
  };

  const hasActiveFilters =
    city ||
    propertyType ||
    transactionType ||
    priceMin ||
    priceMax ||
    areaMin ||
    areaMax ||
    roomsMin ||
    roomsMax;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Szukaj po mieście..."
            className="w-full pl-10 pr-4 py-3 border rounded-xl"
          />
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="px-4 py-3 border rounded-xl"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>

      {showFilters && (
        <div className="bg-white p-6 border rounded-xl mb-6">
          <div className="grid grid-cols-2 gap-4">

            <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)}>
              <option value="">Typ</option>
              {Object.entries(PROPERTY_TYPES).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>

            <select value={transactionType} onChange={(e) => setTransactionType(e.target.value)}>
              <option value="">Oferta</option>
              {Object.entries(TRANSACTION_TYPES).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>

          </div>
        </div>
      )}

      <div className="mb-4 text-sm text-gray-500">
        {loading ? 'Szukam...' : `${properties.length} ofert`}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map(p => (
          <PropertyCard key={p.id} property={p} />
        ))}
      </div>

      {(loading || loadingMore) && (
        <div className="text-center py-6 text-gray-400">
          Ładowanie...
        </div>
      )}

      {hasMore && (
        <div ref={loadMoreRef} className="h-10" />
      )}

      {!hasMore && properties.length > 0 && (
        <div className="text-center py-10 text-gray-400">
          Koniec wyników
        </div>
      )}

      {!loading && properties.length === 0 && (
        <div className="text-center py-20">
          <Building2 className="w-16 h-16 mx-auto text-gray-200 mb-4" />
          <h3 className="text-lg font-semibold">Brak wyników</h3>
        </div>
      )}
    </div>
  );
}