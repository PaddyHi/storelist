import { StoreData, ColumnAnalysis, DataColumnMapping, SelectionStrategy } from '../types';

export class ColumnAnalyzer {
  
  /**
   * Analyze all columns in the dataset
   */
  static analyzeDataset(stores: StoreData[]): ColumnAnalysis[] {
    if (!stores || stores.length === 0) return [];
    
    const columns: ColumnAnalysis[] = [];
    const sampleStore = stores[0];
    
    // Analyze each column
    Object.keys(sampleStore).forEach(columnName => {
      const analysis = this.analyzeColumn(stores, columnName);
      columns.push(analysis);
    });
    
    return columns;
  }
  
  /**
   * Analyze a specific column
   */
  private static analyzeColumn(stores: StoreData[], columnName: string): ColumnAnalysis {
    const values = stores.map(store => store[columnName as keyof StoreData]).filter(v => v != null);
    const uniqueValues = new Set(values);
    const nullCount = stores.length - values.length;
    
    // Determine column type
    const type = this.determineColumnType(values);
    
    // Calculate statistics for numeric columns
    let statistics;
    if (type === 'numeric') {
      const numericValues = values.map(v => Number(v)).filter(v => !isNaN(v));
      statistics = this.calculateNumericStatistics(numericValues);
    }
    
    // Get sample values
    const sampleValues = Array.from(uniqueValues).slice(0, 5);
    
    // Suggest which strategy requirements this could fulfill
    const suggestedRequirements = this.suggestStrategyRequirements(columnName, type, uniqueValues.size);
    
    return {
      name: columnName,
      type,
      uniqueValues: uniqueValues.size,
      nullCount,
      sampleValues,
      statistics,
      suggestedRequirements
    };
  }
  
  /**
   * Determine the type of a column based on its values
   */
  private static determineColumnType(values: any[]): 'numeric' | 'categorical' | 'boolean' | 'date' | 'unknown' {
    if (values.length === 0) return 'unknown';
    
    // Check if all values are numeric
    const numericValues = values.map(v => Number(v)).filter(v => !isNaN(v));
    if (numericValues.length === values.length) {
      return 'numeric';
    }
    
    // Check if all values are boolean-like
    const booleanLikeValues = values.filter(v => 
      typeof v === 'boolean' || 
      (typeof v === 'string' && ['true', 'false', 'yes', 'no', '1', '0'].includes(v.toLowerCase()))
    );
    if (booleanLikeValues.length === values.length) {
      return 'boolean';
    }
    
    // Check if values look like dates
    const dateValues = values.filter(v => {
      const date = new Date(v);
      return !isNaN(date.getTime());
    });
    if (dateValues.length === values.length) {
      return 'date';
    }
    
    // Default to categorical
    return 'categorical';
  }
  
  /**
   * Calculate statistics for numeric columns
   */
  private static calculateNumericStatistics(values: number[]) {
    if (values.length === 0) return undefined;
    
    const sorted = values.sort((a, b) => a - b);
    const sum = values.reduce((a, b) => a + b, 0);
    const mean = sum / values.length;
    
    const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
    const standardDeviation = Math.sqrt(variance);
    
    return {
      min: sorted[0],
      max: sorted[sorted.length - 1],
      mean,
      median: sorted[Math.floor(sorted.length / 2)],
      standardDeviation
    };
  }
  
  /**
   * Suggest which strategy requirements a column could fulfill
   */
  private static suggestStrategyRequirements(
    columnName: string, 
    type: string, 
    uniqueValues: number
  ): string[] {
    const suggestions: string[] = [];
    const lowerName = columnName.toLowerCase();
    
    // Performance-related suggestions
    if (type === 'numeric' && (
      lowerName.includes('revenue') || 
      lowerName.includes('sales') || 
      lowerName.includes('prodselect') ||
      lowerName.includes('performance') ||
      lowerName.includes('profit')
    )) {
      suggestions.push('performance', 'revenue', 'sales');
    }
    
    // Size-related suggestions
    if (type === 'numeric' && (
      lowerName.includes('size') || 
      lowerName.includes('area') || 
      lowerName.includes('sqft') ||
      lowerName.includes('sqm')
    )) {
      suggestions.push('storeSize', 'area');
    }
    
    // Location-related suggestions
    if (type === 'categorical' && (
      lowerName.includes('region') || 
      lowerName.includes('area') || 
      lowerName.includes('zone') ||
      lowerName.includes('regio') ||
      lowerName.includes('stad') ||
      lowerName.includes('city')
    )) {
      suggestions.push('region', 'location', 'geographic');
    }
    
    // Customer-related suggestions
    if (type === 'categorical' && (
      lowerName.includes('customer') || 
      lowerName.includes('klant') || 
      lowerName.includes('demographic') ||
      lowerName.includes('group')
    )) {
      suggestions.push('customerSegment', 'demographic');
    }
    
    // Channel-related suggestions
    if (type === 'categorical' && (
      lowerName.includes('channel') || 
      lowerName.includes('kanaal') || 
      lowerName.includes('type') ||
      lowerName.includes('format')
    )) {
      suggestions.push('channel', 'storeType');
    }
    
    return suggestions;
  }
  
  /**
   * Generate suggested column mappings for all strategies
   */
  static generateSuggestedMappings(columns: ColumnAnalysis[]): Record<SelectionStrategy, Record<string, string>> {
    const mappings: Record<SelectionStrategy, Record<string, string>> = {
      'revenue-focus': {},
      'geographic-coverage': {},
      'growth-opportunities': {},
      'portfolio-balance': {},
      'market-penetration': {},
      'demographic-targeting': {}
    };
    
    // Revenue Focus Strategy
    const revenueColumn = columns.find(c => c.suggestedRequirements.includes('performance') || c.suggestedRequirements.includes('revenue'));
    if (revenueColumn) {
      mappings['revenue-focus']['performance'] = revenueColumn.name;
    }
    
    // Geographic Coverage Strategy
    const regionColumn = columns.find(c => c.suggestedRequirements.includes('region') || c.suggestedRequirements.includes('geographic'));
    if (regionColumn) {
      mappings['geographic-coverage']['region'] = regionColumn.name;
      mappings['market-penetration']['region'] = regionColumn.name;
    }
    
    // Growth Opportunities Strategy
    if (revenueColumn) {
      mappings['growth-opportunities']['performance'] = revenueColumn.name;
    }
    const sizeColumn = columns.find(c => c.suggestedRequirements.includes('storeSize'));
    if (sizeColumn) {
      mappings['growth-opportunities']['storeSize'] = sizeColumn.name;
    }
    
    // Portfolio Balance Strategy
    if (revenueColumn) {
      mappings['portfolio-balance']['performance'] = revenueColumn.name;
    }
    if (regionColumn) {
      mappings['portfolio-balance']['region'] = regionColumn.name;
    }
    
    // Demographic Targeting Strategy
    const customerColumn = columns.find(c => c.suggestedRequirements.includes('customerSegment'));
    if (customerColumn) {
      mappings['demographic-targeting']['customerSegment'] = customerColumn.name;
    }
    if (regionColumn) {
      mappings['demographic-targeting']['region'] = regionColumn.name;
    }
    
    return mappings;
  }
  
  /**
   * Validate if required columns are available for a strategy
   */
  static validateStrategyRequirements(
    columns: ColumnAnalysis[],
    strategy: SelectionStrategy,
    requiredMappings: string[]
  ): { isValid: boolean; missingColumns: string[] } {
    const columnNames = columns.map(c => c.name);
    const missingColumns: string[] = [];
    
    requiredMappings.forEach(requirement => {
      if (!columnNames.includes(requirement)) {
        missingColumns.push(requirement);
      }
    });
    
    return {
      isValid: missingColumns.length === 0,
      missingColumns
    };
  }
} 