import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { 
  getShippingMethods,
  createShippingMethod,
  updateShippingMethod,
  deleteShippingMethod,
  getShipments,
  getShipment,
  updateShipmentStatus,
  getTrackingEvents,
  addTrackingEvent,
  getShippingStats
} from '../controllers/shippingController';

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// Shipping Methods
router.get('/methods', getShippingMethods);
router.post('/methods', createShippingMethod);
router.put('/methods/:id', updateShippingMethod);
router.delete('/methods/:id', deleteShippingMethod);

// Shipments
router.get('/shipments', getShipments);
router.get('/shipments/:id', getShipment);
router.put('/shipments/:id/status', updateShipmentStatus);

// Tracking Events
router.get('/shipments/:id/tracking', getTrackingEvents);
router.post('/shipments/:id/tracking', addTrackingEvent);

// Statistics
router.get('/stats', getShippingStats);

export default router;
