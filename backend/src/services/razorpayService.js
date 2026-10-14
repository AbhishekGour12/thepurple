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
        console.error('[Razorpay] Missing signature parameters:', {
          razorpayOrderId,
          razorpayPaymentId,
          hasSignature: !!razorpaySignature,
        });
        return false;
      }

      const keySecret = (process.env.RAZORPAY_KEY_SECRET || this.keySecret || '').trim();
      const body = `${String(razorpayOrderId).trim()}|${String(razorpayPaymentId).trim()}`;
      const expectedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(body)
        .digest('hex');

      const isMatch = expectedSignature === String(razorpaySignature).trim();
      if (!isMatch) {
        console.error('[Razorpay Signature Verification Failed]', {
          razorpayOrderId,
          razorpayPaymentId,
          receivedSignature: razorpaySignature,
          expectedSignatureLength: expectedSignature.length,
          keySecretAvailable: !!keySecret,
        });
      }
      return isMatch;
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

  /**
   * Issue a refund for a payment via Razorpay API
   * Automatically credits back to customer's original payment method (card, UPI, bank)
   * @param {Object} params
   * @param {string} params.paymentId - Razorpay Payment ID (e.g., pay_xxx)
   * @param {number} [params.amount] - Amount in INR (converted to paise). If omitted, full refund.
   * @param {Object} [params.notes={}] - Key-value metadata notes
   * @param {string} [params.speed='optimum'] - 'normal' or 'optimum'
   * @param {string} [params.receipt] - Unique receipt ID
   */
  async refundPayment({ paymentId, amount, notes = {}, speed = 'optimum', receipt }) {
    try {
      if (!paymentId) {
        throw new Error('Razorpay Payment ID is required to process refund');
      }

      const options = {
        notes,
        speed,
      };

      if (receipt) {
        options.receipt = receipt;
      }

      if (amount && parseFloat(amount) > 0) {
        options.amount = Math.round(parseFloat(amount) * 100); // Convert INR to paise
      }

      const refund = await this.instance.payments.refund(paymentId, options);
      return {
        success: true,
        refundId: refund.id,
        paymentId: refund.payment_id,
        amount: refund.amount ? refund.amount / 100 : amount,
        currency: refund.currency || 'INR',
        status: refund.status || 'processed',
        speedProcessed: refund.speed_processed || speed,
        acquirerData: refund.acquirer_data || null,
        createdAt: refund.created_at,
        raw: refund,
      };
    } catch (error) {
      console.error('[Razorpay Refund Error]:', error);
      const errorMsg =
        error.error?.description ||
        error.error?.message ||
        error.message ||
        'Failed to process refund on Razorpay';
      throw new Error(errorMsg);
    }
  }

  /**
   * Fetch specific refund details from Razorpay
   */
  async fetchRefund(paymentId, refundId) {
    try {
      if (!paymentId || !refundId) return null;
      return await this.instance.payments.fetchRefund(paymentId, refundId);
    } catch (error) {
      console.error('Razorpay Fetch Refund Error:', error);
      return null;
    }
  }
}

export const razorpayService = new RazorpayService();
export default razorpayService;
