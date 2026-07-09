'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Building2, 
  MapPin, 
  Calendar, 
  MessageSquare, 
  Heart, 
  Check, 
  ChevronLeft, 
  ChevronRight,
  Phone, 
  Mail, 
  ArrowLeft,
  DollarSign,
  Compass,
  Clock,
  Layers,
  ZoomIn,
  ZoomOut,
  BadgeCheck,
  Building,
  Info,
  Star,
  Flag,
  SearchX
} from 'lucide-react';
import { useTenant } from '../../TenantContext';

interface VacancyDetail {
  id: string;
  unitId: string;
  label: string;
  rent: number;
  deposit: number;
  moveInFees: number;
  moveInFeeDetails: string;
  recurringFees: number;
  recurringFeeDetails: string;
  images: string[];
  floor: string;
  unitType: string;
  propertyId: string;
  propertyName: string;
  propertyAddress: string;
  county: string;
  subcounty: string;
  latitude: number;
  longitude: number;
  amenities: string[];
  rules: string[];
  agent: {
    name: string;
    email: string;
    phone: string;
    image: string;
  };
}

const DEFAULT_PLACEHOLDER = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80';

const getUnitFallbackImage = (unitType: string): string => {
  const type = (unitType || '').toLowerCase();
  if (type.includes('single')) return '/fallback_single_room.png';
  if (type.includes('bedsitter') || type.includes('studio')) return '/fallback_bedsitter.png';
  if (type.includes('one-bedroom') || type.includes('1 bedroom') || type.includes('one bedroom')) return '/fallback_one_bedroom.png';
  if (type.includes('two-bedroom') || type.includes('2 bedroom') || type.includes('two bedroom')) return '/fallback_two_bedroom.png';
  return '/default_apartment.png';
};

function formatFeeDetails(detailsString: string) {
  if (!detailsString) return '';
  try {
    const parsed = typeof detailsString === 'string' ? JSON.parse(detailsString) : detailsString;
    if (Array.isArray(parsed)) {
      return parsed.map(f => `${f.name} (KSh ${f.amount.toLocaleString()})`).join(', ');
    }
  } catch (e) {
    // fallback if JSON parsing fails
  }
  return detailsString;
}

function getDistanceInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 9999;
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export default function VacancyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { profile } = useTenant();

  const [vacancy, setVacancy] = useState<VacancyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isReporting, setIsReporting] = useState(false);

  // Forms
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [tourDate, setTourDate] = useState('');
  const [tourTime, setTourTime] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [submittingTour, setSubmittingTour] = useState(false);
  const [submittingInquiry, setSubmittingInquiry] = useState(false);

  // Mock related vacancies
  const [otherInProperty, setOtherInProperty] = useState<VacancyDetail[]>([]);
  const [nearbyVacancies, setNearbyVacancies] = useState<VacancyDetail[]>([]);

  // Leaflet references
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  useEffect(() => {
    async function loadVacancy() {
      try {
        const [resSingle, resAll] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/vacancies/${id}`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/vacancies`)
        ]);

        if (resSingle.ok) {
          const data: VacancyDetail = await resSingle.json();
          setVacancy(data);

          if (resAll.ok) {
            const allData: VacancyDetail[] = await resAll.json();
            setOtherInProperty(allData.filter(v => v.propertyId === data.propertyId && v.unitId !== data.unitId));
            
            const nearby = allData.filter(v => 
              v.propertyId !== data.propertyId && 
              getDistanceInKm(data.latitude, data.longitude, v.latitude, v.longitude) <= 5 && 
              v.unitId !== data.unitId
            );
            setNearbyVacancies(nearby);
          }
        } else {
          console.error("Vacancy not found");
        }
      } catch (err) {
        console.error("Error loading vacancy details:", err);
      } finally {
        setLoading(false);
      }
    }
    if (id) {
      loadVacancy();
    }
  }, [id]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if ((window as any).L) {
      setLeafletLoaded(true);
      return;
    }

    if (!document.getElementById('leaflet-css-cdn')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css-cdn';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = () => setLeafletLoaded(true);
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (!leafletLoaded || !vacancy || !mapRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    if (mapInstance.current) {
      mapInstance.current.remove();
      mapInstance.current = null;
    }

    const lat = vacancy.latitude || -1.2921;
    const lng = vacancy.longitude || 36.8219;

    const map = L.map(mapRef.current, {
      zoomControl: false
    }).setView([lat, lng], 14);

    // Standard map design
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    const customIcon = L.divIcon({
      className: 'custom-detail-pin',
      html: `<div style="background-color: #ef4444; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });

    L.marker([lat, lng], { icon: customIcon }).addTo(map);
    mapInstance.current = map;

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [leafletLoaded, vacancy]);

  const handleZoomIn = () => {
    if (mapInstance.current) mapInstance.current.zoomIn();
  };
  const handleZoomOut = () => {
    if (mapInstance.current) mapInstance.current.zoomOut();
  };

  const handleRequestTour = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vacancy || !tourDate || !tourTime) return;
    setSubmittingTour(true);
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/vacancies/inquire`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          unitId: vacancy.unitId,
          type: 'tour',
          tourDate,
          tourTime,
          tenantId: profile?.id || 'GUEST',
          tenantName: profile?.name || 'Anonymous Resident',
          tenantEmail: profile?.email || 'guest@landlord.nl',
        }),
      });

      if (res.ok) {
        setActionSuccess('Tour request submitted! The owner has been notified.');
        setTourDate('');
        setTourTime('');
      } else {
        setActionSuccess('Failed to submit tour request. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setActionSuccess('Network error. Failed to submit tour request.');
    } finally {
      setSubmittingTour(false);
    }
    
    setTimeout(() => setActionSuccess(null), 5000);
  };

  const handleSendInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vacancy || !inquiryMessage.trim()) return;
    setSubmittingInquiry(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/vacancies/inquire`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          unitId: vacancy.unitId,
          type: 'message',
          message: inquiryMessage,
          tenantId: profile?.id || 'GUEST',
          tenantName: profile?.name || 'Anonymous Resident',
          tenantEmail: profile?.email || 'guest@landlord.nl',
        }),
      });

      if (res.ok) {
        setActionSuccess('Inquiry sent successfully! The agent will reach out soon.');
        setInquiryMessage('');
      } else {
        setActionSuccess('Failed to send inquiry. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setActionSuccess('Network error. Failed to send inquiry.');
    } finally {
      setSubmittingInquiry(false);
    }

    setTimeout(() => setActionSuccess(null), 5000);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-paper-200 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!vacancy) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center">
        <h2 className="text-lg font-semibold text-paper-900 dark:text-white">Vacancy Not Found</h2>
        <p className="text-sm text-paper-700 dark:text-ink-400 mt-2">The requested property listing could not be found or has been taken down.</p>
        <button 
          onClick={() => router.push('/tenant/vacancies')}
          className="mt-6 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition-colors"
        >
          Back to Listings
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto w-full pb-24 relative z-10 font-sans">
      
      {/* Header Bar */}
      <div className="px-4 md:px-6 py-4 flex items-center justify-between border-b border-paper-200 dark:border-ink-800 bg-white/50 dark:bg-ink-950/50 backdrop-blur-sm sticky top-0 z-50">
        <button 
          onClick={() => router.push('/tenant/vacancies')}
          className="flex items-center gap-2 text-sm text-paper-700 hover:text-paper-900 dark:text-ink-300 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Listings
        </button>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsFavorite(!isFavorite)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-paper-100 dark:hover:bg-ink-800 transition-colors text-sm text-paper-700 dark:text-ink-300"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
            {isFavorite ? 'Saved' : 'Save'}
          </button>
          <button 
            onClick={() => setIsReporting(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-paper-100 dark:hover:bg-ink-800 transition-colors text-sm text-paper-700 dark:text-ink-300"
          >
            <Flag className="w-4 h-4" />
            Report
          </button>
        </div>
      </div>

      <div className="px-4 md:px-6 pt-6 space-y-8">
        
        {/* Clean Hero Image Gallery */}
        <div className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden bg-paper-100 dark:bg-ink-900 group">
          <img 
            src={vacancy.images[activeImageIndex] || getUnitFallbackImage(vacancy.unitType)} 
            alt={vacancy.propertyName} 
            className="w-full h-full object-cover transition-transform duration-700"
          />
          
          <div className="absolute top-4 left-4 bg-white/90 dark:bg-ink-900/90 backdrop-blur-md px-3 py-1 rounded-md text-xs font-semibold text-paper-900 dark:text-white shadow-sm flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Available Now
          </div>

          {vacancy.images.length > 1 && (
            <>
              <button 
                onClick={(e) => { e.stopPropagation(); setActiveImageIndex(prev => (prev - 1 + vacancy.images.length) % vacancy.images.length); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 dark:bg-ink-900/80 hover:bg-white dark:hover:bg-ink-800 text-paper-900 dark:text-white shadow-sm transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setActiveImageIndex(prev => (prev + 1) % vacancy.images.length); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 dark:bg-ink-900/80 hover:bg-white dark:hover:bg-ink-800 text-paper-900 dark:text-white shadow-sm transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-white/80 dark:bg-ink-900/80 backdrop-blur-md rounded-xl shadow-sm overflow-x-auto max-w-[90%] hide-scrollbar">
                {vacancy.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-14 h-14 rounded-lg overflow-hidden shrink-0 transition-opacity ${
                      activeImageIndex === idx ? 'ring-2 ring-blue-500' : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} className="w-full h-full object-cover" alt="" />
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Refined Header Details */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-8 border-b border-paper-200 dark:border-ink-800">
          <div className="flex-1 space-y-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold text-paper-900 dark:text-white mb-2">
                {vacancy.propertyName} — Unit {vacancy.label}
              </h1>
              <p className="text-paper-700 dark:text-ink-300 text-sm md:text-base flex items-center gap-2">
                <MapPin className="w-4 h-4 text-paper-500 dark:text-ink-400" />
                {vacancy.propertyAddress}, {vacancy.subcounty}, {vacancy.county}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1.5 bg-paper-100 dark:bg-ink-800 text-paper-700 dark:text-ink-300 rounded-md text-sm font-medium flex items-center gap-1.5 border border-paper-200 dark:border-ink-700">
                <Building className="w-4 h-4" /> {vacancy.unitType}
              </span>
              <span className="px-3 py-1.5 bg-paper-100 dark:bg-ink-800 text-paper-700 dark:text-ink-300 rounded-md text-sm font-medium flex items-center gap-1.5 border border-paper-200 dark:border-ink-700">
                <Layers className="w-4 h-4" /> Floor {vacancy.floor}
              </span>
              <span className="px-3 py-1.5 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-500 rounded-md text-sm font-medium flex items-center gap-1.5 border border-yellow-200 dark:border-yellow-700/30">
                <Star className="w-4 h-4 fill-current" /> 4.8 Rating
              </span>
            </div>
          </div>

          <div className="w-full md:w-auto p-5 bg-paper-50 dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-xl">
            <p className="text-xs text-paper-700 dark:text-ink-400 font-medium uppercase tracking-wider mb-1">Monthly Rent</p>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-medium text-paper-700 dark:text-ink-300">KSh</span>
              <span className="text-3xl md:text-4xl font-semibold text-paper-900 dark:text-white">
                {vacancy.rent.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Financial Overview */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-paper-900 dark:text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-paper-500 dark:text-ink-400" />
                Financial Breakdown
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 p-5 rounded-xl">
                  <h4 className="text-xs font-semibold text-paper-700 dark:text-ink-400 uppercase tracking-wider mb-4 border-b border-paper-200 dark:border-ink-700 pb-2">Move-In Costs</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-paper-700 dark:text-ink-300">Security Deposit</span>
                      <span className="font-medium text-paper-900 dark:text-white">KSh {vacancy.deposit.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-paper-700 dark:text-ink-300">One-time Fees</span>
                      <span className="font-medium text-paper-900 dark:text-white">KSh {vacancy.moveInFees.toLocaleString()}</span>
                    </div>
                  </div>
                  {vacancy.moveInFeeDetails && (
                    <p className="text-xs text-paper-700 dark:text-ink-400 mt-4 pt-3 border-t border-dashed border-paper-200 dark:border-ink-700 leading-relaxed">
                      Includes: {formatFeeDetails(vacancy.moveInFeeDetails)}
                    </p>
                  )}
                </div>

                <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 p-5 rounded-xl">
                  <h4 className="text-xs font-semibold text-paper-700 dark:text-ink-400 uppercase tracking-wider mb-4 border-b border-paper-200 dark:border-ink-700 pb-2">Recurring Monthly</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-paper-700 dark:text-ink-300">Base Rent</span>
                      <span className="font-medium text-paper-900 dark:text-white">KSh {vacancy.rent.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-paper-700 dark:text-ink-300">Extra Fees</span>
                      <span className="font-medium text-paper-900 dark:text-white">KSh {vacancy.recurringFees.toLocaleString()}</span>
                    </div>
                  </div>
                  {vacancy.recurringFeeDetails && (
                    <p className="text-xs text-paper-700 dark:text-ink-400 mt-4 pt-3 border-t border-dashed border-paper-200 dark:border-ink-700 leading-relaxed">
                      Includes: {formatFeeDetails(vacancy.recurringFeeDetails)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Features & Rules */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-paper-900 dark:text-white flex items-center gap-2">
                  <Check className="w-5 h-5 text-paper-500 dark:text-ink-400" />
                  Amenities
                </h3>
                {vacancy.amenities && vacancy.amenities.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {vacancy.amenities.map((item, idx) => (
                      <span key={idx} className="px-3 py-1.5 bg-paper-50 dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-md text-sm text-paper-800 dark:text-ink-200">
                        {item}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-paper-700 dark:text-ink-400">No amenities listed.</p>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-paper-900 dark:text-white flex items-center gap-2">
                  <Info className="w-5 h-5 text-paper-500 dark:text-ink-400" />
                  House Rules
                </h3>
                {vacancy.rules && vacancy.rules.length > 0 ? (
                  <ul className="space-y-2">
                    {vacancy.rules.map((rule, idx) => (
                      <li key={idx} className="text-sm text-paper-800 dark:text-ink-200 flex items-start gap-2">
                        <span className="text-paper-400 dark:text-ink-500 mt-0.5">•</span> {rule}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-paper-700 dark:text-ink-400">No house rules listed.</p>
                )}
              </div>
            </div>

            {/* Standard Leaflet Map */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-paper-900 dark:text-white flex items-center gap-2">
                  <Compass className="w-5 h-5 text-paper-500 dark:text-ink-400" />
                  Location
                </h3>
                <div className="flex items-center gap-2">
                  <button onClick={handleZoomIn} className="p-1.5 border border-paper-200 dark:border-ink-700 rounded-md hover:bg-paper-50 dark:hover:bg-ink-800 transition-colors">
                    <ZoomIn className="w-4 h-4 text-paper-700 dark:text-ink-300" />
                  </button>
                  <button onClick={handleZoomOut} className="p-1.5 border border-paper-200 dark:border-ink-700 rounded-md hover:bg-paper-50 dark:hover:bg-ink-800 transition-colors">
                    <ZoomOut className="w-4 h-4 text-paper-700 dark:text-ink-300" />
                  </button>
                </div>
              </div>
              <div className="w-full h-80 bg-paper-100 dark:bg-ink-900 rounded-xl overflow-hidden border border-paper-200 dark:border-ink-700 relative">
                {!leafletLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center text-sm text-paper-700 dark:text-ink-400">
                    Loading map...
                  </div>
                )}
                <div ref={mapRef} className="w-full h-full" />
              </div>
            </div>

          </div>

          {/* Right Column: Agent & Actions */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Agent Info */}
            <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-xl p-6">
              <div className="flex items-center gap-4 mb-4">
                <img 
                  src={vacancy.agent.image || 'https://placehold.co/48x48/3b82f6/ffffff?text=AG'} 
                  alt={vacancy.agent.name} 
                  className="w-12 h-12 rounded-full border border-paper-200 dark:border-ink-700 object-cover" 
                />
                <div>
                  <h3 className="text-sm font-semibold text-paper-900 dark:text-white flex items-center gap-1.5">
                    {vacancy.agent.name} <BadgeCheck className="w-4 h-4 text-blue-500" />
                  </h3>
                  <p className="text-xs text-paper-700 dark:text-ink-400">Property Representative</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <a href={`mailto:${vacancy.agent.email}`} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-paper-50 dark:bg-ink-900 hover:bg-paper-100 dark:hover:bg-ink-950 border border-paper-200 dark:border-ink-700 rounded-lg text-sm text-paper-800 dark:text-ink-200 transition-colors">
                  <Mail className="w-4 h-4" /> Email Agent
                </a>
                {vacancy.agent.phone && (
                  <a href={`tel:${vacancy.agent.phone}`} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-paper-50 dark:bg-ink-900 hover:bg-paper-100 dark:hover:bg-ink-950 border border-paper-200 dark:border-ink-700 rounded-lg text-sm text-paper-800 dark:text-ink-200 transition-colors">
                    <Phone className="w-4 h-4" /> Call Agent
                  </a>
                )}
              </div>
            </div>

            {/* Action Forms */}
            <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-xl p-6 space-y-6">
              
              {actionSuccess && (
                <div className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 text-sm p-3 rounded-lg flex items-start gap-2">
                  <Check className="w-5 h-5 shrink-0" />
                  <p>{actionSuccess}</p>
                </div>
              )}

              <form onSubmit={handleRequestTour} className="space-y-4">
                <h4 className="text-sm font-semibold text-paper-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-paper-500 dark:text-ink-400" />
                  Schedule Tour
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <input 
                    type="date" required value={tourDate} onChange={e => setTourDate(e.target.value)}
                    className="w-full bg-paper-50 dark:bg-ink-900 border border-paper-200 dark:border-ink-700 text-sm p-2.5 rounded-lg text-paper-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                  <input 
                    type="time" required value={tourTime} onChange={e => setTourTime(e.target.value)}
                    className="w-full bg-paper-50 dark:bg-ink-900 border border-paper-200 dark:border-ink-700 text-sm p-2.5 rounded-lg text-paper-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
                <button 
                  type="submit" disabled={submittingTour}
                  className="w-full py-2.5 bg-paper-900 hover:bg-black dark:bg-white dark:hover:bg-paper-100 text-white dark:text-paper-900 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  {submittingTour ? 'Processing...' : 'Request Appointment'}
                </button>
              </form>

              <div className="border-t border-paper-200 dark:border-ink-700"></div>

              <form onSubmit={handleSendInquiry} className="space-y-4">
                <h4 className="text-sm font-semibold text-paper-900 dark:text-white flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-paper-500 dark:text-ink-400" />
                  Send Inquiry
                </h4>
                <textarea 
                  rows={3} required placeholder="Have a question?" value={inquiryMessage} onChange={e => setInquiryMessage(e.target.value)}
                  className="w-full bg-paper-50 dark:bg-ink-900 border border-paper-200 dark:border-ink-700 text-sm p-3 rounded-lg text-paper-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                />
                <button 
                  type="submit" disabled={submittingInquiry}
                  className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  {submittingInquiry ? 'Sending...' : 'Send Message'}
                </button>
              </form>

            </div>
          </div>
        </div>

        {/* Bottom Sections: Other Vacancies */}
        <div className="pt-8 space-y-12">
          
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-paper-900 dark:text-white">
              Other Vacancies at {vacancy.propertyName}
            </h3>
            {otherInProperty.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {otherInProperty.map(v => (
                  <div key={v.id} onClick={() => router.push(`/tenant/vacancies/${v.id}`)} className="cursor-pointer group bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-xl overflow-hidden hover:shadow-md transition-all">
                    <div className="h-40 overflow-hidden relative bg-paper-100 dark:bg-ink-900">
                      <img src={v.images[0] || getUnitFallbackImage(v.unitType)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={v.propertyName} />
                      <div className="absolute bottom-2 left-2 bg-white/90 dark:bg-ink-900/90 text-paper-900 dark:text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">KSh {v.rent.toLocaleString()}</div>
                    </div>
                    <div className="p-4 space-y-1">
                      <h4 className="text-sm font-semibold text-paper-900 dark:text-white truncate">{v.propertyName} - {v.label}</h4>
                      <p className="text-xs text-paper-500 dark:text-ink-400 flex items-center gap-1"><Layers className="w-3 h-3" /> {v.unitType} • {v.floor}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 border border-dashed border-paper-200 dark:border-ink-700 rounded-2xl flex flex-col items-center justify-center text-center bg-paper-50/50 dark:bg-ink-900/50">
                <SearchX className="w-10 h-10 text-paper-400 dark:text-ink-500 mb-3" />
                <h4 className="text-base font-medium text-paper-900 dark:text-white">No Other Units Available</h4>
                <p className="text-sm text-paper-700 dark:text-ink-400 mt-1 max-w-sm">This is currently the only available unit listed at this property.</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-paper-900 dark:text-white">
              Similar Listings Nearby
            </h3>
            {nearbyVacancies.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {nearbyVacancies.map(v => (
                  <div key={v.id} onClick={() => router.push(`/tenant/vacancies/${v.id}`)} className="cursor-pointer group bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-xl overflow-hidden hover:shadow-md transition-all">
                    <div className="h-40 overflow-hidden relative bg-paper-100 dark:bg-ink-900">
                      <img src={v.images[0] || getUnitFallbackImage(v.unitType)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={v.propertyName} />
                      <div className="absolute bottom-2 left-2 bg-white/90 dark:bg-ink-900/90 text-paper-900 dark:text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">KSh {v.rent.toLocaleString()}</div>
                    </div>
                    <div className="p-4 space-y-1">
                      <h4 className="text-sm font-semibold text-paper-900 dark:text-white truncate">{v.propertyName} - {v.label}</h4>
                      <p className="text-xs text-paper-500 dark:text-ink-400 flex items-center gap-1"><MapPin className="w-3 h-3" /> {v.subcounty}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 border border-dashed border-paper-200 dark:border-ink-700 rounded-2xl flex flex-col items-center justify-center text-center bg-paper-50/50 dark:bg-ink-900/50">
                <Compass className="w-10 h-10 text-paper-400 dark:text-ink-500 mb-3" />
                <h4 className="text-base font-medium text-paper-900 dark:text-white">No Nearby Matches</h4>
                <p className="text-sm text-paper-700 dark:text-ink-400 mt-1 max-w-sm">We couldn't find any other properties listed within a 5km radius.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
