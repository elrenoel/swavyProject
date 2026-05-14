import React, { useEffect, useRef } from "react";
import HeroSection from "../components/sections/Hero/HeroSection";
import NewReleasesSection from "../components/sections/NewReleases/NewReleasesSection";
import CuratedEditorial from "../components/sections/CuratedEditorial/CuratedEditorial";
import { useAuth } from "../context/AuthContext";
const Home = () => {
  const { user, isLoading } = useAuth();
  const sectionRefs = useRef([]);
  const showReveal = !isLoading && !user;

  useEffect(() => {
    if (!showReveal) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
    );

    sectionRefs.current.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, [showReveal]);

  return (
    <>
      {showReveal ? (
        <div ref={(el) => (sectionRefs.current[0] = el)} className="reveal">
          <HeroSection />
        </div>
      ) : null}
      <div
        ref={(el) => (sectionRefs.current[1] = showReveal ? el : null)}
        className={showReveal ? "reveal" : ""}
      >
        <NewReleasesSection />
      </div>
      <div
        ref={(el) => (sectionRefs.current[2] = showReveal ? el : null)}
        className={showReveal ? "reveal" : ""}
      >
        <CuratedEditorial />
      </div>
    </>
  );
};

export default Home;
