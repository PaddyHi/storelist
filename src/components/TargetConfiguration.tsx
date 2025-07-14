import React, { useState, useEffect } from 'react';
import { Target, TrendingUp, Users, Building } from 'lucide-react';
import { StoreData, TargetConfig, SelectionStrategy } from '../types';
import { useTargetMetrics } from '../hooks/useTargetMetrics';
import { Card } from './common/Card';
import { MetricDisplay } from './common/MetricDisplay';
import { STRATEGY_SCHEMAS } from '../data/strategySchemas';

interface TargetConfigurationProps {
  stores: StoreData[];
  onTargetChange: (config: TargetConfig) => void;
  onNext: () => void;
  onBack: () => void;
  strategy?: SelectionStrategy;
}

export const TargetConfiguration: React.FC<TargetConfigurationProps> = ({
  stores,
  onTargetChange,
  onNext,
  onBack,
  strategy = 'revenue-focus',
}) => {
  const [targetConfig, setTargetConfig] = useState<TargetConfig>({
    total: Math.min(10, stores.length),
  });

  // Use custom hook for metrics calculation
  const metrics = useTargetMetrics(stores, targetConfig);
  const { maxStores, minStores, coveragePercentage, storesByRegion, totalRevenue, avgStoresPerRegion, uniqueRetailers } = metrics;

  // Update parent component when config changes
  useEffect(() => {
    onTargetChange(targetConfig);
  }, [targetConfig, onTargetChange]);

  const handleTotalChange = (value: number) => {
    setTargetConfig(prev => ({
      ...prev,
      total: Math.max(minStores, Math.min(maxStores, value)),
    }));
  };

  const canProceed = targetConfig.total >= minStores && targetConfig.total <= maxStores;

  // Get required boxes for current strategy
  const requiredBoxes = STRATEGY_SCHEMAS[strategy]?.requiredTargetBoxes || ['target-count', 'dataset-overview', 'selection-preview'];

  return (
    <div className="h-full flex flex-col">
      {/* Page Header */}
      <div className="flex-shrink-0 bg-white border-b border-content-200 px-6 py-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-content-900 mb-2">
            Configure Target Selection
          </h2>
          <p className="text-content-600">
            Set how many stores you want to select from your dataset
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-h-0 overflow-auto px-6 py-6 custom-scrollbar">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Target Setting */}
              {requiredBoxes.includes('target-count') && (
              <Card minHeight="320px">
                <h3 className="text-lg font-semibold mb-6 flex items-center">
                  <Target className="mr-2 h-5 w-5 text-content-900" />
                  Target Store Count
                </h3>
                
                <div className="space-y-6">
                  {/* Range Slider */}
                  <div>
                    <label htmlFor="store-count-slider" className="block text-sm font-medium text-content-700 mb-4">
                      Number of Stores to Select
                    </label>
                    
                    <div className="space-y-4">
                      <div className="relative">
                        <input
                          id="store-count-slider"
                          type="range"
                          min={minStores}
                          max={maxStores}
                          value={targetConfig.total}
                          onChange={(e) => handleTotalChange(parseInt(e.target.value))}
                          className="w-full h-2 bg-content-200 rounded-lg appearance-none cursor-pointer slider"
                          style={{
                            background: `linear-gradient(to right, #111827 0%, #111827 ${((targetConfig.total - minStores) / (maxStores - minStores)) * 100}%, #e5e7eb ${((targetConfig.total - minStores) / (maxStores - minStores)) * 100}%, #e5e7eb 100%)`
                          }}
                          aria-describedby="slider-description"
                          aria-valuemin={minStores}
                          aria-valuemax={maxStores}
                          aria-valuenow={targetConfig.total}
                          aria-valuetext={`${targetConfig.total} stores selected out of ${maxStores} total stores`}
                        />
                        <div className="flex justify-between text-xs text-content-500 mt-1">
                          <span>{minStores}</span>
                          <span>{maxStores}</span>
                        </div>
                      </div>
                      
                      {/* Input Controls */}
                      <div className="flex items-center justify-center space-x-3">
                        <button
                          onClick={() => handleTotalChange(Math.max(minStores, targetConfig.total - 1))}
                          className="btn-secondary p-2 rounded-full"
                          disabled={targetConfig.total <= minStores}
                          aria-label="Decrease store count by 1"
                          aria-describedby="decrease-button-description"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        <div className="flex items-center space-x-2">
                          <label htmlFor="store-count-input" className="sr-only">
                            Store count input
                          </label>
                          <input
                            id="store-count-input"
                            type="number"
                            min={minStores}
                            max={maxStores}
                            value={targetConfig.total}
                            onChange={(e) => handleTotalChange(parseInt(e.target.value) || minStores)}
                            className="w-20 px-3 py-2 text-center border border-content-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-content-900 focus:border-transparent"
                            aria-describedby="input-description"
                            aria-label={`Current store count: ${targetConfig.total}`}
                          />
                          <span className="text-sm text-content-500 font-medium" aria-label={`out of ${maxStores} total stores`}>
                            / {maxStores}
                          </span>
                        </div>
                        <button
                          onClick={() => handleTotalChange(Math.min(maxStores, targetConfig.total + 1))}
                          className="btn-secondary p-2 rounded-full"
                          disabled={targetConfig.total >= maxStores}
                          aria-label="Increase store count by 1"
                          aria-describedby="increase-button-description"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    <div id="slider-description" className="text-xs text-content-500 mt-3 text-center">
                      Select between {minStores} and {maxStores} stores from your dataset
                    </div>
                    <div id="decrease-button-description" className="sr-only">
                      Decrease the number of stores to select. Current value: {targetConfig.total}
                    </div>
                    <div id="increase-button-description" className="sr-only">
                      Increase the number of stores to select. Current value: {targetConfig.total}
                    </div>
                    <div id="input-description" className="sr-only">
                      Enter a number between {minStores} and {maxStores} to set the store count
                    </div>
                  </div>

                  {/* Quick Selection Buttons */}
                  <div className="grid grid-cols-4 gap-2" role="group" aria-label="Quick selection percentage options">
                    <button
                      onClick={() => handleTotalChange(Math.round(maxStores * 0.1))}
                      className="btn-ghost text-xs py-2"
                      aria-label={`Select 10% of stores (${Math.round(maxStores * 0.1)} stores)`}
                    >
                      10%
                    </button>
                    <button
                      onClick={() => handleTotalChange(Math.round(maxStores * 0.25))}
                      className="btn-ghost text-xs py-2"
                      aria-label={`Select 25% of stores (${Math.round(maxStores * 0.25)} stores)`}
                    >
                      25%
                    </button>
                    <button
                      onClick={() => handleTotalChange(Math.round(maxStores * 0.5))}
                      className="btn-ghost text-xs py-2"
                      aria-label={`Select 50% of stores (${Math.round(maxStores * 0.5)} stores)`}
                    >
                      50%
                    </button>
                    <button
                      onClick={() => handleTotalChange(maxStores)}
                      className="btn-ghost text-xs py-2"
                      aria-label={`Select all stores (${maxStores} stores)`}
                    >
                      All
                    </button>
                  </div>
                </div>
              </Card>
              )}

              {/* Dataset Overview */}
              {requiredBoxes.includes('dataset-overview') && (
              <Card minHeight="320px">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Building className="mr-2 h-5 w-5 text-content-900" aria-hidden="true" />
                  Dataset Overview
                </h3>
                
                <div className="grid grid-cols-2 gap-4 text-sm" role="group" aria-label="Dataset statistics">
                  <div className="text-center bg-content-50 rounded-lg p-3" role="img" aria-label={`Total stores: ${maxStores}`}>
                    <div className="text-xl font-bold text-content-900">{maxStores}</div>
                    <div className="text-content-600">Total Stores</div>
                  </div>
                  <div className="text-center bg-content-50 rounded-lg p-3" role="img" aria-label={`Regions: ${Object.keys(storesByRegion).length}`}>
                    <div className="text-xl font-bold text-content-900">{Object.keys(storesByRegion).length}</div>
                    <div className="text-content-600">Regions</div>
                  </div>
                  <div className="text-center bg-content-50 rounded-lg p-3" role="img" aria-label={`Total revenue: €${Math.round(totalRevenue / 1000000)} million`}>
                    <div className="text-xl font-bold text-content-900">€{Math.round(totalRevenue / 1000000)}M</div>
                    <div className="text-content-600">Total Revenue</div>
                  </div>
                  <div className="text-center bg-content-50 rounded-lg p-3" role="img" aria-label={`Retailers: ${uniqueRetailers}`}>
                    <div className="text-xl font-bold text-content-900">{uniqueRetailers}</div>
                    <div className="text-content-600">Retailers</div>
                  </div>
                </div>
              </Card>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Selection Preview */}
              {requiredBoxes.includes('selection-preview') && (
              <Card minHeight="320px">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5 text-content-900" aria-hidden="true" />
                  Selection Preview
                </h3>
                
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-content-50 to-content-100 rounded-xl p-4 border border-content-200" role="group" aria-label="Selection summary">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center" role="img" aria-label={`Selected stores: ${targetConfig.total}`}>
                        <div className="text-2xl font-bold text-content-900">{targetConfig.total}</div>
                        <div className="text-content-600">Selected</div>
                      </div>
                      <div className="text-center" role="img" aria-label={`Coverage: ${coveragePercentage}%`}>
                        <div className="text-2xl font-bold text-content-900">{coveragePercentage}%</div>
                        <div className="text-content-600">Coverage</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm" role="group" aria-label="Selection details">
                    <div className="flex justify-between">
                      <span className="text-content-600">Stores remaining:</span>
                      <span className="font-medium text-content-900">{maxStores - targetConfig.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-content-600">Avg. per region:</span>
                      <span className="font-medium text-content-900">~{avgStoresPerRegion}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-content-600">Selection ratio:</span>
                      <span className="font-medium text-content-900">1 in {Math.round(maxStores / targetConfig.total)}</span>
                    </div>
                  </div>
                </div>
              </Card>
              )}

              {/* What's Next */}
              {requiredBoxes.includes('whats-next') && (
              <Card variant="gradient" minHeight="320px">
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <Users className="mr-2 h-5 w-5 text-content-900" aria-hidden="true" />
                  What's Next?
                </h3>
                <p className="text-content-700 text-sm mb-4">
                  After setting your target, you'll choose a selection strategy that determines HOW these {targetConfig.total} stores are selected from your dataset.
                </p>
                <div className="bg-white rounded-lg p-3 border border-content-200" role="complementary" aria-label="Available strategies preview">
                  <div className="text-xs text-content-600 mb-1">Available Strategies:</div>
                  <div className="text-sm text-content-800">
                    Revenue Focus • Geographic Coverage • Growth Opportunities • Portfolio Balance • and more...
                  </div>
                </div>
              </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 px-6 py-4 border-t border-content-200 bg-white">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <button
            onClick={onBack}
            className="btn-secondary"
            aria-label="Go back to import data step"
          >
            Back: Import Data
          </button>
          
          <button
            onClick={onNext}
            disabled={!canProceed}
            className={`px-8 py-3 rounded-lg font-medium transition-colors ${
              canProceed
                ? 'bg-content-900 hover:bg-content-800 text-white'
                : 'bg-content-300 text-content-500 cursor-not-allowed'
            }`}
            aria-label={canProceed ? "Proceed to strategy selection" : "Cannot proceed - please select a valid number of stores"}
            aria-describedby="next-button-description"
          >
            Next: Select Strategy
          </button>
          <div id="next-button-description" className="sr-only">
            {canProceed 
              ? `Proceed to the next step with ${targetConfig.total} stores selected` 
              : `Please select between ${minStores} and ${maxStores} stores to continue`
            }
          </div>
        </div>
      </div>
    </div>
  );
}; 