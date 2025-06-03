import React from "react";
import { Button, Typography, Box } from "@mui/material";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';

const IntroduceAndLicense = () => {
  return (
    <Box component="section" sx={{ p: 5, backgroundColor: '#ffffff' }}>
      <Typography variant="h4" align="center" gutterBottom sx={{ color: '#4A148C', fontWeight: 'bold' }}>
        <InfoOutlinedIcon fontSize="large" sx={{ verticalAlign: 'middle', mr: 1 }} />
        Introduction & License
      </Typography>

      <Box sx={{ my: 4 }}>
        <Typography variant="h5" sx={{ color: '#4A148C', mb: 2 }}>
          <SchoolOutlinedIcon sx={{ verticalAlign: 'middle', mr: 1 }} /> About Us
        </Typography>
        <Typography paragraph>
          We, <strong>Trần Trọng Khang</strong> and <strong>Đặng Minh Thiện</strong>, are final-year students
          majoring in Information Technology at the University of Technology. This project was born from our passion
          for technology and the desire to apply academic knowledge to practical solutions.
        </Typography>
        <Typography paragraph>
          Contact us:
          <br />Email: <a href="mailto:nongsanteam@example.com">nongsanteam@example.com</a>
          <br />Phone: +84 123 456 789
        </Typography>
      </Box>

      <Box sx={{ my: 4 }}>
        <Typography variant="h5" sx={{ color: '#4A148C', mb: 2 }}>
          🌿 Features & Goals
        </Typography>
        <Typography component="ul" sx={{ pl: 2, '& li': { mb: 1 } }}>
          <li>Connect consumers directly with farmers in a direct-to-consumer model.</li>
          <li>Manage clean products with transparent origins.</li>
          <li>Shopping cart, payment processing, and order tracking.</li>
          <li>Map location and local store finder.</li>
          <li>Built with ReactJS, Node.js, Express, and MongoDB for performance and scalability.</li>
        </Typography>
      </Box>

      <Box sx={{ my: 4 }}>
        <Typography variant="h5" sx={{ color: '#4A148C', mb: 2 }}>
          <GavelOutlinedIcon sx={{ verticalAlign: 'middle', mr: 1 }} /> License
        </Typography>
        <Typography paragraph>
          This project is completely <strong>non-commercial</strong> and serves educational and research purposes only.
          All source code and content are intended for internal group use. If you wish to reuse any part of this project,
          please contact us for permission.
        </Typography>
      </Box>

      <Box textAlign="center" sx={{ mt: 4 }}>
        <Button variant="contained" size="large" href="/" sx={{ bgcolor: '#388E3C', '&:hover': { bgcolor: '#2E7D32' } }}>
          Back to Home
        </Button>
      </Box>
    </Box>
  );
};

export default IntroduceAndLicense;
