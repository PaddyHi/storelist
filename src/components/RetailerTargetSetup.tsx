import React, { useState, useEffect, useMemo } from 'react';
import { Building, Target, Users, TrendingUp } from 'lucide-react';
import { StoreData, TargetConfig } from '../types';
import { Card } from './common/Card';
import { extractRetailerBrand } from '../utils/retailerUtils';

interface RetailerTargetSetupProps {
  stores: StoreData[];
  selectedRetailer: string;
  targetConfig: TargetConfig;
  onRetailerChange: (retailer: string) => void;
  onTargetChange: (config: TargetConfig) => void;
  onNext: () => void;
  onBack: () => void;
}

export const RetailerTargetSetup: React.FC<RetailerTargetSetupProps> = ({
  stores,
  selectedRetailer,
  targetConfig,
  onRetailerChange,
  onTargetChange,
  onNext,
  onBack
}) => {
  const [localTargetCount, setLocalTargetCount] = useState(targetConfig.total);

  // Get available retailers from the data
  const availableRetailers = useMemo(() => {
    const retailers = stores.reduce((acc, store) => {
      const retailerBrand = extractRetailerBrand(store.naam);
      const existingRetailer = acc.find(r => r.name === retailerBrand);
      
      if (existingRetailer) {
        existingRetailer.storeCount += 1;
        existingRetailer.totalRevenue += store.prodSelect;
      } else {
        acc.push({
          name: retailerBrand,
          storeCount: 1,
          totalRevenue: store.prodSelect
        });
      }
      
      return acc;
    }, [] as { name: string; storeCount: number; totalRevenue: number }[]);

    return retailers
      .sort((a, b) => b.storeCount - a.storeCount)
      .slice(0, 20); // Show top 20 retailers by store count
  }, [stores]);

  // Get filtered stores for selected retailer
  const retailerStores = useMemo(() => {
    if (!selectedRetailer) return [];
    return stores.filter(store => extractRetailerBrand(store.naam) === selectedRetailer);
  }, [stores, selectedRetailer]);

  // Calculate metrics for selected retailer
  const retailerMetrics = useMemo(() => {
    if (retailerStores.length === 0) return null;

    const totalRevenue = retailerStores.reduce((sum, store) => sum + store.prodSelect, 0);
    const avgRevenue = totalRevenue / retailerStores.length;
    const regions = [...new Set(retailerStores.map(store => store.fieldSalesRegio))];
    const storeTypes = [...new Set(retailerStores.map(store => store.type))];

    // Calculate total revenue across all stores
    const totalAllRevenue = stores.reduce((sum, store) => sum + store.prodSelect, 0);
    const revenuePercentage = (totalRevenue / totalAllRevenue) * 100;

    return {
      totalStores: retailerStores.length,
      totalRevenue,
      avgRevenue,
      regions: regions.length,
      storeTypes: storeTypes.length,
      regionList: regions,
      storeTypeList: storeTypes,
      revenuePercentage
    };
  }, [retailerStores, stores]);

  // Update parent when local target count changes
  useEffect(() => {
    onTargetChange({ total: localTargetCount });
  }, [localTargetCount, onTargetChange]);

  const handleRetailerSelect = (retailer: string) => {
    onRetailerChange(retailer);
    // Calculate store count for the newly selected retailer
    const newRetailerStores = stores.filter(store => extractRetailerBrand(store.naam) === retailer);
    // Reset target count to reasonable default
    const newTargetCount = Math.min(50, Math.max(10, Math.floor(newRetailerStores.length * 0.1)));
    setLocalTargetCount(newTargetCount);
  };

  const handleTargetCountChange = (value: number) => {
    const maxStores = retailerStores.length;
    const clampedValue = Math.max(1, Math.min(maxStores, value));
    setLocalTargetCount(clampedValue);
  };

  const canProceed = selectedRetailer && localTargetCount > 0 && localTargetCount <= retailerStores.length;

  return (
    <div className="h-full flex flex-col">
      {/* Page Header */}
      <div className="flex-shrink-0 bg-white border-b border-content-200 px-6 py-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-content-900 mb-2">
            Select Retailer & Set Target
          </h2>
          <p className="text-content-600">
            Choose which retailer to focus on and how many stores you want to select
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-h-0 overflow-auto px-6 py-6 custom-scrollbar">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Retailer Selection */}
            <div className="lg:col-span-2">
              <Card>
                <h3 className="text-lg font-semibold mb-6 flex items-center">
                  <Building className="mr-2 h-5 w-5 text-content-900" />
                  Select Retailer
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto custom-scrollbar">
                  {availableRetailers.map((retailer) => (
                    <button
                      key={retailer.name}
                      onClick={() => handleRetailerSelect(retailer.name)}
                      className={`p-4 rounded-lg border-2 text-left transition-all hover:shadow-md ${
                        selectedRetailer === retailer.name
                          ? 'border-content-900 bg-content-50'
                          : 'border-content-200 hover:border-content-300 bg-white'
                      }`}
                    >
                      <div className="font-semibold text-content-900 mb-2 truncate">
                        {retailer.name}
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm text-content-600">
                          {retailer.storeCount} stores
                        </div>
                        <div className="text-sm text-content-600">
                          Avg Revenue: {Math.round(retailer.totalRevenue / retailer.storeCount).toLocaleString()}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </Card>
            </div>

            {/* Right Column - Target Setup & Metrics */}
            <div className="space-y-6">
              {/* Target Count */}
              <Card>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Target className="mr-2 h-5 w-5 text-content-900" />
                  Target Store Count
                </h3>
                
                {selectedRetailer ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-content-700 mb-2">
                        Number of Stores
                      </label>
                      <input
                        type="number"
                        min="1"
                        max={retailerStores.length}
                        value={localTargetCount}
                        onChange={(e) => handleTargetCountChange(parseInt(e.target.value) || 1)}
                        className="w-full px-4 py-3 border border-content-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-content-900 focus:border-transparent"
                      />
                    </div>
                    
                    <div className="text-sm text-content-600">
                      <div>Available: {retailerStores.length} stores</div>
                      <div>Selection: {((localTargetCount / retailerStores.length) * 100).toFixed(1)}%</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-content-500 italic">
                    Select a retailer first
                  </div>
                )}
              </Card>

              {/* Retailer Metrics */}
              {retailerMetrics && (
                <Card>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5 text-content-900" />
                    Retailer Overview
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-content-600">Total Stores:</span>
                      <span className="text-sm font-medium text-content-900">
                        {retailerMetrics.totalStores}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-content-600">Total Revenue:</span>
                      <span className="text-sm font-medium text-content-900">
                        {Math.round(retailerMetrics.totalRevenue).toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-content-600">Market Share:</span>
                      <span className="text-sm font-medium text-content-900">
                        {retailerMetrics.revenuePercentage.toFixed(1)}%
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-content-600">Avg Revenue:</span>
                      <span className="text-sm font-medium text-content-900">
                        {Math.round(retailerMetrics.avgRevenue).toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-content-600">Regions:</span>
                      <span className="text-sm font-medium text-content-900">
                        {retailerMetrics.regions}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-content-600">Store Types:</span>
                      <span className="text-sm font-medium text-content-900">
                        {retailerMetrics.storeTypes}
                      </span>
                    </div>
                  </div>
                </Card>
              )}
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
            Next: Performance Selection
          </button>
        </div>
      </div>
    </div>
  );
}; 