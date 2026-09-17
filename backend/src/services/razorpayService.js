import Razorpay from 'razorpay';
import crypto from 'crypto';

class RazorpayService {
  constructor() {
    this.keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_T54rFRRURtKx41';
    this.keySecret = process.env.RAZORPAY_KEY_SECRET || 'HYBJNTJST3PIBro3kDlLV5G8';

    this.instance = new Razorpay({
      key_id: this.keyId,
      key_secret: this.keySecret,
    });
  }

  /**
   * Create an order on Razorpay
   * @param {Object} params
   * @param {number} params.amount - In INR (will be converted to paise)
   * @param {string} [params.currency='INR']
   * @param {string} params.receipt - Order receipt / internal order reference
   * @param {Object} [params.notes={}]
   */
  async createOrder({ amount, currency = 'INR', receipt, notes = {} }) {
    try {
      const options = {
        amount: Math.round(parseFloat(amount) * 100), // Amount in paise
        currency,
        receipt: (receipt || `rcpt_${Date.now()}`).substring(0, 40),
        notes,
      };

      const order = await this.instance.orders.create(options);
      return {
        success: true,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
        status: order.status,
      };
    } catch (error) {
      console.error('Razorpay Create Order Error:', error);
      throw new Error(error.error?.description || error.message || 'Failed to initialize Razorpay payment');
    }
  }

  /**
   * Verify Razorpay payment signature
   * @param {Object} params
   * @param {string} params.razorpayOrderId
   * @param {string} params.razorpayPaymentId
   * @param {string} params.razorpaySignature
   * @returns {boolean}
   */
  verifyPaymentSignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) {
    try {
      if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        return false;
      }

      const body = `${razorpayOrderId}|${razorpayPaymentId}`;
      const expectedSignature = crypto
        .createHmac('sha256', this.keySecret)
        .update(body.toString())
        .digest('hex');

      return expectedSignature === razorpaySignature;
    } catch (error) {
      console.error('Razorpay Signature Verification Error:', error);
      return false;
    }
  }

  /**
   * Fetch payment details from Razorpay
   * @param {string} paymentId
   */
  async fetchPayment(paymentId) {
    try {
      return await this.instance.payments.fetch(paymentId);
    } catch (error) {
      console.error('Razorpay Fetch Payment Error:', error);
      return null;
    }
  }
}

export const razorpayService = new RazorpayService();
export default razorpayService;
