import React, { useState, useEffect, useMemo } from 'react';
import { Filter, X, RefreshCw, BarChart3, MapPin, Building, Target, Users, DollarSign, ChevronDown, ChevronUp } from 'lucide-react';
import { StoreData, FilterConfig, STRATEGY_DEFINITIONS, SelectionStrategy, StrategyConfiguration } from '../types';
import { getUniqueValues } from '../data/sampleStores';
import { PerformanceAnalyzer } from '../utils/strategyEngine';
import { InteractiveChart } from './InteractiveChart';
import { StrategyConfigurator } from './StrategyConfigurator';

interface FilterSystemProps {
  stores: StoreData[];
  filters: FilterConfig;
  onFiltersChange: (filters: FilterConfig) => void;
  strategy: SelectionStrategy;
  onStrategyChange: (strategy: SelectionStrategy) => void;
  strategyConfig?: StrategyConfiguration;
  onStrategyConfigChange?: (config: StrategyConfiguration) => void;
  onNext: () => void;
  onBack: () => void;
}

interface FilterChipProps {
  label: string;
  value: string;
  onRemove: () => void;
}

const FilterChip: React.FC<FilterChipProps> = ({ label, value, onRemove }) => (
  <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-content-100 text-content-800">
    <span className="mr-2">{label}: {value}</span>
    <button onClick={onRemove} className="hover:text-content-900">
      <X size={14} />
    </button>
  </div>
);

const FilterSystemComponent: React.FC<FilterSystemProps> = ({
  stores,
  filters,
  onFiltersChange,
  strategy,
  onStrategyChange,
  strategyConfig,
  onStrategyConfigChange,
  onNext,
  onBack,
}) => {
  const [filteredStores, setFilteredStores] = useState<StoreData[]>(stores);
  const [showHistogram, setShowHistogram] = useState(false);
  const [expandedFilters, setExpandedFilters] = useState<string[]>(['strategy']);

  // Generate filter options - optimized with Set for O(n) performance
  const filterOptions = useMemo(() => ({
    retailers: [...new Set(getUniqueValues(stores, 'naam').map(name => name.split(' ')[0]))],
    storeTypes: getUniqueValues(stores, 'type'),
    strategies: getUniqueValues(stores, 'strategie'),
    channels: getUniqueValues(stores, 'kanaal'),
    customerGroups: getUniqueValues(stores, 'klantgroep'),
    regions: getUniqueValues(stores, 'fieldSalesRegio'),
  }), [stores]);

  // Calculate revenue range
  const revenueRange = useMemo(() => {
    const revenues = stores.map(store => store.prodSelect);
    return {
      min: Math.min(...revenues),
      max: Math.max(...revenues),
    };
  }, [stores]);

  // Optimized filtering with useMemo for better performance
  const filteredStoresMemo = useMemo(() => {
    if (stores.length === 0) return [];

    // Convert arrays to Sets for O(1) lookup performance
    const retailerSet = new Set(filters.retailers.map(r => r.toLowerCase()));
    const storeTypeSet = new Set(filters.storeTypes);
    const strategySet = new Set(filters.strategies);
    const channelSet = new Set(filters.channels);
    const customerGroupSet = new Set(filters.customerGroups);
    const includedRegionSet = new Set(filters.includedRegions);
    const excludedRegionSet = new Set(filters.excludedRegions);

    return stores.filter(store => {
      // Retailer filter - O(1) lookup
      if (retailerSet.size > 0 && !Array.from(retailerSet).some(retailer => 
        store.naam.toLowerCase().includes(retailer)
      )) {
        return false;
      }

      // All other filters use Set.has() for O(1) lookup
      if (storeTypeSet.size > 0 && !storeTypeSet.has(store.type)) return false;
      if (strategySet.size > 0 && !strategySet.has(store.strategie)) return false;
      if (channelSet.size > 0 && !channelSet.has(store.kanaal)) return false;
      if (customerGroupSet.size > 0 && !customerGroupSet.has(store.klantgroep)) return false;

      // Revenue range filter
      if (store.prodSelect < filters.revenueRange.min || store.prodSelect > filters.revenueRange.max) {
        return false;
      }

      // Region filters
      if (includedRegionSet.size > 0 && !includedRegionSet.has(store.fieldSalesRegio)) return false;
      if (excludedRegionSet.size > 0 && excludedRegionSet.has(store.fieldSalesRegio)) return false;

      return true;
    });
  }, [stores, filters]);

  // Update local state when memoized value changes
  useEffect(() => {
    setFilteredStores(filteredStoresMemo);
  }, [filteredStoresMemo]);

  // Generate histogram data
  const histogramData = useMemo(() => {
    const rawData = PerformanceAnalyzer.generateHistogram(filteredStores, 8);
    const totalCount = rawData.reduce((sum, bin) => sum + bin.count, 0);
    
    return rawData.map(bin => ({
      range: bin.range,
      count: bin.count,
      percentage: totalCount > 0 ? (bin.count / totalCount) * 100 : 0,
      minValue: bin.stores.length > 0 ? Math.min(...bin.stores.map(s => s.prodSelect)) : 0,
      maxValue: bin.stores.length > 0 ? Math.max(...bin.stores.map(s => s.prodSelect)) : 0,
    }));
  }, [filteredStores]);

  // Handle filter changes
  const handleMultiSelectChange = (key: keyof FilterConfig, value: string) => {
    const currentValues = filters[key] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    onFiltersChange({
      ...filters,
      [key]: newValues,
    });
  };

  const handleRevenueRangeChange = (min: number, max: number) => {
    onFiltersChange({
      ...filters,
      revenueRange: { min, max },
    });
  };

  const handleResetFilters = () => {
    onFiltersChange({
      retailers: [],
      storeTypes: [],
      strategies: [],
      channels: [],
      customerGroups: [],
      revenueRange: {
        min: revenueRange.min,
        max: revenueRange.max,
      },
      includedRegions: [],
      excludedRegions: [],
    });
  };

  const toggleFilterSection = (section: string) => {
    setExpandedFilters(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const canProceed = filteredStores.length > 0;

  return (
    <div className="h-full flex flex-col">
      {/* Page Header */}
      <div className="flex-shrink-0 bg-white border-b border-content-200 px-6 py-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-content-900 mb-2">
            Select Strategy & Apply Filters
          </h2>
          <p className="text-content-600">
            Choose your selection strategy and filter stores to refine your target list
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-h-0 overflow-auto px-6 py-6 custom-scrollbar">
        <div className="max-w-6xl mx-auto">
          {/* Enhanced Strategy Configuration */}
          <div className="mb-8">
            <StrategyConfigurator
              stores={stores}
              currentStrategy={strategy}
              onStrategyConfigChange={onStrategyConfigChange || (() => {})}
              onStrategyChange={onStrategyChange}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Filters */}
            <div className="lg:col-span-2 space-y-4">
              {/* Basic Filters */}
              <div className="bg-white rounded-xl border border-content-200 overflow-hidden">
                <button
                  onClick={() => toggleFilterSection('basic')}
                  className="w-full p-4 flex items-center justify-between hover:bg-content-50 transition-colors"
                  aria-expanded={expandedFilters.includes('basic')}
                  aria-controls="basic-filters-section"
                  aria-describedby="basic-filters-description"
                >
                  <h3 className="text-lg font-semibold flex items-center">
                    <Filter className="mr-2 h-5 w-5 text-content-900" aria-hidden="true" />
                    Basic Filters
                  </h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleResetFilters();
                      }}
                      className="btn-ghost text-xs"
                      aria-label="Reset all basic filters"
                    >
                      Reset
                    </button>
                    {expandedFilters.includes('basic') ? 
                      <ChevronUp className="w-5 h-5 text-content-600" aria-hidden="true" /> : 
                      <ChevronDown className="w-5 h-5 text-content-600" aria-hidden="true" />
                    }
                  </div>
                </button>
                <div id="basic-filters-description" className="sr-only">
                  Filter stores by retailer, channel, customer group, and revenue range
                </div>
                
                {expandedFilters.includes('basic') && (
                  <div id="basic-filters-section" className="p-4 border-t border-content-200 bg-content-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Retailers */}
                      <div>
                        <label className="block text-sm font-medium text-content-700 mb-2 flex items-center">
                          <Building className="mr-1 h-4 w-4" />
                          Retailers
                        </label>
                        <div className="space-y-2 max-h-32 overflow-y-auto bg-white rounded-lg border border-content-200 p-2">
                          {filterOptions.retailers.map(retailer => (
                            <label key={retailer} className="flex items-center hover:bg-content-50 p-1 rounded">
                              <input
                                type="checkbox"
                                checked={filters.retailers.includes(retailer)}
                                onChange={() => handleMultiSelectChange('retailers', retailer)}
                                className="mr-2"
                                aria-describedby={`retailer-${retailer.replace(/\s+/g, '-').toLowerCase()}-description`}
                              />
                              <span className="text-sm">{retailer}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Store Types */}
                      <div>
                        <label className="block text-sm font-medium text-content-700 mb-2">
                          Store Types
                        </label>
                        <div className="space-y-2 bg-white rounded-lg border border-content-200 p-2">
                          {filterOptions.storeTypes.map(type => (
                            <label key={type} className="flex items-center hover:bg-content-50 p-1 rounded">
                              <input
                                type="checkbox"
                                checked={filters.storeTypes.includes(type)}
                                onChange={() => handleMultiSelectChange('storeTypes', type)}
                                className="mr-2"
                                aria-describedby={`store-type-${type.replace(/\s+/g, '-').toLowerCase()}-description`}
                              />
                              <span className="text-sm">{type}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Channels */}
                      <div>
                        <fieldset>
                          <legend className="block text-sm font-medium text-content-700 mb-2">
                            Channels
                          </legend>
                          <div className="space-y-2 max-h-32 overflow-y-auto bg-white rounded-lg border border-content-200 p-2" role="group" aria-label="Channel selection">
                            {filterOptions.channels.map(channel => (
                              <label key={channel} className="flex items-center hover:bg-content-50 p-1 rounded">
                                <input
                                  type="checkbox"
                                  checked={filters.channels.includes(channel)}
                                  onChange={() => handleMultiSelectChange('channels', channel)}
                                  className="mr-2"
                                  aria-describedby={`channel-${channel.replace(/\s+/g, '-').toLowerCase()}-description`}
                                />
                                <span className="text-sm">{channel}</span>
                              </label>
                            ))}
                          </div>
                        </fieldset>
                      </div>

                      {/* Customer Groups */}
                      <div>
                        <fieldset>
                          <legend className="block text-sm font-medium text-content-700 mb-2 flex items-center">
                            <Users className="mr-1 h-4 w-4" aria-hidden="true" />
                            Customer Groups
                          </legend>
                          <div className="space-y-2 bg-white rounded-lg border border-content-200 p-2" role="group" aria-label="Customer group selection">
                            {filterOptions.customerGroups.map(group => (
                              <label key={group} className="flex items-center hover:bg-content-50 p-1 rounded">
                                <input
                                  type="checkbox"
                                  checked={filters.customerGroups.includes(group)}
                                  onChange={() => handleMultiSelectChange('customerGroups', group)}
                                  className="mr-2"
                                  aria-describedby={`customer-group-${group}-description`}
                                />
                                <span className="text-sm">Group {group}</span>
                              </label>
                            ))}
                          </div>
                        </fieldset>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Regional Filters */}
              <div className="bg-white rounded-xl border border-content-200 overflow-hidden">
                <button
                  onClick={() => toggleFilterSection('regional')}
                  className="w-full p-4 flex items-center justify-between hover:bg-content-50 transition-colors"
                  aria-expanded={expandedFilters.includes('regional')}
                  aria-controls="regional-filters-section"
                  aria-describedby="regional-filters-description"
                >
                  <h3 className="text-lg font-semibold flex items-center">
                    <MapPin className="mr-2 h-5 w-5 text-content-900" aria-hidden="true" />
                    Regional Filters
                  </h3>
                  <div className="flex items-center space-x-2">
                                         <button
                       onClick={(e) => {
                         e.stopPropagation();
                         handleResetFilters();
                       }}
                       className="btn-ghost text-xs"
                       aria-label="Reset all filters"
                     >
                       Reset
                     </button>
                    {expandedFilters.includes('regional') ? 
                      <ChevronUp className="w-5 h-5 text-content-600" aria-hidden="true" /> : 
                      <ChevronDown className="w-5 h-5 text-content-600" aria-hidden="true" />
                    }
                  </div>
                </button>
                <div id="regional-filters-description" className="sr-only">
                  Filter stores by region, province, and city
                </div>
                
                {expandedFilters.includes('regional') && (
                  <div id="regional-filters-section" className="p-4 border-t border-content-200 bg-content-50">
                    <div className="space-y-2 max-h-40 overflow-y-auto bg-white rounded-lg border border-content-200 p-2">
                      {filterOptions.regions.map(region => (
                        <div key={region} className="flex items-center justify-between hover:bg-content-50 p-1 rounded">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={filters.includedRegions.includes(region)}
                              onChange={() => handleMultiSelectChange('includedRegions', region)}
                              className="mr-2"
                              aria-describedby={`region-${region.replace(/\s+/g, '-').toLowerCase()}-description`}
                            />
                            <span className="text-sm">{region}</span>
                          </label>
                          <button
                            onClick={() => handleMultiSelectChange('excludedRegions', region)}
                            className={`text-xs px-2 py-1 rounded ${
                              filters.excludedRegions.includes(region)
                                ? 'bg-warning-100 text-warning-800'
                                : 'bg-content-100 text-content-600 hover:bg-content-200'
                            }`}
                          >
                            {filters.excludedRegions.includes(region) ? 'Excluded' : 'Exclude'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Revenue Range */}
              <div className="bg-white rounded-xl border border-content-200 overflow-hidden">
                <button
                  onClick={() => toggleFilterSection('revenue')}
                  className="w-full p-4 flex items-center justify-between hover:bg-content-50 transition-colors"
                >
                  <h3 className="text-lg font-semibold flex items-center">
                    <DollarSign className="mr-2 h-5 w-5 text-content-900" />
                    Revenue Range
                  </h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowHistogram(!showHistogram);
                      }}
                      className="btn-ghost text-xs"
                    >
                      {showHistogram ? 'Hide' : 'Show'} Chart
                    </button>
                    {expandedFilters.includes('revenue') ? 
                      <ChevronUp className="w-5 h-5 text-content-600" /> : 
                      <ChevronDown className="w-5 h-5 text-content-600" />
                    }
                  </div>
                </button>
                
                {expandedFilters.includes('revenue') && (
                  <div className="p-4 border-t border-content-200 bg-content-50">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex-1">
                          <label className="text-xs text-content-500">Min: €{Math.round(filters.revenueRange.min / 1000)}k</label>
                          <input
                            type="range"
                            min={revenueRange.min}
                            max={revenueRange.max}
                            value={filters.revenueRange.min}
                            onChange={(e) => handleRevenueRangeChange(parseInt(e.target.value), filters.revenueRange.max)}
                            className="w-full"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="text-xs text-content-500">Max: €{Math.round(filters.revenueRange.max / 1000)}k</label>
                          <input
                            type="range"
                            min={revenueRange.min}
                            max={revenueRange.max}
                            value={filters.revenueRange.max}
                            onChange={(e) => handleRevenueRangeChange(filters.revenueRange.min, parseInt(e.target.value))}
                            className="w-full"
                          />
                        </div>
                      </div>
                      
                      {showHistogram && (
                        <div className="mt-4 animate-fadeInUp bg-white rounded-lg border border-content-200 p-4">
                          <InteractiveChart
                            data={histogramData}
                            title="Revenue Distribution"
                            className="border-0 shadow-none p-0"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Results Summary */}
            <div className="space-y-4">
              {/* Filter Results */}
              <div className="bg-white rounded-xl border border-content-200 p-4">
                <h3 className="text-lg font-semibold mb-4">
                  Filter Results
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-content-600">Filtered stores:</span>
                    <span className="font-medium text-content-900">{filteredStores.length}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-content-600">Coverage:</span>
                    <span className="font-medium text-content-900">
                      {((filteredStores.length / stores.length) * 100).toFixed(1)}%
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-content-600">Unique regions:</span>
                    <span className="font-medium text-content-900">
                      {new Set(filteredStores.map(store => store.fieldSalesRegio)).size}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-content-600">Total revenue:</span>
                    <span className="font-medium text-content-900">
                      €{Math.round(filteredStores.reduce((sum, store) => sum + store.prodSelect, 0) / 1000000)}M
                    </span>
                  </div>
                </div>
              </div>

              {/* Selected Strategy Info */}
              <div className="bg-gradient-to-br from-content-50 to-content-100 rounded-xl border border-content-200 p-4">
                <h3 className="text-lg font-semibold mb-3">
                  Selected Strategy
                </h3>
                <div className="space-y-2" role="group" aria-label="Current strategy summary">
                  <div className="font-medium text-content-900">
                    {STRATEGY_DEFINITIONS[strategy].name}
                  </div>
                  <div className="text-sm text-content-700">
                    {STRATEGY_DEFINITIONS[strategy].description}
                  </div>
                  <div className="text-xs text-content-600 bg-white rounded px-2 py-1">
                    {STRATEGY_DEFINITIONS[strategy].useCase}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 px-6 py-4 border-t border-content-200 bg-white">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <button
            onClick={onBack}
            className="btn-secondary"
            aria-label="Go back to target configuration"
          >
            Back: Configure Target
          </button>
          
          <button
            onClick={onNext}
            disabled={!canProceed}
            className={`px-8 py-3 rounded-lg font-medium transition-colors ${
              canProceed
                ? 'bg-content-900 hover:bg-content-800 text-white'
                : 'bg-content-300 text-content-500 cursor-not-allowed'
            }`}
            aria-label={canProceed ? `Proceed to results with ${filteredStores.length} stores` : "Cannot proceed - no stores match current filters"}
            aria-describedby="next-filter-button-description"
          >
            Next: Review Results ({filteredStores.length} stores)
          </button>
          <div id="next-filter-button-description" className="sr-only">
            {canProceed 
              ? `Proceed to review results with ${filteredStores.length} stores matching your criteria` 
              : "Please adjust your filters to include at least one store"
            }
          </div>
        </div>
      </div>
    </div>
  );
};

// Memoized export for performance optimization
export const FilterSystem = React.memo(FilterSystemComponent); 