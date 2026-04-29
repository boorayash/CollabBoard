import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { connectSocket, disconnectSocket } from './socket/socketClient';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Board from './pages/Board';
import Landing from './pages/Landing';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#007AFF', // matched to Tailwind --color-primary
    },
    background: {
      default: 'transparent',
      paper: '#ffffff',
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


  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="w-full h-full min-h-screen flex flex-col overflow-hidden relative">
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
          <Route path="/" element={<Landing />} />
        </Routes>
      </div>
    </ThemeProvider>
  );
}

export default App;
