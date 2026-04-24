"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "../../lib/utils";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const INJECTED_STYLES = `
  .gsap-reveal { visibility: hidden; }

  /* Environment Overlays */
  .film-grain {
      position: absolute; inset: 0; width: 100%; height: 100%;
      pointer-events: none; z-index: 50; opacity: 0.05; mix-blend-mode: overlay;
      background: url('data:image/svg+xml;utf8,<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><filter id="noiseFilter"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(%23noiseFilter)"/></svg>');
  }

  .bg-grid-theme {
      background-size: 60px 60px;
      background-image: 
          linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
      mask-image: radial-gradient(ellipse at center, black 0%, transparent 70%);
      -webkit-mask-image: radial-gradient(ellipse at center, black 0%, transparent 70%);
  }

  /* -------------------------------------------------------------------
     PHYSICAL SKEUOMORPHIC MATERIALS (Restored 3D Depth)
  ---------------------------------------------------------------------- */
  
  /* OUTSIDE THE CARD: Theme-aware text (Shadow in Light Mode, Glow in Dark Mode) */
  .text-3d-matte {
      color: #ffffff;
      text-shadow: 
          0 10px 30px rgba(255, 255, 255, 0.2), 
          0 2px 4px rgba(255, 255, 255, 0.1);
  }

  .text-silver-matte {
      background: linear-gradient(180deg, #ffffff 0%, rgba(255, 255, 255, 0.4) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      transform: translateZ(0); /* Hardware acceleration to prevent WebKit clipping bug */
      filter: 
          drop-shadow(0px 10px 20px rgba(255, 255, 255, 0.15)) 
          drop-shadow(0px 2px 4px rgba(255, 255, 255, 0.1));
  }

  /* INSIDE THE CARD: Hardcoded Silver/White for the dark background, deep rich shadows */
  .text-card-silver-matte {
      background: linear-gradient(180deg, #FFFFFF 0%, #A1A1AA 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      transform: translateZ(0);
      filter: 
          drop-shadow(0px 12px 24px rgba(0,0,0,0.8)) 
          drop-shadow(0px 4px 8px rgba(0,0,0,0.6));
  }

  /* Deep Physical Card with Dynamic Mouse Lighting */
  .premium-depth-card {
      background: linear-gradient(145deg, #162C6D 0%, #0A101D 100%);
      box-shadow: 
          0 40px 100px -20px rgba(0, 0, 0, 0.9),
          0 20px 40px -20px rgba(0, 0, 0, 0.8),
          inset 0 1px 2px rgba(255, 255, 255, 0.2),
          inset 0 -2px 4px rgba(0, 0, 0, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.04);
      position: relative;
  }

  .card-sheen {
      position: absolute; inset: 0; border-radius: inherit; pointer-events: none; z-index: 50;
      background: radial-gradient(800px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,255,255,0.06) 0%, transparent 40%);
      mix-blend-mode: screen; transition: opacity 0.3s ease;
  }

  /* Realistic Laptop Mockup Hardware */
  .laptop-bezel {
      background-color: #111;
      box-shadow: 
          inset 0 0 0 2px #52525B, 
          inset 0 0 0 4px #000, 
          0 40px 80px -15px rgba(0,0,0,0.9),
          0 15px 25px -5px rgba(0,0,0,0.7);
      transform-style: preserve-3d;
  }

  .hardware-btn {
      background: linear-gradient(90deg, #404040 0%, #171717 100%);
      box-shadow: 
          -2px 0 5px rgba(0,0,0,0.8),
          inset -1px 0 1px rgba(255,255,255,0.15),
          inset 1px 0 2px rgba(0,0,0,0.8);
      border-left: 1px solid rgba(255,255,255,0.05);
  }
  
  .screen-glare {
      background: linear-gradient(110deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 45%);
  }

  .widget-depth {
      background: linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%);
      box-shadow: 
          0 10px 20px rgba(0,0,0,0.3),
          inset 0 1px 1px rgba(255,255,255,0.05),
          inset 0 -1px 1px rgba(0,0,0,0.5);
      border: 1px solid rgba(255,255,255,0.03);
  }

  .floating-ui-badge {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.01) 100%);
      backdrop-filter: blur(24px); 
      -webkit-backdrop-filter: blur(24px);
      box-shadow: 
          0 0 0 1px rgba(255, 255, 255, 0.1),
          0 25px 50px -12px rgba(0, 0, 0, 0.8),
          inset 0 1px 1px rgba(255,255,255,0.2),
          inset 0 -1px 1px rgba(0,0,0,0.5);
  }

  /* Physical Tactile Buttons */
  .btn-modern-light, .btn-modern-dark {
      transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
  }
  .btn-modern-light {
      background: linear-gradient(180deg, #FFFFFF 0%, #F1F5F9 100%);
      color: #0F172A;
      box-shadow: 0 0 0 1px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.1), 0 12px 24px -4px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,1), inset 0 -3px 6px rgba(0,0,0,0.06);
  }
  .btn-modern-light:hover {
      transform: translateY(-3px);
      box-shadow: 0 0 0 1px rgba(0,0,0,0.05), 0 6px 12px -2px rgba(0,0,0,0.15), 0 20px 32px -6px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,1), inset 0 -3px 6px rgba(0,0,0,0.06);
  }
  .btn-modern-light:active {
      transform: translateY(1px);
      background: linear-gradient(180deg, #F1F5F9 0%, #E2E8F0 100%);
      box-shadow: 0 0 0 1px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.1), inset 0 3px 6px rgba(0,0,0,0.1), inset 0 0 0 1px rgba(0,0,0,0.02);
  }
  .btn-modern-dark {
      background: linear-gradient(180deg, #27272A 0%, #18181B 100%);
      color: #FFFFFF;
      box-shadow: 0 0 0 1px rgba(255,255,255,0.1), 0 2px 4px rgba(0,0,0,0.6), 0 12px 24px -4px rgba(0,0,0,0.9), inset 0 1px 1px rgba(255,255,255,0.15), inset 0 -3px 6px rgba(0,0,0,0.8);
  }
  .btn-modern-dark:hover {
      transform: translateY(-3px);
      background: linear-gradient(180deg, #3F3F46 0%, #27272A 100%);
      box-shadow: 0 0 0 1px rgba(255,255,255,0.15), 0 6px 12px -2px rgba(0,0,0,0.7), 0 20px 32px -6px rgba(0,0,0,1), inset 0 1px 1px rgba(255,255,255,0.2), inset 0 -3px 6px rgba(0,0,0,0.8);
  }
  .btn-modern-dark:active {
      transform: translateY(1px);
      background: #18181B;
      box-shadow: 0 0 0 1px rgba(255,255,255,0.05), inset 0 3px 8px rgba(0,0,0,0.9), inset 0 0 0 1px rgba(0,0,0,0.5);
  }

  .progress-ring {
      transform: rotate(-90deg);
      transform-origin: center;
      stroke-dasharray: 402;
      stroke-dashoffset: 402;
      stroke-linecap: round;
  }
`;

export function CinematicHero({ 
  brandName = "AI CFO",
  tagline1 = "Automate finances,",
  tagline2 = "scale your business.",
  cardHeading = "Financial Intelligence, redefined.",
  cardDescription = <><span className="text-white font-semibold">AI CFO Copilot</span> empowers MSMEs with structured accounting, precise cash flow tracking, and intelligent real-time advice.</>,
  metricValue = 99,
  metricLabel = "OCR Accuracy",
  ctaHeading = "Start your journey.",
  ctaDescription = "Join thousands of MSMEs taking control of their finances today.",
  className, 
  ...props 
}) {
  
  const containerRef = useRef(null);
  const mainCardRef = useRef(null);
  const mockupRef = useRef(null);
  const requestRef = useRef(0);

  // 1. High-Performance Mouse Interaction Logic (Using requestAnimationFrame)
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (window.scrollY > window.innerHeight * 2) return;

      cancelAnimationFrame(requestRef.current);
      
      requestRef.current = requestAnimationFrame(() => {
        if (mainCardRef.current && mockupRef.current) {
          const rect = mainCardRef.current.getBoundingClientRect();
          const mouseX = e.clientX - rect.left;
          const mouseY = e.clientY - rect.top;
          
          mainCardRef.current.style.setProperty("--mouse-x", `${mouseX}px`);
          mainCardRef.current.style.setProperty("--mouse-y", `${mouseY}px`);

          const xVal = (e.clientX / window.innerWidth - 0.5) * 2;
          const yVal = (e.clientY / window.innerHeight - 0.5) * 2;

          gsap.to(mockupRef.current, {
            rotationY: xVal * 12,
            rotationX: -yVal * 12,
            ease: "power3.out",
            duration: 1.2,
          });
        }
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(requestRef.current);
    };
  },[]);

  // 2. Complex Cinematic Scroll Timeline
  useEffect(() => {
    const isMobile = window.innerWidth < 768;

    const ctx = gsap.context(() => {
      gsap.set(".text-track", { autoAlpha: 0, y: 60, scale: 0.85, filter: "blur(20px)", rotationX: -20 });
      gsap.set(".text-days", { autoAlpha: 1, clipPath: "inset(0 100% 0 0)" });
      gsap.set(".main-card", { y: window.innerHeight + 200, autoAlpha: 1 });
      gsap.set([".card-left-text", ".card-right-text", ".mockup-scroll-wrapper", ".floating-badge", ".phone-widget"], { autoAlpha: 0 });
      gsap.set(".cta-wrapper", { autoAlpha: 0, scale: 0.8, filter: "blur(30px)", pointerEvents: "none" });

      const introTl = gsap.timeline({ delay: 0.3 });
      introTl
        .to(".text-track", { duration: 1.8, autoAlpha: 1, y: 0, scale: 1, filter: "blur(0px)", rotationX: 0, ease: "expo.out" })
        .to(".text-days", { duration: 1.4, clipPath: "inset(0 0% 0 0)", ease: "power4.inOut" }, "-=1.0");

      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=7000",
          pin: true,
          scrub: 1,
          anticipatePin: 1,
        },
      });

      scrollTl
        .to([".hero-text-wrapper", ".bg-grid-theme"], { scale: 1.15, filter: "blur(20px)", opacity: 0.2, ease: "power2.inOut", duration: 2 }, 0)
        .to(".main-card", { y: 0, ease: "power3.inOut", duration: 2 }, 0)
        .to(".main-card", { width: "100%", height: "100%", borderRadius: "0px", ease: "power3.inOut", duration: 1.5 })
        .fromTo(".mockup-scroll-wrapper",
          { y: 300, z: -500, rotationX: 50, rotationY: -30, autoAlpha: 0, scale: 0.6 },
          { y: 0, z: 0, rotationX: 0, rotationY: 0, autoAlpha: 1, scale: 1, ease: "expo.out", duration: 2.5 }, "-=0.8"
        )
        .fromTo(".phone-widget", { y: 40, autoAlpha: 0, scale: 0.95 }, { y: 0, autoAlpha: 1, scale: 1, stagger: 0.15, ease: "back.out(1.2)", duration: 1.5 }, "-=1.5")
        .to(".progress-ring", { strokeDashoffset: 60, duration: 2, ease: "power3.inOut" }, "-=1.2")
        .to(".counter-val", { innerHTML: metricValue, snap: { innerHTML: 1 }, duration: 2, ease: "expo.out" }, "-=2.0")
        .fromTo(".floating-badge", { y: 100, autoAlpha: 0, scale: 0.7, rotationZ: -10 }, { y: 0, autoAlpha: 1, scale: 1, rotationZ: 0, ease: "back.out(1.5)", duration: 1.5, stagger: 0.2 }, "-=2.0")
        .fromTo(".card-left-text", { x: -50, autoAlpha: 0 }, { x: 0, autoAlpha: 1, ease: "power4.out", duration: 1.5 }, "-=1.5")
        .fromTo(".card-right-text", { x: 50, autoAlpha: 0, scale: 0.8 }, { x: 0, autoAlpha: 1, scale: 1, ease: "expo.out", duration: 1.5 }, "<")
        .to({}, { duration: 2.5 })
        .set(".hero-text-wrapper", { autoAlpha: 0 })
        .set(".cta-wrapper", { autoAlpha: 1, pointerEvents: "auto" }) 
        .to({}, { duration: 1.5 })
        .to([".mockup-scroll-wrapper", ".floating-badge", ".card-left-text", ".card-right-text"], {
          scale: 0.9, y: -40, z: -200, autoAlpha: 0, ease: "power3.in", duration: 1.2, stagger: 0.05,
        })
        // Responsive card pullback sizing
        .to(".main-card", { 
          width: isMobile ? "92vw" : "85vw", 
          height: isMobile ? "92vh" : "85vh", 
          borderRadius: isMobile ? "32px" : "40px", 
          ease: "expo.inOut", 
          duration: 1.8 
        }, "pullback") 
        .to(".cta-wrapper", { scale: 1, filter: "blur(0px)", ease: "expo.inOut", duration: 1.8 }, "pullback")
        .to(".main-card", { y: -window.innerHeight - 300, ease: "power3.in", duration: 1.5 });

    }, containerRef);

    return () => ctx.revert();
  },[metricValue]); 

  return (
    <div
      ref={containerRef}
      className={cn("relative w-screen h-screen overflow-hidden flex items-center justify-center bg-zinc-950 text-white font-sans antialiased", className)}
      style={{ perspective: "1500px" }}
      {...props}
    >
      <style dangerouslySetInnerHTML={{ __html: INJECTED_STYLES }} />
      <div className="film-grain" aria-hidden="true" />
      <div className="bg-grid-theme absolute inset-0 z-0 pointer-events-none opacity-50" aria-hidden="true" />

      {/* BACKGROUND LAYER: Hero Texts */}
      <div className="hero-text-wrapper absolute z-10 flex flex-col items-center justify-center text-center w-screen px-4 will-change-transform transform-style-3d">
        <h1 className="text-track gsap-reveal text-3d-matte text-5xl md:text-7xl lg:text-[6rem] font-bold tracking-tight mb-2">
          {tagline1}
        </h1>
        <h1 className="text-days gsap-reveal text-silver-matte text-5xl md:text-7xl lg:text-[6rem] font-extrabold tracking-tighter text-indigo-400">
          {tagline2}
        </h1>
      </div>

      {/* BACKGROUND LAYER 2: Tactile CTA Buttons */}
      <div className="cta-wrapper absolute z-10 flex flex-col items-center justify-center text-center w-screen px-4 gsap-reveal will-change-transform">
        <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight text-silver-matte">
          {ctaHeading}
        </h2>
        <p className="text-muted-foreground text-lg md:text-xl mb-12 max-w-xl mx-auto font-light leading-relaxed">
          {ctaDescription}
        </p>
        <div className="flex flex-col sm:flex-row gap-6">
          <Link to="/dashboard" className="btn-modern-light flex items-center justify-center gap-3 px-8 py-4 rounded-[1.25rem] group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            <div className="text-left">
              <div className="text-xl font-bold leading-none tracking-tight flex items-center gap-2">Open Dashboard <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" /></div>
            </div>
          </Link>
        </div>
      </div>

      {/* FOREGROUND LAYER: The Physical Deep Blue Card */}
      <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none" style={{ perspective: "1500px" }}>
        <div
          ref={mainCardRef}
          className="main-card premium-depth-card relative overflow-hidden gsap-reveal flex items-center justify-center pointer-events-auto w-[92vw] md:w-[85vw] h-[92vh] md:h-[85vh] rounded-[32px] md:rounded-[40px]"
        >
          <div className="card-sheen" aria-hidden="true" />

          {/* BACKGROUND TEXTS & LAPTOP MOCKUP */}
          <div className="relative w-full h-full max-w-[1400px] mx-auto px-6 lg:px-12 flex items-center justify-center z-10 py-12 lg:py-0">
            
            {/* BRAND NAME (Ambient Background) */}
            <div className="card-right-text gsap-reveal absolute top-10 md:top-20 right-6 md:right-16 z-0 opacity-10 lg:opacity-60 flex justify-end pointer-events-none">
              <h2 className="text-7xl md:text-[9rem] lg:text-[11rem] font-black uppercase tracking-tighter text-card-silver-matte leading-none">
                {brandName}
              </h2>
            </div>

            {/* ACCOUNTABILITY TEXT (Foreground Top-Left) */}
            <div className="card-left-text gsap-reveal absolute top-12 md:top-24 left-6 md:left-16 z-30 max-w-sm lg:max-w-lg">
              <h3 className="text-white text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 tracking-tight drop-shadow-xl">
                {cardHeading}
              </h3>
              <p className="hidden md:block text-zinc-300 text-base lg:text-xl font-medium leading-relaxed drop-shadow-md">
                {cardDescription}
              </p>
            </div>

            {/* THE LAPTOP MOCKUP */}
            <div className="mockup-scroll-wrapper relative w-full flex items-center justify-center z-20 mt-24 lg:mt-32" style={{ perspective: "1500px" }}>
              
              <div className="relative w-full h-full flex items-center justify-center transform scale-[0.5] sm:scale-[0.65] md:scale-[0.85] lg:scale-100">
                
                {/* Laptop Bezel Container */}
                <div
                  ref={mockupRef}
                  className="relative w-[800px] h-[500px] rounded-2xl laptop-bezel flex flex-col will-change-transform transform-style-3d bg-[#111]"
                >
                  {/* Laptop Camera/Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[70px] h-[18px] bg-black rounded-b-xl z-50 flex items-center justify-center border-b border-white/5 shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)] animate-pulse" />
                  </div>

                  {/* Inner Screen Container */}
                  <div className="absolute inset-[10px] bg-[#050914] rounded-lg overflow-hidden shadow-[inset_0_0_25px_rgba(0,0,0,1)] text-white z-10 border border-white/10">
                    <div className="absolute inset-0 screen-glare z-40 pointer-events-none" aria-hidden="true" />

                    {/* App Interface (Dashboard Layout) */}
                    <div className="relative w-full h-full pt-10 px-8 pb-8 flex flex-col">
                      {/* Header */}
                      <div className="phone-widget flex justify-between items-center mb-10 border-b border-white/10 pb-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-sm border border-indigo-500/30 shadow-lg shadow-indigo-500/20">AI</div>
                          <span className="text-2xl font-bold tracking-tight text-white drop-shadow-md">AI CFO Dashboard</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-xs text-neutral-400 uppercase tracking-widest font-bold">Today</span>
                          <div className="h-2 w-16 bg-white/10 rounded-full" />
                          <div className="h-2 w-16 bg-white/10 rounded-full" />
                          <div className="w-8 h-8 rounded-full bg-indigo-500/50 border border-white/10" />
                        </div>
                      </div>

                      {/* Main Grid */}
                      <div className="grid grid-cols-3 gap-8 flex-1">
                        
                        {/* Left Metric */}
                        <div className="col-span-1 phone-widget relative flex flex-col items-center justify-center widget-depth rounded-3xl border border-white/5 drop-shadow-[0_15px_25px_rgba(0,0,0,0.5)]">
                          <svg className="absolute inset-0 w-full h-full" aria-hidden="true" style={{ transform: "scale(0.85)" }}>
                            <circle cx="50%" cy="50%" r="40%" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="16" />
                            <circle className="progress-ring" cx="50%" cy="50%" r="40%" fill="none" stroke="#6366f1" strokeWidth="16" style={{ transformOrigin: "center" }} />
                          </svg>
                          <div className="text-center z-10 flex flex-col items-center">
                            <span className="counter-val text-6xl font-extrabold tracking-tighter text-white drop-shadow-lg">0</span>
                            <span className="text-[11px] text-indigo-200/50 uppercase tracking-[0.1em] font-bold mt-2">{metricLabel}</span>
                          </div>
                        </div>

                        {/* Right Content */}
                        <div className="col-span-2 flex flex-col gap-6">
                          <div className="flex-1 phone-widget widget-depth rounded-3xl p-6 flex items-center border border-white/5">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-indigo-600/5 flex items-center justify-center mr-6 border border-indigo-400/20 shadow-inner">
                              <svg className="w-8 h-8 text-indigo-400 drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <div className="flex-1 space-y-3">
                              <div className="h-3 w-48 bg-neutral-300 rounded-full shadow-inner" />
                              <div className="h-2 w-32 bg-neutral-600 rounded-full shadow-inner" />
                            </div>
                          </div>
                          
                          <div className="flex-1 phone-widget widget-depth rounded-3xl p-6 flex items-center border border-white/5">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/5 flex items-center justify-center mr-6 border border-emerald-400/20 shadow-inner">
                              <svg className="w-8 h-8 text-emerald-400 drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <div className="flex-1 space-y-3">
                              <div className="h-3 w-36 bg-neutral-300 rounded-full shadow-inner" />
                              <div className="h-2 w-56 bg-neutral-600 rounded-full shadow-inner" />
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Laptop Base Lip */}
                  <div className="absolute -bottom-[6px] left-1/2 -translate-x-1/2 w-[240px] h-[6px] bg-white/20 rounded-t-xl shadow-[0_-1px_2px_rgba(255,255,255,0.1)] z-50" />
                </div>

                {/* Floating Glass Badges */}
                <div className="floating-badge absolute flex top-8 lg:top-16 left-[-10px] lg:left-[-40px] floating-ui-badge rounded-2xl p-4 items-center gap-4 z-30 transform hover:scale-105 transition-transform">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-b from-indigo-500/20 to-indigo-900/10 flex items-center justify-center border border-indigo-400/30 shadow-inner">
                    <span className="text-xl drop-shadow-lg" aria-hidden="true">💡</span>
                  </div>
                  <div>
                    <p className="text-white text-sm font-bold tracking-tight">AI Insights</p>
                    <p className="text-indigo-200/50 text-xs font-medium">Cash flow optimal</p>
                  </div>
                </div>

                <div className="floating-badge absolute flex bottom-16 lg:bottom-24 right-[-10px] lg:right-[-40px] floating-ui-badge rounded-2xl p-4 items-center gap-4 z-30 transform hover:scale-105 transition-transform">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-b from-emerald-500/20 to-emerald-900/10 flex items-center justify-center border border-emerald-400/30 shadow-inner">
                    <span className="text-xl drop-shadow-lg" aria-hidden="true">⚡️</span>
                  </div>
                  <div>
                    <p className="text-white text-sm font-bold tracking-tight">Invoice Scanned</p>
                    <p className="text-emerald-200/50 text-xs font-medium">Data extracted</p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
