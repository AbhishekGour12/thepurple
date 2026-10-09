/**
 * Shiprocket API Integration Service
 * Manages Authentication, Dynamic Rates, Adhoc Order creation, AWB generation, and Tracking.
 */

class ShiprocketService {
  constructor() {
    this.baseUrl = 'https://apiv2.shiprocket.in/v1/external';
    this.email = process.env.SHIPROCKET_EMAIL || 'leovexatechnologies@gmail.com';
    this.password = process.env.SHIPROCKET_PASSWORD || 'c1Yk0Ucmw8GD11^E9emGgS6lsyU0QCw!';
    this.token = null;
    this.tokenExpiry = null;
    this.primaryPickupPincode = '452010';
    this.primaryPickupLocation = 'warehouse';
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
   * Find Order in Shiprocket by channel order ID / orderNumber (e.g. TP-81322216)
   * @param {string} orderNumber
   */
  async findOrderByNumber(orderNumber) {
    try {
      if (!orderNumber) return null;
      const res = await this.request(`/orders?search=${encodeURIComponent(orderNumber)}`, {
        method: 'GET',
      });
      if (res.success && res.data?.data && Array.isArray(res.data.data)) {
        const found =
          res.data.data.find(
            (o) =>
              String(o.channel_order_id || o.order_id || '')
                .trim()
                .toUpperCase() === String(orderNumber).trim().toUpperCase()
          ) || res.data.data[0];
        if (found) {
          const firstShipment = found.shipments && found.shipments.length > 0 ? found.shipments[0] : null;
          return {
            shiprocketOrderId: String(found.id),
            shiprocketShipmentId: firstShipment ? String(firstShipment.id) : null,
            awbCode: firstShipment?.awb || found.awb_code || null,
            status: found.status,
            statusCode: found.status_code,
          };
        }
      }
      return null;
    } catch (err) {
      console.warn(`Shiprocket lookup for #${orderNumber} failed:`, err.message);
      return null;
    }
  }

  /**
   * Cancel an order in Shiprocket
   * Cancels shipment/AWB if generated, and cancels the order in Shiprocket.
   * @param {string|number|Object} orderIdOrOptions - shiprocketOrderId or options object
   * @param {string} [awbCode]
   * @param {string|number} [shipmentId]
   * @param {string} [orderNumber]
   */
  async cancelOrder(orderIdOrOptions, awbCode = null, shipmentId = null, orderNumber = null) {
    try {
      let srOrderId = null;
      let awb = null;
      let shipId = null;
      let ordNum = null;

      if (typeof orderIdOrOptions === 'object' && orderIdOrOptions !== null) {
        srOrderId = orderIdOrOptions.shiprocketOrderId || orderIdOrOptions.orderId || orderIdOrOptions.id;
        awb = orderIdOrOptions.awbCode || orderIdOrOptions.awb;
        shipId = orderIdOrOptions.shipmentId || orderIdOrOptions.shiprocketShipmentId;
        ordNum = orderIdOrOptions.orderNumber;
      } else {
        srOrderId = orderIdOrOptions;
        awb = awbCode;
        shipId = shipmentId;
        ordNum = orderNumber;
      }

      // Check if srOrderId is actually an alphanumeric order number (like TP-81322216)
      const isNumericSrId = srOrderId && /^\d+$/.test(String(srOrderId).trim());
      if (!isNumericSrId && srOrderId && !ordNum) {
        ordNum = String(srOrderId).trim();
        srOrderId = null;
      }

      // If no valid numeric shiprocketOrderId, look it up in Shiprocket by channel orderNumber
      if (!srOrderId && ordNum) {
        const found = await this.findOrderByNumber(ordNum);
        if (found) {
          srOrderId = found.shiprocketOrderId;
          if (!awb && found.awbCode) awb = found.awbCode;
          if (!shipId && found.shiprocketShipmentId) shipId = found.shiprocketShipmentId;
        }
      }

      // If we have numeric srOrderId but missing AWB or shipId, query order detail from Shiprocket
      if (srOrderId && (!awb || !shipId)) {
        try {
          const detailRes = await this.request(`/orders/show/${srOrderId}`, { method: 'GET' });
          if (detailRes.success && detailRes.data?.data) {
            const d = detailRes.data.data;
            const shipments = d.shipments || [];
            if (shipments.length > 0) {
              const firstShip = shipments[0];
              if (!shipId && firstShip.id) shipId = firstShip.id;
              if (!awb && firstShip.awb) awb = firstShip.awb;
            }
            if (!awb && d.awb_code) awb = d.awb_code;
          }
        } catch (detailErr) {
          console.warn(`[Shiprocket] Could not fetch order details for srOrderId ${srOrderId}:`, detailErr.message);
        }
      }

      if (!srOrderId && !awb && !shipId) {
        console.warn('[Shiprocket] cancelOrder: No Shiprocket order ID, Shipment ID, or AWB found for order:', ordNum || orderIdOrOptions);
        return {
          success: false,
          message: 'No Shiprocket order ID, Shipment ID, or AWB code found for cancellation in Shiprocket',
        };
      }

      const actions = [];
      let anySuccess = false;

      // 1. Cancel AWB if assigned
      if (awb) {
        try {
          const awbCancelRes = await this.request('/orders/cancel/shipment/awbs', {
            method: 'POST',
            body: JSON.stringify({ awbs: [String(awb).trim()] }),
          });
          actions.push({ step: 'cancel_awb', awb, success: awbCancelRes.success, response: awbCancelRes.data });
          if (awbCancelRes.success) anySuccess = true;
        } catch (awbErr) {
          console.warn(`[Shiprocket] Failed to cancel AWB ${awb}:`, awbErr.message);
          actions.push({ step: 'cancel_awb', awb, success: false, error: awbErr.message });
        }
      }

      // 2. Cancel Shipment if shipmentId present
      if (shipId) {
        const parsedShipId = parseInt(shipId, 10);
        if (!isNaN(parsedShipId)) {
          try {
            const shipCancelRes = await this.request('/shipments/cancel', {
              method: 'POST',
              body: JSON.stringify({ ids: [parsedShipId] }),
            });
            actions.push({
              step: 'cancel_shipment',
              shipmentId: parsedShipId,
              success: shipCancelRes.success,
              response: shipCancelRes.data,
            });
            if (shipCancelRes.success) anySuccess = true;
          } catch (shipErr) {
            console.warn(`[Shiprocket] Failed to cancel Shipment ${parsedShipId}:`, shipErr.message);
            actions.push({ step: 'cancel_shipment', shipmentId: parsedShipId, success: false, error: shipErr.message });
          }
        }
      }

      // 3. Cancel Order in Shiprocket
      let orderCancelRes = null;
      if (srOrderId) {
        const parsedOrderId = parseInt(srOrderId, 10);
        if (!isNaN(parsedOrderId)) {
          orderCancelRes = await this.request('/orders/cancel', {
            method: 'POST',
            body: JSON.stringify({ ids: [parsedOrderId] }),
          });
          actions.push({
            step: 'cancel_order',
            orderId: parsedOrderId,
            success: orderCancelRes.success,
            response: orderCancelRes.data,
          });
          if (orderCancelRes.success) anySuccess = true;
        }
      }

      const mainSuccess = Boolean(orderCancelRes?.success || anySuccess);
      const message =
        orderCancelRes?.data?.message ||
        (mainSuccess ? 'Order cancelled in Shiprocket successfully' : 'Shiprocket order cancellation processed');

      console.log(`[Shiprocket cancelOrder Result] (Order #${ordNum || srOrderId}):`, {
        mainSuccess,
        message,
        actions,
      });

      return {
        success: mainSuccess,
        message,
        actions,
        data: orderCancelRes?.data || null,
      };
    } catch (err) {
      console.error('Shiprocket Cancel Order Exception:', err);
      return { success: false, message: err.message };
    }
  }

  /**
   * 1. Assign Courier & Generate Real AWB in Shiprocket
   * @param {string|number} shipmentId
   * @param {number} [courierCompanyId]
   */
  async assignAwb(shipmentId, courierCompanyId = null) {
    try {
      if (!shipmentId) return { success: false, message: 'Shipment ID is required' };

      const awbPayload = { shipment_id: shipmentId };
      if (courierCompanyId) {
        awbPayload.courier_id = courierCompanyId;
      }

      const awbRes = await this.request('/courier/assign/awb', {
        method: 'POST',
        body: JSON.stringify(awbPayload),
      });

      const data = awbRes?.data;
      const awbCode = data?.response?.data?.awb_code || data?.awb_code || null;
      const courierName = data?.response?.data?.courier_name || data?.courier_name || null;
      const courierCompanyIdAssigned = data?.response?.data?.courier_company_id || null;

      if (awbCode) {
        return {
          success: true,
          awbCode,
          courierName,
          courierCompanyId: courierCompanyIdAssigned,
          message: 'AWB and Courier assigned successfully',
        };
      }

      // Handle Shiprocket error response
      const errMsg =
        data?.message ||
        data?.response?.data?.awb_assign_error ||
        data?.errors?.message ||
        'Could not assign AWB courier partner in Shiprocket';

      console.warn('[Shiprocket AWB Assign Warning]:', errMsg, data);
      return {
        success: false,
        message: errMsg,
        statusCode: data?.status_code || 400,
      };
    } catch (err) {
      console.error('Shiprocket Assign AWB Error:', err);
      return { success: false, message: err.message };
    }
  }

  /**
   * 2. Generate Official Shipping Label PDF from Shiprocket
   * @param {string|number} shipmentId
   */
  async generateLabel(shipmentId) {
    try {
      if (!shipmentId) return { success: false, message: 'Shipment ID is required' };

      const labelRes = await this.request('/courier/generate/label', {
        method: 'POST',
        body: JSON.stringify({ shipment_id: [shipmentId] }),
      });

      const labelUrl = labelRes.data?.label_url || null;
      if (labelUrl) {
        return {
          success: true,
          labelUrl,
          labelCreated: labelRes.data?.label_created || 1,
        };
      }

      return {
        success: false,
        message: labelRes.data?.message || 'Shiprocket could not generate shipping label PDF (Assign AWB first)',
      };
    } catch (err) {
      console.error('Shiprocket Generate Label Error:', err);
      return { success: false, message: err.message };
    }
  }

  /**
   * 3. Generate Official Tax Invoice PDF from Shiprocket
   * @param {string|number} shiprocketOrderId
   */
  async generateInvoice(shiprocketOrderId) {
    try {
      if (!shiprocketOrderId) return { success: false, message: 'Shiprocket Order ID is required' };

      const invoiceRes = await this.request('/orders/print/invoice', {
        method: 'POST',
        body: JSON.stringify({ ids: [shiprocketOrderId] }),
      });

      const invoiceUrl = invoiceRes.data?.invoice_url || null;
      if (invoiceUrl) {
        return {
          success: true,
          invoiceUrl,
          isInvoiceCreated: invoiceRes.data?.is_invoice_created || true,
        };
      }

      return {
        success: false,
        message: invoiceRes.data?.message || 'Shiprocket could not generate invoice PDF',
      };
    } catch (err) {
      console.error('Shiprocket Generate Invoice Error:', err);
      return { success: false, message: err.message };
    }
  }

  /**
   * 4. Schedule Courier Pickup in Shiprocket
   * @param {string|number} shipmentId
   * @param {string} [pickupDate] - Format: YYYY-MM-DD
   */
  async schedulePickup(shipmentId, pickupDate = null) {
    try {
      if (!shipmentId) return { success: false, message: 'Shipment ID is required' };

      // Default pickup date to tomorrow if not specified
      let formattedDate = pickupDate;
      if (!formattedDate) {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        formattedDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      }

      const pickupRes = await this.request('/courier/generate/pickup', {
        method: 'POST',
        body: JSON.stringify({
          shipment_id: [shipmentId],
          pickup_date: [formattedDate],
        }),
      });

      const data = pickupRes.data;
      if (data?.pickup_status === 1 || data?.response?.pickup_scheduled_date || data?.response?.status === 200) {
        return {
          success: true,
          pickupScheduledDate: data?.response?.pickup_scheduled_date || formattedDate,
          pickupTokenNumber: data?.response?.pickup_token_number || null,
          data: data?.response || data,
          message: 'Courier pickup scheduled successfully',
        };
      }

      const errMsg =
        data?.message ||
        data?.response?.data ||
        data?.response?.message ||
        'Failed to schedule pickup in Shiprocket (ensure AWB is assigned)';

      return {
        success: false,
        message: errMsg,
      };
    } catch (err) {
      console.error('Shiprocket Schedule Pickup Error:', err);
      return { success: false, message: err.message };
    }
  }

  /**
   * 5. Generate Manifest from Shiprocket
   * @param {string|number} shipmentId
   */
  async generateManifest(shipmentId) {
    try {
      if (!shipmentId) return { success: false, message: 'Shipment ID is required' };

      const manifestRes = await this.request('/manifests/generate', {
        method: 'POST',
        body: JSON.stringify({ shipment_id: [shipmentId] }),
      });

      const manifestUrl = manifestRes.data?.manifest_url || null;
      if (manifestUrl) {
        return {
          success: true,
          manifestUrl,
        };
      }

      return {
        success: false,
        message: manifestRes.data?.message || 'Could not generate manifest in Shiprocket',
      };
    } catch (err) {
      console.error('Shiprocket Generate Manifest Error:', err);
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
      const cleanAwb = String(awbCode).trim();

      const res = await this.request(`/courier/track/awb/${encodeURIComponent(cleanAwb)}`, {
        method: 'GET',
      });

      // Handle various response wrappers from Shiprocket API
      let track = null;
      if (res.data?.tracking_data) {
        track = res.data.tracking_data;
      } else if (res.data?.[cleanAwb]?.tracking_data) {
        track = res.data[cleanAwb].tracking_data;
      } else if (res.data?.data?.tracking_data) {
        track = res.data.data.tracking_data;
      } else if (res.data && typeof res.data === 'object') {
        const firstVal = Object.values(res.data)[0];
        if (firstVal && typeof firstVal === 'object' && firstVal.tracking_data) {
          track = firstVal.tracking_data;
        } else if (res.data.shipment_track || res.data.shipment_status || res.data.current_status) {
          track = res.data;
        }
      }

      if (track && (track.shipment_track || track.shipment_status !== undefined || track.current_status || track.track_status === 1 || Array.isArray(track.shipment_track_activities))) {
        const firstShipmentTrack = Array.isArray(track.shipment_track) && track.shipment_track.length > 0
          ? track.shipment_track[0]
          : (track.shipment_track && typeof track.shipment_track === 'object' ? track.shipment_track : {});

        const rawStatus = firstShipmentTrack.current_status || track.current_status || track.shipment_status || 'IN_TRANSIT';
        const rawStatusId = track.shipment_status !== undefined && track.shipment_status !== null
          ? track.shipment_status
          : (track.shipment_status_id || firstShipmentTrack.sr_status || firstShipmentTrack.status_id || null);

        const activities = track.shipment_track_activities || track.activities || track.scans || [];
        const courierName = firstShipmentTrack.courier_name || track.courier_name || null;
        const trackUrl = track.track_url || firstShipmentTrack.track_url || `https://shiprocket.co/tracking/${cleanAwb}`;
        const expectedDate = track.expected_delivery_date || track.etd || track.edd || firstShipmentTrack.edd || null;
        const deliveredDate = firstShipmentTrack.delivered_date || null;

        const { orderStatus, shipmentStatus, displayStatus } = this.mapShiprocketStatus(rawStatus, rawStatusId);

        return {
          success: true,
          currentStatus: displayStatus || rawStatus,
          rawStatus: String(rawStatus),
          statusId: rawStatusId,
          orderStatus,
          shipmentStatus,
          courierName,
          trackUrl,
          activities,
          expectedDate,
          deliveredDate,
        };
      }

      return {
        success: false,
        message: res.data?.message || 'Tracking details not yet updated by courier',
        trackUrl: `https://shiprocket.co/tracking/${cleanAwb}`,
      };
    } catch (err) {
      console.error('Shiprocket Tracking Error:', err);
      return { success: false, message: err.message };
    }
  }

  /**
   * Map raw Shiprocket status string or status ID to local Order & Shipment statuses
   * @param {string|number} rawStatus
   * @param {number|string} [statusId]
   */
  mapShiprocketStatus(rawStatus, statusId = null) {
    const raw = String(rawStatus || '').toUpperCase().trim();

    // Determine numeric ID from either statusId or rawStatus
    let id = null;
    if (statusId !== null && statusId !== undefined && String(statusId).trim() !== '' && !isNaN(Number(statusId))) {
      id = Number(statusId);
    } else if (rawStatus !== null && rawStatus !== undefined && String(rawStatus).trim() !== '' && !isNaN(Number(rawStatus))) {
      id = Number(rawStatus);
    }

    let orderStatus = 'IN_TRANSIT';
    let shipmentStatus = 'IN_TRANSIT';
    let displayStatus = 'In Transit';

    // 1. DELIVERED Check (ID 7, 23, 26 or text matching DELIVERED / DELIVER)
    if (
      id === 7 ||
      id === 23 ||
      id === 26 ||
      ((raw.includes('DELIVER') || raw.includes('FULFILL') || raw.includes('COMPLETE')) &&
        !raw.includes('RTO') &&
        !raw.includes('UNDELIVER') &&
        !raw.includes('OUT FOR') &&
        !raw.includes('ATTEMPT'))
    ) {
      orderStatus = 'DELIVERED';
      shipmentStatus = 'DELIVERED';
      displayStatus = 'Delivered';
    }
    // 2. OUT FOR DELIVERY Check (ID 17, 41, 57 or text matching OUT FOR DELIVERY / OFD)
    else if (
      id === 17 ||
      raw.includes('OUT FOR DELIVERY') ||
      raw.includes('OUT_FOR_DELIVERY') ||
      raw === 'OFD'
    ) {
      orderStatus = 'IN_TRANSIT';
      shipmentStatus = 'OUT_FOR_DELIVERY';
      displayStatus = 'Out for Delivery';
    }
    // 3. CANCELLED Check (ID 8, 16, 43 or text matching CANCEL)
    else if (id === 8 || id === 16 || id === 43 || raw.includes('CANCEL')) {
      orderStatus = 'CANCELLED';
      shipmentStatus = 'CANCELLED';
      displayStatus = 'Cancelled';
    }
    // 4. RTO DELIVERED Check (ID 10, 46 or text matching RTO DELIVERED)
    else if (
      id === 10 ||
      id === 46 ||
      raw.includes('RTO DELIVERED') ||
      raw.includes('RETURNED TO WAREHOUSE') ||
      raw.includes('RETURNED TO ORIGIN')
    ) {
      orderStatus = 'RETURNED';
      shipmentStatus = 'RTO_DELIVERED';
      displayStatus = 'Returned to Origin';
    }
    // 5. RTO INITIATED / RETURN / UNDELIVERED Check (ID 9, 12, 13, 14, 21, 24, 25, 40, 44, 45, 57 or text)
    else if (
      id === 9 ||
      id === 12 ||
      id === 13 ||
      id === 14 ||
      id === 21 ||
      id === 24 ||
      id === 25 ||
      id === 40 ||
      id === 44 ||
      id === 45 ||
      raw.includes('RTO') ||
      raw.includes('RETURN') ||
      raw.includes('UNDELIVERED') ||
      raw.includes('LOST') ||
      raw.includes('DAMAGED') ||
      raw.includes('DESTROYED')
    ) {
      orderStatus = 'RETURNED';
      shipmentStatus = 'RTO_INITIATED';
      displayStatus = 'RTO / Return Initiated';
    }
    // 6. PICKED UP / SHIPPED Check (ID 6, 42 or text matching PICKED UP / HANDED OVER / SHIPPED)
    else if (
      id === 6 ||
      id === 42 ||
      raw.includes('PICKED UP') ||
      raw.includes('PICKED-UP') ||
      raw.includes('HANDED OVER') ||
      raw.includes('PICKUP COMPLETED') ||
      raw.includes('SHIPPED')
    ) {
      orderStatus = 'SHIPROCKET_PICKUP';
      shipmentStatus = 'PICKED_UP';
      displayStatus = 'Picked Up by Courier';
    }
    // 7. PICKUP SCHEDULED / BOOKED / QUEUED (ID 3, 4, 15, 20, 52 or text matching PICKUP)
    else if (
      id === 3 ||
      id === 4 ||
      id === 15 ||
      id === 20 ||
      id === 52 ||
      raw.includes('PICKUP SCHEDULED') ||
      raw.includes('PICKUP BOOKED') ||
      raw.includes('PICKUP QUEUED') ||
      raw.includes('PICKUP GENERATED') ||
      raw.includes('RESCHEDULED')
    ) {
      orderStatus = 'SHIPROCKET_PICKUP';
      shipmentStatus = 'PICKUP_SCHEDULED';
      displayStatus = 'Pickup Scheduled';
    }
    // 8. AWB ASSIGNED / LABEL / MANIFEST GENERATED (ID 1, 2, 5 or text matching AWB / LABEL)
    else if (
      id === 1 ||
      id === 2 ||
      id === 5 ||
      raw.includes('AWB ASSIGNED') ||
      raw.includes('LABEL GENERATED') ||
      raw.includes('MANIFEST GENERATED') ||
      raw.includes('READY TO SHIP')
    ) {
      orderStatus = 'SHIPROCKET_PICKUP';
      shipmentStatus = 'AWB_ASSIGNED';
      displayStatus = 'AWB Assigned';
    }
    // 9. IN TRANSIT / REACHED / HUB (ID 18, 19, 22, 38, 39, 48, 49, 50, 51 or text matching TRANSIT / HUB)
    else if (
      id === 18 ||
      id === 19 ||
      id === 22 ||
      id === 38 ||
      id === 39 ||
      id === 48 ||
      id === 49 ||
      id === 50 ||
      id === 51 ||
      raw.includes('TRANSIT') ||
      raw.includes('REACHED') ||
      raw.includes('HUB') ||
      raw.includes('DISPATCHED') ||
      raw.includes('DESTINATION')
    ) {
      orderStatus = 'IN_TRANSIT';
      shipmentStatus = 'IN_TRANSIT';
      displayStatus = 'In Transit';
    }

    return { orderStatus, shipmentStatus, displayStatus, rawStatus: raw, statusId: id };
  }

  /**
   * Process incoming Shiprocket Webhook payload
   * Supports standard tracking update, scans timeline, status updates, and RTO events.
   * @param {Object} payload
   */
  async processTrackingWebhook(payload = {}) {
    try {
      if (!payload || typeof payload !== 'object') {
        return { success: false, message: 'Invalid payload received' };
      }

      // 1. Extract possible identifiers from various Shiprocket webhook schemas
      const awb = payload.awb || payload.awb_code || payload.tracking_data?.awb || payload.data?.awb || payload.data?.awb_code;
      const orderNumber = payload.order_id || payload.channel_order_id || payload.order_no || payload.data?.order_id || payload.data?.channel_order_id;
      const srOrderId = payload.sr_order_id || payload.shiprocket_order_id || payload.data?.sr_order_id || payload.data?.shiprocket_order_id;
      const srShipmentId = payload.shipment_id || payload.shiprocket_shipment_id || payload.data?.shipment_id || payload.data?.shiprocket_shipment_id;
      const courierName = payload.courier_name || payload.courier || payload.data?.courier_name;
      const etd = payload.etd || payload.expected_delivery_date || payload.data?.etd || payload.data?.expected_delivery_date;
      const trackingUrl = payload.sr_tracking_url || payload.courier_tracking_url || (awb ? `https://shiprocket.co/tracking/${awb}` : null);

      // Extract raw status / activities
      const rawStatus =
        payload.current_status ||
        payload.shipment_status ||
        payload.status ||
        payload.tracking_data?.shipment_status ||
        payload.tracking_data?.current_status ||
        payload.data?.current_status ||
        payload.data?.shipment_status ||
        'IN_TRANSIT';

      const statusId =
        payload.current_status_id ||
        payload.shipment_status_id ||
        payload.status_id ||
        payload.data?.current_status_id ||
        payload.data?.shipment_status_id ||
        payload.tracking_data?.shipment_status ||
        null;

      const scans =
        payload.scans ||
        payload.tracking_data?.shipment_track_activities ||
        payload.activities ||
        payload.data?.scans ||
        [];

      // Lazy import models to avoid circular reference
      const { Order, OrderItem, Product, Shipment } = await import('../models/index.js');
      const { Op } = await import('sequelize');

      // 2. Locate order in DB
      const whereConditions = [];
      if (orderNumber) whereConditions.push({ orderNumber: String(orderNumber).trim() });
      if (awb) whereConditions.push({ awbCode: String(awb).trim() });
      if (srOrderId) whereConditions.push({ shiprocketOrderId: String(srOrderId).trim() });
      if (srShipmentId) whereConditions.push({ shiprocketShipmentId: String(srShipmentId).trim() });

      let order = null;
      if (whereConditions.length > 0) {
        order = await Order.findOne({
          where: { [Op.or]: whereConditions },
          include: [
            { model: Shipment, as: 'shipment' },
            { model: OrderItem, as: 'items' },
          ],
        });
      }

      // If not found in Order table, check Shipment table by AWB or Shipment ID
      if (!order && (awb || srShipmentId || srOrderId)) {
        const shipConditions = [];
        if (awb) shipConditions.push({ awbCode: String(awb).trim() });
        if (srShipmentId) shipConditions.push({ shiprocketShipmentId: String(srShipmentId).trim() });
        if (srOrderId) shipConditions.push({ shiprocketOrderId: String(srOrderId).trim() });

        if (shipConditions.length > 0) {
          const matchedShipment = await Shipment.findOne({
            where: { [Op.or]: shipConditions },
          });
          if (matchedShipment?.orderId) {
            order = await Order.findByPk(matchedShipment.orderId, {
              include: [
                { model: Shipment, as: 'shipment' },
                { model: OrderItem, as: 'items' },
              ],
            });
          }
        }
      }

      if (!order) {
        return {
          success: false,
          message: `Order matching criteria not found in database (awb=${awb || 'n/a'}, orderNumber=${orderNumber || 'n/a'})`,
        };
      }

      // 3. Map status
      const { orderStatus, shipmentStatus, displayStatus } = this.mapShiprocketStatus(rawStatus, statusId);

      // Restock inventory if order transitions to CANCELLED or RETURNED from an active status
      const isTerminalReturnOrCancel = ['CANCELLED', 'RETURNED'].includes(orderStatus);
      const wasAlreadyTerminal = ['CANCELLED', 'RETURNED'].includes(order.status);
      if (isTerminalReturnOrCancel && !wasAlreadyTerminal && order.items && order.items.length > 0) {
        for (const item of order.items) {
          if (item.productId && item.quantity > 0) {
            Product.increment('stock', {
              by: item.quantity,
              where: { id: item.productId },
            }).catch((stockErr) => {
              console.warn(`[Shiprocket Webhook] Restock warning for product ${item.productId}:`, stockErr.message);
            });
          }
        }
      }

      // 4. Update Order
      const updateData = {
        status: orderStatus,
      };
      if (awb && !order.awbCode) updateData.awbCode = String(awb);
      if (courierName && (!order.courierName || order.courierName === 'Shiprocket Express')) {
        updateData.courierName = courierName;
      }
      if (trackingUrl) updateData.trackingUrl = trackingUrl;
      if (srOrderId && !order.shiprocketOrderId) updateData.shiprocketOrderId = String(srOrderId);
      if (srShipmentId && !order.shiprocketShipmentId) updateData.shiprocketShipmentId = String(srShipmentId);

      await order.update(updateData);

      // 5. Update or Create Shipment record
      const trackingUpdateData = {
        currentStatus: displayStatus || rawStatus,
        rawStatus: String(rawStatus),
        statusId: statusId,
        courierName: courierName || order.courierName,
        awb: awb || order.awbCode,
        trackUrl: trackingUrl || order.trackingUrl,
        expectedDate: etd,
        activities: scans,
        receivedAt: new Date().toISOString(),
      };

      if (order.shipment) {
        await order.shipment.update({
          status: shipmentStatus,
          awbCode: awb || order.shipment.awbCode,
          courierName: courierName || order.shipment.courierName,
          trackingUrl: trackingUrl || order.shipment.trackingUrl,
          estimatedDeliveryDate: etd ? new Date(etd) : order.shipment.estimatedDeliveryDate,
          lastTrackingUpdate: trackingUpdateData,
        });
      } else {
        await Shipment.create({
          orderId: order.id,
          courierName: courierName || order.courierName || 'Shiprocket',
          shiprocketShipmentId: srShipmentId ? String(srShipmentId) : order.shiprocketShipmentId,
          shiprocketOrderId: srOrderId ? String(srOrderId) : order.shiprocketOrderId,
          awbCode: awb || order.awbCode,
          status: shipmentStatus,
          trackingUrl: trackingUrl,
          estimatedDeliveryDate: etd ? new Date(etd) : null,
          lastTrackingUpdate: trackingUpdateData,
        });
      }

      return {
        success: true,
        orderId: order.id,
        orderNumber: order.orderNumber,
        newStatus: orderStatus,
        shipmentStatus: shipmentStatus,
        displayStatus: displayStatus || rawStatus,
        rawStatus: rawStatus,
      };
    } catch (error) {
      console.error('Shiprocket Webhook Processing Exception:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Sync tracking status for a single order by querying Shiprocket live API
   * @param {Object|string} orderOrId
   */
  async syncOrderTracking(orderOrId) {
    try {
      const { Order, Shipment } = await import('../models/index.js');
      const { Op } = await import('sequelize');

      let order = typeof orderOrId === 'object' && orderOrId?.id ? orderOrId : null;
      if (!order) {
        order = await Order.findOne({
          where: {
            [Op.or]: [
              { id: String(orderOrId) },
              { orderNumber: String(orderOrId) },
            ],
          },
          include: [{ model: Shipment, as: 'shipment' }],
        });
      } else if (!order.shipment) {
        order = await Order.findByPk(order.id, {
          include: [{ model: Shipment, as: 'shipment' }],
        });
      }

      if (!order) {
        return { success: false, message: 'Order not found' };
      }

      // Check if AWB is available, or query Shiprocket by orderNumber if missing
      let effectiveAwb = order.awbCode || order.shipment?.awbCode;
      if (!effectiveAwb && order.orderNumber) {
        const found = await this.findOrderByNumber(order.orderNumber);
        if (found?.awbCode) {
          effectiveAwb = found.awbCode;
          await order.update({
            awbCode: effectiveAwb,
            shiprocketOrderId: found.shiprocketOrderId || order.shiprocketOrderId,
            shiprocketShipmentId: found.shiprocketShipmentId || order.shiprocketShipmentId,
          });
          order.awbCode = effectiveAwb;
        }
      }

      if (!effectiveAwb) {
        return {
          success: false,
          message: 'Order has no AWB assigned yet. Please generate label first.',
          liveTracking: order.shipment?.lastTrackingUpdate || null,
        };
      }

      const trackInfo = await this.trackShipment(effectiveAwb);
      if (!trackInfo.success || !trackInfo.currentStatus) {
        return {
          success: false,
          message: trackInfo.message || 'Tracking details not yet updated by courier',
          liveTracking: trackInfo,
          order,
        };
      }

      const orderStatus = trackInfo.orderStatus || this.mapShiprocketStatus(trackInfo.rawStatus || trackInfo.currentStatus, trackInfo.statusId).orderStatus;
      const shipmentStatus = trackInfo.shipmentStatus || this.mapShiprocketStatus(trackInfo.rawStatus || trackInfo.currentStatus, trackInfo.statusId).shipmentStatus;

      // Update Order
      const updatePayload = {
        status: orderStatus,
        trackingUrl: trackInfo.trackUrl || order.trackingUrl,
      };
      if (trackInfo.courierName && (!order.courierName || order.courierName === 'Shiprocket Express')) {
        updatePayload.courierName = trackInfo.courierName;
      }
      if (!order.awbCode && effectiveAwb) {
        updatePayload.awbCode = effectiveAwb;
      }
      await order.update(updatePayload);

      const trackingPayload = {
        currentStatus: trackInfo.currentStatus,
        rawStatus: trackInfo.rawStatus,
        statusId: trackInfo.statusId,
        courierName: trackInfo.courierName || order.courierName,
        awb: effectiveAwb,
        trackUrl: trackInfo.trackUrl || order.trackingUrl,
        expectedDate: trackInfo.expectedDate,
        deliveredDate: trackInfo.deliveredDate,
        activities: trackInfo.activities || [],
        syncedAt: new Date().toISOString(),
      };

      if (order.shipment) {
        await order.shipment.update({
          status: shipmentStatus,
          awbCode: effectiveAwb,
          courierName: trackInfo.courierName || order.shipment.courierName,
          trackingUrl: trackInfo.trackUrl || order.shipment.trackingUrl,
          estimatedDeliveryDate: trackInfo.expectedDate ? new Date(trackInfo.expectedDate) : order.shipment.estimatedDeliveryDate,
          lastTrackingUpdate: trackingPayload,
        });
      } else {
        await Shipment.create({
          orderId: order.id,
          courierName: trackInfo.courierName || order.courierName || 'Shiprocket',
          shiprocketShipmentId: order.shiprocketShipmentId,
          shiprocketOrderId: order.shiprocketOrderId,
          awbCode: effectiveAwb,
          status: shipmentStatus,
          trackingUrl: trackInfo.trackUrl || order.trackingUrl,
          estimatedDeliveryDate: trackInfo.expectedDate ? new Date(trackInfo.expectedDate) : null,
          lastTrackingUpdate: trackingPayload,
        });
      }

      return {
        success: true,
        order,
        liveTracking: trackingPayload,
        mappedStatus: orderStatus,
        shipmentStatus: shipmentStatus,
      };
    } catch (err) {
      console.error('Shiprocket Single Order Sync Error:', err);
      return { success: false, message: err.message };
    }
  }
}

export const shiprocketService = new ShiprocketService();
export default shiprocketService;
