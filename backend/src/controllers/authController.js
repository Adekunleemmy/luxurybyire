import * as authService from '../services/authService.js';

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginAdmin(email, password);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const admin = await authService.getAdminProfile(req.admin.id);

    res.json({
      success: true,
      data: admin,
    });
  } catch (error) {
    next(error);
  }
};
