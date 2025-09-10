// Supabase Configuration for Milk Retailer Management System
// This file contains the configuration settings for connecting to Supabase

// To set up your Supabase project:
// 1. Go to https://supabase.com and create a new project
// 2. Get your project URL and anon key from the API settings
// 3. Replace the placeholder values below with your actual values
// 4. Run the SQL schema in your Supabase SQL editor (provided in supabase-client.js)

const SUPABASE_CONFIG = {
    // Replace with your Supabase project URL
    url: 'https://your-project-ref.supabase.co',
    
    // Replace with your Supabase anon/public key
    anonKey: 'your-anon-key-here',
    
    // Optional: Additional configuration
    options: {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true
        },
        db: {
            schema: 'public'
        }
    }
};

// Export configuration for use in the application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SUPABASE_CONFIG;
} else {
    window.SUPABASE_CONFIG = SUPABASE_CONFIG;
}

/* 
SETUP INSTRUCTIONS:

1. Create a new Supabase project at https://supabase.com

2. Get your project credentials:
   - Go to Settings > API
   - Copy the "Project URL" and "anon/public" key
   - Replace the placeholder values above

3. Run the following SQL in your Supabase SQL editor to create the database schema:

-- Enable RLS (Row Level Security) if needed
-- ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE milk_types ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE bills ENABLE ROW LEVEL SECURITY;

-- Create tables and relationships (see supabase-client.js for full schema)

4. Test the connection by opening the website and checking the browser console

5. For production, consider adding environment variables and proper security policies

Note: The schema creation SQL is available in the supabase-client.js file's DATABASE_SCHEMA constant.
*/