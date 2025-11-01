const db = require('../db');
const { v4: uuidv4 } = require('uuid');

/**
 * GET /api/orders
 * Get user's orders with optional status filter
 */
async function getOrders(req, res) {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    let query = `
      SELECT id, order_number, items, subtotal, tax, delivery_fee, total, currency,
             delivery_address, payment_method, status, estimated_delivery, 
             tracking_number, delivered_at, created_at
      FROM orders
      WHERE patient_id = $1
    `;

    const params = [userId];

    if (status) {
      query += ` AND status = $2`;
      params.push(status);
    }

    query += ` ORDER BY created_at DESC`;

    const result = await db.query(query, params);

    const orders = result.rows.map(order => ({
      id: order.id,
      orderNumber: order.order_number,
      items: order.items,
      total: parseFloat(order.total),
      currency: order.currency,
      status: order.status,
      deliveredAt: order.delivered_at,
      createdAt: order.created_at
    }));

    res.json({ orders });
  } catch (err) {
    console.error('Get orders error:', err);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
}

/**
 * POST /api/orders
 * Create a new order
 */
async function createOrder(req, res) {
  try {
    const userId = req.user.id;
    const { items, subtotal, tax, deliveryFee, total, currency, deliveryAddress, paymentMethod } = req.body;

    if (!items || !total || !deliveryAddress || !paymentMethod) {
      return res.status(400).json({ 
        success: false,
        error: 'Missing required fields: items, total, deliveryAddress, paymentMethod' 
      });
    }

    // Validate items array
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        success: false,
        error: 'Items must be a non-empty array' 
      });
    }

    // Generate order ID and order number
    const orderId = uuidv4();
    const orderNumber = 'ORD-' + new Date().toISOString().split('T')[0].replace(/-/g, '') + '-' + 
                        Math.random().toString(36).substr(2, 6).toUpperCase();

    // Generate tracking number
    const trackingNumber = 'TRK' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();

    // Calculate estimated delivery (3 days from now)
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 3);

    // Enrich items with medicine details from database
    const enrichedItems = [];
    for (const item of items) {
      const medicineResult = await db.query(
        'SELECT name, image FROM medicines WHERE id = $1',
        [item.medicineId]
      );

      if (medicineResult.rows.length > 0) {
        enrichedItems.push({
          medicineId: item.medicineId,
          medicineName: medicineResult.rows[0].name,
          quantity: item.quantity,
          price: item.price,
          image: medicineResult.rows[0].image
        });
      } else {
        enrichedItems.push({
          medicineId: item.medicineId,
          medicineName: 'Unknown Medicine',
          quantity: item.quantity,
          price: item.price,
          image: null
        });
      }
    }

    // Insert order
    await db.query(`
      INSERT INTO orders (
        id, patient_id, order_number, items, subtotal, tax, delivery_fee, 
        total, currency, delivery_address, payment_method, status,
        estimated_delivery, tracking_number, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
    `, [
      orderId, userId, orderNumber, JSON.stringify(enrichedItems), 
      subtotal, tax || 0, deliveryFee || 0, total, currency || '₹',
      JSON.stringify(deliveryAddress), paymentMethod, 'Processing',
      estimatedDelivery, trackingNumber
    ]);

    // Create notification
    await db.query(`
      INSERT INTO notifications (
        patient_id, title, description, type, icon_name, icon_color, related_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      userId,
      'Order Placed',
      `Your order ${orderNumber} has been placed successfully.`,
      'order',
      'cart',
      '#34D399',
      orderId
    ]);

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order: {
        id: orderId,
        orderNumber,
        items: enrichedItems,
        total,
        currency: currency || '₹',
        status: 'Processing',
        estimatedDelivery: estimatedDelivery.toISOString().split('T')[0],
        trackingNumber,
        createdAt: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
}

module.exports = { getOrders, createOrder };
