import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, isAuthenticated, error: authError } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard", { replace: true });
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");

    if (!email || !password) {
      setLocalError("Please fill in all fields");
      return;
    }

    await login(email, password);
  };

  const error = authError || localError;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">

        <CardHeader>
          <CardTitle className="text-center">Welcome Back</CardTitle>
          <CardDescription className="text-center">
            Sign in to your account
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">

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

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>

          </form>

          <p className="mt-4 text-center text-sm">
            Don't have an account?{" "}
            <Link to="/register" className="text-accent hover:underline">
              Register
            </Link>
          </p>

        </CardContent>

      </Card>
    </div>
  );
}