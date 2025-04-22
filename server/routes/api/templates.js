const express = require('express');
const router = express.Router();
const pool = require('../../db');
const auth = require('../../middleware/auth');

// @route   GET api/templates
// @desc    Get all templates for a gym
// @access  Private (gym owner only)
router.get('/', auth, async (req, res) => {
  try {
    // Get gym_id from user record
    const gym_id = req.user.gym_id;
    
    if (!gym_id) {
      return res.status(400).json({ msg: 'No gym associated with this account' });
    }

    // Query to get all templates for this gym
    const templatesQuery = `
      SELECT * FROM class_templates 
      WHERE gym_id = $1
      ORDER BY name ASC
    `;
    
    const templatesResult = await pool.query(templatesQuery, [gym_id]);
    
    res.json(templatesResult.rows);
  } catch (err) {
    console.error('Error fetching templates:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/templates
// @desc    Create a new template
// @access  Private (gym owner only)
router.post('/', auth, async (req, res) => {
  try {
    const gym_id = req.user.gym_id;
    
    if (!gym_id) {
      return res.status(400).json({ msg: 'No gym associated with this account' });
    }
    
    const { 
      name, 
      instructor, 
      level_id, 
      max_capacity, 
      duration_minutes,
      age 
    } = req.body;
    
    // Validate required fields
    if (!name) {
      return res.status(400).json({ msg: 'Template name is required' });
    }
    
    // Insert new template
    const insertQuery = `
      INSERT INTO class_templates 
        (gym_id, name, instructor, level_id, max_capacity, duration_minutes, age)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const values = [
      gym_id,
      name,
      instructor || null,
      level_id || 'Fundamentals',
      max_capacity || 20,
      duration_minutes || 60,
      age || 'Adult'
    ];
    
    const result = await pool.query(insertQuery, values);
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error creating template:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/templates/:id
// @desc    Delete a template
// @access  Private (gym owner only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const gym_id = req.user.gym_id;
    const template_id = req.params.id;
    
    if (!gym_id) {
      return res.status(400).json({ msg: 'No gym associated with this account' });
    }
    
    // Check if template exists and belongs to this gym
    const checkQuery = `
      SELECT * FROM class_templates
      WHERE id = $1 AND gym_id = $2
    `;
    
    const checkResult = await pool.query(checkQuery, [template_id, gym_id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ msg: 'Template not found or you do not have permission' });
    }
    
    // Delete the template
    const deleteQuery = `
      DELETE FROM class_templates
      WHERE id = $1
      RETURNING id
    `;
    
    const deleteResult = await pool.query(deleteQuery, [template_id]);
    
    res.json({ id: deleteResult.rows[0].id, msg: 'Template deleted' });
  } catch (err) {
    console.error('Error deleting template:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/templates/:id
// @desc    Update a template
// @access  Private (gym owner only)
router.put('/:id', auth, async (req, res) => {
  try {
    const gym_id = req.user.gym_id;
    const template_id = req.params.id;
    
    if (!gym_id) {
      return res.status(400).json({ msg: 'No gym associated with this account' });
    }
    
    const { 
      name, 
      instructor, 
      level_id, 
      max_capacity, 
      duration_minutes,
      age 
    } = req.body;
    
    // Check if template exists and belongs to this gym
    const checkQuery = `
      SELECT * FROM class_templates
      WHERE id = $1 AND gym_id = $2
    `;
    
    const checkResult = await pool.query(checkQuery, [template_id, gym_id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ msg: 'Template not found or you do not have permission' });
    }
    
    // Update the template
    const updateQuery = `
      UPDATE class_templates
      SET 
        name = $1,
        instructor = $2,
        level_id = $3,
        max_capacity = $4,
        duration_minutes = $5,
        age = $6,
        updated_at = NOW()
      WHERE id = $7
      RETURNING *
    `;
    
    const values = [
      name || checkResult.rows[0].name,
      instructor !== undefined ? instructor : checkResult.rows[0].instructor,
      level_id || checkResult.rows[0].level_id,
      max_capacity || checkResult.rows[0].max_capacity,
      duration_minutes || checkResult.rows[0].duration_minutes,
      age || checkResult.rows[0].age,
      template_id
    ];
    
    const result = await pool.query(updateQuery, values);
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating template:', err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router; 