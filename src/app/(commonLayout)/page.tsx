import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold">Welcome to PH Healthcare Dashboard</h1>
      <Button variant="outline">Get Started</Button>
    </div>
  );
}