# Store List Builder - Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Open in Browser**
   The application will automatically open at `http://localhost:3000`

## Build for Production

```bash
npm run build
npm run preview
```

## Development Commands

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Project Structure

```
store-list-builder/
├── public/
│   └── vite.svg           # Favicon
├── src/
│   ├── components/        # React components
│   ├── data/             # Sample data
│   ├── types/            # TypeScript types
│   ├── utils/            # Utility functions
│   ├── App.tsx           # Main app component
│   ├── main.tsx          # React entry point
│   └── index.css         # Global styles
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── vite.config.ts        # Vite configuration
├── tailwind.config.js    # Tailwind CSS configuration
└── README.md             # Project documentation
```

## Features Included

✅ **Data Import System**
- CSV file upload with validation
- Sample Dutch retail store data
- Template download

✅ **Target Configuration**  
- Basic target setting
- 70-20-10 methodology
- Advanced options

✅ **Strategy Selection**
- 6 strategic approaches
- Multi-dimensional filters
- Revenue histogram

✅ **Results Analysis**
- Performance analytics
- Regional coverage
- CSV export

## Technology Stack

- **React 18** - Latest stable version
- **TypeScript 5.3** - Latest stable version  
- **Vite 5.1** - Latest build tool
- **Tailwind CSS 3.4** - Latest utility-first CSS
- **Lucide React 0.330** - Latest icon library

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Troubleshooting

If you encounter any issues:

1. **Clear node_modules and reinstall**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Check Node.js version** (requires Node 18+)
   ```bash
   node --version
   npm --version
   ```

3. **Clear browser cache** and reload the page

4. **Check browser console** for any error messages

## Sample Data

The application includes 16 sample Dutch retail stores:
- Albert Heijn (6 locations)
- Jumbo (4 locations)  
- Other retailers: Lidl, Aldi, Plus, Vomar, Coop, Spar

## Next Steps

1. Upload your own CSV data or use the sample dataset
2. Configure your target store count
3. Select a strategy and apply filters
4. Review results and export your selection

Happy store selecting! 🏪 