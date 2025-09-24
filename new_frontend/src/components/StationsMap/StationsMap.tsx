import React from 'react';
import { Box, Typography } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const stations = [
  "Aluva", "Pulinchodu", "Companypady", "Ambattukavu", "Muttom",
  "Kalamassery", "Cochin University", "Pathadipalam", "Edapally", "Changampuzha Park",
  "Palarivattom", "JLN Stadium", "Kaloor", "Lissie", "MG Road", "Maharaja’s College", 
  "Ernakulam South", "Kadavanthra", "Elamkulam", "Vyttila", "Thaikoodam", "Petta", 
  "Vadakkekotta", "SN Junction", "Tripunithura"
];

const mapEmbedUrl = "https://www.google.com/maps/d/embed?mid=1Ko69kQuMLxHoN6-0UgJixtNR9gM&ehbc=2E312F";
const mapHeight = 400;

const StationsMap: React.FC = () => (
  <Box sx={{
    width: '100%',
    display: 'flex',
    flexDirection: { xs: 'column', md: 'row' },
    justifyContent: 'center',
    alignItems: { xs: 'center', md: 'flex-start' },
    gap: 4,
    mt: 4
  }}>
    {/* Left side: stations */}
    <Box sx={{ flex: 1, minWidth: 350, mb: { xs: 3, md: 0 } }}>
      <Typography variant="h4" sx={{ color: "#7bc0c0", mb: 2, fontWeight: 600 }}>
        Stations
      </Typography>
      <Typography variant="body1" sx={{ color: "#111", mb: 2 }}>
        Take a closer look at our station locations in this interactive map to plan your trip and day with ease.
      </Typography>
      <Box sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 2,
        alignItems: 'center'
      }}>
        {stations.map((name, idx) => (
          <React.Fragment key={name}>
            <Typography component="span" variant="body1" sx={{
              color: "#00b3b3", fontWeight: 500, fontSize: { xs: 14, md: 16 },
              mx: 0.5, whiteSpace: "nowrap"
            }}>
              {name}
            </Typography>
            {idx < stations.length - 1 &&
              <ArrowForwardIcon sx={{ fontSize: 18, verticalAlign: 'middle', color: "#111" }} />
            }
          </React.Fragment>
        ))}
      </Box>
    </Box>
    {/* Right side: Google Maps embed */}
    <Box sx={{
      flex: 1,
      minWidth: 340,
      borderRadius: 3,
      boxShadow: 5,
      overflow: 'hidden',
      bgcolor: '#f8fbff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <iframe
        src={mapEmbedUrl}
        title="Kochi Metro Map"
        width="100%"
        height={mapHeight}
        style={{ border: "none" }}
        allowFullScreen
        loading="lazy"
      />
    </Box>
  </Box>
);

export default StationsMap;
