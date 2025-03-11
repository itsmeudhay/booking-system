const express = require('express');
const { 
    getAllAddOns,
    getSingleAddOn,
    postAllAddOns,
    updateAddOn,
    deleteAddOn 
} = require('../controllers/addOnController');
const router = express.Router();

router.get('/', getAllAddOns);
router.get('/:id', getSingleAddOn);
router.post('/', postAllAddOns);
router.put('/:id', updateAddOn);
router.delete('/:id', deleteAddOn);

module.exports = router;
