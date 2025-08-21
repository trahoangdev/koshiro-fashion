import { Request, Response } from 'express';
import { User } from '../models/User';
import mongoose from 'mongoose';

// Define the auth request interface
interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

// Get user addresses
export const getUserAddresses = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return addresses with proper IDs
    const addresses = (user.addresses || []).map(addr => ({
      _id: (addr as any)._id || new mongoose.Types.ObjectId(),
      type: addr.type,
      fullName: addr.fullName,
      phone: addr.phone,
      address: addr.address,
      city: addr.city,
      state: addr.state,
      zipCode: addr.zipCode,
      country: addr.country,
      isDefault: addr.isDefault
    }));

    res.json({ addresses });
  } catch (error) {
    console.error('Get addresses error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Add new address
export const addAddress = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { type, fullName, phone, address, city, state, zipCode, country, isDefault } = req.body;

    // Validate required fields
    if (!fullName || !phone || !address || !city || !state || !zipCode || !country) {
      return res.status(400).json({ message: 'All address fields are required' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If this is set as default, unset all other defaults
    if (isDefault) {
      user.addresses?.forEach(addr => {
        addr.isDefault = false;
      });
    }

    // Create new address
    const newAddress = {
      _id: new mongoose.Types.ObjectId(),
      type: type || 'shipping',
      fullName,
      phone,
      address,
      city,
      state,
      zipCode,
      country,
      isDefault: isDefault || (user.addresses?.length === 0)
    };

    // Add to user's addresses
    if (!user.addresses) {
      user.addresses = [];
    }
    user.addresses.push(newAddress);

    await user.save();

    res.status(201).json({
      message: 'Address added successfully',
      address: newAddress
    });
  } catch (error) {
    console.error('Add address error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Update address
export const updateAddress = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { id } = req.params;
    const { type, fullName, phone, address, city, state, zipCode, country, isDefault } = req.body;

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const addressIndex = user.addresses?.findIndex(addr => (addr as any)._id?.toString() === id);
    if (addressIndex === -1 || addressIndex === undefined) {
      return res.status(404).json({ message: 'Address not found' });
    }

    // If this is set as default, unset all other defaults
    if (isDefault) {
      user.addresses?.forEach(addr => {
        addr.isDefault = false;
      });
    }

    // Update address
    const updatedAddress = {
      ...user.addresses![addressIndex],
      type: type || user.addresses![addressIndex].type,
      fullName: fullName || user.addresses![addressIndex].fullName,
      phone: phone || user.addresses![addressIndex].phone,
      address: address || user.addresses![addressIndex].address,
      city: city || user.addresses![addressIndex].city,
      state: state || user.addresses![addressIndex].state,
      zipCode: zipCode || user.addresses![addressIndex].zipCode,
      country: country || user.addresses![addressIndex].country,
      isDefault: isDefault !== undefined ? isDefault : user.addresses![addressIndex].isDefault
    };

    user.addresses![addressIndex] = updatedAddress;
    await user.save();

    res.json({
      message: 'Address updated successfully',
      address: updatedAddress
    });
  } catch (error) {
    console.error('Update address error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete address
export const deleteAddress = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { id } = req.params;

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const addressIndex = user.addresses?.findIndex(addr => (addr as any)._id?.toString() === id);
    if (addressIndex === -1 || addressIndex === undefined) {
      return res.status(404).json({ message: 'Address not found' });
    }

    // Check if it's the default address
    const isDefaultAddress = user.addresses![addressIndex].isDefault;

    // Remove address
    user.addresses?.splice(addressIndex, 1);

    // If we deleted the default address, make the first remaining address default
    if (isDefaultAddress && user.addresses && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    res.json({ message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Delete address error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Set default address
export const setDefaultAddress = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { id } = req.params;

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const addressIndex = user.addresses?.findIndex(addr => (addr as any)._id?.toString() === id);
    if (addressIndex === -1 || addressIndex === undefined) {
      return res.status(404).json({ message: 'Address not found' });
    }

    // Unset all default flags
    user.addresses?.forEach(addr => {
      addr.isDefault = false;
    });

    // Set new default
    user.addresses![addressIndex].isDefault = true;

    await user.save();

    res.json({ message: 'Default address updated successfully' });
  } catch (error) {
    console.error('Set default address error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
