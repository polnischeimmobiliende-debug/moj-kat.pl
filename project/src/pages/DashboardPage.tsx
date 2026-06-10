import { useState, useEffect } from 'react';
import { Link, navigate } from '../components/Router';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import {
  type Property,
  type Profile,
  formatPrice,
  formatArea,
  PROPERTY_TYPES,
  TRANSACTION_TYPES
} from '../lib/types';
import {
  User,
  Mail,
  Phone,
  CreditCard as Edit3,
  Trash2,
  List,
  Heart,
  PlusCircle,
  Building2,
  Pencil
} from 'lucide-react';

export function DashboardPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [myProperties, setMyProperties] = useState<Property[]>([]);
  const [favorites, setFavorites] = useState<Property[]>([]);
  const [tab, setTab] = useState<'listings' | 'favorites' | 'profile'>('listings');
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;

    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setProfile(data as Profile);
          setEditName(data.full_name);
          setEditPhone(data.phone);
        }
      });

    supabase
      .from('properties')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setMyProperties(data as Property[]);
      });

    loadFavorites();
  }, [user]);

  const loadFavorites = async () => {
    if (!user) return;

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

      if (data) setFavorites(data as Property[]);
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleSaveProfile = async () => {
    setSaving(true);

    await supabase
      .from('profiles')
      .update({
        full_name: editName,
        phone: editPhone,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    setProfile(prev =>
      prev ? { ...prev, full_name: editName, phone: editPhone } : null
    );

    setEditing(false);
    setSaving(false);
  };

  const handleDeleteProperty = async (id: string) => {
    if (!confirm('Czy na pewno chcesz usunąć to ogłoszenie?')) return;

    await supabase.from('properties').delete().eq('id', id);

    setMyProperties(prev => prev.filter(p => p.id !== id));
  };

  const tabs = [
    { key: 'listings' as const, label: 'Moje ogłoszenia', icon: List, count: myProperties.length },
    { key: 'favorites' as const, label: 'Ulubione', icon: Heart, count: favorites.length },
    { key: 'profile' as const, label: 'Profil', icon: User, count: 0 }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Moje konto</h1>
          <p className="text-gray-500 text-sm mt-1">{user.email}</p>
        </div>

        <Link
          to="/add"
          className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-colors text-sm no-underline"
        >
          <PlusCircle className="w-4 h-4" />
          Dodaj ogłoszenie
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-8">
        {tabs.map(({ key, label, icon: Icon, count }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              tab === key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{label}</span>
            {count > 0 && (
              <span className="bg-teal-100 text-teal-700 text-xs font-semibold px-1.5 py-0.5 rounded-md">
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Listings */}
      {tab === 'listings' && (
        <div className="space-y-4">
          {myProperties.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
              <Building2 className="w-12 h-12 mx-auto text-gray-200 mb-3" />
              <p className="text-gray-500 mb-4">Nie masz jeszcze żadnych ogłoszeń</p>
              <Link to="/add" className="text-teal-600 font-medium hover:underline no-underline text-sm">
                Dodaj pierwsze ogłoszenie
              </Link>
            </div>
          ) : (
            myProperties.map(p => (
              <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-4 flex gap-4 hover:shadow-sm transition-shadow">
                
                <Link
                  to={`/property/${p.id}/${encodeURIComponent(p.title || '')}`}
                  className="shrink-0 no-underline"
                >
                  <img
                    src={p.images?.[0] || 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=200'}
                    className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-lg"
                  />
                </Link>

                <div className="flex-1 min-w-0">
                  <Link
                    to={`/property/${p.id}/${encodeURIComponent(p.title || '')}`}
                    className="text-sm font-semibold text-gray-900 hover:text-teal-600 no-underline line-clamp-1"
                  >
                    {p.title}
                  </Link>

                  <div className="text-lg font-bold text-gray-900 mt-1">
                    {formatPrice(p.price)}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                    <span>{PROPERTY_TYPES[p.property_type]}</span>
                    <span>{TRANSACTION_TYPES[p.transaction_type]}</span>
                    <span>{formatArea(p.area)}</span>
                    <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${
                      p.status === 'active'
                        ? 'bg-green-50 text-green-600'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {p.status === 'active' ? 'Aktywne' : p.status}
                    </span>
                  </div>
                </div>

                <div className="flex gap-1 shrink-0">
                  <Link
                    to={`/edit/${p.id}`}
                    className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors no-underline"
                  >
                    <Pencil className="w-4 h-4" />
                  </Link>

                  <button
                    onClick={() => handleDeleteProperty(p.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Favorites */}
      {tab === 'favorites' && (
        <div className="space-y-4">
          {favorites.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
              <Heart className="w-12 h-12 mx-auto text-gray-200 mb-3" />
              <p className="text-gray-500 mb-4">Nie masz ulubionych ofert</p>
              <Link to="/search" className="text-teal-600 font-medium hover:underline no-underline text-sm">
                Przeglądaj oferty
              </Link>
            </div>
          ) : (
            favorites.map(p => (
              <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-4 flex gap-4 hover:shadow-sm transition-shadow">
                
                <Link
                  to={`/property/${p.id}/${encodeURIComponent(p.title || '')}`}
                  className="shrink-0 no-underline"
                >
                  <img
                    src={p.images?.[0] || 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=200'}
                    className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-lg"
                  />
                </Link>

                <div className="flex-1 min-w-0">
                  <Link
                    to={`/property/${p.id}/${encodeURIComponent(p.title || '')}`}
                    className="text-sm font-semibold text-gray-900 hover:text-teal-600 no-underline line-clamp-1"
                  >
                    {p.title}
                  </Link>

                  <div className="text-lg font-bold text-gray-900 mt-1">
                    {formatPrice(p.price)}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                    <span>{p.city}</span>
                    <span>{PROPERTY_TYPES[p.property_type]}</span>
                    <span>{formatArea(p.area)}</span>
                  </div>
                </div>

              </div>
            ))
          )}
        </div>
      )}

      {/* Profile */}
      {tab === 'profile' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-6">Dane profilu</h2>

          {editing ? (
            <div className="space-y-4">
              <input
                value={editName}
                onChange={e => setEditName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                placeholder="Imię i nazwisko"
              />

              <input
                value={editPhone}
                onChange={e => setEditPhone(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                placeholder="Telefon"
              />

              <div className="flex gap-3">
                <button
                  onClick={handleSaveProfile}
                  className="px-6 py-2.5 bg-teal-600 text-white rounded-xl text-sm"
                >
                  Zapisz
                </button>

                <button
                  onClick={() => setEditing(false)}
                  className="px-6 py-2.5 bg-gray-100 rounded-xl text-sm"
                >
                  Anuluj
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="text-teal-600 text-sm"
            >
              Edytuj profil
            </button>
          )}
        </div>
      )}
    </div>
  );
}