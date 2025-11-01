const db = require('../db');

/**
 * GET /api/payments
 * Get payment history for user
 */
async function getPayments(req, res) {
  try {
    const userId = req.user.id;
    const { type = 'all' } = req.query;

    const upcoming = [];
    const completed = [];

    // Get appointment payments
    const appointmentsResult = await db.query(`
      SELECT id, doctor_name, appointment_date, appointment_time, payment, status, created_at
      FROM appointments
      WHERE patient_id = $1
      ORDER BY appointment_date DESC
    `, [userId]);

    for (const apt of appointmentsResult.rows) {
      const payment = apt.payment;
      
      if (apt.status === 'Confirmed' && new Date(apt.appointment_date) >= new Date()) {
        // Upcoming payment
        upcoming.push({
          id: `pay-apt-${apt.id}`,
          title: apt.doctor_name,
          description: `Consultation with ${apt.doctor_name}`,
          date: apt.appointment_date,
          amount: payment?.total || 0,
          currency: payment?.currency || '₹',
          status: 'Pending',
          type: 'consultation',
          relatedId: apt.id
        });
      } else if (apt.status === 'Completed' || payment?.isPaid) {
        // Completed payment
        completed.push({
          id: `pay-apt-${apt.id}`,
          title: apt.doctor_name,
          description: 'Paid for consultation',
          date: apt.appointment_date,
          amount: payment?.total || 0,
          currency: payment?.currency || '₹',
          status: 'Paid',
          type: 'consultation',
          paymentMethod: payment?.paymentMethod || 'Card',
          transactionId: payment?.transactionId || ''
        });
      }
    }

    // Get pharmacy order payments
    const ordersResult = await db.query(`
      SELECT id, order_number, total, currency, payment_method, created_at
      FROM orders
      WHERE patient_id = $1
      ORDER BY created_at DESC
    `, [userId]);

    for (const order of ordersResult.rows) {
      completed.push({
        id: `pay-order-${order.id}`,
        title: 'Pharmacy Order',
        description: `Medicine order #${order.order_number}`,
        date: order.created_at,
        amount: parseFloat(order.total),
        currency: order.currency,
        status: 'Paid',
        type: 'pharmacy',
        paymentMethod: order.payment_method,
        transactionId: `TXN-${order.id.substr(0, 8)}`
      });
    }

    const payments = {
      upcoming: type === 'all' || type === 'upcoming' ? upcoming : [],
      completed: type === 'all' || type === 'completed' ? completed : []
    };

    res.json({ payments });
  } catch (err) {
    console.error('Get payments error:', err);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
}

module.exports = { getPayments };
