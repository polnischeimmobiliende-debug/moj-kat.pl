import { useState } from 'react';
import { navigate } from '../components/Router';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import {
  PROPERTY_TYPES,
  TRANSACTION_TYPES,
  PARKING_TYPES,
  BUILDING_TYPES,
  HEATING_TYPES
} from '../lib/types';

export function AddPropertyPage() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    property_type: 'apartment',
    transaction_type: 'sale',
    price: '',
    area: '',
    rooms: '',
    city: '',
    district: '',
    street: '',
    images: '',
    furnished: false,
    floor: '',
    total_floors: '',
    construction_year: '',
    building_type: '',
    heating_type: '',
    parking: ''
  });

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleChange = (key: string, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await supabase.from('properties').insert({
      user_id: user.id,
      title: form.title,
      description: form.description,
      property_type: form.property_type,
      transaction_type: form.transaction_type,
      price: Number(form.price),
      area: Number(form.area),
      rooms: Number(form.rooms),
      city: form.city,
      district: form.district || null,
      street: form.street || null,
      images: form.images
        ? form.images.split(',').map(i => i.trim())
        : [],
      furnished: form.furnished,
      floor: form.floor ? Number(form.floor) : null,
      total_floors: form.total_floors ? Number(form.total_floors) : null,
      construction_year: form.construction_year
        ? Number(form.construction_year)
        : null,
      building_type: form.building_type || null,
      heating_type: form.heating_type || null,
      parking: form.parking || null,
      status: 'active'
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    navigate('/dashboard');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Dodaj ogłoszenie</h1>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl border">

        {error && (
          <div className="p-3 bg-red-50 text-red-600 rounded">
            {error}
          </div>
        )}

        <input
          placeholder="Tytuł"
          value={form.title}
          onChange={e => handleChange('title', e.target.value)}
          className="w-full p-3 border rounded"
          required
        />

        <textarea
          placeholder="Opis"
          value={form.description}
          onChange={e => handleChange('description', e.target.value)}
          className="w-full p-3 border rounded"
          rows={4}
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <select
            value={form.property_type}
            onChange={e => handleChange('property_type', e.target.value)}
            className="p-3 border rounded"
          >
            {Object.entries(PROPERTY_TYPES).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>

          <select
            value={form.transaction_type}
            onChange={e => handleChange('transaction_type', e.target.value)}
            className="p-3 border rounded"
          >
            {Object.entries(TRANSACTION_TYPES).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <input
            type="number"
            placeholder="Cena"
            value={form.price}
            onChange={e => handleChange('price', e.target.value)}
            className="p-3 border rounded"
            required
          />

          <input
            type="number"
            placeholder="Metraż"
            value={form.area}
            onChange={e => handleChange('area', e.target.value)}
            className="p-3 border rounded"
            required
          />

          <input
            type="number"
            placeholder="Pokoje"
            value={form.rooms}
            onChange={e => handleChange('rooms', e.target.value)}
            className="p-3 border rounded"
            required
          />
        </div>

        <input
          placeholder="Miasto"
          value={form.city}
          onChange={e => handleChange('city', e.target.value)}
          className="w-full p-3 border rounded"
          required
        />

        <input
          placeholder="Dzielnica (opcjonalnie)"
          value={form.district}
          onChange={e => handleChange('district', e.target.value)}
          className="w-full p-3 border rounded"
        />

        <input
          placeholder="Ulica (opcjonalnie)"
          value={form.street}
          onChange={e => handleChange('street', e.target.value)}
          className="w-full p-3 border rounded"
        />

        <input
          placeholder="Zdjęcia (URL, oddziel przecinkiem)"
          value={form.images}
          onChange={e => handleChange('images', e.target.value)}
          className="w-full p-3 border rounded"
        />

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.furnished}
            onChange={e => handleChange('furnished', e.target.checked)}
          />
          Umeblowane
        </label>

        <button
          disabled={loading}
          className="w-full bg-teal-600 text-white p-3 rounded font-semibold"
        >
          {loading ? 'Dodawanie...' : 'Dodaj ogłoszenie'}
        </button>
      </form>
    </div>
  );
}