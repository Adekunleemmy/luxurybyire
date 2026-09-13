import * as settingsService from '../services/settingsService.js';

export const getSettings = async (req, res, next) => {
  try {
    const settings = await settingsService.getSettings();
    res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    const settings = await settingsService.updateSettings(req.body);
    res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
};

export const getDeliveryZones = async (req, res, next) => {
  try {
    const zones = await settingsService.getDeliveryZones();
    res.json({ success: true, data: zones });
  } catch (error) {
    next(error);
  }
};

export const updateDeliveryZones = async (req, res, next) => {
  try {
    const zones = await settingsService.updateDeliveryZones(req.body.zones);
    res.json({ success: true, data: zones });
  } catch (error) {
    next(error);
  }
};
