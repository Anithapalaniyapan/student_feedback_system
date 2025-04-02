import { Container, Typography, Grid, Paper, List, ListItem, ListItemText, ListItemIcon, Button, Box, AppBar, Toolbar, Snackbar, Alert } from '@mui/material';
import { Schedule, Feedback, Assessment, Event, Description, Logout } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [feedbackQuestions, setFeedbackQuestions] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  useEffect(() => {
    const fetchFeedbackQuestions = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setSnackbar({
            open: true,
            message: 'Please log in to access this page',
            severity: 'error'
          });
          navigate('/login', { replace: true });
          return;
        }

        const response = await fetch('http://localhost:8080/api/questions/department/1/year/2', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.status === 403) {
          setSnackbar({
            open: true,
            message: 'You do not have permission to access this resource',
            severity: 'error'
          });
          navigate('/login', { replace: true });
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to fetch questions');
        }

        const data = await response.json();
        const studentQuestions = data.filter(question => question.role === 'student');
        setFeedbackQuestions(studentQuestions);
      } catch (error) {
        console.error('Error fetching feedback questions:', error);
        setSnackbar({
          open: true,
          message: error.message || 'Failed to fetch questions. Please try again.',
          severity: 'error'
        });
      }
    };

    fetchFeedbackQuestions();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login', { replace: true });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Student Dashboard
          </Typography>
          <Button
            color="inherit"
            onClick={handleLogout}
            startIcon={<Logout />}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Class Committee Meeting & Feedback
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    startIcon={<Feedback />}
                    fullWidth
                  >
                    Submit Course Feedback
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    startIcon={<Event />}
                    fullWidth
                  >
                    View Meeting Schedule
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    startIcon={<Description />}
                    fullWidth
                  >
                    View Meeting Minutes
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Feedback Questions
              </Typography>
              <List>
                {feedbackQuestions.map((question) => (
                  <ListItem key={question.id}>
                    <ListItemIcon>
                      <Feedback />
                    </ListItemIcon>
                    <ListItemText 
                      primary={question.text}
                      secondary={`Created at: ${new Date(question.createdAt).toLocaleDateString()}`}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Container>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default StudentDashboard;