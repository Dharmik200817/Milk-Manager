// Supabase Client Configuration for Milk Retailer Management System
// Initialize Supabase client for database operations

// Import Supabase from CDN (already included in HTML)
const { createClient } = supabase;

// Supabase configuration - Replace with your actual Supabase project details
const SUPABASE_URL = 'https://your-project-ref.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here';

// Create Supabase client instance
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Database schema setup (run these in your Supabase SQL editor)
const DATABASE_SCHEMA = `
-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    address TEXT,
    preferred_milk_type_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create milk_types table
CREATE TABLE IF NOT EXISTS milk_types (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    rate_per_liter DECIMAL(10,2) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create deliveries table
CREATE TABLE IF NOT EXISTS deliveries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    milk_type_id UUID NOT NULL REFERENCES milk_types(id),
    quantity DECIMAL(5,2) NOT NULL,
    rate_per_liter DECIMAL(10,2) NOT NULL,
    extra_items TEXT,
    extra_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    delivery_date DATE NOT NULL DEFAULT CURRENT_DATE,
    delivery_time TIME NOT NULL DEFAULT CURRENT_TIME,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bills table
CREATE TABLE IF NOT EXISTS bills (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID NOT NULL REFERENCES customers(id),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    extra_total DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bill_items table (for detailed bill breakdown)
CREATE TABLE IF NOT EXISTS bill_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    bill_id UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
    delivery_id UUID NOT NULL REFERENCES deliveries(id),
    description TEXT,
    quantity DECIMAL(5,2) NOT NULL,
    rate DECIMAL(10,2) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_deliveries_customer_date ON deliveries(customer_id, delivery_date);
CREATE INDEX IF NOT EXISTS idx_deliveries_date ON deliveries(delivery_date);
CREATE INDEX IF NOT EXISTS idx_bills_customer ON bills(customer_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);

-- Add foreign key constraint for preferred milk type
ALTER TABLE customers 
ADD CONSTRAINT fk_customers_preferred_milk_type 
FOREIGN KEY (preferred_milk_type_id) REFERENCES milk_types(id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_milk_types_updated_at BEFORE UPDATE ON milk_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_deliveries_updated_at BEFORE UPDATE ON deliveries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bills_updated_at BEFORE UPDATE ON bills FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default milk types
INSERT INTO milk_types (name, rate_per_liter, description) VALUES
('Cow Milk', 55.00, 'Fresh cow milk - full cream'),
('Buffalo Milk', 65.00, 'Fresh buffalo milk - high fat content'),
('Toned Milk', 45.00, 'Toned cow milk - reduced fat'),
('Double Toned Milk', 40.00, 'Double toned milk - low fat'),
('Skimmed Milk', 38.00, 'Skimmed milk - fat-free')
ON CONFLICT (name) DO NOTHING;
`;

// Database utility functions
class DatabaseManager {
    constructor(client) {
        this.client = client;
    }

    // Customer operations
    async createCustomer(customerData) {
        try {
            const { data, error } = await this.client
                .from('customers')
                .insert([customerData])
                .select()
                .single();
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error creating customer:', error);
            return { success: false, error: error.message };
        }
    }

    async getCustomers() {
        try {
            const { data, error } = await this.client
                .from('customers')
                .select(`
                    *,
                    preferred_milk_type:milk_types(name, rate_per_liter)
                `)
                .order('name');
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error fetching customers:', error);
            return { success: false, error: error.message };
        }
    }

    async updateCustomer(id, updates) {
        try {
            const { data, error } = await this.client
                .from('customers')
                .update(updates)
                .eq('id', id)
                .select()
                .single();
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error updating customer:', error);
            return { success: false, error: error.message };
        }
    }

    async deleteCustomer(id) {
        try {
            const { error } = await this.client
                .from('customers')
                .delete()
                .eq('id', id);
            
            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Error deleting customer:', error);
            return { success: false, error: error.message };
        }
    }

    // Milk type operations
    async createMilkType(milkTypeData) {
        try {
            const { data, error } = await this.client
                .from('milk_types')
                .insert([milkTypeData])
                .select()
                .single();
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error creating milk type:', error);
            return { success: false, error: error.message };
        }
    }

    async getMilkTypes() {
        try {
            const { data, error } = await this.client
                .from('milk_types')
                .select('*')
                .eq('is_active', true)
                .order('name');
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error fetching milk types:', error);
            return { success: false, error: error.message };
        }
    }

    async updateMilkType(id, updates) {
        try {
            const { data, error } = await this.client
                .from('milk_types')
                .update(updates)
                .eq('id', id)
                .select()
                .single();
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error updating milk type:', error);
            return { success: false, error: error.message };
        }
    }

    async deleteMilkType(id) {
        try {
            const { data, error } = await this.client
                .from('milk_types')
                .update({ is_active: false })
                .eq('id', id)
                .select()
                .single();
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error deleting milk type:', error);
            return { success: false, error: error.message };
        }
    }

    // Delivery operations
    async createDelivery(deliveryData) {
        try {
            const { data, error } = await this.client
                .from('deliveries')
                .insert([deliveryData])
                .select(`
                    *,
                    customer:customers(name, phone),
                    milk_type:milk_types(name, rate_per_liter)
                `)
                .single();
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error creating delivery:', error);
            return { success: false, error: error.message };
        }
    }

    async getDeliveries(date = null) {
        try {
            let query = this.client
                .from('deliveries')
                .select(`
                    *,
                    customer:customers(name, phone, address),
                    milk_type:milk_types(name, rate_per_liter)
                `)
                .order('delivery_time', { ascending: false });

            if (date) {
                query = query.eq('delivery_date', date);
            }

            const { data, error } = await query;
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error fetching deliveries:', error);
            return { success: false, error: error.message };
        }
    }

    async getDeliveriesByDateRange(startDate, endDate, customerId = null) {
        try {
            let query = this.client
                .from('deliveries')
                .select(`
                    *,
                    customer:customers(name, phone),
                    milk_type:milk_types(name, rate_per_liter)
                `)
                .gte('delivery_date', startDate)
                .lte('delivery_date', endDate)
                .order('delivery_date');

            if (customerId) {
                query = query.eq('customer_id', customerId);
            }

            const { data, error } = await query;
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error fetching deliveries by date range:', error);
            return { success: false, error: error.message };
        }
    }

    async updateDelivery(id, updates) {
        try {
            const { data, error } = await this.client
                .from('deliveries')
                .update(updates)
                .eq('id', id)
                .select(`
                    *,
                    customer:customers(name, phone),
                    milk_type:milk_types(name, rate_per_liter)
                `)
                .single();
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error updating delivery:', error);
            return { success: false, error: error.message };
        }
    }

    async deleteDelivery(id) {
        try {
            const { error } = await this.client
                .from('deliveries')
                .delete()
                .eq('id', id);
            
            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Error deleting delivery:', error);
            return { success: false, error: error.message };
        }
    }

    // Bill operations
    async createBill(billData) {
        try {
            const { data, error } = await this.client
                .from('bills')
                .insert([billData])
                .select(`
                    *,
                    customer:customers(name, phone, address)
                `)
                .single();
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error creating bill:', error);
            return { success: false, error: error.message };
        }
    }

    async getBills() {
        try {
            const { data, error } = await this.client
                .from('bills')
                .select(`
                    *,
                    customer:customers(name, phone)
                `)
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error fetching bills:', error);
            return { success: false, error: error.message };
        }
    }

    // Statistics and analytics
    async getDashboardStats() {
        try {
            const today = new Date().toISOString().split('T')[0];
            
            // Get today's deliveries
            const { data: todayDeliveries, error: deliveryError } = await this.client
                .from('deliveries')
                .select('quantity, total_amount')
                .eq('delivery_date', today);

            if (deliveryError) throw deliveryError;

            // Get total customers
            const { count: totalCustomers, error: customerError } = await this.client
                .from('customers')
                .select('*', { count: 'exact', head: true });

            if (customerError) throw customerError;

            // Calculate stats
            const todayCount = todayDeliveries.length;
            const todayRevenue = todayDeliveries.reduce((sum, delivery) => sum + parseFloat(delivery.total_amount), 0);
            const todayLiters = todayDeliveries.reduce((sum, delivery) => sum + parseFloat(delivery.quantity), 0);

            return {
                success: true,
                data: {
                    todayDeliveries: todayCount,
                    todayRevenue: todayRevenue.toFixed(2),
                    totalCustomers: totalCustomers || 0,
                    totalLiters: todayLiters.toFixed(1)
                }
            };
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            return { success: false, error: error.message };
        }
    }

    // Generate invoice number
    generateInvoiceNumber() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const time = Date.now().toString().slice(-4);
        return `INV-${year}${month}${day}-${time}`;
    }
}

// Initialize database manager
const db = new DatabaseManager(supabaseClient);

// Export for use in other files
window.supabaseClient = supabaseClient;
window.db = db;

// Connection test function
async function testConnection() {
    try {
        const { data, error } = await supabaseClient
            .from('customers')
            .select('count', { count: 'exact', head: true });
        
        if (error) throw error;
        console.log('✅ Supabase connection successful');
        return true;
    } catch (error) {
        console.error('❌ Supabase connection failed:', error.message);
        showToast('Database connection failed. Please check your configuration.', 'error');
        return false;
    }
}

// Auto-test connection when page loads
document.addEventListener('DOMContentLoaded', () => {
    testConnection();
});

console.log('🚀 Supabase client initialized for Milk Retailer Management System');