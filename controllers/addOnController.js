const AddOn = require('../models/addOn');


// Get all add-ons
const getAllAddOns = async (req, res) => {
  try {
    const addOns = await AddOn.find();
    res.status(200).json(addOns);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching add-ons', error });
  }
};

const getSingleAddOn = async (req, res) => {
  try {
    const addOn = await AddOn.findById(req.params.id);
    if (!addOn) {
      return res.status(404).json({ message: 'Add-on not found' });
    }
    res.status(200).json(addOn);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching add-on', error });
  }
};

const postAllAddOns = async (req, res) => {
  try {
      const addOn = new AddOn(req.body);
      const savedAddOn = await addOn.save();
      res.status(201).json(savedAddOn);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
};

const updateAddOn = async (req, res) => {
  try {
    const { name, price } = req.body;
    const updatedAddOn = await AddOn.findByIdAndUpdate(req.params.id, { name, price }, { new: true });
    if (!updatedAddOn) {
      return res.status(404).json({ message: 'Add-on not found' });
    }
    res.status(200).json({ message: 'Add-on updated successfully', addOn: updatedAddOn });
  } catch (error) {
    res.status(500).json({ message: 'Error updating add-on', error });
  }
};

const deleteAddOn = async (req, res) => {
  try {
    const deletedAddOn = await AddOn.findByIdAndDelete(req.params.id);
    if (!deletedAddOn) {
      return res.status(404).json({ message: 'Add-on not found' });
    }
    res.status(200).json({ message: 'Add-on deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting add-on', error });
  }
};


module.exports = {
  getAllAddOns,
  getSingleAddOn,
  postAllAddOns,
  updateAddOn,
  deleteAddOn
};
