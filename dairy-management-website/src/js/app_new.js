// Narmada Dairy Milk Management System
// Main Application JavaScript

class DairyManagementApp {
    constructor() {
        this.currentSection = 'dashboard';
        this.customers = [];
        this.milkTypes = [];
        this.deliveries = [];
        this.lastEntry = null;
        this.supabase = null;
        
        this.init();
    }

    async init() {
        try {
            // Initialize Supabase
            if (typeof window.supabaseClient !== 'undefined') {
                this.supabase = window.supabaseClient;
            }

            // Initialize the application
            await this.loadInitialData();
            this.setupEventListeners();
            this.updateCurrentDate();
            this.showDashboard();
            
            // Update dashboard stats
            await this.updateDashboardStats();
            
            showToast('Application initialized successfully!', 'success');
        } catch (error) {
            console.error('Failed to initialize application:', error);
            showToast('Failed to initialize application', 'error');
        }
    }

    async loadInitialData() {
        try {
            showLoading(true);
            
            // Load default milk types if none exist
            await this.loadMilkTypes();
            if (this.milkTypes.length === 0) {
                await this.createDefaultMilkTypes();
            }
            
            // Load customers and deliveries
            await this.loadCustomers();
            await this.loadDeliveries();
            
        } catch (error) {
            console.error('Error loading initial data:', error);
        } finally {
            showLoading(false);
        }
    }

    async createDefaultMilkTypes() {
        const defaultTypes = [
            { name: 'Cow Milk', rate: 60 },
            { name: 'Buffalo Milk', rate: 80 },
            { name: 'Organic Milk', rate: 100 }
        ];

        for (const type of defaultTypes) {
            await this.addMilkType(type.name, type.rate);
        }
    }

    setupEventListeners() {
        // Delivery form
        const deliveryForm = document.getElementById('deliveryForm');
        if (deliveryForm) {
            deliveryForm.addEventListener('submit', (e) => this.handleDeliverySubmit(e));
        }

        // Customer form
        const customerForm = document.getElementById('customerForm');
        if (customerForm) {
            customerForm.addEventListener('submit', (e) => this.handleCustomerSubmit(e));
        }

        // Billing form
        const billingForm = document.getElementById('billingForm');
        if (billingForm) {
            billingForm.addEventListener('submit', (e) => this.handleBillingSubmit(e));
        }

        // Quantity buttons
        document.querySelectorAll('.qty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.selectQuantity(btn.dataset.qty);
            });
        });

        // Repeat last entry button
        const repeatBtn = document.getElementById('repeatLastEntry');
        if (repeatBtn) {
            repeatBtn.addEventListener('click', () => this.repeatLastEntry());
        }

        // Search inputs
        const deliverySearch = document.getElementById('deliverySearch');
        if (deliverySearch) {
            deliverySearch.addEventListener('input', (e) => this.filterDeliveries(e.target.value));
        }

        const customerSearch = document.getElementById('customerSearch');
        if (customerSearch) {
            customerSearch.addEventListener('input', (e) => this.filterCustomers(e.target.value));
        }

        // Set today's date as default
        const deliveryDate = document.getElementById('deliveryDate');
        if (deliveryDate) {
            deliveryDate.value = new Date().toISOString().split('T')[0];
        }
    }

    updateCurrentDate() {
        const dateElement = document.getElementById('currentDate');
        if (dateElement) {
            const now = new Date();
            dateElement.textContent = now.toLocaleDateString('en-IN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
    }

    // Navigation functions
    showDashboard() {
        this.showSection('dashboard');
        this.updateDashboardStats();
        this.loadRecentDeliveries();
    }

    showSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.section-content').forEach(section => {
            section.style.display = 'none';
        });

        // Hide dashboard
        const dashboard = document.querySelector('.dashboard-section');
        if (dashboard) {
            dashboard.style.display = 'none';
        }

        // Show requested section
        if (sectionName === 'dashboard') {
            if (dashboard) {
                dashboard.style.display = 'block';
            }
        } else {
            const section = document.getElementById(`${sectionName}-section`);
            if (section) {
                section.style.display = 'block';
            }
        }

        this.currentSection = sectionName;

        // Update section-specific data
        switch (sectionName) {
            case 'delivery':
                this.populateDeliveryForm();
                this.loadTodaysDeliveries();
                break;
            case 'customers':
                this.populateCustomerForm();
                this.loadCustomersTable();
                break;
            case 'billing':
                this.populateBillingForm();
                break;
        }
    }

    // Delivery functions
    async handleDeliverySubmit(e) {
        e.preventDefault();
        
        try {
            const customerId = document.getElementById('customerSelect').value;
            const milkTypeId = document.getElementById('milkTypeSelect').value;
            const quantity = parseFloat(document.getElementById('quantityInput').value);
            const extraItems = document.getElementById('extraItems').value;
            const extraAmount = parseFloat(document.getElementById('extraAmount').value) || 0;
            const date = document.getElementById('deliveryDate').value;

            if (!customerId || !milkTypeId || !quantity || !date) {
                showToast('Please fill all required fields', 'error');
                return;
            }

            const customer = this.customers.find(c => c.id == customerId);
            const milkType = this.milkTypes.find(m => m.id == milkTypeId);
            
            if (!customer || !milkType) {
                showToast('Invalid customer or milk type', 'error');
                return;
            }

            const milkAmount = quantity * milkType.rate;
            const totalAmount = milkAmount + extraAmount;

            const delivery = {
                customer_id: customerId,
                customer_name: customer.name,
                milk_type_id: milkTypeId,
                milk_type: milkType.name,
                quantity: quantity,
                rate: milkType.rate,
                milk_amount: milkAmount,
                extra_items: extraItems,
                extra_amount: extraAmount,
                total_amount: totalAmount,
                delivery_date: date,
                created_at: new Date().toISOString()
            };

            await this.addDelivery(delivery);
            
            // Save as last entry for repeat functionality
            this.lastEntry = delivery;
            
            // Reset form
            document.getElementById('deliveryForm').reset();
            document.getElementById('deliveryDate').value = new Date().toISOString().split('T')[0];
            
            // Clear quantity buttons
            document.querySelectorAll('.qty-btn').forEach(btn => btn.classList.remove('active'));
            
            showToast('Delivery added successfully!', 'success');
            
            // Refresh displays
            this.loadTodaysDeliveries();
            this.updateDashboardStats();
            
        } catch (error) {
            console.error('Error adding delivery:', error);
            showToast('Error adding delivery', 'error');
        }
    }

    selectQuantity(qty) {
        // Update input
        document.getElementById('quantityInput').value = qty;
        
        // Update button states
        document.querySelectorAll('.qty-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        event.target.classList.add('active');
    }

    repeatLastEntry() {
        if (!this.lastEntry) {
            showToast('No previous entry to repeat', 'warning');
            return;
        }

        // Fill form with last entry data
        document.getElementById('customerSelect').value = this.lastEntry.customer_id;
        document.getElementById('milkTypeSelect').value = this.lastEntry.milk_type_id;
        document.getElementById('quantityInput').value = this.lastEntry.quantity;
        document.getElementById('extraItems').value = this.lastEntry.extra_items || '';
        document.getElementById('extraAmount').value = this.lastEntry.extra_amount || '';
        
        // Update quantity button
        document.querySelectorAll('.qty-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.qty == this.lastEntry.quantity) {
                btn.classList.add('active');
            }
        });

        showToast('Last entry loaded for repeat', 'success');
    }

    // Customer functions
    async handleCustomerSubmit(e) {
        e.preventDefault();
        
        try {
            const name = document.getElementById('customerName').value.trim();
            const phone = document.getElementById('customerPhone').value.trim();
            const address = document.getElementById('customerAddress').value.trim();

            if (!name) {
                showToast('Customer name is required', 'error');
                return;
            }

            const customer = {
                name: name,
                phone: phone,
                address: address,
                created_at: new Date().toISOString()
            };

            await this.addCustomer(customer);
            
            // Reset form
            document.getElementById('customerForm').reset();
            
            showToast('Customer added successfully!', 'success');
            
            // Refresh displays
            this.loadCustomersTable();
            this.populateDeliveryForm();
            this.populateBillingForm();
            this.updateDashboardStats();
            
        } catch (error) {
            console.error('Error adding customer:', error);
            showToast('Error adding customer', 'error');
        }
    }

    // Billing functions
    async handleBillingSubmit(e) {
        e.preventDefault();
        
        try {
            const customerId = document.getElementById('billCustomerSelect').value;
            const fromDate = document.getElementById('billFromDate').value;
            const toDate = document.getElementById('billToDate').value;

            if (!customerId || !fromDate || !toDate) {
                showToast('Please fill all fields', 'error');
                return;
            }

            await this.generateBill(customerId, fromDate, toDate);
            
        } catch (error) {
            console.error('Error generating bill:', error);
            showToast('Error generating bill', 'error');
        }
    }

    async generateBill(customerId, fromDate, toDate) {
        try {
            const customer = this.customers.find(c => c.id == customerId);
            if (!customer) {
                showToast('Customer not found', 'error');
                return;
            }

            // Filter deliveries for the date range
            const billDeliveries = this.deliveries.filter(d => 
                d.customer_id == customerId && 
                d.delivery_date >= fromDate && 
                d.delivery_date <= toDate
            );

            if (billDeliveries.length === 0) {
                showToast('No deliveries found for the selected period', 'warning');
                return;
            }

            // Calculate totals
            const subtotal = billDeliveries.reduce((sum, d) => sum + d.milk_amount, 0);
            const extraTotal = billDeliveries.reduce((sum, d) => sum + (d.extra_amount || 0), 0);
            const grandTotal = subtotal + extraTotal;

            // Generate bill HTML
            const billHTML = this.generateBillHTML(customer, billDeliveries, fromDate, toDate, subtotal, extraTotal, grandTotal);
            
            // Show bill preview
            const billPreview = document.getElementById('billPreview');
            if (billPreview) {
                billPreview.innerHTML = billHTML;
                billPreview.style.display = 'block';
            }

            showToast('Bill generated successfully!', 'success');
            
        } catch (error) {
            console.error('Error generating bill:', error);
            throw error;
        }
    }

    generateBillHTML(customer, deliveries, fromDate, toDate, subtotal, extraTotal, grandTotal) {
        const invoiceNumber = `INV-${Date.now()}`;
        const invoiceDate = new Date().toLocaleDateString('en-IN');
        
        let itemsHTML = '';
        deliveries.forEach(delivery => {
            itemsHTML += `
                <tr>
                    <td>${new Date(delivery.delivery_date).toLocaleDateString('en-IN')}</td>
                    <td>${delivery.milk_type} (${delivery.quantity}L)</td>
                    <td>${delivery.quantity}L</td>
                    <td>₹${delivery.rate.toFixed(2)}</td>
                    <td>₹${delivery.milk_amount.toFixed(2)}</td>
                </tr>
            `;
            
            if (delivery.extra_items && delivery.extra_amount > 0) {
                itemsHTML += `
                    <tr>
                        <td>${new Date(delivery.delivery_date).toLocaleDateString('en-IN')}</td>
                        <td>${delivery.extra_items}</td>
                        <td>1</td>
                        <td>₹${delivery.extra_amount.toFixed(2)}</td>
                        <td>₹${delivery.extra_amount.toFixed(2)}</td>
                    </tr>
                `;
            }
        });

        return `
            <div class="bill-header">
                <div>
                    <h2>Narmada Dairy</h2>
                    <p>Milk Delivery Invoice</p>
                </div>
                <div>
                    <p><strong>Invoice #:</strong> ${invoiceNumber}</p>
                    <p><strong>Date:</strong> ${invoiceDate}</p>
                </div>
            </div>
            <div class="bill-content">
                <div class="customer-info">
                    <h3>Bill To:</h3>
                    <p><strong>${customer.name}</strong></p>
                    <p>${customer.phone}</p>
                    <p>${customer.address}</p>
                    <p><strong>Period:</strong> ${new Date(fromDate).toLocaleDateString('en-IN')} to ${new Date(toDate).toLocaleDateString('en-IN')}</p>
                </div>
                <div class="bill-table">
                    <table class="invoice-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Item</th>
                                <th>Quantity</th>
                                <th>Rate</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHTML}
                        </tbody>
                    </table>
                </div>
                <div class="bill-total">
                    <div class="total-row">
                        <span>Subtotal:</span>
                        <span>₹${subtotal.toFixed(2)}</span>
                    </div>
                    <div class="total-row">
                        <span>Extra Items:</span>
                        <span>₹${extraTotal.toFixed(2)}</span>
                    </div>
                    <div class="total-row final-total">
                        <span><strong>Total:</strong></span>
                        <span><strong>₹${grandTotal.toFixed(2)}</strong></span>
                    </div>
                </div>
            </div>
            <div class="bill-actions">
                <button class="btn btn-primary" onclick="window.print()">
                    <i class="fas fa-print"></i> Print Bill
                </button>
            </div>
        `;
    }

    // Data loading functions
    async loadMilkTypes() {
        try {
            if (this.supabase) {
                const { data, error } = await this.supabase
                    .from('milk_types')
                    .select('*')
                    .order('name');
                
                if (error) throw error;
                this.milkTypes = data || [];
            } else {
                // Fallback to localStorage
                this.milkTypes = JSON.parse(localStorage.getItem('milkTypes') || '[]');
            }
        } catch (error) {
            console.error('Error loading milk types:', error);
            this.milkTypes = [];
        }
    }

    async loadCustomers() {
        try {
            if (this.supabase) {
                const { data, error } = await this.supabase
                    .from('customers')
                    .select('*')
                    .order('name');
                
                if (error) throw error;
                this.customers = data || [];
            } else {
                // Fallback to localStorage
                this.customers = JSON.parse(localStorage.getItem('customers') || '[]');
            }
        } catch (error) {
            console.error('Error loading customers:', error);
            this.customers = [];
        }
    }

    async loadDeliveries() {
        try {
            if (this.supabase) {
                const { data, error } = await this.supabase
                    .from('deliveries')
                    .select('*')
                    .order('created_at', { ascending: false });
                
                if (error) throw error;
                this.deliveries = data || [];
            } else {
                // Fallback to localStorage
                this.deliveries = JSON.parse(localStorage.getItem('deliveries') || '[]');
            }
        } catch (error) {
            console.error('Error loading deliveries:', error);
            this.deliveries = [];
        }
    }

    // Data manipulation functions
    async addMilkType(name, rate) {
        try {
            const milkType = {
                id: Date.now(),
                name: name,
                rate: rate,
                created_at: new Date().toISOString()
            };

            if (this.supabase) {
                const { data, error } = await this.supabase
                    .from('milk_types')
                    .insert([milkType])
                    .select();
                
                if (error) throw error;
                if (data && data.length > 0) {
                    this.milkTypes.push(data[0]);
                }
            } else {
                this.milkTypes.push(milkType);
                localStorage.setItem('milkTypes', JSON.stringify(this.milkTypes));
            }
        } catch (error) {
            console.error('Error adding milk type:', error);
            throw error;
        }
    }

    async addCustomer(customer) {
        try {
            customer.id = Date.now();
            
            if (this.supabase) {
                const { data, error } = await this.supabase
                    .from('customers')
                    .insert([customer])
                    .select();
                
                if (error) throw error;
                if (data && data.length > 0) {
                    this.customers.push(data[0]);
                }
            } else {
                this.customers.push(customer);
                localStorage.setItem('customers', JSON.stringify(this.customers));
            }
        } catch (error) {
            console.error('Error adding customer:', error);
            throw error;
        }
    }

    async addDelivery(delivery) {
        try {
            delivery.id = Date.now();
            
            if (this.supabase) {
                const { data, error } = await this.supabase
                    .from('deliveries')
                    .insert([delivery])
                    .select();
                
                if (error) throw error;
                if (data && data.length > 0) {
                    this.deliveries.unshift(data[0]);
                }
            } else {
                this.deliveries.unshift(delivery);
                localStorage.setItem('deliveries', JSON.stringify(this.deliveries));
            }
        } catch (error) {
            console.error('Error adding delivery:', error);
            throw error;
        }
    }

    // UI update functions
    populateDeliveryForm() {
        // Populate customers
        const customerSelect = document.getElementById('customerSelect');
        if (customerSelect) {
            customerSelect.innerHTML = '<option value="">Select Customer</option>';
            this.customers.forEach(customer => {
                const option = document.createElement('option');
                option.value = customer.id;
                option.textContent = customer.name;
                customerSelect.appendChild(option);
            });
        }

        // Populate milk types
        const milkTypeSelect = document.getElementById('milkTypeSelect');
        if (milkTypeSelect) {
            milkTypeSelect.innerHTML = '<option value="">Select Milk Type</option>';
            this.milkTypes.forEach(type => {
                const option = document.createElement('option');
                option.value = type.id;
                option.textContent = `${type.name} (₹${type.rate}/L)`;
                milkTypeSelect.appendChild(option);
            });
        }
    }

    populateCustomerForm() {
        // No dynamic population needed for customer form
    }

    populateBillingForm() {
        // Populate customers
        const customerSelect = document.getElementById('billCustomerSelect');
        if (customerSelect) {
            customerSelect.innerHTML = '<option value="">Select Customer</option>';
            this.customers.forEach(customer => {
                const option = document.createElement('option');
                option.value = customer.id;
                option.textContent = customer.name;
                customerSelect.appendChild(option);
            });
        }
    }

    loadTodaysDeliveries() {
        const today = new Date().toISOString().split('T')[0];
        const todaysDeliveries = this.deliveries.filter(d => d.delivery_date === today);
        
        const tbody = document.querySelector('#deliveriesTable tbody');
        if (tbody) {
            tbody.innerHTML = '';
            
            if (todaysDeliveries.length === 0) {
                tbody.innerHTML = '<tr><td colspan="8" class="text-center">No deliveries found for today</td></tr>';
                return;
            }
            
            todaysDeliveries.forEach(delivery => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${delivery.customer_name}</td>
                    <td>${delivery.milk_type}</td>
                    <td>${delivery.quantity}L</td>
                    <td>₹${delivery.rate.toFixed(2)}</td>
                    <td>₹${delivery.milk_amount.toFixed(2)}</td>
                    <td>${delivery.extra_items || '-'}</td>
                    <td>₹${delivery.total_amount.toFixed(2)}</td>
                    <td>
                        <button class="btn btn-sm btn-danger" onclick="app.deleteDelivery(${delivery.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        }
    }

    loadCustomersTable() {
        const tbody = document.querySelector('#customersTable tbody');
        if (tbody) {
            tbody.innerHTML = '';
            
            if (this.customers.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" class="text-center">No customers found</td></tr>';
                return;
            }
            
            this.customers.forEach(customer => {
                const orderCount = this.deliveries.filter(d => d.customer_id == customer.id).length;
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${customer.name}</td>
                    <td>${customer.phone || '-'}</td>
                    <td>${customer.address || '-'}</td>
                    <td>${orderCount}</td>
                    <td>
                        <button class="btn btn-sm btn-danger" onclick="app.deleteCustomer(${customer.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        }
    }

    loadRecentDeliveries() {
        const container = document.getElementById('recentDeliveriesList');
        if (container) {
            const recentDeliveries = this.deliveries.slice(0, 5);
            
            if (recentDeliveries.length === 0) {
                container.innerHTML = '<div class="loading-message">No recent deliveries</div>';
                return;
            }
            
            let html = '';
            recentDeliveries.forEach(delivery => {
                html += `
                    <div class="delivery-item">
                        <div class="delivery-info">
                            <strong>${delivery.customer_name}</strong> - ${delivery.milk_type}
                            <small>${new Date(delivery.created_at).toLocaleString('en-IN')}</small>
                        </div>
                        <div class="delivery-amount">
                            ₹${delivery.total_amount.toFixed(2)}
                        </div>
                    </div>
                `;
            });
            
            container.innerHTML = html;
        }
    }

    async updateDashboardStats() {
        try {
            const today = new Date().toISOString().split('T')[0];
            const todaysDeliveries = this.deliveries.filter(d => d.delivery_date === today);
            
            // Update stats
            const todayRevenue = todaysDeliveries.reduce((sum, d) => sum + d.total_amount, 0);
            const todayDeliveriesCount = todaysDeliveries.length;
            const todayQuantity = todaysDeliveries.reduce((sum, d) => sum + d.quantity, 0);
            const totalCustomers = this.customers.length;
            
            // Update DOM
            const revenueEl = document.getElementById('todayRevenue');
            if (revenueEl) revenueEl.textContent = `₹${todayRevenue.toFixed(2)}`;
            
            const deliveriesEl = document.getElementById('todayDeliveries');
            if (deliveriesEl) deliveriesEl.textContent = todayDeliveriesCount;
            
            const quantityEl = document.getElementById('todayQuantity');
            if (quantityEl) quantityEl.textContent = `${todayQuantity}L`;
            
            const customersEl = document.getElementById('totalCustomers');
            if (customersEl) customersEl.textContent = totalCustomers;
            
        } catch (error) {
            console.error('Error updating dashboard stats:', error);
        }
    }

    // Search and filter functions
    filterDeliveries(searchTerm) {
        const rows = document.querySelectorAll('#deliveriesTable tbody tr');
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm.toLowerCase()) ? '' : 'none';
        });
    }

    filterCustomers(searchTerm) {
        const rows = document.querySelectorAll('#customersTable tbody tr');
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm.toLowerCase()) ? '' : 'none';
        });
    }

    // Delete functions
    async deleteDelivery(id) {
        if (!confirm('Are you sure you want to delete this delivery?')) return;
        
        try {
            if (this.supabase) {
                const { error } = await this.supabase
                    .from('deliveries')
                    .delete()
                    .eq('id', id);
                
                if (error) throw error;
            }
            
            this.deliveries = this.deliveries.filter(d => d.id !== id);
            localStorage.setItem('deliveries', JSON.stringify(this.deliveries));
            
            this.loadTodaysDeliveries();
            this.updateDashboardStats();
            showToast('Delivery deleted successfully!', 'success');
            
        } catch (error) {
            console.error('Error deleting delivery:', error);
            showToast('Error deleting delivery', 'error');
        }
    }

    async deleteCustomer(id) {
        if (!confirm('Are you sure you want to delete this customer?')) return;
        
        try {
            if (this.supabase) {
                const { error } = await this.supabase
                    .from('customers')
                    .delete()
                    .eq('id', id);
                
                if (error) throw error;
            }
            
            this.customers = this.customers.filter(c => c.id !== id);
            localStorage.setItem('customers', JSON.stringify(this.customers));
            
            this.loadCustomersTable();
            this.populateDeliveryForm();
            this.populateBillingForm();
            this.updateDashboardStats();
            showToast('Customer deleted successfully!', 'success');
            
        } catch (error) {
            console.error('Error deleting customer:', error);
            showToast('Error deleting customer', 'error');
        }
    }
}

// Global functions for navigation
function showSection(sectionName) {
    if (window.app) {
        window.app.showSection(sectionName);
    }
}

function showDashboard() {
    if (window.app) {
        window.app.showDashboard();
    }
}

function generateReport() {
    showToast('Report generation feature coming soon!', 'info');
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new DairyManagementApp();
});
