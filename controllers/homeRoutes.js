const router = require('express').Router();
const { Device, User } = require('../models');
const withAuth = require('../utils/auth');

router.get('/', async (req, res) => {
  try {
    if (!req.session.loggedIn) {
      res.redirect('/login');
      return;
    }
    // Get all devices and JOIN with user data
    const deviceData = await Device.findAll();

    // Serialize data so the template can read it
    const devices = deviceData.map((device) => device.get({ plain: true }));
    res.status(200).json(devices);
    // Pass serialized data and session flag into template
    res.render('homepage', { 
      devices, 
      logged_in: req.session.logged_in 
    });
    res.redirect('/profile');
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/device/:id', async (req, res) => {
  try {
    const deviceData = await Device.findByPk(req.params.id, {
      include: [
        {
          model: User,
          attributes: ['name'],
        },
      ],
    });

    const device = deviceData.get({ plain: true });

    res.render('device', {
      ...device,
      logged_in: req.session.logged_in
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

// Use withAuth middleware to prevent access to route
router.get('/profile', withAuth, async (req, res) => {
  try {
    // Find the logged in user based on the session ID
    const userData = await User.findByPk(req.session.user_id, {
      attributes: { exclude: ['password'] },
      include: [{ model: Device }],
    });

    const user = userData.get({ plain: true });

    res.render('profile', {
      ...user,
      logged_in: true
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/login', (req, res) => {
  // If the user is already logged in, redirect the request to another route
  if (req.session.logged_in) {
    res.redirect('/profile');
    return;
  }

  res.render('login');
});

module.exports = router;
