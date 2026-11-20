import type { Metadata } from "next";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <>
      <Header />
      <main id="content" className="page">
        <div className="page-hero">
          <p className="eyebrow">404</p>
          <h1>Nothing on this orbit</h1>
          <div className="lead">
            <p>
              That page does not exist. Try <a href="/plan">the plan</a>,{" "}
              <a href="/technologies">the thirteen inventions</a> or{" "}
              <a href="/numbers">every number</a>.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
