// Main Application Logic for Milk Retailer Management System

// Application State
const AppState = {
    currentSection: 'dashboard',
    customers: [],
    milkTypes: [],
    deliveries: [],
    lastDelivery: null,
    isLoading: false
};

// Application Controller
class MilkRetailerApp {
    constructor() {
        this.initializeApp();
    }

    async initializeApp() {
        try {
            UIUtils.showLoading('Initializing application...');
            
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.setupApp());
            } else {
                this.setupApp();
            }
        } catch (error) {
            console.error('Error initializing app:', error);
            showToast('Failed to initialize application', 'error');
        } finally {
            UIUtils.hideLoading();
        }
    }

    async setupApp() {
        // Set up event listeners
        this.setupNavigation();
        this.setupForms();
        this.setupEventListeners();

        // Load initial data
        await this.loadInitialData();

        // Set up auto-fill from last delivery
        this.setupAutoFill();

        // Initialize current date
        this.setCurrentDate();

        console.log('🚀 Milk Retailer Management System initialized successfully');
    }

    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                this.switchSection(section);
            });
        });
    }

    switchSection(sectionName) {
        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionName).classList.add('active');

        AppState.currentSection = sectionName;

        // Load section-specific data
        this.loadSectionData(sectionName);
    }

    async loadSectionData(sectionName) {
        switch (sectionName) {
            case 'dashboard':
                await this.loadDashboardData();
                break;
            case 'deliveries':
                await this.loadDeliveries();
                break;
            case 'customers':
                await this.loadCustomers();
                break;
            case 'settings':
                await this.loadMilkTypes();
                break;
        }
    }

    setupForms() {
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

        // Milk type form
        const milkTypeForm = document.getElementById('milkTypeForm');
        if (milkTypeForm) {
            milkTypeForm.addEventListener('submit', (e) => this.handleMilkTypeSubmit(e));
        }

        // Bill form
        const billForm = document.getElementById('billForm');
        if (billForm) {
            billForm.addEventListener('submit', (e) => this.handleBillSubmit(e));
        }
    }

    setupEventListeners() {
        // Quantity buttons
        document.querySelectorAll('.qty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const quantity = btn.getAttribute('data-qty');
                document.getElementById('quantity').value = quantity;
                
                // Update button states
                document.querySelectorAll('.qty-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // Milk type selection auto-rate
        const milkTypeSelect = document.getElementById('milkType');
        if (milkTypeSelect) {
            milkTypeSelect.addEventListener('change', this.updateDeliveryTotal.bind(this));
        }

        // Quantity and extra amount changes
        const quantityInput = document.getElementById('quantity');
        const extraAmountInput = document.getElementById('extraAmount');
        if (quantityInput) {
            quantityInput.addEventListener('input', this.updateDeliveryTotal.bind(this));
        }
        if (extraAmountInput) {
            extraAmountInput.addEventListener('input', this.updateDeliveryTotal.bind(this));
        }

        // Date filter for deliveries
        const deliveryDateInput = document.getElementById('deliveryDate');
        if (deliveryDateInput) {
            deliveryDateInput.addEventListener('change', this.filterDeliveriesByDate.bind(this));
        }

        // Search functionality
        const customerSearchInput = document.getElementById('customerSearch');
        if (customerSearchInput) {
            customerSearchInput.addEventListener('input', UIUtils.debounce((e) => {
                SearchUtils.filterTable('customersTable', e.target.value, [0, 1, 2]); // Name, Phone, Address
            }, 300));
        }
    }

    async loadInitialData() {
        try {
            UIUtils.showLoading('Loading data...');
            
            // Load all required data in parallel
            const [customersResult, milkTypesResult] = await Promise.all([
                db.getCustomers(),
                db.getMilkTypes()
            ]);

            if (customersResult.success) {
                AppState.customers = customersResult.data;
                this.populateCustomerSelects();
            }

            if (milkTypesResult.success) {
                AppState.milkTypes = milkTypesResult.data;
                this.populateMilkTypeSelects();
            }

            // Load dashboard data
            await this.loadDashboardData();
            
        } catch (error) {
            console.error('Error loading initial data:', error);
            showToast('Failed to load application data', 'error');
        } finally {
            UIUtils.hideLoading();
        }
    }

    async loadDashboardData() {
        try {
            const statsResult = await db.getDashboardStats();
            if (statsResult.success) {
                const stats = statsResult.data;
                document.getElementById('todayDeliveries').textContent = stats.todayDeliveries;
                document.getElementById('todayRevenue').textContent = CurrencyUtils.formatCurrency(stats.todayRevenue);
                document.getElementById('totalCustomers').textContent = stats.totalCustomers;
                document.getElementById('totalLiters').textContent = `${stats.totalLiters}L`;
            }
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        }
    }

    async loadDeliveries(date = null) {
        try {
            const tableBody = document.getElementById('deliveriesTableBody');
            if (!tableBody) return;

            UIUtils.showLoading('Loading deliveries...');
            tableBody.innerHTML = UIUtils.createSkeleton(5);

            const result = await db.getDeliveries(date || DateUtils.formatDate(new Date()));
            
            if (result.success) {
                AppState.deliveries = result.data;
                this.renderDeliveriesTable();
            } else {
                showToast('Failed to load deliveries', 'error');
                tableBody.innerHTML = '<tr><td colspan="8" class="text-center">Failed to load deliveries</td></tr>';
            }
        } catch (error) {
            console.error('Error loading deliveries:', error);
            showToast('Error loading deliveries', 'error');
        } finally {
            UIUtils.hideLoading();
        }
    }

    async loadCustomers() {
        try {
            const result = await db.getCustomers();
            if (result.success) {
                AppState.customers = result.data;
                this.renderCustomersTable();
                this.populateCustomerSelects();
            }
        } catch (error) {
            console.error('Error loading customers:', error);
            showToast('Error loading customers', 'error');
        }
    }

    async loadMilkTypes() {
        try {
            const result = await db.getMilkTypes();
            if (result.success) {
                AppState.milkTypes = result.data;
                this.renderMilkTypesList();
                this.populateMilkTypeSelects();
            }
        } catch (error) {
            console.error('Error loading milk types:', error);
            showToast('Error loading milk types', 'error');
        }
    }

    populateCustomerSelects() {
        const selects = ['customerSelect', 'billCustomer'];
        selects.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (select) {
                select.innerHTML = '<option value="">Select Customer</option>';
                AppState.customers.forEach(customer => {
                    const option = document.createElement('option');
                    option.value = customer.id;
                    option.textContent = `${customer.name} - ${customer.phone}`;
                    select.appendChild(option);
                });
            }
        });
    }

    populateMilkTypeSelects() {
        const selects = ['milkType', 'preferredMilkType'];
        selects.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (select) {
                const placeholder = selectId === 'milkType' ? 'Select Milk Type' : 'Select Preferred Type';
                select.innerHTML = `<option value="">${placeholder}</option>`;
                AppState.milkTypes.forEach(milkType => {
                    const option = document.createElement('option');
                    option.value = milkType.id;
                    option.textContent = `${milkType.name} - ${CurrencyUtils.formatCurrency(milkType.rate_per_liter)}/L`;
                    option.setAttribute('data-rate', milkType.rate_per_liter);
                    select.appendChild(option);
                });
            }
        });
    }

    renderDeliveriesTable() {
        const tableBody = document.getElementById('deliveriesTableBody');
        if (!tableBody) return;

        if (AppState.deliveries.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="8" class="text-center">No deliveries found for this date</td></tr>';
            return;
        }

        tableBody.innerHTML = AppState.deliveries.map(delivery => `
            <tr>
                <td data-label="Time">${DateUtils.formatDisplayTime(delivery.delivery_time)}</td>
                <td data-label="Customer">${delivery.customer?.name || 'N/A'}</td>
                <td data-label="Milk Type">${delivery.milk_type?.name || 'N/A'}</td>
                <td data-label="Quantity">${delivery.quantity}L</td>
                <td data-label="Rate">${CurrencyUtils.formatCurrency(delivery.rate_per_liter)}</td>
                <td data-label="Extra Items">${delivery.extra_items || '-'}</td>
                <td data-label="Total">${CurrencyUtils.formatCurrency(delivery.total_amount)}</td>
                <td data-label="Actions">
                    <div class="btn-group">
                        <button class="btn btn-sm btn-outline" onclick="editDelivery('${delivery.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteDelivery('${delivery.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    renderCustomersTable() {
        const tableBody = document.getElementById('customersTableBody');
        if (!tableBody) return;

        if (AppState.customers.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" class="text-center">No customers found</td></tr>';
            return;
        }

        tableBody.innerHTML = AppState.customers.map(customer => `
            <tr>
                <td data-label="Name">${customer.name}</td>
                <td data-label="Phone">${customer.phone}</td>
                <td data-label="Address">${customer.address}</td>
                <td data-label="Preferred Type">${customer.preferred_milk_type?.name || 'None'}</td>
                <td data-label="Total Orders">
                    <span class="badge badge-primary">0</span>
                </td>
                <td data-label="Actions">
                    <div class="btn-group">
                        <button class="btn btn-sm btn-outline" onclick="editCustomer('${customer.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteCustomer('${customer.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    renderMilkTypesList() {
        const container = document.getElementById('milkTypesList');
        if (!container) return;

        if (AppState.milkTypes.length === 0) {
            container.innerHTML = '<p class="text-center">No milk types found</p>';
            return;
        }

        container.innerHTML = AppState.milkTypes.map(milkType => `
            <div class="milk-type-item">
                <div class="milk-type-name">${milkType.name}</div>
                <div class="milk-type-rate">${CurrencyUtils.formatCurrency(milkType.rate_per_liter)}/L</div>
                <div class="milk-type-actions">
                    <button class="btn btn-sm btn-outline" onclick="editMilkType('${milkType.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteMilkType('${milkType.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    async handleDeliverySubmit(e) {
        e.preventDefault();
        
        try {
            const formData = FormUtils.getFormData(e.target);
            
            // Validation
            const validation = FormUtils.validateDeliveryForm(formData);
            if (!validation.isValid) {
                FormUtils.showFormErrors(e.target, validation.errors);
                return;
            }

            // Get selected milk type rate
            const milkTypeSelect = document.getElementById('milkType');
            const selectedOption = milkTypeSelect.options[milkTypeSelect.selectedIndex];
            const rate = parseFloat(selectedOption.getAttribute('data-rate'));

            // Prepare delivery data
            const deliveryData = {
                customer_id: formData.customer_id,
                milk_type_id: formData.milk_type_id,
                quantity: parseFloat(formData.quantity),
                rate_per_liter: rate,
                extra_items: formData.extra_items || null,
                extra_amount: parseFloat(formData.extra_amount) || 0,
                total_amount: CurrencyUtils.calculateTotal(formData.quantity, rate, formData.extra_amount),
                delivery_date: DateUtils.formatDate(new Date()),
                delivery_time: DateUtils.getCurrentTime()
            };

            UIUtils.showLoading('Adding delivery...');

            const result = await db.createDelivery(deliveryData);
            
            if (result.success) {
                showToast('Delivery added successfully!', 'success');
                
                // Save for auto-fill
                StorageUtils.saveLastDelivery(deliveryData);
                AppState.lastDelivery = deliveryData;
                
                // Clear form and reload data
                FormUtils.clearForm(e.target);
                this.setupAutoFill();
                await this.loadDeliveries();
                await this.loadDashboardData();
            } else {
                showToast('Failed to add delivery: ' + result.error, 'error');
            }
        } catch (error) {
            console.error('Error adding delivery:', error);
            showToast('Error adding delivery', 'error');
        } finally {
            UIUtils.hideLoading();
        }
    }

    async handleCustomerSubmit(e) {
        e.preventDefault();
        
        try {
            const formData = FormUtils.getFormData(e.target);
            
            // Validation
            const validation = FormUtils.validateCustomerForm(formData);
            if (!validation.isValid) {
                FormUtils.showFormErrors(e.target, validation.errors);
                return;
            }

            UIUtils.showLoading('Adding customer...');

            const result = await db.createCustomer({
                name: formData.name.trim(),
                phone: formData.phone.trim(),
                address: formData.address.trim(),
                preferred_milk_type_id: formData.preferred_milk_type_id || null
            });
            
            if (result.success) {
                showToast('Customer added successfully!', 'success');
                FormUtils.clearForm(e.target);
                await this.loadCustomers();
            } else {
                showToast('Failed to add customer: ' + result.error, 'error');
            }
        } catch (error) {
            console.error('Error adding customer:', error);
            showToast('Error adding customer', 'error');
        } finally {
            UIUtils.hideLoading();
        }
    }

    async handleMilkTypeSubmit(e) {
        e.preventDefault();
        
        try {
            const formData = FormUtils.getFormData(e.target);
            
            // Validation
            const validation = FormUtils.validateMilkTypeForm(formData);
            if (!validation.isValid) {
                FormUtils.showFormErrors(e.target, validation.errors);
                return;
            }

            UIUtils.showLoading('Adding milk type...');

            const result = await db.createMilkType({
                name: formData.name.trim(),
                rate_per_liter: parseFloat(formData.rate_per_liter),
                description: formData.description || null
            });
            
            if (result.success) {
                showToast('Milk type added successfully!', 'success');
                FormUtils.clearForm(e.target);
                await this.loadMilkTypes();
            } else {
                showToast('Failed to add milk type: ' + result.error, 'error');
            }
        } catch (error) {
            console.error('Error adding milk type:', error);
            showToast('Error adding milk type', 'error');
        } finally {
            UIUtils.hideLoading();
        }
    }

    async handleBillSubmit(e) {
        e.preventDefault();
        
        try {
            const formData = FormUtils.getFormData(e.target);
            
            if (!formData.customer_id || !formData.start_date || !formData.end_date) {
                showToast('Please fill all required fields', 'error');
                return;
            }

            UIUtils.showLoading('Generating bill...');

            // Get deliveries for the period
            const deliveriesResult = await db.getDeliveriesByDateRange(
                formData.start_date,
                formData.end_date,
                formData.customer_id
            );

            if (deliveriesResult.success && deliveriesResult.data.length > 0) {
                this.generateBillPreview(formData, deliveriesResult.data);
                UIUtils.show('billPreview');
            } else {
                showToast('No deliveries found for the selected period', 'warning');
            }
        } catch (error) {
            console.error('Error generating bill:', error);
            showToast('Error generating bill', 'error');
        } finally {
            UIUtils.hideLoading();
        }
    }

    generateBillPreview(formData, deliveries) {
        const customer = AppState.customers.find(c => c.id === formData.customer_id);
        if (!customer) return;

        // Calculate totals
        const subtotal = deliveries.reduce((sum, d) => sum + (parseFloat(d.quantity) * parseFloat(d.rate_per_liter)), 0);
        const extraTotal = deliveries.reduce((sum, d) => sum + parseFloat(d.extra_amount || 0), 0);
        const total = subtotal + extraTotal;

        // Generate invoice number
        const invoiceNumber = db.generateInvoiceNumber();

        // Update bill preview
        document.getElementById('invoiceNumber').textContent = invoiceNumber;
        document.getElementById('invoiceDate').textContent = DateUtils.formatDisplayDate(new Date());
        
        document.getElementById('billToInfo').innerHTML = `
            <p><strong>${customer.name}</strong></p>
            <p>${customer.phone}</p>
            <p>${customer.address}</p>
        `;

        const tableBody = document.getElementById('billTableBody');
        tableBody.innerHTML = deliveries.map(delivery => `
            <tr>
                <td>${DateUtils.formatDisplayDate(delivery.delivery_date)}</td>
                <td>${delivery.milk_type?.name || 'N/A'}${delivery.extra_items ? ` + ${delivery.extra_items}` : ''}</td>
                <td>${delivery.quantity}L</td>
                <td>${CurrencyUtils.formatCurrency(delivery.rate_per_liter)}</td>
                <td>${CurrencyUtils.formatCurrency(delivery.total_amount)}</td>
            </tr>
        `).join('');

        document.getElementById('billSubtotal').textContent = CurrencyUtils.formatCurrency(subtotal);
        document.getElementById('billExtras').textContent = CurrencyUtils.formatCurrency(extraTotal);
        document.getElementById('billTotal').textContent = CurrencyUtils.formatCurrency(total);

        // Store bill data for saving
        this.currentBillData = {
            customer_id: customer.id,
            invoice_number: invoiceNumber,
            start_date: formData.start_date,
            end_date: formData.end_date,
            subtotal,
            extra_total: extraTotal,
            total_amount: total,
            deliveries
        };
    }

    setupAutoFill() {
        const lastDelivery = StorageUtils.getLastDelivery();
        if (lastDelivery && StorageUtils.getPreferences().autoFillLastEntry) {
            // Auto-fill customer and milk type
            if (lastDelivery.customer_id) {
                const customerSelect = document.getElementById('customerSelect');
                if (customerSelect) customerSelect.value = lastDelivery.customer_id;
            }
            
            if (lastDelivery.milk_type_id) {
                const milkTypeSelect = document.getElementById('milkType');
                if (milkTypeSelect) {
                    milkTypeSelect.value = lastDelivery.milk_type_id;
                    this.updateDeliveryTotal();
                }
            }
        }
    }

    updateDeliveryTotal() {
        const milkTypeSelect = document.getElementById('milkType');
        const quantityInput = document.getElementById('quantity');
        const extraAmountInput = document.getElementById('extraAmount');

        if (!milkTypeSelect || !quantityInput) return;

        const selectedOption = milkTypeSelect.options[milkTypeSelect.selectedIndex];
        if (!selectedOption || !selectedOption.getAttribute('data-rate')) return;

        const rate = parseFloat(selectedOption.getAttribute('data-rate'));
        const quantity = parseFloat(quantityInput.value) || 0;
        const extraAmount = parseFloat(extraAmountInput?.value) || 0;

        const total = CurrencyUtils.calculateTotal(quantity, rate, extraAmount);
        
        // Show calculated total (you can add a display element for this)
        console.log('Calculated total:', CurrencyUtils.formatCurrency(total));
    }

    setCurrentDate() {
        const dateInput = document.getElementById('deliveryDate');
        if (dateInput) {
            dateInput.value = DateUtils.formatDate(new Date());
        }

        const billStartDate = document.getElementById('billStartDate');
        const billEndDate = document.getElementById('billEndDate');
        if (billStartDate && billEndDate) {
            billStartDate.value = DateUtils.formatDate(new Date());
            billEndDate.value = DateUtils.formatDate(new Date());
        }
    }

    async filterDeliveriesByDate() {
        const dateInput = document.getElementById('deliveryDate');
        if (dateInput) {
            await this.loadDeliveries(dateInput.value);
        }
    }
}

// Global functions for button actions
window.switchSection = function(section) {
    app.switchSection(section);
};

window.clearDeliveryForm = function() {
    const form = document.getElementById('deliveryForm');
    if (form) FormUtils.clearForm(form);
};

window.clearCustomerForm = function() {
    const form = document.getElementById('customerForm');
    if (form) FormUtils.clearForm(form);
};

window.exportDeliveries = function() {
    if (AppState.deliveries.length === 0) {
        showToast('No deliveries to export', 'warning');
        return;
    }
    ExportUtils.exportDeliveries(AppState.deliveries);
    showToast('Deliveries exported successfully', 'success');
};

window.printBill = function() {
    ExportUtils.printBill();
};

window.saveBill = async function() {
    if (!app.currentBillData) {
        showToast('No bill data to save', 'error');
        return;
    }

    try {
        UIUtils.showLoading('Saving bill...');
        const result = await db.createBill(app.currentBillData);
        
        if (result.success) {
            showToast('Bill saved successfully!', 'success');
        } else {
            showToast('Failed to save bill: ' + result.error, 'error');
        }
    } catch (error) {
        console.error('Error saving bill:', error);
        showToast('Error saving bill', 'error');
    } finally {
        UIUtils.hideLoading();
    }
};

// Initialize the application
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new MilkRetailerApp();
});

console.log('📱 Milk Retailer Management App loaded');
