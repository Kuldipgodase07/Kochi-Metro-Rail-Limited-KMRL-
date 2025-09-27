# Google OR-Tools Train Scheduling System

## Overview

This system implements Google OR-Tools constraint programming to schedule exactly 24 trains from a fleet, with the remaining trains displayed on the right side for manual review and adjustment.

## Features

- **Constraint Programming**: Uses Google OR-Tools for advanced optimization
- **24-Train Scheduling**: Always schedules exactly 24 trains
- **Interactive UI**: Drag-and-drop interface to move trains between scheduled and available
- **Real-time Optimization**: Live constraint programming with multiple criteria
- **Service Status Monitoring**: Real-time connection status to OR-Tools service

## System Architecture

```
Frontend (React/TypeScript)
    ↓ HTTP API calls
OR-Tools Service (Python/Flask) ← Port 8001
    ↓ Constraint Programming
Google OR-Tools Library
    ↓ Optimization Results
MongoDB Atlas Database
```

## Quick Start

### 1. Start the OR-Tools Service

```powershell
# Run this in a dedicated terminal
.\start-ortools.ps1
```

The service will start on `http://localhost:8001`

### 2. Start the Frontend

```powershell
# In another terminal
npm run dev
```

The frontend will start on `http://localhost:5173`

### 3. Access the OR-Tools Scheduling

Navigate to: `http://localhost:5173/ortools-scheduling`

## OR-Tools Service Details

### Service Endpoints

- **Health Check**: `GET http://localhost:8001/api/health`
- **Optimization**: `POST http://localhost:8001/api/train-scheduling/optimize`

### Optimization Constraints

1. **Exact Selection**: Must select exactly 24 trains
2. **Depot Balancing**: 9-15 trains from each depot
3. **Age Diversity**: At least 8 newer trains (≤5 years old)
4. **Manufacturer Diversity**: At least 4 trains from each manufacturer
5. **Availability Scoring**: Maximizes total availability score

### Scoring Criteria

- **Operational Status** (40 points): Ready > Standby > Maintenance
- **Age & Reliability** (25 points): Newer trains score higher
- **Make/Model** (20 points): Alstom > Hyundai Rotem > BEML
- **Maintenance Freshness** (10 points): Recent maintenance preferred
- **Fitness Validity** (5 points): Valid certificates required

## Frontend Components

### ORToolsSchedulingDashboard

Main component that provides:

- Service status monitoring
- Date selection for scheduling
- 24-train scheduling interface
- Remaining trains display
- Manual train movement
- Export functionality

### Key Features

1. **Left Panel**: Shows 24 scheduled trains with bay assignments
2. **Right Panel**: Shows remaining trains sorted by optimization score
3. **Interactive Movement**: Click to move trains between panels
4. **Real-time Updates**: Live optimization score and status
5. **Export Options**: Download schedule as JSON

## Usage Instructions

### 1. Run Optimization

1. Select the target date
2. Click "Run OR-Tools Optimization"
3. Wait for the constraint programming to complete
4. Review the 24 selected trains on the left
5. Review remaining trains on the right

### 2. Manual Adjustments

1. Click "Schedule" on any train in the right panel to move it to scheduled
2. Click "Remove" on any train in the left panel to move it back to available
3. Maximum 24 trains can be scheduled at any time
4. Use "Reset to AI" to return to original optimization

### 3. Export Schedule

1. Click "Export Schedule" to download the current schedule
2. File includes all train details, scores, and optimization metrics

## Service Monitoring

The frontend automatically monitors the OR-Tools service status:

- **Green**: Service online and responding
- **Red**: Service offline or unreachable
- **Yellow**: Checking connection status

## Troubleshooting

### OR-Tools Service Not Starting

1. Check Python installation: `python --version`
2. Install dependencies: `pip install -r backend/requirements.txt`
3. Verify OR-Tools installation: `python -c "import ortools"`

### Frontend Connection Issues

1. Ensure OR-Tools service is running on port 8001
2. Check browser console for CORS errors
3. Verify service health: `http://localhost:8001/api/health`

### Optimization Failures

1. Check constraint violations in the results
2. Ensure sufficient eligible trains (≥24)
3. Review depot and manufacturer distribution

## Advanced Configuration

### Custom Constraints

Edit `backend/ortools_service.py` to modify:

- Depot balancing ratios
- Age diversity requirements
- Manufacturer distribution
- Availability scoring weights

### Service Configuration

- **Port**: Change in `ortools_service.py` (default: 8001)
- **Timeout**: Modify solver timeout (default: 10 seconds)
- **Constraints**: Adjust constraint parameters

## Performance Metrics

- **Execution Time**: Typically 1-5 seconds
- **Constraint Count**: ~15-20 constraints
- **Variable Count**: 50+ decision variables
- **Solution Quality**: Optimal or feasible solutions

## Integration Points

### With Existing System

- Uses same MongoDB Atlas database
- Integrates with existing train data models
- Compatible with current authentication system
- Works alongside manual and AI scheduling

### API Integration

The OR-Tools service provides REST API endpoints that can be integrated with:

- Mobile applications
- Third-party systems
- Automated scheduling workflows
- Reporting systems

## File Structure

```
backend/
├── ortools_service.py          # Main OR-Tools service
├── requirements.txt             # Python dependencies
└── start-ortools.ps1          # Service startup script

src/
├── components/
│   └── ORToolsSchedulingDashboard.tsx  # Main UI component
├── pages/
│   └── ORToolsSchedulingPage.tsx       # Page wrapper
└── App.tsx                     # Route configuration
```

## Dependencies

### Backend (Python)

- `ortools` - Google OR-Tools constraint programming
- `flask` - Web framework
- `flask-cors` - CORS support
- `datetime` - Date handling

### Frontend (React/TypeScript)

- `react` - UI framework
- `lucide-react` - Icons
- `@/components/ui/*` - UI components
- `react-i18next` - Internationalization

## Support

For issues or questions:

1. Check the service logs in the terminal
2. Verify all dependencies are installed
3. Ensure ports 8001 and 5173 are available
4. Review the constraint programming results

## Future Enhancements

- Real-time constraint updates
- Multi-objective optimization
- Historical performance analysis
- Advanced constraint modeling
- Integration with external systems
