# À Votre Service

A comprehensive multi-tool productivity suite offering over 50 integrated tools for calculations, text processing, health monitoring, creativity, and productivity enhancement.

## Features

### 🧮 Calculators
- Basic Calculator with advanced operations
- BMI Calculator with health recommendations
- Date Calculator for time computations
- Unit Converter for various measurements
- Percentage Calculator
- Tip Calculator

### 📝 Text & Data Tools
- Text Utilities (case conversion, word count, etc.)
- Password Generator with customizable options
- QR Code Generator
- Base64 Encoder/Decoder
- JSON Formatter and Validator
- Hash Generator (MD5, SHA-1, SHA-256)

### 🎨 Creativity Tools
- Color Palette Generator
- Lorem Ipsum Generator
- Random Quote Generator
- Dice Roller
- Random Number Generator

### 💪 Health & Wellness
- BMI Calculator with detailed analysis
- Water Intake Tracker
- Calorie Calculator
- Sleep Tracker
- Exercise Timer

### 📊 Productivity Tools
- Todo List Manager
- Pomodoro Timer
- Note Taking
- Habit Tracker
- Goal Setting

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd a_votre_service
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:8080`

### Building for Production

```bash
npm run build
```

## Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Components**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Local Storage**: IndexedDB via Dexie
- **State Management**: React Query + Context API
- **Routing**: React Router DOM
- **Charts**: Recharts
- **Icons**: Lucide React

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   └── tools/          # Tool-specific components
├── contexts/           # React contexts
├── hooks/              # Custom React hooks
├── pages/              # Page components
├── utils/              # Utility functions
└── types/              # TypeScript type definitions
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have questions, please open an issue on the GitHub repository.
