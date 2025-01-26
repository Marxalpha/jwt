import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-background">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight">
          Welcome to Our Platform
        </h1>
        <p className="text-muted-foreground text-lg">
          Get started with your journey today
        </p>

        <div className="flex gap-4 justify-center">
          <Link href="/login">
            <Button variant="default">Login</Button>
          </Link>
          <Link href="/signup">
            <Button variant="outline">Sign Up</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
