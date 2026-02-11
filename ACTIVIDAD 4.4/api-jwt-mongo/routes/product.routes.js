const express = require('express');
const router = express.Router();
const productCtrl = require('../controllers/productController');
const { protect, restrictTo } = require('../middlewares/auth');

router.get('/', productCtrl.list);
router.get('/:id', productCtrl.getById);
router.post('/', protect, restrictTo('admin'), productCtrl.create);
router.put('/:id', protect, restrictTo('admin'), productCtrl.update);
router.delete('/:id', protect, restrictTo('admin'), productCtrl.remove);

module.exports = router;
