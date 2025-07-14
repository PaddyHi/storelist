import { StoreData } from '../types';

// Sample dataset with 30 Dutch retail stores (10 each of Albert Heijn, Jumbo, and Lidl)
export const sampleStores: StoreData[] = [
  // Albert Heijn - 10 stores
  {
    naam: 'Albert Heijn Amsterdam Centraal',
    crmId: 'AH-001',
    storeId: 'AH-AMS-001',
    stad: 'Amsterdam',
    straat: 'Stationsplein',
    nummer: '15',
    postcode: '1012 AB',
    kanaal: 'Stedelijk Premium',
    type: 'Filiaal',
    fieldSalesRegio: 'Noord-Holland',
    klantgroep: 'A',
    prodSelect: 2850000,
    strategie: 'Brandbuilding',
    storeSize: 1200
  },
  {
    naam: 'Albert Heijn Utrecht Centrum',
    crmId: 'AH-002',
    storeId: 'AH-UTR-002',
    stad: 'Utrecht',
    straat: 'Lange Elisabethstraat',
    nummer: '67',
    postcode: '3511 JH',
    kanaal: 'Stedelijk Premium',
    type: 'Filiaal',
    fieldSalesRegio: 'Utrecht',
    klantgroep: 'A',
    prodSelect: 2650000,
    strategie: 'Executie+',
    storeSize: 1100
  },
  {
    naam: 'Albert Heijn Rotterdam Blaak',
    crmId: 'AH-003',
    storeId: 'AH-RTD-003',
    stad: 'Rotterdam',
    straat: 'Blaak',
    nummer: '32',
    postcode: '3011 TA',
    kanaal: 'Stedelijk Premium',
    type: 'Filiaal',
    fieldSalesRegio: 'Zuid-Holland',
    klantgroep: 'A',
    prodSelect: 2750000,
    strategie: 'Brandbuilding',
    storeSize: 1350
  },
  {
    naam: 'Albert Heijn Den Haag Centrum',
    crmId: 'AH-004',
    storeId: 'AH-DH-004',
    stad: 'Den Haag',
    straat: 'Spui',
    nummer: '186',
    postcode: '2511 BW',
    kanaal: 'Stedelijk Premium',
    type: 'Filiaal',
    fieldSalesRegio: 'Zuid-Holland',
    klantgroep: 'A',
    prodSelect: 2450000,
    strategie: 'Executie+',
    storeSize: 950
  },
  {
    naam: 'Albert Heijn Eindhoven Centrum',
    crmId: 'AH-005',
    storeId: 'AH-EIN-005',
    stad: 'Eindhoven',
    straat: 'Rechtestraat',
    nummer: '24',
    postcode: '5611 GM',
    kanaal: 'Stedelijk Basis',
    type: 'Filiaal',
    fieldSalesRegio: 'Noord-Brabant',
    klantgroep: 'B',
    prodSelect: 1950000,
    strategie: 'Executie',
    storeSize: 800
  },
  {
    naam: 'Albert Heijn Groningen Centrum',
    crmId: 'AH-006',
    storeId: 'AH-GRN-006',
    stad: 'Groningen',
    straat: 'Herestraat',
    nummer: '45',
    postcode: '9711 GA',
    kanaal: 'Stedelijk Basis',
    type: 'Filiaal',
    fieldSalesRegio: 'Groningen',
    klantgroep: 'B',
    prodSelect: 1850000,
    strategie: 'Executie',
    storeSize: 750
  },
  {
    naam: 'Albert Heijn Tilburg Centrum',
    crmId: 'AH-007',
    storeId: 'AH-TIL-007',
    stad: 'Tilburg',
    straat: 'Heuvelstraat',
    nummer: '120',
    postcode: '5038 CM',
    kanaal: 'Stedelijk Basis',
    type: 'Filiaal',
    fieldSalesRegio: 'Noord-Brabant',
    klantgroep: 'B',
    prodSelect: 2100000,
    strategie: 'Executie+',
    storeSize: 1050
  },
  {
    naam: 'Albert Heijn Nijmegen Centrum',
    crmId: 'AH-008',
    storeId: 'AH-NMG-008',
    stad: 'Nijmegen',
    straat: 'Broerstraat',
    nummer: '89',
    postcode: '6511 HZ',
    kanaal: 'Stedelijk Basis',
    type: 'Filiaal',
    fieldSalesRegio: 'Gelderland',
    klantgroep: 'B',
    prodSelect: 1750000,
    strategie: 'Executie',
    storeSize: 850
  },
  {
    naam: 'Albert Heijn Maastricht Centrum',
    crmId: 'AH-009',
    storeId: 'AH-MST-009',
    stad: 'Maastricht',
    straat: 'Grote Staat',
    nummer: '56',
    postcode: '6211 SZ',
    kanaal: 'Stedelijk Premium',
    type: 'Filiaal',
    fieldSalesRegio: 'Limburg',
    klantgroep: 'A',
    prodSelect: 2250000,
    strategie: 'Brandbuilding',
    storeSize: 1400
  },
  {
    naam: 'Albert Heijn Arnhem Centrum',
    crmId: 'AH-010',
    storeId: 'AH-ARN-010',
    stad: 'Arnhem',
    straat: 'Ketelstraat',
    nummer: '78',
    postcode: '6828 XZ',
    kanaal: 'Stedelijk Basis',
    type: 'Filiaal',
    fieldSalesRegio: 'Gelderland',
    klantgroep: 'B',
    prodSelect: 1900000,
    strategie: 'Executie',
    storeSize: 900
  },

  // Jumbo - 10 stores
  {
    naam: 'Jumbo Amsterdam Noord',
    crmId: 'JMB-001',
    storeId: 'JMB-AMS-001',
    stad: 'Amsterdam',
    straat: 'Nieuwendammerdijk',
    nummer: '406',
    postcode: '1023 BX',
    kanaal: 'Stedelijk Basis',
    type: 'Franchiser',
    fieldSalesRegio: 'Noord-Holland',
    klantgroep: 'B',
    prodSelect: 2100000,
    strategie: 'Executie',
    storeSize: 1600
  },
  {
    naam: 'Jumbo Utrecht Overvecht',
    crmId: 'JMB-002',
    storeId: 'JMB-UTR-002',
    stad: 'Utrecht',
    straat: 'Europalaan',
    nummer: '100',
    postcode: '3526 KS',
    kanaal: 'Stedelijk Basis',
    type: 'Franchiser',
    fieldSalesRegio: 'Utrecht',
    klantgroep: 'B',
    prodSelect: 1850000,
    strategie: 'Executie',
    storeSize: 1400
  },
  {
    naam: 'Jumbo Rotterdam Zuid',
    crmId: 'JMB-003',
    storeId: 'JMB-RTD-003',
    stad: 'Rotterdam',
    straat: 'Zuidplein',
    nummer: '120',
    postcode: '3083 CW',
    kanaal: 'Stedelijk Basis',
    type: 'Franchiser',
    fieldSalesRegio: 'Zuid-Holland',
    klantgroep: 'B',
    prodSelect: 2000000,
    strategie: 'Executie',
    storeSize: 1550
  },
  {
    naam: 'Jumbo Tilburg Centrum',
    crmId: 'JMB-004',
    storeId: 'JMB-TIL-004',
    stad: 'Tilburg',
    straat: 'Heuvelstraat',
    nummer: '89',
    postcode: '5038 CM',
    kanaal: 'Stedelijk Basis',
    type: 'Franchiser',
    fieldSalesRegio: 'Noord-Brabant',
    klantgroep: 'B',
    prodSelect: 1750000,
    strategie: 'Executie',
    storeSize: 1300
  },
  {
    naam: 'Jumbo Den Haag Zuid',
    crmId: 'JMB-005',
    storeId: 'JMB-DH-005',
    stad: 'Den Haag',
    straat: 'Hobbemastraat',
    nummer: '134',
    postcode: '2526 JL',
    kanaal: 'Stedelijk Basis',
    type: 'Franchiser',
    fieldSalesRegio: 'Zuid-Holland',
    klantgroep: 'B',
    prodSelect: 1950000,
    strategie: 'Executie',
    storeSize: 1450
  },
  {
    naam: 'Jumbo Eindhoven Noord',
    crmId: 'JMB-006',
    storeId: 'JMB-EIN-006',
    stad: 'Eindhoven',
    straat: 'Kerkstraat',
    nummer: '201',
    postcode: '5611 GH',
    kanaal: 'Stedelijk Basis',
    type: 'Franchiser',
    fieldSalesRegio: 'Noord-Brabant',
    klantgroep: 'B',
    prodSelect: 1800000,
    strategie: 'Executie',
    storeSize: 1350
  },
  {
    naam: 'Jumbo Groningen Centrum',
    crmId: 'JMB-007',
    storeId: 'JMB-GRN-007',
    stad: 'Groningen',
    straat: 'Folkingestraat',
    nummer: '78',
    postcode: '9711 KZ',
    kanaal: 'Stedelijk Basis',
    type: 'Franchiser',
    fieldSalesRegio: 'Groningen',
    klantgroep: 'B',
    prodSelect: 1700000,
    strategie: 'Executie',
    storeSize: 1250
  },
  {
    naam: 'Jumbo Breda Centrum',
    crmId: 'JMB-008',
    storeId: 'JMB-BRD-008',
    stad: 'Breda',
    straat: 'Ginnekenstraat',
    nummer: '145',
    postcode: '4811 JE',
    kanaal: 'Stedelijk Basis',
    type: 'Franchiser',
    fieldSalesRegio: 'Noord-Brabant',
    klantgroep: 'B',
    prodSelect: 1900000,
    strategie: 'Executie',
    storeSize: 1400
  },
  {
    naam: 'Jumbo Zwolle Centrum',
    crmId: 'JMB-009',
    storeId: 'JMB-ZWL-009',
    stad: 'Zwolle',
    straat: 'Diezerstraat',
    nummer: '89',
    postcode: '8011 XA',
    kanaal: 'Stedelijk Basis',
    type: 'Franchiser',
    fieldSalesRegio: 'Overijssel',
    klantgroep: 'B',
    prodSelect: 1650000,
    strategie: 'Executie',
    storeSize: 1200
  },
  {
    naam: 'Jumbo Haarlem Centrum',
    crmId: 'JMB-010',
    storeId: 'JMB-HLM-010',
    stad: 'Haarlem',
    straat: 'Grote Markt',
    nummer: '34',
    postcode: '2011 RD',
    kanaal: 'Stedelijk Basis',
    type: 'Franchiser',
    fieldSalesRegio: 'Noord-Holland',
    klantgroep: 'B',
    prodSelect: 1750000,
    strategie: 'Executie',
    storeSize: 1300
  },

  // Lidl - 10 stores
  {
    naam: 'Lidl Amsterdam West',
    crmId: 'LDL-001',
    storeId: 'LDL-AMS-001',
    stad: 'Amsterdam',
    straat: 'Postjesweg',
    nummer: '99',
    postcode: '1057 DT',
    kanaal: 'Landelijk Basis',
    type: 'Filiaal',
    fieldSalesRegio: 'Noord-Holland',
    klantgroep: 'C',
    prodSelect: 1200000,
    strategie: 'Executie',
    storeSize: 1100
  },
  {
    naam: 'Lidl Utrecht Noord',
    crmId: 'LDL-002',
    storeId: 'LDL-UTR-002',
    stad: 'Utrecht',
    straat: 'Vasco da Gamalaan',
    nummer: '45',
    postcode: '3526 GA',
    kanaal: 'Landelijk Basis',
    type: 'Filiaal',
    fieldSalesRegio: 'Utrecht',
    klantgroep: 'C',
    prodSelect: 1150000,
    strategie: 'Executie',
    storeSize: 1050
  },
  {
    naam: 'Lidl Rotterdam Noord',
    crmId: 'LDL-003',
    storeId: 'LDL-RTD-003',
    stad: 'Rotterdam',
    straat: 'Bergweg',
    nummer: '234',
    postcode: '3037 LG',
    kanaal: 'Landelijk Basis',
    type: 'Filiaal',
    fieldSalesRegio: 'Zuid-Holland',
    klantgroep: 'C',
    prodSelect: 1300000,
    strategie: 'Executie',
    storeSize: 1150
  },
  {
    naam: 'Lidl Den Haag Oost',
    crmId: 'LDL-004',
    storeId: 'LDL-DH-004',
    stad: 'Den Haag',
    straat: 'Hobbemastraat',
    nummer: '78',
    postcode: '2526 JL',
    kanaal: 'Landelijk Basis',
    type: 'Filiaal',
    fieldSalesRegio: 'Zuid-Holland',
    klantgroep: 'C',
    prodSelect: 1100000,
    strategie: 'Executie',
    storeSize: 1000
  },
  {
    naam: 'Lidl Eindhoven Zuid',
    crmId: 'LDL-005',
    storeId: 'LDL-EIN-005',
    stad: 'Eindhoven',
    straat: 'Tongelresestraat',
    nummer: '156',
    postcode: '5613 DA',
    kanaal: 'Landelijk Basis',
    type: 'Filiaal',
    fieldSalesRegio: 'Noord-Brabant',
    klantgroep: 'C',
    prodSelect: 1050000,
    strategie: 'Executie',
    storeSize: 950
  },
  {
    naam: 'Lidl Groningen Zuid',
    crmId: 'LDL-006',
    storeId: 'LDL-GRN-006',
    stad: 'Groningen',
    straat: 'Hereweg',
    nummer: '234',
    postcode: '9725 AG',
    kanaal: 'Landelijk Basis',
    type: 'Filiaal',
    fieldSalesRegio: 'Groningen',
    klantgroep: 'C',
    prodSelect: 1000000,
    strategie: 'Executie',
    storeSize: 900
  },
  {
    naam: 'Lidl Tilburg Noord',
    crmId: 'LDL-007',
    storeId: 'LDL-TIL-007',
    stad: 'Tilburg',
    straat: 'Ringbaan-Oost',
    nummer: '89',
    postcode: '5013 CB',
    kanaal: 'Landelijk Basis',
    type: 'Filiaal',
    fieldSalesRegio: 'Noord-Brabant',
    klantgroep: 'C',
    prodSelect: 1150000,
    strategie: 'Executie',
    storeSize: 1050
  },
  {
    naam: 'Lidl Nijmegen West',
    crmId: 'LDL-008',
    storeId: 'LDL-NMG-008',
    stad: 'Nijmegen',
    straat: 'Daalseweg',
    nummer: '234',
    postcode: '6521 GK',
    kanaal: 'Landelijk Basis',
    type: 'Filiaal',
    fieldSalesRegio: 'Gelderland',
    klantgroep: 'C',
    prodSelect: 1080000,
    strategie: 'Executie',
    storeSize: 980
  },
  {
    naam: 'Lidl Breda West',
    crmId: 'LDL-009',
    storeId: 'LDL-BRD-009',
    stad: 'Breda',
    straat: 'Haagdijk',
    nummer: '67',
    postcode: '4814 NL',
    kanaal: 'Landelijk Basis',
    type: 'Filiaal',
    fieldSalesRegio: 'Noord-Brabant',
    klantgroep: 'C',
    prodSelect: 1120000,
    strategie: 'Executie',
    storeSize: 1020
  },
  {
    naam: 'Lidl Zwolle West',
    crmId: 'LDL-010',
    storeId: 'LDL-ZWL-010',
    stad: 'Zwolle',
    straat: 'Zwartewaterweg',
    nummer: '145',
    postcode: '8024 AG',
    kanaal: 'Landelijk Basis',
    type: 'Filiaal',
    fieldSalesRegio: 'Overijssel',
    klantgroep: 'C',
    prodSelect: 1050000,
    strategie: 'Executie',
    storeSize: 950
  }
];

// Helper function to get unique values for filter options
export const getUniqueValues = (stores: StoreData[], field: keyof StoreData): string[] => {
  return Array.from(new Set(stores.map(store => String(store[field]))));
};

// Helper function to get revenue statistics
export const getRevenueStats = (stores: StoreData[]) => {
  const revenues = stores.map(store => store.prodSelect);
  const sorted = [...revenues].sort((a, b) => a - b);
  
  return {
    min: sorted[0],
    max: sorted[sorted.length - 1],
    mean: revenues.reduce((sum, val) => sum + val, 0) / revenues.length,
    median: sorted[Math.floor(sorted.length / 2)],
    q1: sorted[Math.floor(sorted.length * 0.25)],
    q3: sorted[Math.floor(sorted.length * 0.75)]
  };
};

// Helper function to categorize stores by performance
export const categorizeByPerformance = (stores: StoreData[]) => {
  const stats = getRevenueStats(stores);
  const threshold1 = stats.q1;
  const threshold2 = stats.q3;
  
  return stores.map(store => ({
    ...store,
    performanceCategory: store.prodSelect >= threshold2 ? 'high' : 
                        store.prodSelect >= threshold1 ? 'medium' : 'low'
  }));
};

// CSV template for download
export const csvTemplate = `naam,crmId,storeId,stad,straat,nummer,postcode,kanaal,type,fieldSalesRegio,klantgroep,prodSelect,strategie
Albert Heijn Example,AH-999,AH-EX-999,Amsterdam,Damrak,1,1012 JS,Stedelijk Premium,Filiaal,Noord-Holland,A,2500000,Brandbuilding
Jumbo Example,JMB-999,JMB-EX-999,Utrecht,Hoofdstraat,50,3511 AA,Stedelijk Basis,Franchiser,Utrecht,B,1800000,Executie`;

// Default filter configuration
export const defaultFilters = {
  retailers: [],
  storeTypes: [],
  strategies: [],
  channels: [],
  customerGroups: [],
  revenueRange: {
    min: 0,
    max: 5000000
  },
  includedRegions: [],
  excludedRegions: []
}; 