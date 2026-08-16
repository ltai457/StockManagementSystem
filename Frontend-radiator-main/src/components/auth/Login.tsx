// @ts-nocheck
import { useEffect, useState } from "react";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Link,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import authService from "../../api/authService";
import { useAuth } from "../../contexts/auth-context";

export default function Login() {
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const testConnection = async () => {
      const result = await authService.testConnection();
      setConnectionStatus(result);
      if (!result.success) setError("Unable to connect to server. Please check if the API is running.");
    };
    void testConnection();
  }, []);

  const handleChange = (event) => {
    setCredentials((current) => ({ ...current, [event.target.name]: event.target.value }));
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!credentials.username.trim() || !credentials.password.trim()) {
      setError("Please fill in all fields");
      return;
    }
    if (credentials.username.trim().length < 3) {
      setError("Username must be at least 3 characters long");
      return;
    }
    if (credentials.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const result = await login(credentials.username.trim(), credentials.password);
      if (result.success) navigate("/dashboard", { replace: true });
      else setError(result.error || "Sign in failed. Please try again.");
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const offline = connectionStatus && !connectionStatus.success;

  return (
    <Box
      alignItems="center"
      display="flex"
      justifyContent="center"
      minHeight="100vh"
      overflow="hidden"
      px={2}
      py={6}
      position="relative"
      sx={{ background: "linear-gradient(135deg, #eff6ff 0%, #fff 48%, #eef2ff 100%)" }}
    >
      <Typography color="primary" fontWeight={800} left={24} position="absolute" top={20} variant="h4">
        RadiatorStock
      </Typography>

      {offline && <Alert severity="error" sx={{ position: "absolute", right: 24, top: 20 }}>Server Offline</Alert>}
      {connectionStatus?.success && (
        <Link href="#" sx={{ position: "absolute", right: 24, top: 28 }}>Need help?</Link>
      )}

      <Stack maxWidth={440} spacing={2} width="100%" zIndex={1}>
        <Card sx={{ backdropFilter: "blur(12px)", bgcolor: "rgba(255,255,255,.94)" }}>
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Stack alignItems="center" mb={4} spacing={1} textAlign="center">
              <Avatar sx={{ bgcolor: "primary.main", borderRadius: 3, height: 64, width: 64 }}>
                <LockOutlinedIcon fontSize="large" />
              </Avatar>
              <Typography variant="h2">Welcome Back</Typography>
              <Typography color="text.secondary">Sign in to your account</Typography>
            </Stack>

            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={2.5}>
                <TextField
                  autoComplete="username"
                  disabled={loading}
                  label="Username"
                  name="username"
                  onChange={handleChange}
                  required
                  value={credentials.username}
                />
                <Box>
                  <Stack direction="row" justifyContent="space-between" mb={0.75}>
                    <Typography component="label" htmlFor="password" variant="body2">Password</Typography>
                    <Link href="#" variant="body2">Forgot password?</Link>
                  </Stack>
                  <TextField
                    autoComplete="current-password"
                    disabled={loading}
                    id="password"
                    name="password"
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                    type={showPassword ? "text" : "password"}
                    value={credentials.password}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton aria-label={showPassword ? "Hide password" : "Show password"} edge="end" onClick={() => setShowPassword((value) => !value)}>
                              {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </Box>

                {error && <Alert severity="error">{error}</Alert>}

                <Button disabled={loading || offline} fullWidth size="large" type="submit" variant="contained">
                  {loading ? <Stack alignItems="center" direction="row" spacing={1}><CircularProgress color="inherit" size={20} /><span>Signing in...</span></Stack> : "Sign In"}
                </Button>

                <FormControlLabel control={<Checkbox disabled={loading} />} label="Remember me for 30 days" />
              </Stack>
            </Box>

            <Stack borderTop={1} borderColor="divider" mt={3} pt={2} textAlign="center">
              <Typography color="text.secondary" variant="caption">RadiatorStock Management System</Typography>
              <Typography color="text.disabled" variant="caption">Internal staff access only</Typography>
            </Stack>
          </CardContent>
        </Card>

        {connectionStatus && (
          <Box textAlign="center">
            <Chip color={connectionStatus.success ? "success" : "error"} label={connectionStatus.success ? "Connected to server" : "Server connection failed"} variant="outlined" />
          </Box>
        )}
      </Stack>
    </Box>
  );
}
