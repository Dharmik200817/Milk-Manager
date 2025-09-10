// Utility Functions for Milk Retailer Management System

// Date and Time Utilities
const DateUtils = {
    // Format date to YYYY-MM-DD
    formatDate(date) {
        if (!date) date = new Date();
        return date.toISOString().split('T')[0];
    },

    // Format date for display
    formatDisplayDate(date) {
        if (!date) return '';
        return new Date(date).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },

    // Format time for display
    formatDisplayTime(time) {
        if (!time) return '';
        return new Date(`1970-01-01T${time}`).toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    },

    // Get current time in HH:MM format
    getCurrentTime() {
        return new Date().toTimeString().slice(0, 5);
    },

    // Get date range for different periods
    getDateRange(period, customStart = null, customEnd = null) {
        const today = new Date();
        let startDate, endDate;

        switch (period) {
            case 'daily':
                startDate = endDate = this.formatDate(today);
                break;
            case 'weekly':
                startDate = new Date(today.setDate(today.getDate() - 6));
                endDate = new Date();
                break;
            case 'monthly':
                startDate = new Date(today.getFullYear(), today.getMonth(), 1);
                endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                break;
            case 'custom':
                startDate = customStart ? new Date(customStart) : new Date();
                endDate = customEnd ? new Date(customEnd) : new Date();
                break;
            default:
                startDate = endDate = this.formatDate(today);
        }

        return {
            start: this.formatDate(startDate),
            end: this.formatDate(endDate)
        };
    }
};

// Currency and Number Utilities
const CurrencyUtils = {
    // Format number as Indian currency
    formatCurrency(amount) {
        if (isNaN(amount)) return '₹0.00';
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(amount);
    },

    // Format number with commas
    formatNumber(number) {
        if (isNaN(number)) return '0';
        return new Intl.NumberFormat('en-IN').format(number);
    },

    // Parse currency string to number
    parseCurrency(currencyString) {
        if (!currencyString) return 0;
        return parseFloat(currencyString.replace(/[₹,]/g, '')) || 0;
    },

    // Calculate total amount
    calculateTotal(quantity, rate, extraAmount = 0) {
        const baseAmount = parseFloat(quantity) * parseFloat(rate);
        return baseAmount + parseFloat(extraAmount);
    }
};

// Form Utilities
const FormUtils = {
    // Get form data as object
    getFormData(formElement) {
        const formData = new FormData(formElement);
        const data = {};
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        return data;
    },

    // Validate form data
    validateDeliveryForm(data) {
        const errors = [];
        
        if (!data.customer_id) errors.push('Please select a customer');
        if (!data.milk_type_id) errors.push('Please select milk type');
        if (!data.quantity || parseFloat(data.quantity) <= 0) errors.push('Please enter valid quantity');
        if (data.extra_amount && parseFloat(data.extra_amount) < 0) errors.push('Extra amount cannot be negative');
        
        return {
            isValid: errors.length === 0,
            errors
        };
    },

    // Validate customer form
    validateCustomerForm(data) {
        const errors = [];
        
        if (!data.name || data.name.trim().length < 2) errors.push('Name must be at least 2 characters');
        if (!data.phone || !/^[6-9]\d{9}$/.test(data.phone)) errors.push('Please enter valid 10-digit phone number');
        if (!data.address || data.address.trim().length < 5) errors.push('Address must be at least 5 characters');
        
        return {
            isValid: errors.length === 0,
            errors
        };
    },

    // Validate milk type form
    validateMilkTypeForm(data) {
        const errors = [];
        
        if (!data.name || data.name.trim().length < 2) errors.push('Milk type name must be at least 2 characters');
        if (!data.rate_per_liter || parseFloat(data.rate_per_liter) <= 0) errors.push('Rate must be greater than 0');
        
        return {
            isValid: errors.length === 0,
            errors
        };
    },

    // Clear form
    clearForm(formElement) {
        formElement.reset();
        // Clear any validation states
        formElement.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
        formElement.querySelectorAll('.error-message').forEach(el => el.remove());
    },

    // Show form errors
    showFormErrors(formElement, errors) {
        // Clear previous errors
        formElement.querySelectorAll('.error-message').forEach(el => el.remove());
        formElement.querySelectorAll('.error').forEach(el => el.classList.remove('error'));

        // Show new errors
        errors.forEach(error => {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message alert alert-danger';
            errorDiv.textContent = error;
            formElement.insertBefore(errorDiv, formElement.firstChild);
        });
    }
};

// Local Storage Utilities
const StorageUtils = {
    // Save to localStorage
    save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            return false;
        }
    },

    // Load from localStorage
    load(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            return defaultValue;
        }
    },

    // Remove from localStorage
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing from localStorage:', error);
            return false;
        }
    },

    // Save last delivery data for auto-fill
    saveLastDelivery(deliveryData) {
        this.save('lastDelivery', {
            customer_id: deliveryData.customer_id,
            milk_type_id: deliveryData.milk_type_id,
            quantity: deliveryData.quantity,
            timestamp: Date.now()
        });
    },

    // Get last delivery data (if recent)
    getLastDelivery() {
        const data = this.load('lastDelivery');
        if (data && (Date.now() - data.timestamp) < 3600000) { // 1 hour
            return data;
        }
        return null;
    },

    // Save user preferences
    savePreferences(preferences) {
        this.save('userPreferences', preferences);
    },

    // Get user preferences
    getPreferences() {
        return this.load('userPreferences', {
            autoFillLastEntry: true,
            defaultQuantity: 1,
            showTime: true,
            dateFormat: 'dd/mm/yyyy'
        });
    }
};

// UI Utilities
const UIUtils = {
    // Show loading state
    showLoading(message = 'Loading...') {
        const overlay = document.getElementById('loadingOverlay');
        const loadingText = overlay.querySelector('p');
        if (loadingText) loadingText.textContent = message;
        overlay.classList.add('show');
    },

    // Hide loading state
    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        overlay.classList.remove('show');
    },

    // Show/hide elements
    show(element) {
        if (typeof element === 'string') {
            element = document.getElementById(element);
        }
        if (element) element.style.display = 'block';
    },

    hide(element) {
        if (typeof element === 'string') {
            element = document.getElementById(element);
        }
        if (element) element.style.display = 'none';
    },

    // Toggle element visibility
    toggle(element) {
        if (typeof element === 'string') {
            element = document.getElementById(element);
        }
        if (element) {
            element.style.display = element.style.display === 'none' ? 'block' : 'none';
        }
    },

    // Smooth scroll to element
    scrollTo(element) {
        if (typeof element === 'string') {
            element = document.getElementById(element);
        }
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    },

    // Create loading skeleton
    createSkeleton(rows = 5) {
        let html = '';
        for (let i = 0; i < rows; i++) {
            html += `
                <tr>
                    <td><div class="skeleton skeleton-text"></div></td>
                    <td><div class="skeleton skeleton-text"></div></td>
                    <td><div class="skeleton skeleton-text"></div></td>
                    <td><div class="skeleton skeleton-text"></div></td>
                    <td><div class="skeleton skeleton-text"></div></td>
                </tr>
            `;
        }
        return html;
    },

    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Throttle function
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};

// Export Utilities
const ExportUtils = {
    // Convert table to CSV
    tableToCSV(tableId) {
        const table = document.getElementById(tableId);
        if (!table) return null;

        const rows = table.querySelectorAll('tr');
        const csv = [];

        for (let i = 0; i < rows.length; i++) {
            const row = [];
            const cols = rows[i].querySelectorAll('td, th');
            
            for (let j = 0; j < cols.length - 1; j++) { // Skip last column (actions)
                let cellText = cols[j].textContent.trim();
                cellText = cellText.replace(/"/g, '""'); // Escape quotes
                row.push(`"${cellText}"`);
            }
            csv.push(row.join(','));
        }

        return csv.join('\n');
    },

    // Download CSV file
    downloadCSV(csvContent, filename) {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    },

    // Export deliveries data
    exportDeliveries(deliveries, filename = null) {
        if (!filename) {
            const date = DateUtils.formatDate(new Date()).replace(/-/g, '');
            filename = `deliveries_${date}.csv`;
        }

        const headers = ['Date', 'Time', 'Customer', 'Phone', 'Milk Type', 'Quantity (L)', 'Rate (₹)', 'Extra Items', 'Extra Amount (₹)', 'Total (₹)'];
        const rows = deliveries.map(delivery => [
            DateUtils.formatDisplayDate(delivery.delivery_date),
            DateUtils.formatDisplayTime(delivery.delivery_time),
            delivery.customer?.name || '',
            delivery.customer?.phone || '',
            delivery.milk_type?.name || '',
            delivery.quantity,
            delivery.rate_per_liter,
            delivery.extra_items || '',
            delivery.extra_amount || 0,
            delivery.total_amount
        ]);

        const csvContent = [headers, ...rows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');

        this.downloadCSV(csvContent, filename);
    },

    // Print bill
    printBill() {
        const billContent = document.getElementById('billPreview');
        if (!billContent) return;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Invoice</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .bill-card { max-width: 800px; margin: 0 auto; }
                    .bill-header { display: flex; justify-content: space-between; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 10px; }
                    .invoice-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    .invoice-table th, .invoice-table td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                    .invoice-table th { background-color: #f5f5f5; }
                    .bill-total { text-align: right; margin-top: 20px; }
                    .total-row { display: flex; justify-content: space-between; margin: 5px 0; }
                    .final-total { font-weight: bold; font-size: 1.2em; border-top: 2px solid #000; padding-top: 10px; }
                    @media print { body { margin: 0; } }
                </style>
            </head>
            <body>
                ${billContent.innerHTML.replace(/<div class="bill-actions">.*?<\/div>/s, '')}
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    }
};

// Toast Notification System
function showToast(message, type = 'success', duration = 3000) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    if (!toast || !toastMessage) {
        console.warn('Toast elements not found');
        return;
    }

    // Remove existing type classes
    toast.classList.remove('success', 'error', 'warning', 'info');
    
    // Add new type class
    toast.classList.add(type);
    
    // Set message
    toastMessage.textContent = message;
    
    // Show toast
    toast.classList.add('show');
    
    // Auto hide after duration
    setTimeout(() => {
        hideToast();
    }, duration);
}

function hideToast() {
    const toast = document.getElementById('toast');
    if (toast) {
        toast.classList.remove('show');
    }
}

// Search and Filter Utilities
const SearchUtils = {
    // Filter table rows
    filterTable(tableId, searchTerm, columns = []) {
        const table = document.getElementById(tableId);
        if (!table) return;

        const tbody = table.querySelector('tbody');
        const rows = tbody.querySelectorAll('tr');
        const term = searchTerm.toLowerCase();

        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            let found = false;

            if (columns.length > 0) {
                // Search specific columns
                columns.forEach(colIndex => {
                    if (cells[colIndex] && cells[colIndex].textContent.toLowerCase().includes(term)) {
                        found = true;
                    }
                });
            } else {
                // Search all columns
                cells.forEach(cell => {
                    if (cell.textContent.toLowerCase().includes(term)) {
                        found = true;
                    }
                });
            }

            row.style.display = found ? '' : 'none';
        });
    },

    // Sort table by column
    sortTable(tableId, columnIndex, ascending = true) {
        const table = document.getElementById(tableId);
        if (!table) return;

        const tbody = table.querySelector('tbody');
        const rows = Array.from(tbody.querySelectorAll('tr'));

        rows.sort((a, b) => {
            const aValue = a.cells[columnIndex].textContent.trim();
            const bValue = b.cells[columnIndex].textContent.trim();

            // Try to parse as numbers first
            const aNum = parseFloat(aValue.replace(/[₹,]/g, ''));
            const bNum = parseFloat(bValue.replace(/[₹,]/g, ''));

            if (!isNaN(aNum) && !isNaN(bNum)) {
                return ascending ? aNum - bNum : bNum - aNum;
            }

            // Fallback to string comparison
            return ascending ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        });

        // Clear tbody and re-append sorted rows
        tbody.innerHTML = '';
        rows.forEach(row => tbody.appendChild(row));
    }
};

// Make utilities available globally
window.DateUtils = DateUtils;
window.CurrencyUtils = CurrencyUtils;
window.FormUtils = FormUtils;
window.StorageUtils = StorageUtils;
window.UIUtils = UIUtils;
window.ExportUtils = ExportUtils;
window.SearchUtils = SearchUtils;
window.showToast = showToast;
window.hideToast = hideToast;

console.log('🛠️ Utility functions loaded successfully');