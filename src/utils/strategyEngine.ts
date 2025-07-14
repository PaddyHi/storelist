import { StoreData, SelectionStrategy, TargetConfig, SelectionResult, PortfolioConfig, StrategyConfiguration } from '../types';

/**
 * Strategy Engine for Store Selection
 * Implements six strategic approaches with sophisticated algorithms
 */
export class StrategyEngine {
  /**
   * Execute store selection based on strategy and configuration
   */
  public static selectStores(
    stores: StoreData[],
    strategy: SelectionStrategy,
    targetConfig: TargetConfig,
    filteredStores?: StoreData[],
    strategyConfig?: StrategyConfiguration
  ): SelectionResult {
    const workingStores = filteredStores || stores;
    
    if (workingStores.length === 0) {
      return this.createEmptyResult();
    }

    let selectedStores: StoreData[] = [];

    // Use strategy configuration or fallback to default behavior
    const config = strategyConfig || {
      strategy,
      columnMappings: {},
      parameters: {},
      regionWeights: []
    };

    switch (strategy) {
      case 'revenue-focus':
        selectedStores = this.revenueMaximizationSelection(workingStores, targetConfig, config);
        break;
      case 'geographic-coverage':
        selectedStores = this.geographicDistributionSelection(workingStores, targetConfig, config);
        break;
      case 'growth-opportunities':
        selectedStores = this.growthPotentialSelection(workingStores, targetConfig, config);
        break;
      case 'portfolio-balance':
        selectedStores = this.portfolioBalanceSelection(workingStores, targetConfig, config);
        break;
      case 'market-penetration':
        selectedStores = this.marketPenetrationSelection(workingStores, targetConfig, config);
        break;
      case 'demographic-targeting':
        selectedStores = this.demographicTargetingSelection(workingStores, targetConfig, config);
        break;
      default:
        selectedStores = this.revenueMaximizationSelection(workingStores, targetConfig, config);
    }

    return this.generateResult(selectedStores, workingStores);
  }

  /**
   * Revenue Maximization Strategy
   * Select highest-performing stores to maximize total revenue
   */
  private static revenueMaximizationSelection(stores: StoreData[], targetConfig: TargetConfig, config: StrategyConfiguration): StoreData[] {
    return stores
      .sort((a, b) => b.prodSelect - a.prodSelect)
      .slice(0, targetConfig.total);
  }

  /**
   * Geographic Distribution Strategy
   * Ensure balanced representation across all regions and markets
   */
  private static geographicDistributionSelection(stores: StoreData[], targetConfig: TargetConfig, config: StrategyConfiguration): StoreData[] {
    const target = targetConfig.total;
    const regions = [...new Set(stores.map(store => store.fieldSalesRegio))];
    const storesByRegion = this.groupStoresByRegion(stores);
    
    const selectedStores: StoreData[] = [];
    
    // First, ensure at least one store from each region
    for (const region of regions) {
      const regionStores = storesByRegion[region] || [];
      if (regionStores.length > 0 && selectedStores.length < target) {
        // Select best performer from region
        const bestStore = regionStores.reduce((best, current) => 
          current.prodSelect > best.prodSelect ? current : best
        );
        selectedStores.push(bestStore);
      }
    }
    
    // Fill remaining slots with best performers from each region in round-robin
    const remainingSlots = target - selectedStores.length;
    if (remainingSlots > 0) {
      const availableStores = stores.filter(store => !selectedStores.includes(store));
      const availableByRegion = this.groupStoresByRegion(availableStores);
      
      // Sort stores in each region by performance
      for (const region of regions) {
        if (availableByRegion[region]) {
          availableByRegion[region].sort((a, b) => b.prodSelect - a.prodSelect);
        }
      }
      
      // Round-robin selection from regions
      let regionIndex = 0;
      while (selectedStores.length < target) {
        const region = regions[regionIndex % regions.length];
        const regionStores = availableByRegion[region];
        
        if (regionStores && regionStores.length > 0) {
          selectedStores.push(regionStores.shift()!);
        }
        
        regionIndex++;
        
        // Safety check to prevent infinite loop
        if (regionIndex > regions.length * 10) break;
      }
    }
    
    return selectedStores.slice(0, target);
  }

  /**
   * Growth Potential Strategy
   * Target underperforming stores with high growth potential
   */
  private static growthPotentialSelection(stores: StoreData[], targetConfig: TargetConfig, config: StrategyConfiguration): StoreData[] {
    const target = targetConfig.total;
    
    // Sort by performance to identify growth opportunities
    const sortedStores = stores.sort((a, b) => a.prodSelect - b.prodSelect);
    
    // Focus on middle-tier performers (20th to 70th percentile) as they have growth potential
    const totalStores = sortedStores.length;
    const growthCandidates = sortedStores.slice(
      Math.floor(totalStores * 0.2), // Skip bottom 20%
      Math.floor(totalStores * 0.7)  // Take up to 70th percentile
    );
    
    // If we don't have enough growth candidates, include more stores
    if (growthCandidates.length < target) {
      const additionalStores = sortedStores.slice(0, Math.floor(totalStores * 0.2));
      growthCandidates.push(...additionalStores);
    }
    
    // Prioritize by region diversity for growth opportunities
    const selectedStores: StoreData[] = [];
    const usedRegions = new Set<string>();
    
    // First pass: one store per region
    for (const store of growthCandidates) {
      if (!usedRegions.has(store.fieldSalesRegio) && selectedStores.length < target) {
        selectedStores.push(store);
        usedRegions.add(store.fieldSalesRegio);
      }
    }
    
    // Second pass: fill remaining slots
    for (const store of growthCandidates) {
      if (!selectedStores.includes(store) && selectedStores.length < target) {
        selectedStores.push(store);
      }
    }
    
    return selectedStores.slice(0, target);
  }

  /**
   * Portfolio Balance Strategy (70/20/10 Methodology)
   * Strategic allocation: 70% core markets, 20% growth, 10% experimental
   */
  private static portfolioBalanceSelection(stores: StoreData[], targetConfig: TargetConfig, config: StrategyConfiguration): StoreData[] {
    const target = targetConfig.total;
    
    // Default 70/20/10 allocation
    const coreCount = Math.round(target * 0.7);
    const growthCount = Math.round(target * 0.2);
    const experimentalCount = target - coreCount - growthCount;
    
    const selectedStores: StoreData[] = [];
    
    // 70% Core Markets - Top performers with geographic distribution
    const coreStores = this.geographicDistributionSelection(stores, { ...targetConfig, total: coreCount }, config);
    selectedStores.push(...coreStores);
    
    // 20% Growth Markets - Mid-tier performers not already selected
    const remainingStores = stores.filter(store => !selectedStores.includes(store));
    const growthStores = this.growthPotentialSelection(remainingStores, { ...targetConfig, total: growthCount }, config);
    selectedStores.push(...growthStores);
    
    // 10% Experimental - Lowest performers or underrepresented regions
    const finalRemaining = stores.filter(store => !selectedStores.includes(store));
    if (finalRemaining.length > 0 && experimentalCount > 0) {
      // Focus on underrepresented regions or lowest performers
      const regions = [...new Set(stores.map(store => store.fieldSalesRegio))];
      const selectedRegions = new Set(selectedStores.map(store => store.fieldSalesRegio));
      const underrepresentedRegions = regions.filter(region => !selectedRegions.has(region));
      
      const experimentalStores: StoreData[] = [];
      
      // First, add stores from underrepresented regions
      for (const region of underrepresentedRegions) {
        if (experimentalStores.length >= experimentalCount) break;
        const regionStores = finalRemaining.filter(store => store.fieldSalesRegio === region);
        if (regionStores.length > 0) {
          const bestInRegion = regionStores.reduce((best, current) => 
            current.prodSelect > best.prodSelect ? current : best
          );
          experimentalStores.push(bestInRegion);
        }
      }
      
      // Fill remaining experimental slots with lowest performers
      const remaining = finalRemaining
        .filter(store => !experimentalStores.includes(store))
        .sort((a, b) => a.prodSelect - b.prodSelect);
      
      experimentalStores.push(...remaining.slice(0, experimentalCount - experimentalStores.length));
      selectedStores.push(...experimentalStores);
    }
    
    return selectedStores.slice(0, target);
  }

  /**
   * Market Penetration Strategy
   * Focus on high-density markets and competitive positioning
   */
  private static marketPenetrationSelection(stores: StoreData[], targetConfig: TargetConfig, config: StrategyConfiguration): StoreData[] {
    const target = targetConfig.total;
    
    // Group by region and prioritize regions with more stores (higher density)
    const storesByRegion = this.groupStoresByRegion(stores);
    const regionDensity = Object.entries(storesByRegion)
      .map(([region, regionStores]) => ({
        region,
        storeCount: regionStores.length,
        avgRevenue: regionStores.reduce((sum, store) => sum + store.prodSelect, 0) / regionStores.length,
        stores: regionStores
      }))
      .sort((a, b) => {
        // Sort by density first, then by average revenue
        const densityDiff = b.storeCount - a.storeCount;
        return densityDiff !== 0 ? densityDiff : b.avgRevenue - a.avgRevenue;
      });
    
    const selectedStores: StoreData[] = [];
    
    // Select more stores from high-density regions
    for (const { region, stores: regionStores } of regionDensity) {
      if (selectedStores.length >= target) break;
      
      // Calculate how many stores to select from this region based on density
      const remainingSlots = target - selectedStores.length;
      const regionWeight = regionStores.length / stores.length;
      const storesToSelect = Math.max(1, Math.min(remainingSlots, Math.ceil(target * regionWeight)));
      
      // Select top performers from this region
      const topStores = regionStores
        .sort((a, b) => b.prodSelect - a.prodSelect)
        .slice(0, storesToSelect);
      
      selectedStores.push(...topStores);
    }
    
    return selectedStores.slice(0, target);
  }

  /**
   * Demographic Targeting Strategy
   * Select stores based on target customer demographics and profiles
   */
  private static demographicTargetingSelection(stores: StoreData[], targetConfig: TargetConfig, config: StrategyConfiguration): StoreData[] {
    const target = targetConfig.total;
    
    // Group by customer group and channel type for demographic targeting
    const storesByDemographic = stores.reduce((acc, store) => {
      const key = `${store.klantgroep}-${store.kanaal}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(store);
      return acc;
    }, {} as Record<string, StoreData[]>);
    
    // Calculate performance for each demographic segment
    const segmentPerformance = Object.entries(storesByDemographic)
      .map(([segment, segmentStores]) => ({
        segment,
        storeCount: segmentStores.length,
        avgRevenue: segmentStores.reduce((sum, store) => sum + store.prodSelect, 0) / segmentStores.length,
        totalRevenue: segmentStores.reduce((sum, store) => sum + store.prodSelect, 0),
        stores: segmentStores.sort((a, b) => b.prodSelect - a.prodSelect)
      }))
      .sort((a, b) => b.avgRevenue - a.avgRevenue);
    
    const selectedStores: StoreData[] = [];
    
    // Select stores prioritizing high-performing demographic segments
    for (const { stores: segmentStores } of segmentPerformance) {
      if (selectedStores.length >= target) break;
      
      const remainingSlots = target - selectedStores.length;
      const storesToSelect = Math.min(remainingSlots, Math.max(1, Math.ceil(segmentStores.length * 0.3)));
      
      selectedStores.push(...segmentStores.slice(0, storesToSelect));
    }
    
    return selectedStores.slice(0, target);
  }

  /**
   * Group stores by region helper method
   */
  private static groupStoresByRegion(stores: StoreData[]): Record<string, StoreData[]> {
    return stores.reduce((acc, store) => {
      if (!acc[store.fieldSalesRegio]) {
        acc[store.fieldSalesRegio] = [];
      }
      acc[store.fieldSalesRegio].push(store);
      return acc;
    }, {} as Record<string, StoreData[]>);
  }

  /**
   * Generate comprehensive result analytics
   */
  private static generateResult(selectedStores: StoreData[], allStores: StoreData[]): SelectionResult {
    const totalRevenue = selectedStores.reduce((sum, store) => sum + store.prodSelect, 0);
    const averageRevenue = totalRevenue / selectedStores.length;
    
    const uniqueRegions = new Set(selectedStores.map(store => store.fieldSalesRegio));
    const totalRegions = new Set(allStores.map(store => store.fieldSalesRegio));
    const regionCoverage = uniqueRegions.size / totalRegions.size;
    
    // Performance distribution
    const revenues = selectedStores.map(store => store.prodSelect);
    const sortedRevenues = [...revenues].sort((a, b) => b - a);
    const highThreshold = sortedRevenues[Math.floor(sortedRevenues.length * 0.33)];
    const mediumThreshold = sortedRevenues[Math.floor(sortedRevenues.length * 0.66)];
    
    const performanceDistribution = {
      high: selectedStores.filter(store => store.prodSelect >= highThreshold).length,
      medium: selectedStores.filter(store => store.prodSelect >= mediumThreshold && store.prodSelect < highThreshold).length,
      low: selectedStores.filter(store => store.prodSelect < mediumThreshold).length,
    };
    
    // Revenue per region
    const revenuePerRegion: Record<string, number> = {};
    selectedStores.forEach(store => {
      revenuePerRegion[store.fieldSalesRegio] = (revenuePerRegion[store.fieldSalesRegio] || 0) + store.prodSelect;
    });
    
    const uniqueRetailers = new Set(selectedStores.map(store => store.naam.split(' ')[0]));
    
    return {
      selectedStores,
      totalRevenue,
      averageRevenue,
      regionCoverage,
      performanceDistribution,
      statistics: {
        totalStores: selectedStores.length,
        uniqueRegions: uniqueRegions.size,
        uniqueRetailers: uniqueRetailers.size,
        revenuePerRegion,
      },
    };
  }

  /**
   * Create empty result for error cases
   */
  private static createEmptyResult(): SelectionResult {
    return {
      selectedStores: [],
      totalRevenue: 0,
      averageRevenue: 0,
      regionCoverage: 0,
      performanceDistribution: { high: 0, medium: 0, low: 0 },
      statistics: {
        totalStores: 0,
        uniqueRegions: 0,
        uniqueRetailers: 0,
        revenuePerRegion: {},
      },
    };
  }
}

export class PerformanceAnalyzer {
  
  /**
   * Generate revenue histogram data
   */
  public static generateHistogram(stores: StoreData[], bins: number = 10): Array<{ range: string; count: number; stores: StoreData[] }> {
    const revenues = stores.map(store => store.prodSelect);
    const min = Math.min(...revenues);
    const max = Math.max(...revenues);
    const binSize = (max - min) / bins;
    
    const histogram: Array<{ range: string; count: number; stores: StoreData[] }> = [];
    
    for (let i = 0; i < bins; i++) {
      const binMin = min + i * binSize;
      const binMax = min + (i + 1) * binSize;
      
      const binStores = stores.filter(store => 
        store.prodSelect >= binMin && (i === bins - 1 ? store.prodSelect <= binMax : store.prodSelect < binMax)
      );
      
      histogram.push({
        range: `€${Math.round(binMin / 1000)}k - €${Math.round(binMax / 1000)}k`,
        count: binStores.length,
        stores: binStores,
      });
    }
    
    return histogram;
  }
} 