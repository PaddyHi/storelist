# Store List Builder

A sophisticated React-based web application for retail analytics and store selection optimization. This tool enables retail managers, field sales teams, and strategic planners to intelligently select optimal store portfolios from large datasets based on multiple criteria and strategic methodologies.

## Features

### 🎯 Core Functionality
- **Data-Driven Store Selection**: Make informed decisions about which stores to target
- **Strategic Portfolio Optimization**: Implement proven retail methodologies like the 70-20-10 approach
- **Scalable Analysis**: Handle datasets from small samples to enterprise-level store networks
- **User-Friendly Interface**: Complex analytics through an intuitive, step-by-step workflow

### 📊 Data Management
- **CSV File Upload**: Upload and validate store data with comprehensive error handling
- **Sample Data**: Pre-loaded dataset of 16 Dutch retail stores for immediate testing
- **Template Download**: Get correctly formatted CSV templates
- **Data Validation**: Robust parsing with error detection and warnings

### 🎛️ Target Configuration
- **Basic Target Setting**: Simple numeric input with validation
- **70-20-10 Methodology**: Strategic allocation framework
  - 70% National Coverage
  - 20% Brand Strongholds
  - 10% Untapped Potential
- **Advanced Options**: Population weighting and high-performer prioritization

### 🔄 Selection Strategies
1. **Balanced Coverage**: Even distribution across regions and performance levels
2. **Top Performers**: Revenue-focused selection
3. **Geographic Spread**: Maximum regional coverage
4. **Growth Opportunity**: Target underperforming stores with potential
5. **70-20-10 Methodology**: Strategic allocation framework
6. **Stronghold Focus**: 80% established performers, 20% expansion

### 🔍 Advanced Filtering
- **Multi-Dimensional Filters**: 
  - Retailers (Albert Heijn, Jumbo, etc.)
  - Store Types (Filiaal, Franchiser)
  - Strategies (Executie, Brandbuilding, Executie+)
  - Channels (Stedelijk Premium, Landelijk Mainstream, etc.)
  - Customer Groups (A, B, C, D)
  - Revenue Range with histogram visualization
  - Regional controls (include/exclude)

### 📈 Results & Analytics
- **Statistical Analysis**: Total revenue, regional coverage, performance distribution
- **Data Visualization**: Performance indicators, regional analysis, histogram charts
- **Sortable Tables**: Interactive store listings with comprehensive data
- **Export Functionality**: CSV export with proper formatting

## Technology Stack

- **Frontend**: React 18+ with TypeScript
- **Styling**: Tailwind CSS for responsive design
- **Icons**: Lucide React for consistent iconography
- **Build Tool**: Vite for fast development and building
- **Data Processing**: Custom CSV parser with validation

## Installation

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

## Usage

### Step 1: Import Data
- Upload a CSV file with store data or use the sample dataset
- Download the template if you need the correct format
- Review data validation results and warnings

### Step 2: Configure Target
- Set the number of stores to select
- Optionally enable 70-20-10 methodology with advanced options
- Configure allocation percentages and weighting preferences

### Step 3: Select Strategy & Apply Filters
- Choose from six strategic approaches
- Apply multi-dimensional filters to refine your dataset
- View real-time histogram of revenue distribution

### Step 4: Review Results
- Analyze comprehensive selection results
- Review performance distribution and regional coverage
- Export final selection as CSV

## Data Format

The application expects CSV files with the following columns:

```csv
naam,crmId,storeId,stad,straat,nummer,postcode,kanaal,type,fieldSalesRegio,klantgroep,prodSelect,strategie
```

### Field Descriptions
- `naam`: Store name
- `crmId`: CRM identifier
- `storeId`: Store identifier
- `stad`: City
- `straat`: Street
- `nummer`: Street number
- `postcode`: Postal code (Dutch format: 1234 AB)
- `kanaal`: Channel type
- `type`: Store type (Filiaal/Franchiser)
- `fieldSalesRegio`: Sales region
- `klantgroep`: Customer group (A/B/C/D)
- `prodSelect`: Revenue/performance metric (numeric)
- `strategie`: Store strategy

## Sample Data

The application includes a sample dataset with 16 Dutch retail stores:
- Albert Heijn locations in major cities
- Jumbo stores across different regions
- Other retailers like Lidl, Aldi, Plus, Vomar, Coop, and Spar
- Realistic data across all required fields

## Strategic Methodologies

### 70-20-10 Methodology
A proven retail allocation framework:
- **70% National Coverage**: Broad market presence across regions
- **20% Brand Strongholds**: High-performing locations for brand reinforcement
- **10% Untapped Potential**: Growth opportunity stores

### Selection Algorithms
Each strategy uses sophisticated algorithms:
- **Balanced**: Regional distribution with performance balancing
- **Top Performers**: Revenue-based ranking
- **Geographic**: Round-robin regional selection
- **Growth**: Percentile-based opportunity identification
- **Stronghold**: High-performer focus with strategic expansion

## Performance & Scalability

- **Dataset Size**: Efficiently handles 1000+ stores
- **Filter Combinations**: Supports complex multi-criteria filtering
- **Memory Management**: Optimized with React hooks and useMemo
- **Export Speed**: Generates CSV files in seconds
- **UI Responsiveness**: Maintains 60fps interactions

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For questions or support, please open an issue in the repository.

---

**Store List Builder** - Sophisticated retail analytics for strategic store selection at scale. 