import { useMemo } from 'react';
import { StoreData, TargetConfig } from '../types';

export interface TargetMetrics {
  coveragePercentage: string;
  storesByRegion: Record<string, number>;
  totalRevenue: number;
  avgStoresPerRegion: number;
  maxStores: number;
  minStores: number;
  uniqueRetailers: number;
}

export const useTargetMetrics = (stores: StoreData[], targetConfig: TargetConfig): TargetMetrics => {
  return useMemo(() => {
    const maxStores = stores.length;
    const minStores = 1;
    
    const coveragePercentage = ((targetConfig.total / maxStores) * 100).toFixed(1);
    
    const storesByRegion = stores.reduce((acc, store) => {
      acc[store.fieldSalesRegio] = (acc[store.fieldSalesRegio] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const totalRevenue = stores.reduce((sum, store) => sum + store.prodSelect, 0);
    
    const avgStoresPerRegion = Math.round(targetConfig.total / Object.keys(storesByRegion).length);
    
    const uniqueRetailers = new Set(stores.map(s => s.naam.split(' ')[0])).size;

    return {
      coveragePercentage,
      storesByRegion,
      totalRevenue,
      avgStoresPerRegion,
      maxStores,
      minStores,
      uniqueRetailers,
    };
  }, [stores, targetConfig]);
}; 