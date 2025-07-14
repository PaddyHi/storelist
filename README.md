# Store List Builder

A sophisticated React-based web application for retail analytics and store selection optimization. This tool enables retail managers, field sales teams, and strategic planners to intelligently select optimal store portfolios from large datasets using advanced algorithms and strategic methodologies.

## 🚀 Features

### 🎯 6-Step Optimization Workflow
1. **Import**: Upload CSV data or use sample dataset
2. **Setup**: Select retailer and set target store count
3. **Performance**: Choose performance tier filtering
4. **Strategy**: Match campaign objectives with selection algorithms
5. **Regional**: Configure geographic distribution and over-indexing
6. **Results**: Review analytics and export optimized selection

### 📊 Advanced Data Management
- **Flexible CSV Import**: Supports both comma and semicolon delimiters
- **Smart Data Parsing**: Handles currency formatting (€, $, £), missing values, and various column naming conventions
- **Partial Import Support**: Continue with partial data when some records have issues
- **Real-time Validation**: Immediate feedback with detailed error reporting
- **Production-Ready**: Handles real-world data inconsistencies gracefully

### 🎛️ Intelligent Selection Strategies
- **Revenue Focus**: Prioritize highest-performing stores
- **Geographic Balance**: Ensure optimal regional coverage
- **Growth Opportunity**: Target underperforming stores with potential
- **Portfolio Balance**: Strategic 70-20-10 methodology implementation
- **Market Penetration**: Maximize market presence
- **Stronghold Focus**: Build on existing high-performers

### 🗺️ Regional Distribution Control
- **National Coverage**: Even distribution across all regions
- **Over-indexing**: Focus on specific high-priority regions
- **Real-time Visualization**: See projected distribution changes instantly
- **Impact Analysis**: Understand focus percentage and store allocation
- **Regional Weighting**: Customize importance by geographic area

### 📈 Comprehensive Analytics
- **Performance Metrics**: Revenue totals, averages, and distribution analysis
- **Regional Coverage**: Geographic spread and market penetration insights
- **Portfolio Analysis**: Store type, retailer, and tier breakdowns
- **Interactive Visualization**: Sortable tables, progress bars, and distribution charts
- **Export Capabilities**: Professional CSV output with complete store details

## 🛠️ Technology Stack

- **Frontend**: React 18+ with TypeScript for type safety
- **Styling**: Tailwind CSS for responsive, modern design
- **Icons**: Lucide React for consistent iconography
- **Build Tool**: Vite for fast development and optimized builds
- **Data Processing**: Custom CSV parser with intelligent format detection
- **State Management**: React hooks with optimized re-rendering

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd store-list-builder
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## 🎯 Usage Guide

### Step 1: Import Your Data
- **Upload CSV**: Drag & drop or browse for your store data file
- **Use Sample Data**: 30 Dutch retail stores for immediate testing
- **Download Template**: Get the correct CSV format structure
- **Handle Warnings**: Option to continue with partial data imports

### Step 2: Retailer & Target Setup
- **Select Retailer**: Choose from available retailers in your dataset
- **Set Target**: Define how many stores to select
- **Review Metrics**: See retailer-specific statistics and averages

### Step 3: Performance Tier Selection
- **Choose Tier**: Select percentage (e.g., "Top 20%") or absolute threshold
- **View Distribution**: See performance spread across your dataset
- **Understand Impact**: Preview how tier selection affects your pool

### Step 4: Strategy Selection
- **Campaign Objectives**: Match your business goals with selection algorithms
- **Strategy Preview**: Understand how each approach works
- **Algorithm Details**: See methodology explanations and use cases

### Step 5: Regional Distribution
- **National Coverage**: Standard even distribution
- **Over-indexing**: Focus on specific regions with custom percentages
- **Real-time Preview**: See projected distribution changes instantly
- **Impact Analysis**: Understand regional focus and store allocation

### Step 6: Results Analysis
- **Performance Summary**: Total revenue, store count, regional coverage
- **Distribution Analysis**: Performance tiers, regional spread, retailer mix
- **Detailed Store List**: Complete selection with sorting and filtering
- **Export Results**: Download optimized selection as CSV

## 📋 Data Format

### Required CSV Structure
```csv
naam,crmId,storeId,stad,straat,nummer,postcode,kanaal,type,fieldSalesRegio,klantgroep,prodSelect,strategie,storeSize
```

### Field Descriptions
| Field | Description | Example | Required |
|-------|-------------|---------|----------|
| `naam` | Store name | "Albert Heijn Amsterdam" | ✅ |
| `crmId` | CRM identifier | "AH001" | ✅ |
| `storeId` | Store identifier | "ST001" | ✅ |
| `stad` | City | "Amsterdam" | ✅ |
| `straat` | Street | "Kalverstraat" | ✅ |
| `nummer` | Street number | "100" | ✅ |
| `postcode` | Postal code | "1012 AB" | ✅ |
| `kanaal` | Channel type | "Stedelijk Premium" | ✅ |
| `type` | Store type | "Filiaal" | ✅ |
| `fieldSalesRegio` | Sales region | "Noord-Holland" | ✅ |
| `klantgroep` | Customer group | "A" | ✅ |
| `prodSelect` | Revenue (numeric) | "€ 150,000" | ✅ |
| `strategie` | Store strategy | "Executie" | ✅ |
| `storeSize` | Store size | "1500" | ❌ |

### Data Flexibility
- **Delimiters**: Supports both comma (`,`) and semicolon (`;`) separated files
- **Currency**: Automatically parses €, $, £ symbols and thousand separators
- **Column Variations**: Handles common naming variations (e.g., `crmid` → `crmId`)
- **Missing Values**: Provides sensible defaults and validation warnings
- **Encoding**: Supports UTF-8 and common European character sets

## 🧮 Selection Algorithms

### Revenue Focus
Prioritizes stores by revenue performance, selecting top performers first while maintaining reasonable geographic distribution.

### Geographic Balance
Ensures optimal regional coverage by distributing selections proportionally across all sales regions.

### Growth Opportunity
Identifies underperforming stores with potential based on market characteristics and performance gaps.

### Portfolio Balance (70-20-10)
Strategic methodology allocating:
- **70%**: Core performing stores for stable foundation
- **20%**: Growth markets for expansion
- **10%**: Experimental locations for testing

### Market Penetration
Maximizes market presence by selecting stores that provide optimal coverage across customer segments and geographic areas.

### Stronghold Focus
Builds on existing high-performers while strategically expanding into adjacent high-potential markets.

## 🌍 Regional Distribution

### National Coverage
Even distribution across all available regions based on store density and market size.

### Over-indexing
Focus strategy allowing:
- **Region Selection**: Choose specific regions for emphasis
- **Focus Percentage**: Set how much selection should concentrate on chosen regions
- **Real-time Preview**: See immediate impact on distribution
- **Remainder Distribution**: Proportional allocation of remaining stores

## 📊 Sample Data

Includes 30 Dutch retail stores across:
- **Albert Heijn**: 10 locations across major cities
- **Jumbo**: 10 stores in diverse regions
- **Lidl**: 10 outlets representing discount retail segment

Complete with realistic data across all required fields for immediate testing.

## 🔧 Performance & Scalability

- **Dataset Size**: Efficiently handles 1,000+ stores with responsive UI
- **Real-time Updates**: Instant feedback on filter and configuration changes
- **Memory Optimization**: React hooks and useMemo for efficient rendering
- **Export Speed**: Generates CSV files in seconds regardless of dataset size
- **Error Handling**: Graceful degradation with partial data support

## 🌐 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For questions, issues, or feature requests, please open an issue in the repository.

---

**Store List Builder** - Professional retail analytics for strategic store selection at enterprise scale. 