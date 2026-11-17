import { TopBar } from "@/components/TopBar";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopBar />
      <main>
        <div className="container">{children}</div>
      </main>
    </>
  );
}
