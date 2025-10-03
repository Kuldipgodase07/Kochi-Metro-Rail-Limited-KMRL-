# Deep RL Train Scheduling Implementation

## Overview

Successfully implemented a "Test Model" card on the dashboard that allows users to interact with the Deep Reinforcement Learning model for train scheduling.

## Components Created

### 1. Frontend Page: DeepRLSchedulingPage.tsx

**Location:** `src/pages/DeepRLSchedulingPage.tsx`

**Features:**

- Date selection input for schedule generation
- "Generate Schedule" button to fetch AI-powered schedules
- Display of scheduled trains (top 25) with SIH scores
- Display of remaining trains
- Swap functionality to exchange trains between scheduled and remaining lists
- "Update AI Schedule" button to save changes
- Loading states and error handling
- Responsive design with Material UI components

### 2. Backend API Route: rlSchedule.js

**Location:** `backend/routes/rlSchedule.js`

**Endpoints:**

- `GET /api/rl-schedule?date=YYYY-MM-DD` - Fetches RL-generated schedule for a specific date
- `POST /api/rl-schedule` - Updates the schedule with user modifications

**Functionality:**

- Calls Python inference script (`rl/inference.py`) to generate schedules
- Parses RL model output
- Splits trains into scheduled (first 25) and remaining
- Returns JSON response with train details and SIH scores

### 3. Dashboard Card

**Location:** `src/components/FuturisticNavigation.tsx`

**Card Details:**

- **ID:** `deep-rl`
- **Label:** Will use translation key `scheduling.deepRLTest` (falls back to "Test Model")
- **Icon:** Zap (lightning bolt)
- **Color:** Lime green theme (`bg-lime-50`, `text-lime-600`)
- **Route:** `/deep-rl-scheduling`
- **Description:** "Test the Deep RL model for train scheduling"
- **Position:** First card in the dashboard grid

### 4. Routing Configuration

**Location:** `src/App.tsx`

- Added route: `/deep-rl-scheduling` → `DeepRLSchedulingPage`
- Protected with authentication (requires login)
- Imported and registered the new page component

### 5. Backend Server Configuration

**Location:** `backend/server.js`

- Imported rlSchedule route
- Registered route at `/api` path
- Configured for CORS and rate limiting

## How to Use

### For Users:

1. Log in to the dashboard
2. Click the **"Test Model"** card (lime green with lightning icon)
3. On the Deep RL Scheduling page:
   - Select a date
   - Click "Generate Schedule" to fetch AI-generated schedule
   - View scheduled trains (25) and remaining trains
   - Use dropdowns to swap trains between lists
   - Click "Update AI Schedule" to save changes

### API Integration:

```javascript
// Fetch schedule
GET /api/rl-schedule?date=2025-10-15

// Response
{
  "scheduled_trains": [
    {
      "train_id": "T001",
      "train_number": "TRAIN-001",
      "sih_score": 0.95,
      ...
    },
    // ... 24 more trains
  ],
  "remaining_trains": [...]
}

// Update schedule
POST /api/rl-schedule
Body: {
  "date": "2025-10-15",
  "scheduled_trains": [...]
}
```

## Python RL Model Requirements

The implementation expects a Python script at `rl/inference.py` that:

- Accepts a date parameter as command line argument
- Loads the trained RL model (`kmrl_rl_agent_final.zip`)
- Generates schedule for the given date
- Outputs JSON to stdout with train details including:
  - `train_id`
  - `train_number`
  - `sih_score`
  - Other relevant train metadata

## Configuration

### Environment Variables (.env)

```
PYTHON_PATH=python  # Path to Python interpreter (optional)
PORT=5000           # Backend server port
```

### CORS Configuration

Frontend URL is automatically allowed in development mode. For production, add to `corsOptions` in `server.js`.

## Testing

To test the implementation:

1. **Backend:**

   ```bash
   cd backend
   node server.js
   ```

2. **Frontend:**

   ```bash
   npm run dev
   ```

3. **Access:**
   - Dashboard: `http://localhost:5173/dashboard`
   - Click the "Test Model" card
   - Or directly: `http://localhost:5173/deep-rl-scheduling`

## Next Steps (Optional Enhancements)

1. **Add Translation:**

   - Add key `scheduling.deepRLTest` to translation files
   - Default: "Test Model" or "Deep RL Scheduling"

2. **Database Integration:**

   - Save updated schedules to MongoDB
   - Track schedule history
   - Add user attribution

3. **Enhanced UI:**

   - Add schedule visualization (timeline/Gantt chart)
   - Show train details modal
   - Add export functionality (PDF/Excel)

4. **Advanced Features:**
   - Batch date scheduling
   - Compare multiple schedules
   - Schedule optimization metrics display
   - Conflict detection

## Files Modified/Created

### Created:

- ✅ `src/pages/DeepRLSchedulingPage.tsx`
- ✅ `backend/routes/rlSchedule.js`

### Modified:

- ✅ `src/components/FuturisticNavigation.tsx` (added card)
- ✅ `src/App.tsx` (added route and import)
- ✅ `backend/server.js` (added API route)

## Status: ✅ Complete and Ready to Use!
