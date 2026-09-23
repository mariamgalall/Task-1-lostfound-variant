import Joi from 'joi';
import Item from '../models/Item.js';

// full schema — used for create (POST), all fields required where relevant
const createSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().allow('', null),
  category: Joi.string().valid('electronics', 'clothing', 'documents', 'accessories', 'other'),
  status: Joi.string().valid('lost', 'found', 'claimed'),
  location: Joi.string().allow('', null),
  reportedBy: Joi.string().hex().length(24).allow(null, ''),
});

// partial schema — used for update (PATCH), nothing required, but at least one field must be present
const updateSchema = Joi.object({
  title: Joi.string(),
  description: Joi.string().allow('', null),
  category: Joi.string().valid('electronics', 'clothing', 'documents', 'accessories', 'other'),
  status: Joi.string().valid('lost', 'found', 'claimed'),
  location: Joi.string().allow('', null),
  reportedBy: Joi.string().hex().length(24).allow(null, ''),
}).min(1); // require at least one field so an empty PATCH body is rejected

export async function createItem(req, res) {
  try {
    const { error, value } = createSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const item = await Item.create(value);
    res.status(201).json(item);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'This item (title + location) already exists.' });
    }
    res.status(500).json({ error: err.message });
  }
}

export async function getAllItems(req, res) {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.category) filter.category = req.query.category;

    const items = await Item.find(filter).populate('reportedBy', 'name email');
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getItem(req, res) {
  try {
    const item = await Item.findById(req.params.id).populate('reportedBy', 'name email');
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateItem(req, res) {
  try {
    const { error, value } = updateSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const item = await Item.findByIdAndUpdate(req.params.id, value, {
      new: true,
      runValidators: true,
    });
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'This item (title + location) already exists.' });
    }
    res.status(500).json({ error: err.message });
  }
}

export async function deleteItem(req, res) {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}