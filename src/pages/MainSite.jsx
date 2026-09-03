import React, { useEffect, useLayoutEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import AboutCards from "../components/AboutCards";
import Announcements from "../components/Announcements";
import Milestones from "../components/Milestones";
import ConcernForm from "../components/ConcernForm";
import Events from "../components/Events";
import Officers from "../components/Officers";
import Footer from "../components/Footer";

export default function MainSite() {
  const [isLoading, setIsLoading] = useState(true);

  useLayoutEffect(() => {
    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    window.requestAnimationFrame(() => window.scrollTo(0, 0));

    return () => {
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, []);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => setIsLoading(false), prefersReducedMotion ? 180 : 1350);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const targets = document.querySelectorAll("#mainSite > section:not(.hero), #mainSite > footer");
    if (targets.length === 0) return undefined;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      targets.forEach((target) => target.classList.add("is-visible"));
      return undefined;
    }

    targets.forEach((target) => target.classList.add("scroll-reveal"));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px" }
    );

    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, []);

  return (
    <div id="mainSite" className={isLoading ? "site-is-loading" : "site-is-ready"}>
      {isLoading && (
        <div className="site-loader" role="status" aria-live="polite" aria-label="Loading BSHM Department">
          <div className="site-loader-mark" aria-hidden="true">
            <span>B</span>
          </div>
          <div className="site-loader-name">BSHM <strong>DEPT</strong></div>
          <div className="site-loader-track" aria-hidden="true"><span /></div>
          <div className="site-loader-caption">Preparing your department space</div>
        </div>
      )}
      <Navbar />
      <Hero />
      <AboutCards />
      <Announcements />
      <Milestones />
      <ConcernForm />
      <Events />
      <Officers />
      <Footer />
    </div>
  );
}
