import type { Metadata } from "next";

import HomePage from "@/components/features/home/HomePage";

export const metadata: Metadata = {
  title: "PH Healthcare | Connected care for every visit",
  description:
    "Explore consultation, diagnostics, medicine access, health plans, and NGO support from one modern healthcare portal.",
};

export default function Home() {
  return <HomePage />;
}
