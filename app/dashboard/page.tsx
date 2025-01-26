"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface UserDetails {
  name: string;
  email: string;
  _id: string;
}

interface DummyApiResponse {
  message: string;
  data: {
    timestamp: string;
    randomNumber: number;
    userId: string;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dummyApiData, setDummyApiData] = useState<DummyApiResponse | null>(
    null
  );
  const [dummyApiLoading, setDummyApiLoading] = useState(false);
  const [csrfToken, setCsrfToken] = useState("");

  useEffect(() => {
    // Get CSRF token on component mount
    fetch("/api/auth/csrf")
      .then((res) => res.json())
      .then((data) => setCsrfToken(data.csrfToken));

    const fetchUserDetails = async () => {
      try {
        const response = await fetch("/api/auth/user");

        if (!response.ok) {
          throw new Error("Failed to fetch user details");
        }

        const data = await response.json();
        setUserDetails(data);
      } catch (err) {
        console.error("Error fetching user details:", err);
        setError("Failed to load user details");
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "x-csrf-token": csrfToken,
        },
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      setError("Failed to logout");
    }
  };

  const callDummyApi = async () => {
    setDummyApiLoading(true);
    try {
      const response = await fetch("/api/protected/dummy");
      if (!response.ok) {
        throw new Error("Failed to call dummy API");
      }
      const data = await response.json();
      setDummyApiData(data);
    } catch (err) {
      setError("Failed to call dummy API");
      console.error(err);
    } finally {
      setDummyApiLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </div>

        {error && (
          <div className="bg-destructive/15 text-destructive px-4 py-2 rounded-md">
            {error}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>User Details</CardTitle>
              <CardDescription>Your account information</CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Name
                  </dt>
                  <dd className="text-sm mt-1">{userDetails?.name || "N/A"}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Email
                  </dt>
                  <dd className="text-sm mt-1">
                    {userDetails?.email || "N/A"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    User ID
                  </dt>
                  <dd className="text-sm mt-1">{userDetails?._id || "N/A"}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Dummy API Card */}
          <Card>
            <CardHeader>
              <CardTitle>Test Protected API</CardTitle>
              <CardDescription>
                Call a protected API endpoint that requires authentication
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={callDummyApi} disabled={dummyApiLoading}>
                {dummyApiLoading ? "Calling API..." : "Call Dummy API"}
              </Button>

              {dummyApiData && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium">API Response:</p>
                  <div className="bg-muted p-4 rounded-md">
                    <pre className="text-xs whitespace-pre-wrap">
                      {JSON.stringify(dummyApiData, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
