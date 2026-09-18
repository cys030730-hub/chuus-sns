import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#9b7fd4',
      light: '#c3b2e8',
      dark: '#6f52a8',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#757575',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
    text: {
      primary: '#08060d',
      secondary: '#6b6375',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: {
    borderRadius: 16,
  },
});

export default theme;
