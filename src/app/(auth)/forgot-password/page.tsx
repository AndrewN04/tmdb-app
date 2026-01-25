"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import Link from "next/link";

export default function ForgotPassword() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Forgot Password</CardTitle>
          <CardDescription>Password reset via email is coming soon.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            In the meantime, please contact support or try signing in with Google or GitHub.
          </p>
          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/sign-in">Back to Sign In</Link>
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-xs text-muted-foreground">
            Or use social login for instant access
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
