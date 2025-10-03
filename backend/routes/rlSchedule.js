import express from 'express';
import { execFile } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

// Polyfill __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// GET /api/rl-schedule?date=YYYY-MM-DD
router.get('/rl-schedule', (req, res) => {
  const date = req.query.date;
  if (!date) return res.status(400).json({ error: 'Missing date parameter' });

  // Call Python inference script
  const scriptPath = path.resolve(__dirname, '../../rl/inference.py');
  // Use Python 3.13 with stable-baselines3 installed
  const pythonPath = process.env.PYTHON_PATH || 'C:\\Users\\shivr\\AppData\\Local\\Programs\\Python\\Python313\\python.exe';
  execFile(pythonPath, [scriptPath, date], { cwd: path.resolve(__dirname, '../../') }, (err, stdout, stderr) => {
    if (err) {
      return res.status(500).json({ error: stderr || err.message });
    }
    try {
      // Find the JSON output in stdout
      const jsonStart = stdout.indexOf('{');
      const json = JSON.parse(stdout.slice(jsonStart));
      // Split trains into scheduled and remaining
      const scheduled_trains = (json.train_details || []).slice(0, 25);
      const remaining_trains = (json.train_details || []).slice(25);
      res.json({ scheduled_trains, remaining_trains, raw: json });
    } catch (e) {
      res.status(500).json({ error: 'Failed to parse RL output', details: e.message, stdout });
    }
  });
});

// POST /api/rl-schedule - Update schedule
router.post('/rl-schedule', (req, res) => {
  const { date, scheduled_trains } = req.body;
  
  if (!date || !scheduled_trains) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  // Here you would typically save the updated schedule to the database
  // For now, we'll just return a success response
  res.json({ 
    success: true, 
    message: 'Schedule updated successfully',
    date,
    train_count: scheduled_trains.length
  });
});

export default router;
