import { getAllCases } from "@/lib/content";
import { HomeClient } from "@/components/home/HomeClient";

export default function HomePage() {
  let cases = [];
  try {
    cases = getAllCases();
  } catch {
    // If content is invalid, HomeClient will show a friendly error when cases is empty.
    cases = [];
  }

  return <HomeClient cases={cases} />;
}
