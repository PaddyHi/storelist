import React, { useState, useMemo } from 'react';
import { BarChart3, TrendingUp, Target, Eye } from 'lucide-react';
import { StoreData } from '../types';
import { Card } from './common/Card';
import { extractRetailerBrand } from '../utils/retailerUtils';

interface PerformanceTierSelectionProps {
  stores: StoreData[];
  selectedRetailer: string;
  performanceTier: {
    type: 'percentage' | 'absolute';
    value: number;
    description: string;
  };
  onPerformanceTierChange: (tier: { type: 'percentage' | 'absolute'; value: number; description: string }) => void;
  onNext: () => void;
  onBack: () => void;
}

export const PerformanceTierSelection: React.FC<PerformanceTierSelectionProps> = ({
  stores,
  selectedRetailer,
  performanceTier,
  onPerformanceTierChange,
  onNext,
  onBack
}) => {
  const [selectedTierType, setSelectedTierType] = useState<'percentage' | 'absolute'>(performanceTier.type);
  const [customValue, setCustomValue] = useState(performanceTier.value);

  // Get retailer stores and sort by performance
  const retailerStores = useMemo(() => {
    return stores
      .filter(store => extractRetailerBrand(store.naam) === selectedRetailer)
      .sort((a, b) => b.prodSelect - a.prodSelect);
  }, [stores, selectedRetailer]);

  // Calculate performance distribution
  const performanceDistribution = useMemo(() => {
    if (retailerStores.length === 0) return { bins: [], stats: null };

    const revenues = retailerStores.map(store => store.prodSelect);
    const minRevenue = Math.min(...revenues);
    const maxRevenue = Math.max(...revenues);
    const avgRevenue = revenues.reduce((sum, rev) => sum + rev, 0) / revenues.length;

    // Create 10 bins for histogram
    const binCount = 10;
    const binSize = (maxRevenue - minRevenue) / binCount;
    const bins = Array.from({ length: binCount }, (_, i) => ({
      min: minRevenue + i * binSize,
      max: minRevenue + (i + 1) * binSize,
      count: 0,
      percentage: 0
    }));

    // Populate bins
    revenues.forEach(revenue => {
      const binIndex = Math.min(Math.floor((revenue - minRevenue) / binSize), binCount - 1);
      bins[binIndex].count++;
    });

    // Calculate percentages
    bins.forEach(bin => {
      bin.percentage = (bin.count / revenues.length) * 100;
    });

    return {
      bins,
      stats: {
        min: minRevenue,
        max: maxRevenue,
        avg: avgRevenue,
        median: revenues[Math.floor(revenues.length / 2)],
        total: revenues.length
      }
    };
  }, [retailerStores]);

  // Calculate selected stores based on current tier
  const selectedStores = useMemo(() => {
    if (selectedTierType === 'percentage') {
      const count = Math.floor((customValue / 100) * retailerStores.length);
      return retailerStores.slice(0, count);
    } else {
      return retailerStores.filter(store => store.prodSelect >= customValue);
    }
  }, [retailerStores, selectedTierType, customValue]);

  // Pre-defined tier options
  const tierOptions = [
    { type: 'percentage' as const, value: 10, description: 'Top 10% Best Performers', color: 'bg-green-100 text-green-800' },
    { type: 'percentage' as const, value: 20, description: 'Top 20% Best Performers', color: 'bg-blue-100 text-blue-800' },
    { type: 'percentage' as const, value: 30, description: 'Top 30% Best Performers', color: 'bg-yellow-100 text-yellow-800' },
    { type: 'percentage' as const, value: 50, description: 'Top 50% Best Performers', color: 'bg-purple-100 text-purple-800' },
  ];

  const handleTierSelect = (tier: typeof tierOptions[0]) => {
    setSelectedTierType(tier.type);
    setCustomValue(tier.value);
    onPerformanceTierChange({
      type: tier.type,
      value: tier.value,
      description: tier.description
    });
  };

  const handleCustomValueChange = (value: number) => {
    setCustomValue(value);
    const description = selectedTierType === 'percentage' 
      ? `Top ${value}% Performers`
      : `Stores with Revenue ≥ ${value.toLocaleString()}`;
    
    onPerformanceTierChange({
      type: selectedTierType,
      value,
      description
    });
  };

  const canProceed = selectedStores.length > 0;

  return (
    <div className="h-full flex flex-col">
      {/* Page Header */}
      <div className="flex-shrink-0 bg-white border-b border-content-200 px-6 py-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-content-900 mb-2">
            Select Performance Tier
          </h2>
          <p className="text-content-600">
            Choose the performance level of stores you want to focus on
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-h-0 overflow-auto px-6 py-6 custom-scrollbar">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Performance Distribution */}
            <div className="space-y-6">
              {/* Performance Chart */}
              <Card>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5 text-content-900" />
                  Performance Distribution
                </h3>
                
                {performanceDistribution.stats && (
                  <div className="space-y-4">
                    {/* Performance Stats */}
                    <div className="bg-content-50 rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-content-600">Total Stores:</span>
                          <span className="font-medium text-content-900 ml-2">
                            {performanceDistribution.stats.total}
                          </span>
                        </div>
                        <div>
                          <span className="text-content-600">Average:</span>
                          <span className="font-medium text-content-900 ml-2">
                            {Math.round(performanceDistribution.stats.avg).toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-content-600">Median:</span>
                          <span className="font-medium text-content-900 ml-2">
                            {Math.round(performanceDistribution.stats.median).toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-content-600">Range:</span>
                          <span className="font-medium text-content-900 ml-2">
                            {Math.round(performanceDistribution.stats.min).toLocaleString()} - {Math.round(performanceDistribution.stats.max).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Histogram */}
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-content-700 mb-2">Revenue Distribution</div>
                      {performanceDistribution.bins.map((bin, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="w-20 text-xs text-content-600">
                            {Math.round(bin.min / 1000)}k-{Math.round(bin.max / 1000)}k
                          </div>
                          <div className="flex-1 bg-content-200 rounded-full h-4 relative">
                            <div
                              className="bg-content-900 h-4 rounded-full transition-all duration-500"
                              style={{ width: `${bin.percentage}%` }}
                            />
                          </div>
                          <div className="w-12 text-xs text-content-600 text-right">
                            {bin.count}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>

              {/* Selection Impact */}
              <Card>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Eye className="mr-2 h-5 w-5 text-content-900" />
                  Selection Impact
                </h3>
                
                <div className="space-y-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="text-sm font-medium text-blue-900 mb-2">
                      Current Selection: {performanceTier.description}
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-blue-700">Selected Stores:</span>
                        <span className="font-medium text-blue-900 ml-2">
                          {selectedStores.length}
                        </span>
                      </div>
                      <div>
                        <span className="text-blue-700">Percentage:</span>
                        <span className="font-medium text-blue-900 ml-2">
                          {((selectedStores.length / retailerStores.length) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {selectedStores.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-content-700">Performance Range</div>
                      <div className="text-sm text-content-600">
                        <div>Highest: {Math.round(selectedStores[0]?.prodSelect || 0).toLocaleString()}</div>
                        <div>Lowest: {Math.round(selectedStores[selectedStores.length - 1]?.prodSelect || 0).toLocaleString()}</div>
                        <div>Average: {Math.round(selectedStores.reduce((sum, s) => sum + s.prodSelect, 0) / selectedStores.length).toLocaleString()}</div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Right Column - Tier Selection */}
            <div className="space-y-6">
              {/* Pre-defined Tiers */}
              <Card>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Target className="mr-2 h-5 w-5 text-content-900" />
                  Best Performers Selection
                </h3>
                
                <div className="space-y-3">
                  {tierOptions.map((tier, index) => {
                    const isSelected = selectedTierType === tier.type && customValue === tier.value;
                    const storeCount = Math.floor((tier.value / 100) * retailerStores.length);
                    
                    return (
                      <button
                        key={index}
                        onClick={() => handleTierSelect(tier)}
                        className={`w-full p-4 rounded-lg border-2 text-left transition-all hover:shadow-md ${
                          isSelected
                            ? 'border-content-900 bg-content-50'
                            : 'border-content-200 hover:border-content-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-content-900">
                            {tier.description}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${tier.color}`}>
                            {tier.value}%
                          </span>
                        </div>
                        <div className="text-sm text-content-600">
                          {storeCount} highest performing stores
                        </div>
                      </button>
                    );
                  })}
                </div>
              </Card>

              {/* Selection Info */}
              <Card>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5 text-content-900" />
                  Selection Information
                </h3>
                
                <div className="space-y-4">
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-sm font-medium text-green-900 mb-2">
                      How it Works
                    </div>
                    <div className="text-sm text-green-800">
                      Stores are ranked by sales performance and only the top performers in your selected percentage are included. This ensures you get the highest performing stores from {selectedRetailer}.
                    </div>
                  </div>
                  
                  {selectedStores.length > 0 && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="text-sm font-medium text-blue-900 mb-2">
                        Performance Range of Selected Stores
                      </div>
                      <div className="text-sm text-blue-800 space-y-1">
                        <div>Highest: {Math.round(selectedStores[0]?.prodSelect || 0).toLocaleString()}</div>
                        <div>Lowest: {Math.round(selectedStores[selectedStores.length - 1]?.prodSelect || 0).toLocaleString()}</div>
                        <div>Average: {Math.round(selectedStores.reduce((sum, s) => sum + s.prodSelect, 0) / selectedStores.length).toLocaleString()}</div>
                      </div>
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
            disabled={!canProceed}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              canProceed
                ? 'bg-content-900 text-white hover:bg-content-800'
                : 'bg-content-300 text-content-500 cursor-not-allowed'
            }`}
          >
            Next: Strategy Selection
          </button>
        </div>
      </div>
    </div>
  );
}; 