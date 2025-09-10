# Milk Retailer Management System

A comprehensive web application for milk retailers to manage customer deliveries, billing, and daily operations efficiently.

## Features

### 🚚 Delivery Management
- **Quick Entry Buttons**: Common quantities (500ml, 1L, 1.5L, 2L)
- **Auto-fill**: Last entry auto-fills for faster repetitive inputs
- **Real-time Calculation**: Automatic total calculation with rates and extra items
- **Daily View**: Filter deliveries by date with export functionality

### 🥛 Milk Types & Rates
- **Flexible Milk Types**: Add different milk types (Cow, Buffalo, Toned, etc.)
- **Dynamic Rates**: Set and update rates per liter
- **Memory Feature**: Remembers previously selected milk type

### 💰 Billing System
- **Period-based Bills**: Daily, weekly, monthly billing periods
- **Detailed Invoices**: Professional invoice generation with customer details
- **Extra Items**: Include additional items (butter, paneer) in bills
- **Print & Save**: Print bills and save to database

### 👥 Customer Management
- **Customer Profiles**: Store customer information and preferences
- **Phone Validation**: Indian phone number validation
- **Search & Filter**: Quick customer search functionality
- **Delivery History**: Track customer delivery patterns

### 📊 Dashboard & Analytics
- **Today's Stats**: Deliveries count, revenue, total liters
- **Quick Actions**: Fast access to common operations
- **Visual Indicators**: Color-coded status and progress indicators

### 📱 Mobile Optimization
- **Responsive Design**: Optimized for smartphones and tablets
- **Touch-friendly**: Large touch targets for mobile interaction
- **Offline-ready**: Works with poor internet connectivity
- **Progressive Web App**: Can be installed on mobile devices

## Technology Stack

- **Frontend**: Pure HTML5, CSS3, JavaScript (ES6+)
- **UI Framework**: Custom CSS with modern design patterns
- **Database**: Supabase (PostgreSQL)
- **Icons**: Font Awesome
- **Fonts**: Google Fonts (Inter)

## Setup Instructions

### 1. Prerequisites
- Modern web browser
- Supabase account (free tier available)
- Text editor/IDE

### 2. Supabase Setup

1. **Create Supabase Project**
   - Go to [https://supabase.com](https://supabase.com)
   - Create a new account/login
   - Create a new project
   - Wait for project initialization (2-3 minutes)

2. **Get Project Credentials**
   - Go to Settings > API in your Supabase dashboard
   - Copy the "Project URL" 
   - Copy the "anon/public" key

3. **Update Configuration**
   - Open `config/supabase-config.js`
   - Replace placeholder values:
     ```javascript
     url: 'your-actual-project-url',
     anonKey: 'your-actual-anon-key'
     ```

4. **Create Database Schema**
   - Go to SQL Editor in Supabase dashboard
   - Copy the SQL from `src/js/supabase-client.js` (DATABASE_SCHEMA constant)
   - Run the SQL to create tables and relationships

### 3. Local Development

1. **Clone/Download the project**
   ```bash
   git clone <repository-url>
   cd dairy-management-website
   ```

2. **Serve the files**
   - Using Python:
     ```bash
     cd src
     python -m http.server 8000
     ```
   - Using Node.js:
     ```bash
     npx serve src
     ```
   - Or use VS Code Live Server extension

3. **Open in browser**
   - Navigate to `http://localhost:8000`
   - Check console for connection status

### 4. Production Deployment

**Option 1: Static Hosting (Recommended)**
- Deploy to Netlify, Vercel, or GitHub Pages
- Upload the `src` folder contents
- Configure environment variables if needed

**Option 2: Traditional Web Hosting**
- Upload files to your web hosting provider
- Ensure HTTPS is enabled for Supabase connection

## Usage Guide

### Initial Setup
1. **Add Milk Types**
   - Go to Settings section
   - Add your milk types with rates
   - Default types are pre-populated

2. **Add Customers**
   - Go to Customers section
   - Add customer details
   - Set preferred milk types

### Daily Operations

**Adding Deliveries**
1. Go to Deliveries section
2. Select customer and milk type
3. Use quick quantity buttons or enter custom amount
4. Add extra items if needed
5. Submit to save

**Generating Bills**
1. Go to Billing section
2. Select customer and date range
3. Review bill details
4. Print or save to database

**Viewing Reports**
- Dashboard shows today's statistics
- Export deliveries as CSV
- Filter by date ranges

### Mobile Usage
- Install as PWA for app-like experience
- Use landscape mode for better table viewing
- Touch gestures for navigation

## Features Deep Dive

### Auto-fill Functionality
- Remembers last customer and milk type for 1 hour
- Speeds up repetitive delivery entries
- Can be disabled in preferences

### Bulk Operations
- Quick quantity buttons for common sizes
- Support for custom quantities
- Automatic rate calculation

### Search & Filter
- Real-time customer search
- Date-based delivery filtering
- Sortable table columns

### Export Features
- CSV export for Excel compatibility
- Print-friendly bill layouts
- Professional invoice formatting

## Database Schema

```sql
customers (
  id, name, phone, address, 
  preferred_milk_type_id, created_at, updated_at
)

milk_types (
  id, name, rate_per_liter, description,
  is_active, created_at, updated_at
)

deliveries (
  id, customer_id, milk_type_id, quantity,
  rate_per_liter, extra_items, extra_amount,
  total_amount, delivery_date, delivery_time,
  created_at, updated_at
)

bills (
  id, customer_id, invoice_number,
  start_date, end_date, subtotal,
  extra_total, total_amount, status,
  created_at, updated_at
)
```

## Customization

### Styling
- Modify CSS variables in `src/css/style.css`
- Responsive breakpoints in `src/css/responsive.css`
- Component styles in `src/css/components.css`

### Functionality
- Add new features in `src/js/app.js`
- Utility functions in `src/js/utils.js`
- Database operations in `src/js/supabase-client.js`

### Branding
- Update app name in HTML
- Change colors in CSS variables
- Replace icons with custom ones

## Troubleshooting

### Common Issues

**"Database connection failed"**
- Check Supabase credentials
- Verify project URL and API key
- Ensure tables are created

**"No deliveries showing"**
- Check date filter
- Verify data exists in database
- Check browser console for errors

**Mobile display issues**
- Clear browser cache
- Update to latest browser version
- Check responsive CSS

### Debug Mode
- Open browser developer tools
- Check console for error messages
- Verify network requests in Network tab

## Security Considerations

### For Production
- Enable Row Level Security (RLS) in Supabase
- Create proper access policies
- Use environment variables for keys
- Implement user authentication

### Data Protection
- Regular database backups
- Secure API key storage
- HTTPS-only deployment

## Performance Optimization

- Images are optimized for web
- CSS/JS files are minified for production
- Database queries are optimized
- Local storage reduces API calls

## Support & Contribution

### Getting Help
- Check console logs for errors
- Review Supabase documentation
- Test with minimal data first

### Contributing
- Fork the repository
- Create feature branches
- Submit pull requests
- Follow coding standards

## License

This project is open source and available under the MIT License.

## Changelog

### v1.0.0 (Current)
- Initial release
- Core delivery management
- Customer and billing features
- Mobile optimization
- Supabase integration

---

**Built with ❤️ for small dairy businesses**

For questions or support, please check the documentation or create an issue.
