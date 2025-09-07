import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/auth';
import { Settings } from '../models/Settings';

// Get system settings
export const getSettings = asyncHandler(async (req: Request, res: Response) => {
  let settings = await Settings.findOne();
    
    // If no settings exist, create default settings
    if (!settings) {
      settings = new Settings();
      await settings.save();
    }

    res.json(settings);});
// Update system settings
export const updateSettings = asyncHandler(async (req: Request, res: Response) => {
  const {
      websiteName,
      websiteDescription,
      contactEmail,
      contactPhone,
      primaryColor,
      enableDarkMode,
      maintenanceMode,
      debugMode
    } = req.body;

    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = new Settings();
    }

    // Update fields
    if (websiteName !== undefined) settings.websiteName = websiteName;
    if (websiteDescription !== undefined) settings.websiteDescription = websiteDescription;
    if (contactEmail !== undefined) settings.contactEmail = contactEmail;
    if (contactPhone !== undefined) settings.contactPhone = contactPhone;
    if (primaryColor !== undefined) settings.primaryColor = primaryColor;
    if (enableDarkMode !== undefined) settings.enableDarkMode = enableDarkMode;
    if (maintenanceMode !== undefined) settings.maintenanceMode = maintenanceMode;
    if (debugMode !== undefined) settings.debugMode = debugMode;

    await settings.save();

    res.json({
      message: 'Settings updated successfully',
      settings
    });});