import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { connectSocket, disconnectSocket } from './socket/socketClient';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Board from './pages/Board';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#7c4dff',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
  typography: {
    fontFamily: '"Inter", sans-serif',
    h1: { fontFamily: '"Outfit", sans-serif' },
    h2: { fontFamily: '"Outfit", sans-serif' },
    h3: { fontFamily: '"Outfit", sans-serif' },
    h4: { fontFamily: '"Outfit", sans-serif' },
    h5: { fontFamily: '"Outfit", sans-serif' },
    h6: { fontFamily: '"Outfit", sans-serif' },
  },
});

const ProtectedRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  if (!user) {
    return <Navigate to="/login" />;
  }
  return children;
};

function App() {
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user?.token) {
      connectSocket(user.token);
    } else {
      disconnectSocket();
    }
    return () => {
      disconnectSocket();
    };
  }, [user]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div style={{
        minHeight: '100vh',
        width: '100vw',
        background: 'linear-gradient(135deg, #0F172A, #1E1B4B, #0F172A)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden' // prevents body scroll jumping
      }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/board/:id"
            element={
              <ProtectedRoute>
                <Board />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </ThemeProvider>
  );
}

export default App;
