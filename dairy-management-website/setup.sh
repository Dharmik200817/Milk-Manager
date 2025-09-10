#!/bin/bash

# Milk Retailer Management System - Setup Script
# This script helps set up the application for development or production

echo "🥛 Milk Retailer Management System Setup"
echo "========================================"

# Check if we're in the right directory
if [ ! -f "src/index.html" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "✅ Project structure validated"

# Check for Node.js (optional but recommended for local development)
if command -v node &> /dev/null; then
    echo "✅ Node.js found: $(node --version)"
    
    # Install serve if not present
    if ! command -v serve &> /dev/null; then
        echo "📦 Installing serve for local development..."
        npm install -g serve
    fi
    
    echo "🚀 You can now run:"
    echo "   npm run dev    # Start development server on port 3000"
    echo "   npm start      # Start server on default port"
else
    echo "⚠️  Node.js not found - you can still use Python or other web servers"
fi

# Check for Python (alternative for local development)
if command -v python3 &> /dev/null; then
    echo "✅ Python 3 found: $(python3 --version)"
    echo "🐍 Alternative: Run 'cd src && python3 -m http.server 8000'"
elif command -v python &> /dev/null; then
    echo "✅ Python found: $(python --version)"
    echo "🐍 Alternative: Run 'cd src && python -m http.server 8000'"
fi

echo ""
echo "📋 Next Steps:"
echo "1. Set up your Supabase project at https://supabase.com"
echo "2. Update config/supabase-config.js with your credentials"
echo "3. Run the database schema in your Supabase SQL editor"
echo "4. Start the development server"
echo "5. Open http://localhost:3000 (or 8000) in your browser"

echo ""
echo "📁 File Structure:"
echo "src/                 # Web application files"
echo "├── index.html       # Main application"
echo "├── css/            # Stylesheets"
echo "├── js/             # JavaScript files"
echo "config/             # Configuration files"
echo "└── README.md       # Documentation"

echo ""
echo "🔧 For production deployment:"
echo "1. Upload contents of 'src/' folder to your web hosting"
echo "2. Ensure HTTPS is enabled"
echo "3. Test the application thoroughly"

echo ""
echo "📖 For detailed instructions, see README.md"
echo "✨ Setup complete! Happy milk managing! 🥛"
