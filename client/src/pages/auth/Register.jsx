import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading, isAuthenticated, error: authError } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard", { replace: true });
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");

    if (!name || !email || !password || !confirmPassword) {
      setLocalError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setLocalError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setLocalError("Password must be at least 6 characters");
      return;
    }

    await register(name, email, password);
  };

  const error = authError || localError;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">

        <CardHeader>
          <CardTitle className="text-center">Create Account</CardTitle>
          <CardDescription className="text-center">
            Join us to start managing your projects
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <Label>Full Name</Label>
              <Input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div>
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div>
              <Label>Password</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div>
              <Label>Confirm Password</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Sign Up"}
            </Button>

          </form>

          <p className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-accent hover:underline">
              Login
            </Link>
          </p>

        </CardContent>

      </Card>
    </div>
  );
}