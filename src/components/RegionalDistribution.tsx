import React, { useState, useMemo } from 'react';
import { MapPin, Users, Target, BarChart3 } from 'lucide-react';
import { StoreData, SelectionStrategy } from '../types';
import { Card } from './common/Card';
import { DUTCH_PROVINCES, STRATEGY_SCHEMAS } from '../data/strategySchemas';
import { extractRetailerBrand } from '../utils/retailerUtils';

interface RegionalDistributionProps {
  stores: StoreData[];
  selectedRetailer: string;
  strategy: SelectionStrategy;
  regionalConfig: {
    type: 'national' | 'over-index';
    overIndexRegions?: string[];
    overIndexPercentage?: number;
  };
  onRegionalConfigChange: (config: {
    type: 'national' | 'over-index';
    overIndexRegions?: string[];
    overIndexPercentage?: number;
  }) => void;
  onNext: () => void;
  onBack: () => void;
}

// Population data for Dutch provinces (approximated for demo)
const PROVINCE_POPULATION = {
  'Zuid-Holland': 3.7,
  'Noord-Holland': 2.9,
  'Noord-Brabant': 2.6,
  'Gelderland': 2.1,
  'Utrecht': 1.4,
  'Overijssel': 1.2,
  'Limburg': 1.1,
  'Groningen': 0.6,
  'Friesland': 0.7,
  'Drenthe': 0.5,
  'Flevoland': 0.4,
  'Zeeland': 0.4
};

export const RegionalDistribution: React.FC<RegionalDistributionProps> = ({
  stores,
  selectedRetailer,
  strategy,
  regionalConfig,
  onRegionalConfigChange,
  onNext,
  onBack
}) => {
  const [selectedOverIndexRegions, setSelectedOverIndexRegions] = useState<string[]>(
    regionalConfig.overIndexRegions || []
  );
  const [overIndexPercentage, setOverIndexPercentage] = useState(
    regionalConfig.overIndexPercentage || 20
  );

  // Get retailer stores by region
  const retailerStores = useMemo(() => {
    return stores.filter(store => extractRetailerBrand(store.naam) === selectedRetailer);
  }, [stores, selectedRetailer]);

  // Calculate current distribution
  const currentDistribution = useMemo(() => {
    const distribution: Record<string, { count: number; percentage: number }> = {};
    
    DUTCH_PROVINCES.forEach(province => {
      const provinceStores = retailerStores.filter(store => store.fieldSalesRegio === province);
      distribution[province] = {
        count: provinceStores.length,
        percentage: (provinceStores.length / retailerStores.length) * 100
      };
    });
    
    return distribution;
  }, [retailerStores]);

  // Calculate population-based distribution
  const populationBasedDistribution = useMemo(() => {
    const totalPopulation = Object.values(PROVINCE_POPULATION).reduce((sum, pop) => sum + pop, 0);
    const distribution: Record<string, { expectedPercentage: number; populationShare: number }> = {};
    
    DUTCH_PROVINCES.forEach(province => {
      const populationShare = (PROVINCE_POPULATION[province] || 0) / totalPopulation * 100;
      distribution[province] = {
        expectedPercentage: populationShare,
        populationShare
      };
    });
    
    return distribution;
  }, []);

  // Check if strategy requires regional distribution
  const strategyRequiresRegional = useMemo(() => {
    const schema = STRATEGY_SCHEMAS[strategy];
    return schema?.supportsRegionalWeighting || strategy === 'geographic-coverage';
  }, [strategy]);

  const handleDistributionTypeChange = (type: 'national' | 'over-index') => {
    if (type === 'national') {
      onRegionalConfigChange({
        type: 'national'
      });
    } else {
      onRegionalConfigChange({
        type: 'over-index',
        overIndexRegions: selectedOverIndexRegions,
        overIndexPercentage
      });
    }
  };

  const handleOverIndexRegionToggle = (province: string) => {
    const newRegions = selectedOverIndexRegions.includes(province)
      ? selectedOverIndexRegions.filter(r => r !== province)
      : [...selectedOverIndexRegions, province];
    
    setSelectedOverIndexRegions(newRegions);
    
    if (regionalConfig.type === 'over-index') {
      onRegionalConfigChange({
        type: 'over-index',
        overIndexRegions: newRegions,
        overIndexPercentage
      });
    }
  };

  const handleOverIndexPercentageChange = (percentage: number) => {
    setOverIndexPercentage(percentage);
    
    if (regionalConfig.type === 'over-index') {
      onRegionalConfigChange({
        type: 'over-index',
        overIndexRegions: selectedOverIndexRegions,
        overIndexPercentage: percentage
      });
    }
  };

  // Skip this step if strategy doesn't require regional configuration
  if (!strategyRequiresRegional) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-content-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="h-8 w-8 text-content-600" />
            </div>
            <h3 className="text-lg font-semibold text-content-900 mb-2">
              Regional Distribution Not Required
            </h3>
            <p className="text-content-600 mb-6">
              The selected strategy doesn't require specific regional distribution settings.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={onBack}
                className="px-6 py-3 bg-white border border-content-300 text-content-700 rounded-lg hover:bg-content-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={onNext}
                className="px-6 py-3 bg-content-900 text-white rounded-lg hover:bg-content-800 transition-colors"
              >
                Next: Review Results
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Page Header */}
      <div className="flex-shrink-0 bg-white border-b border-content-200 px-6 py-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-content-900 mb-2">
            Configure Regional Distribution
          </h2>
          <p className="text-content-600">
            Set how stores should be distributed across Dutch provinces
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-h-0 overflow-auto px-6 py-6 custom-scrollbar">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Distribution Options */}
            <div className="space-y-6">
              {/* Distribution Type */}
              <Card>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Target className="mr-2 h-5 w-5 text-content-900" />
                  Distribution Strategy
                </h3>
                
                <div className="space-y-4">
                  {/* National Coverage */}
                  <button
                    onClick={() => handleDistributionTypeChange('national')}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                      regionalConfig.type === 'national'
                        ? 'border-content-900 bg-content-50'
                        : 'border-content-200 hover:border-content-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-content-900">National Coverage</h4>
                      <Users className="h-5 w-5 text-content-600" />
                    </div>
                    <p className="text-sm text-content-600">
                      Distribute stores proportionally based on population density across all provinces
                    </p>
                  </button>

                  {/* Over-Index Strategy */}
                  <button
                    onClick={() => handleDistributionTypeChange('over-index')}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                      regionalConfig.type === 'over-index'
                        ? 'border-content-900 bg-content-50'
                        : 'border-content-200 hover:border-content-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-content-900">Over-Index Strategy</h4>
                      <BarChart3 className="h-5 w-5 text-content-600" />
                    </div>
                    <p className="text-sm text-content-600">
                      Focus more stores in specific regions while maintaining national presence
                    </p>
                  </button>
                </div>
              </Card>

              {/* Over-Index Configuration */}
              {regionalConfig.type === 'over-index' && (
                <Card>
                  <h3 className="text-lg font-semibold mb-4">Over-Index Configuration</h3>
                  
                  <div className="space-y-4">
                    {/* Percentage Slider */}
                    <div>
                      <label className="block text-sm font-medium text-content-700 mb-2">
                        Focus Percentage: {overIndexPercentage}%
                      </label>
                      <input
                        type="range"
                        min="10"
                        max="60"
                        step="5"
                        value={overIndexPercentage}
                        onChange={(e) => handleOverIndexPercentageChange(Number(e.target.value))}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-content-600 mt-1">
                        <span>10% Focus</span>
                        <span>60% Focus</span>
                      </div>
                    </div>

                    {/* Region Selection */}
                    <div>
                      <label className="block text-sm font-medium text-content-700 mb-2">
                        Select Focus Regions ({selectedOverIndexRegions.length} selected)
                      </label>
                      <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                        {DUTCH_PROVINCES.map(province => (
                          <label
                            key={province}
                            className={`flex items-center space-x-2 p-2 rounded border cursor-pointer transition-all ${
                              selectedOverIndexRegions.includes(province)
                                ? 'bg-content-50 border-content-300'
                                : 'bg-white border-content-200 hover:border-content-300'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={selectedOverIndexRegions.includes(province)}
                              onChange={() => handleOverIndexRegionToggle(province)}
                              className="rounded border-content-300 focus:ring-content-900"
                            />
                            <span className="text-sm text-content-900">{province}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </div>

            {/* Right Column - Current Distribution & Preview */}
            <div className="space-y-6">
              {/* Current Distribution */}
              <Card>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <MapPin className="mr-2 h-5 w-5 text-content-900" />
                  Current Store Distribution
                </h3>
                
                <div className="space-y-3">
                  {DUTCH_PROVINCES.map(province => {
                    const current = currentDistribution[province];
                    const population = populationBasedDistribution[province];
                    
                    return (
                      <div key={province} className="flex items-center justify-between p-3 bg-content-50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-content-900">{province}</span>
                            <span className="text-xs text-content-600">{current.count} stores</span>
                          </div>
                          <div className="w-full bg-content-200 rounded-full h-2">
                            <div
                              className="bg-content-900 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${current.percentage}%` }}
                            />
                          </div>
                        </div>
                        <div className="ml-4 text-right">
                          <div className="text-sm text-content-600">{current.percentage.toFixed(1)}%</div>
                          <div className="text-xs text-content-500">
                            Pop: {population.populationShare.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Distribution Preview */}
              <Card>
                <h3 className="text-lg font-semibold mb-4">Distribution Preview</h3>
                
                <div className="space-y-4">
                  {regionalConfig.type === 'national' && (
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-medium text-green-900 mb-2">National Coverage</h4>
                      <p className="text-sm text-green-800">
                        Stores will be distributed proportionally based on population density. 
                        Larger provinces will receive more stores.
                      </p>
                    </div>
                  )}
                  
                  {regionalConfig.type === 'over-index' && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-2">Over-Index Strategy</h4>
                      <p className="text-sm text-blue-800 mb-2">
                        {overIndexPercentage}% of stores will be focused in selected regions, 
                        with remaining {100 - overIndexPercentage}% distributed nationally.
                      </p>
                      
                      {selectedOverIndexRegions.length > 0 && (
                        <div className="mt-2">
                          <span className="text-sm font-medium text-blue-900">Focus regions: </span>
                          <span className="text-sm text-blue-800">
                            {selectedOverIndexRegions.join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 bg-white border-t border-content-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <button
            onClick={onBack}
            className="px-6 py-3 bg-white border border-content-300 text-content-700 rounded-lg hover:bg-content-50 transition-colors"
          >
            Back
          </button>
          
          <button
            onClick={onNext}
            disabled={regionalConfig.type === 'over-index' && selectedOverIndexRegions.length === 0}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              !(regionalConfig.type === 'over-index' && selectedOverIndexRegions.length === 0)
                ? 'bg-content-900 text-white hover:bg-content-800'
                : 'bg-content-300 text-content-500 cursor-not-allowed'
            }`}
          >
            Next: Review Results
          </button>
        </div>
      </div>
    </div>
  );
}; 