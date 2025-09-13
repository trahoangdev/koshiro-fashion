import { Request, Response } from 'express';
import { ShippingMethod, Shipment, TrackingEvent } from '../models/Shipping';

// Get all shipping methods
export const getShippingMethods = async (req: Request, res: Response) => {
  try {
    const methods = await ShippingMethod.find({}).sort({ createdAt: -1 });
    res.json(methods);
  } catch (error) {
    console.error('Error fetching shipping methods:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create new shipping method
export const createShippingMethod = async (req: Request, res: Response) => {
  try {
    const method = new ShippingMethod(req.body);
    await method.save();
    res.status(201).json(method);
  } catch (error) {
    console.error('Error creating shipping method:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update shipping method
export const updateShippingMethod = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const method = await ShippingMethod.findByIdAndUpdate(id, req.body, { new: true });
    if (!method) {
      return res.status(404).json({ message: 'Shipping method not found' });
    }
    res.json(method);
  } catch (error) {
    console.error('Error updating shipping method:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete shipping method
export const deleteShippingMethod = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const method = await ShippingMethod.findByIdAndDelete(id);
    if (!method) {
      return res.status(404).json({ message: 'Shipping method not found' });
    }
    res.json({ message: 'Shipping method deleted successfully' });
  } catch (error) {
    console.error('Error deleting shipping method:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all shipments with pagination and filters
export const getShipments = async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      method, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query: any = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (method && method !== 'all') {
      query.shippingMethod = method;
    }
    
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { trackingNumber: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { carrier: { $regex: search, $options: 'i' } }
      ];
    }

    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    const shipments = await Shipment.find(query)
      .sort(sort)
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit))
      .populate('orderId', 'orderNumber customerName customerEmail');

    const total = await Shipment.countDocuments(query);

    res.json({
      shipments,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      total
    });
  } catch (error) {
    console.error('Error fetching shipments:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get single shipment
export const getShipment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const shipment = await Shipment.findById(id).populate('orderId');
    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found' });
    }
    res.json(shipment);
  } catch (error) {
    console.error('Error fetching shipment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update shipment status
export const updateShipmentStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    const shipment = await Shipment.findByIdAndUpdate(
      id, 
      { 
        status, 
        notes,
        updatedAt: new Date(),
        ...(status === 'delivered' && { actualDelivery: new Date() })
      }, 
      { new: true }
    );
    
    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found' });
    }

    // Create tracking event
    const trackingEvent = new TrackingEvent({
      shipmentId: id,
      status,
      location: req.body.location || 'Unknown',
      description: req.body.description || `Status updated to ${status}`,
      timestamp: new Date(),
      carrier: shipment.carrier
    });
    await trackingEvent.save();

    res.json(shipment);
  } catch (error) {
    console.error('Error updating shipment status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get tracking events for a shipment
export const getTrackingEvents = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const events = await TrackingEvent.find({ shipmentId: id })
      .sort({ timestamp: -1 });
    res.json(events);
  } catch (error) {
    console.error('Error fetching tracking events:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Add tracking event
export const addTrackingEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const event = new TrackingEvent({
      ...req.body,
      shipmentId: id,
      timestamp: new Date()
    });
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    console.error('Error adding tracking event:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get shipping statistics
export const getShippingStats = async (req: Request, res: Response) => {
  try {
    const total = await Shipment.countDocuments();
    const pending = await Shipment.countDocuments({ status: 'pending' });
    const delivered = await Shipment.countDocuments({ status: 'delivered' });
    const inTransit = await Shipment.countDocuments({ status: 'in_transit' });
    const failed = await Shipment.countDocuments({ status: 'failed' });
    
    const totalCost = await Shipment.aggregate([
      { $group: { _id: null, total: { $sum: '$shippingCost' } } }
    ]);

    res.json({
      total,
      pending,
      delivered,
      inTransit,
      failed,
      totalCost: totalCost[0]?.total || 0
    });
  } catch (error) {
    console.error('Error fetching shipping stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};