import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/auth';
import { PaymentMethod } from '../models/PaymentMethod';

export const getPaymentMethods = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as Request & { user: { userId: string } }).user.userId;
    
    const paymentMethods = await PaymentMethod.find({ userId }).sort({ isDefault: -1, createdAt: -1 });
    
    res.json(paymentMethods);});
export const addPaymentMethod = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as Request & { user: { userId: string } }).user.userId;
    const { type, name, cardNumber, expiryMonth, expiryYear, cvv, paypalEmail } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    if (type === 'paypal' && !paypalEmail) {
      return res.status(400).json({ message: 'PayPal email is required' });
    }

    if ((type === 'credit_card' || type === 'debit_card') && (!cardNumber || !expiryMonth || !expiryYear || !cvv)) {
      return res.status(400).json({ message: 'Card details are required' });
    }

    // Extract last 4 digits for card types
    let last4: string | undefined;
    let brand: string | undefined;
    
    if (type === 'credit_card' || type === 'debit_card') {
      last4 = cardNumber.replace(/\s/g, '').slice(-4);
      // Simple brand detection
      if (cardNumber.startsWith('4')) {
        brand = 'Visa';
      } else if (cardNumber.match(/^5[1-5]/)) {
        brand = 'Mastercard';
      } else if (cardNumber.match(/^3[47]/)) {
        brand = 'American Express';
      }
    }

    const paymentMethod = new PaymentMethod({
      userId,
      type,
      name: type === 'paypal' ? paypalEmail : name,
      last4,
      expiryMonth,
      expiryYear,
      brand,
      paypalEmail,
      isDefault: false // Will be set to true if this is the first payment method
    });

    // If this is the first payment method, make it default
    const existingMethods = await PaymentMethod.find({ userId });
    if (existingMethods.length === 0) {
      paymentMethod.isDefault = true;
    }

    await paymentMethod.save();

    res.status(201).json(paymentMethod);});
export const updatePaymentMethod = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as Request & { user: { userId: string } }).user.userId;
    const { id } = req.params;
    const { type, name, cardNumber, expiryMonth, expiryYear, cvv, paypalEmail } = req.body;

    const paymentMethod = await PaymentMethod.findOne({ _id: id, userId });
    if (!paymentMethod) {
      return res.status(404).json({ message: 'Payment method not found' });
    }

    // Update fields
    if (name) paymentMethod.name = name;
    if (type) paymentMethod.type = type;
    if (expiryMonth) paymentMethod.expiryMonth = expiryMonth;
    if (expiryYear) paymentMethod.expiryYear = expiryYear;
    if (paypalEmail) paymentMethod.paypalEmail = paypalEmail;

    // Update card details if provided
    if (cardNumber) {
      paymentMethod.last4 = cardNumber.replace(/\s/g, '').slice(-4);
      // Update brand
      if (cardNumber.startsWith('4')) {
        paymentMethod.brand = 'Visa';
      } else if (cardNumber.match(/^5[1-5]/)) {
        paymentMethod.brand = 'Mastercard';
      } else if (cardNumber.match(/^3[47]/)) {
        paymentMethod.brand = 'American Express';
      }
    }

    await paymentMethod.save();

    res.json(paymentMethod);});
export const deletePaymentMethod = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as Request & { user: { userId: string } }).user.userId;
    const { id } = req.params;

    const paymentMethod = await PaymentMethod.findOne({ _id: id, userId });
    if (!paymentMethod) {
      return res.status(404).json({ message: 'Payment method not found' });
    }

    await PaymentMethod.findByIdAndDelete(id);

    // If this was the default payment method, set another one as default
    if (paymentMethod.isDefault) {
      const remainingMethods = await PaymentMethod.find({ userId }).limit(1);
      if (remainingMethods.length > 0) {
        remainingMethods[0].isDefault = true;
        await remainingMethods[0].save();
      }
    }

    res.json({ message: 'Payment method deleted successfully' });});
export const setDefaultPaymentMethod = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as Request & { user: { userId: string } }).user.userId;
    const { id } = req.params;

    const paymentMethod = await PaymentMethod.findOne({ _id: id, userId });
    if (!paymentMethod) {
      return res.status(404).json({ message: 'Payment method not found' });
    }

    // Set all other payment methods to non-default
    await PaymentMethod.updateMany(
      { userId, _id: { $ne: id } },
      { isDefault: false }
    );

    // Set this payment method as default
    paymentMethod.isDefault = true;
    await paymentMethod.save();

    res.json({ message: 'Default payment method updated successfully' });});