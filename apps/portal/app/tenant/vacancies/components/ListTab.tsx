'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Building2, MapPin, Heart, Layers, ChevronLeft, ChevronRight } from 'lucide-react';
import { VacancyProperty, DEFAULT_PLACEHOLDER } from '../types';

interface ListTabProps {
  sortedList: VacancyProperty[];
  paginatedList: VacancyProperty[];
  favorites: string[];
  toggleFavorite: (id: string, e: React.MouseEvent) => void;
  currentPage: number;
  setCurrentPage: (p: number) => void;
  totalPages: number;
  onClearFilters: () => void;
}

export default function ListTab({
  sortedList,
  paginatedList,
  favorites,
  toggleFavorite,
  currentPage,
  setCurrentPage,
  totalPages,
  onClearFilters
}: ListTabProps) {
  const router = useRouter();

  if (sortedList.length === 0) {
    return (
      <div className="text-center py-20 bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-2xl">
        <Building2 className="w-10 h-10 text-paper-300 dark:text-ink-600 mx-auto mb-2" />
        <h4 className="text-xs font-semibold text-paper-900 dark:text-white">No Vacancies Found</h4>
        <p className="text-[11px] text-paper-500 dark:text-ink-400 mt-1 max-w-sm mx-auto">
          No vacancy listings match your criteria. Try adjusting your radial search bounds or resetting your filter values.
        </p>
        <button 
          onClick={onClearFilters}
          className="mt-4 px-4 py-2 bg-coral-500 hover:bg-coral-600 text-white rounded-xl text-xs font-bold shadow transition-colors"
        >
          Clear All Filters
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Horizontal Stack Cards Layout - w-full grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
        {paginatedList.map(item => {
          const getUnitFallbackImage = (unitType: string): string => {
            const type = (unitType || '').toLowerCase();
            if (type.includes('single')) return '/fallback_single_room.png';
            if (type.includes('bedsitter') || type.includes('studio')) return '/fallback_bedsitter.png';
            if (type.includes('one-bedroom') || type.includes('1 bedroom') || type.includes('one bedroom')) return '/fallback_one_bedroom.png';
            if (type.includes('two-bedroom') || type.includes('2 bedroom') || type.includes('two bedroom')) return '/fallback_two_bedroom.png';
            return '/default_apartment.png';
          };
          const coverImg = item.images && item.images.length > 0 ? item.images[0] : getUnitFallbackImage(item.unitType);
          const inWishlist = favorites.includes(item.id);
          
          return (
            <div 
              key={item.id}
              onClick={() => router.push(`/tenant/vacancies/${item.id}`)}
              className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col group h-full"
            >
              {/* Card Image */}
              <div className="relative w-full h-44 bg-paper-100 dark:bg-ink-950 overflow-hidden">
                <img 
                  src={coverImg} 
                  alt={item.propertyName} 
                  className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent pointer-events-none" />
                
                {/* Wishlist overlay */}
                <button 
                  onClick={(e) => toggleFavorite(item.id, e)}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm transition-colors z-10"
                >
                  <Heart className={`w-3.5 h-3.5 ${inWishlist ? 'fill-coral-500 text-coral-500' : 'text-white'}`} />
                </button>

                {/* Price display in KSh (KES) */}
                <div className="absolute bottom-3 left-3 text-white font-extrabold text-sm drop-shadow-md">
                  KSh {item.rent.toLocaleString()} <span className="text-[9px] font-medium opacity-85">/ mo</span>
                </div>

                <div className="absolute top-3 left-3">
                  <span className="text-[8px] font-extrabold bg-blue-500 text-white px-2 py-0.5 rounded shadow">
                    VACANT
                  </span>
                </div>
              </div>

              {/* Info Area */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <h3 className="font-bold text-paper-900 dark:text-white text-sm truncate group-hover:text-coral-500 transition-colors">
                    {item.propertyName} - Unit {item.label}
                  </h3>
                  <p className="text-[10px] text-paper-500 dark:text-ink-400 flex items-center gap-1 truncate">
                    <MapPin className="w-3 h-3 text-coral-500 flex-shrink-0" /> {item.propertyAddress}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[8px] bg-paper-50 dark:bg-ink-950 border border-paper-150 dark:border-ink-800 text-paper-600 dark:text-ink-300 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                    <Layers className="w-2.5 h-2.5" /> Floor {item.floor}
                  </span>
                  <span className="text-[8px] bg-paper-50 dark:bg-ink-950 border border-paper-150 dark:border-ink-800 text-paper-600 dark:text-ink-300 px-1.5 py-0.5 rounded-md">
                    {item.unitType}
                  </span>
                </div>

                <div className="pt-3 border-t border-paper-100 dark:border-ink-800 flex items-center justify-between text-[9px] text-paper-400">
                  <span>County: {item.county || 'N/A'}</span>
                  <span className="text-coral-500 font-bold flex items-center gap-0.5">
                    Details &rarr;
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            className="p-1.5 rounded-lg border border-paper-200 dark:border-ink-800 text-paper-600 dark:text-ink-300 hover:bg-paper-100 dark:hover:bg-ink-800 transition-colors disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <span className="text-xs text-paper-555">
            Page {currentPage} of {totalPages}
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
            className="p-1.5 rounded-lg border border-paper-200 dark:border-ink-800 text-paper-600 dark:text-ink-300 hover:bg-paper-100 dark:hover:bg-ink-800 transition-colors disabled:opacity-40"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
