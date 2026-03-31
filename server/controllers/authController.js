const User = require('../models/User');
const jwt = require('jsonwebtoken');

exports.sendOtp = async (req, res) => {
  const { phoneNumber, role } = req.body;

  try {
    if (!phoneNumber || !role) {
      return res.status(400).json({ msg: 'Please provide phone number and role' });
    }

    let user = await User.findOne({ phoneNumber });

    // Mock OTP logic
    const otp = '123456';
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes from now

    if (!user) {
      // Create new user if not exists
      user = new User({
        phoneNumber,
        role,
        otp,
        otpExpires
      });
    } else {
      // Update existing user with new OTP and optionally, a new role if they selected one
      user.otp = otp;
      user.otpExpires = otpExpires;
      user.role = role; 
    }

    await user.save();

    res.json({ msg: 'OTP sent successfully. (Use 123456 for testing)' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.verifyOtp = async (req, res) => {
  const { phoneNumber, otp } = req.body;

  try {
    if (!phoneNumber || !otp) {
      return res.status(400).json({ msg: 'Please provide phone number and OTP' });
    }

    const user = await User.findOne({ phoneNumber });

    if (!user) {
      return res.status(400).json({ msg: 'Invalid user' });
    }

    // Check if OTP matches and is not expired
    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ msg: 'Invalid or expired OTP' });
    }

    // Clear OTP after successful verification
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({ token, role: user.role });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
