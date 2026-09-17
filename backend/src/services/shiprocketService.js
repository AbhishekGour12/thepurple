/**
 * Shiprocket API Integration Service
 * Manages Authentication, Dynamic Rates, Adhoc Order creation, AWB generation, and Tracking.
 */

class ShiprocketService {
  constructor() {
    this.baseUrl = 'https://apiv2.shiprocket.in/v1/external';
    this.email = process.env.SHIPROCKET_EMAIL || 'solutions@abhi.services'
    this.password = process.env.SHIPROCKET_PASSWORD || '!b79u2ybjMD5AYpv!7DqGNH@ecD1^p4A';
    this.token = null;
    this.tokenExpiry = null;
    this.primaryPickupPincode = '140301';
    this.primaryPickupLocation = 'warehouse-1';
  }

  /**
   * Authenticate and get Shiprocket JWT token (caches for 9 days)
   */
  async getAuthToken() {
    try {
      if (this.token && this.tokenExpiry && Date.now() < this.tokenExpiry) {
        return this.token;
      }

      const email = process.env.SHIPROCKET_EMAIL || this.email;
      const password = process.env.SHIPROCKET_PASSWORD || this.password;

      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.token) {
        console.warn('Shiprocket Auth Warning:', data.message || 'Could not authenticate');
        return null;
      }

      this.token = data.token;
      this.tokenExpiry = Date.now() + 9 * 24 * 60 * 60 * 1000;

      // Also refresh Primary Pickup Location from Shiprocket
      await this.fetchPrimaryPickupLocation();

      return this.token;
    } catch (error) {
      console.error('Shiprocket Auth Error:', error.message);
      return null;
    }
  }

  /**
   * Fetch configured warehouse pickup location from Shiprocket
   */
  async fetchPrimaryPickupLocation() {
    try {
      if (!this.token) return;
      const res = await fetch(`${this.baseUrl}/settings/company/pickup`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
        },
      });
      const data = await res.json();
      const addresses = data?.data?.shipping_address || [];
      if (addresses.length > 0) {
        const primary = addresses.find((a) => a.is_primary_location == 1) || addresses[0];
        if (primary) {
          this.primaryPickupPincode = String(primary.pin_code || '140301');
          this.primaryPickupLocation = String(primary.pickup_location || 'warehouse-1');
        }
      }
    } catch (err) {
      console.warn('Could not load Shiprocket pickup locations:', err.message);
    }
  }

  /**
   * Helper for authenticated Shiprocket requests
   */
  async request(endpoint, options = {}) {
    const token = await this.getAuthToken();
    if (!token) {
      return { success: false, error: 'Shiprocket authentication failed' };
    }

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    };

    try {
      const res = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      const json = await res.json();
      return { success: res.ok, data: json, status: res.status };
    } catch (err) {
      console.error(`Shiprocket Request Error [${endpoint}]:`, err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Check Pincode Serviceability and calculate real-time cheapest courier rate from Shiprocket
   * @param {Object} params
   * @param {string} params.deliveryPincode
   * @param {number} [params.weight=0.35] - in KG
   * @param {number} [params.cod=0] - 0 for prepaid, 1 for COD
   */
  async checkServiceability({ deliveryPincode, weight = 0.35, cod = 0 }) {
    try {
      const cleanDeliveryPin = String(deliveryPincode || '').trim();
      if (!cleanDeliveryPin || cleanDeliveryPin.length !== 6) {
        return { serviceable: false, message: 'Invalid 6-digit Pincode' };
      }

      // Ensure we have active token and pickup location
      await this.getAuthToken();
      const pickupPin = this.primaryPickupPincode || '140301';

      const res = await this.request(
        `/courier/serviceability?pickup_postcode=${pickupPin}&delivery_postcode=${cleanDeliveryPin}&weight=${weight}&cod=${cod}`,
        { method: 'GET' }
      );

      if (res.success && res.data?.data?.available_courier_companies?.length > 0) {
        const couriers = res.data.data.available_courier_companies;

        // Sort by cheapest courier rate
        couriers.sort((a, b) => parseFloat(a.rate || 999) - parseFloat(b.rate || 999));
        const cheapest = couriers[0];

        const rateInRupees = Math.ceil(parseFloat(cheapest.rate || 89));
        const estimatedDeliveryDays = cheapest.estimated_delivery_days
          ? `${cheapest.estimated_delivery_days} Days`
          : cheapest.etd || '3 - 5 Days';

        return {
          serviceable: true,
          courierName: cheapest.courier_name || 'Shiprocket Express',
          courierCompanyId: cheapest.courier_company_id,
          estimatedDays: estimatedDeliveryDays,
          rate: rateInRupees,
          availableCouriersCount: couriers.length,
          allCouriers: couriers.slice(0, 3).map((c) => ({
            name: c.courier_name,
            rate: Math.ceil(parseFloat(c.rate || 89)),
            etd: c.estimated_delivery_days ? `${c.estimated_delivery_days} Days` : c.etd,
          })),
        };
      }

      // If specific pincode has no courier or returned error
      if (res.data?.message) {
        console.warn(`Shiprocket Serviceability check for ${cleanDeliveryPin}:`, res.data.message);
      }

      return {
        serviceable: true,
        courierName: 'Standard Express',
        estimatedDays: '3 - 5 Days',
        rate: 89,
      };
    } catch (err) {
      console.error('Shiprocket Serviceability exception:', err);
      return {
        serviceable: true,
        courierName: 'Standard Express',
        estimatedDays: '3 - 5 Days',
        rate: 89,
      };
    }
  }

  /**
   * Create an adhoc order in Shiprocket
   * @param {Object} order - Local Order model instance
   * @param {Array} orderItems - Array of OrderItem instances
   */
  async createOrder(order, orderItems = []) {
    try {
      await this.getAuthToken();
      const pickupLocation = this.primaryPickupLocation || 'warehouse-1';

      const now = new Date();
      const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
        now.getDate()
      ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      // Format order items for Shiprocket
      const items = orderItems.map((item, idx) => ({
        name: (item.productName || 'Jewellery Item').substring(0, 100),
        sku: (item.sku || `TP-SKU-${idx + 1}`).substring(0, 50),
        units: item.quantity || 1,
        selling_price: parseFloat(item.price || 0),
        discount: 0,
        tax: 0,
        hsn: 7113, // Fashion/Imitation Jewellery HSN
      }));

      // Split name into first and last
      const nameParts = (order.customerName || 'Customer').trim().split(' ');
      const firstName = nameParts[0] || 'Customer';
      const lastName = nameParts.slice(1).join(' ') || 'Customer';

      const payload = {
        order_id: order.orderNumber,
        order_date: formattedDate,
        pickup_location: pickupLocation,
        channel_id: '',
        comment: `ThePurple Online Order #${order.orderNumber}`,
        billing_customer_name: firstName,
        billing_last_name: lastName,
        billing_address: (order.shippingAddress || '').substring(0, 190),
        billing_address_2: '',
        billing_city: order.city || 'City',
        billing_pincode: String(order.pincode || '110001'),
        billing_state: order.state || 'State',
        billing_country: 'India',
        billing_email: order.customerEmail || 'customer@thepurple.online',
        billing_phone: order.customerMobile || '9999999999',
        shipping_is_billing: true,
        order_items: items,
        payment_method: 'Prepaid',
        shipping_charges: parseFloat(order.shippingAmount || 0),
        giftwrap_charges: 0,
        transaction_charges: 0,
        total_discount: parseFloat(order.discountAmount || 0),
        sub_total: parseFloat(order.subtotalAmount || 0),
        length: 10,
        breadth: 10,
        height: 8,
        weight: 0.35, // 350g typical packet
      };

      const res = await this.request('/orders/create/adhoc', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res.success && res.data?.order_id) {
        return {
          success: true,
          shiprocketOrderId: String(res.data.order_id),
          shiprocketShipmentId: String(res.data.shipment_id || ''),
          awbCode: res.data.awb_code || null,
          courierName: res.data.courier_name || null,
          status: res.data.status || 'ORDER_CREATED',
        };
      }

      console.warn('Shiprocket Create Order API response:', res.data);
      return {
        success: false,
        message: res.data?.message || 'Shiprocket order creation returned an issue',
        data: res.data,
      };
    } catch (err) {
      console.error('Shiprocket Create Order Exception:', err);
      return { success: false, message: err.message };
    }
  }

  /**
   * Cancel an order in Shiprocket
   * @param {string|number} shiprocketOrderId
   */
  async cancelOrder(shiprocketOrderId) {
    try {
      if (!shiprocketOrderId) return { success: false, message: 'No Shiprocket order ID' };

      const res = await this.request('/orders/cancel', {
        method: 'POST',
        body: JSON.stringify({ ids: [parseInt(shiprocketOrderId, 10)] }),
      });

      return {
        success: res.success,
        data: res.data,
      };
    } catch (err) {
      console.error('Shiprocket Cancel Order Exception:', err);
      return { success: false, message: err.message };
    }
  }

  /**
   * Generate AWB & Shipping Label in Shiprocket (assigns courier)
   * @param {string|number} shipmentId
   * @param {number} [courierCompanyId]
   */
  async generateLabel(shipmentId, courierCompanyId = null) {
    try {
      if (!shipmentId) return { success: false, message: 'No Shipment ID' };

      // 1. Assign AWB with optional courier company ID
      const awbPayload = { shipment_id: shipmentId };
      if (courierCompanyId) {
        awbPayload.courier_id = courierCompanyId;
      }

      const awbRes = await this.request('/courier/assign/awb', {
        method: 'POST',
        body: JSON.stringify(awbPayload),
      });

      // 2. Generate Label URL
      const labelRes = await this.request('/courier/generate/label', {
        method: 'POST',
        body: JSON.stringify({ shipment_id: [shipmentId] }),
      });

      return {
        success: true,
        awbCode: awbRes.data?.response?.data?.awb_code || null,
        courierName: awbRes.data?.response?.data?.courier_name || null,
        labelUrl: labelRes.data?.label_url || null,
      };
    } catch (err) {
      console.error('Shiprocket Generate Label Error:', err);
      return { success: false, message: err.message };
    }
  }

  /**
   * Track Shipment by AWB code
   * @param {string} awbCode
   */
  async trackShipment(awbCode) {
    try {
      if (!awbCode) return { success: false, message: 'AWB code required' };

      const res = await this.request(`/courier/track/awb/${awbCode}`, {
        method: 'GET',
      });

      if (res.success && res.data?.tracking_data) {
        const track = res.data.tracking_data;
        return {
          success: true,
          currentStatus: track.shipment_status || 'IN_TRANSIT',
          trackUrl: track.track_url || null,
          activities: track.shipment_track_activities || [],
          expectedDate: track.expected_delivery_date || null,
        };
      }

      return {
        success: false,
        message: 'Tracking details not yet updated by courier',
      };
    } catch (err) {
      console.error('Shiprocket Tracking Error:', err);
      return { success: false, message: err.message };
    }
  }
}

export const shiprocketService = new ShiprocketService();
export default shiprocketService;
