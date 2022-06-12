const router = require('express').Router();
const { User } = require('../../models');
const withAuth = require('../../utils/auth');


////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////

router.get("/", (req, res) => {
  // find all users
  // be sure to include its associated data
  User.findAll()
    .then((users) => res.json(users))
    .catch((err) => res.status(500).json(err));
});

router.get("/:id", (req, res) => {
  // find a single user by its `id`
  User.findByPk(req.params.id)
    .then((user) => res.json(user))
    .catch((err) => res.status(400).json(err));
});

////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////


// router.post('/', async (req, res) => {
//   try {
//     const userData = await User.findOne({ where: { id: req.params.id } });
//     const user = userData.get({ plain: true });
//     if (!user) {
//       res
//         .status(404)
//         .json({ message: 'ID not found, please try again' });
//       return;
//     }
//     if (user.signedUp){
//       res.status(400).json({ message: 'User already signed up, Log in' });
//       return;
//     }
//       console.log(user);
//       res.render('signup', {user} );
//     } catch (err) {
//     res.status(400).json(err);
//   }
// });

// Sign Up of a new user (available for users and admins)


router.put('/signup/:id', async (req,res) => {
  try {
    // console.log('jelou');
    // console.log('test');
    const userData = await User.update(req.body,
      {
      where: {
        id: req.params.id,
      },
      individualHooks: true,
    });
    // console.log(userData);
    if(userData){
      const dataSession = await User.findByPk(req.params.id);
      // console.log(dataSession);
      req.session.save(() => {
        req.session.user_id = dataSession.id;
        req.session.logged_in = true;
        res.status(200).json({ user: dataSession, message: 'You are now logged in!' });
      });
    }
  } catch (error){
    res.status(500).json(error);
  }
});

// Adding a new user to the db (available only for admins)
router.post('/add', withAuth, async (req, res) => {
  try {
    const userData = await User.create(req.body);
    res.status(200).json(userData);
  } catch (err) {
    res.status(400).json(err);
  }
});

router.post('/login', async (req, res) => {
  try {
    const userData = await User.findOne({ where: { email: req.body.email } });

    if (!userData) {
      res
        .status(400)
        .json({ message: 'Incorrect email or password, please try again' });
      return;
    }

    const validPassword = await userData.checkPassword(req.body.password);

    if (!validPassword) {
      res
        .status(400)
        .json({ message: 'Incorrect email or password, please try again' });
      return;
    }

    req.session.save(() => {
      req.session.user_id = userData.id;
      req.session.logged_in = true;
      
      res.json({ user: userData, message: 'You are now logged in!' });
    });

  } catch (err) {
    res.status(400).json(err);
  }
});

router.post('/logout', (req, res) => {
  if (req.session.logged_in) {
    req.session.destroy(() => {
      res.status(204).end();
    });
  } else {
    res.status(404).end();
  }
});

module.exports = router;