import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function StarIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2l2.9 6.3 6.9.6-5.2 4.6 1.6 6.8L12 16.9 5.8 20.3l1.6-6.8L2.2 8.9l6.9-.6z" />
    </svg>
  );
}
function ArrowIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}
function PlayIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}
function SparkleIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2l1.5 5.5L19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5z" />
    </svg>
  );
}
function GlobeIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3c-2.5 3-4 5.5-4 9s1.5 6 4 9" />
      <path d="M12 3c2.5 3 4 5.5 4 9s-1.5 6-4 9" />
      <path d="M3 12h18" />
    </svg>
  );
}
function HubIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 9V3" /><path d="M12 21v-6" />
      <path d="M9 12H3" /><path d="M21 12h-6" />
    </svg>
  );
}
function CheckIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}
function BoltIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" />
    </svg>
  );
}

function Logo({ white = false }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: white ? "rgba(255,255,255,0.15)" : "linear-gradient(135deg,#00434f,#0d5c6b)" }}
      >
        <BoltIcon className="w-5 h-5 text-white" />
      </div>
      <span
        className={`text-xl font-bold ${white ? "text-white" : ""}`}
        style={white ? {} : { background: "linear-gradient(90deg,#00434f,#0d5c6b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
      >
        Intervix
      </span>
    </div>
  );
}

function Stars({ count = 5 }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <StarIcon key={i} className="w-4 h-4 text-[#0d5c6b]" />
      ))}
    </div>
  );
}

function ReviewCard({ quote, name, role, initials, rating = 5 }) {
  return (
    <div className="bg-white/70 backdrop-blur-md border border-white/50 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300">
      <div>
        <Stars count={rating} />
        <p className="mt-4 mb-6 text-[#111c2d] text-[15px] leading-relaxed italic">&ldquo;{quote}&rdquo;</p>
      </div>
      <div className="flex items-center gap-3 border-t border-[#bfc8cb]/30 pt-4">
        <div className="w-10 h-10 rounded-full bg-[#0d5c6b]/10 flex items-center justify-center font-bold text-[#0d5c6b] text-sm shrink-0">
          {initials}
        </div>
        <div>
          <p className="text-sm font-bold text-[#111c2d]">{name}</p>
          <p className="text-xs text-[#3f484b]">{role}</p>
        </div>
      </div>
    </div>
  );
}

function Step({ number, title, description, isLast }) {
  return (
    <div className="flex items-center flex-1 last:flex-none">
      <div className="flex flex-col items-center text-center flex-1">
        <div
          className="w-14 h-14 rounded-full text-white flex items-center justify-center text-xl font-bold mb-4 shadow-lg ring-8 ring-[#EEF2F7]"
          style={{ background: "linear-gradient(135deg,#00434f,#0d5c6b)" }}
        >
          {number}
        </div>
        <h3 className="text-lg font-semibold text-[#00434f] mb-2">{title}</h3>
        <p className="text-sm text-[#3f484b] max-w-[180px]">{description}</p>
      </div>
      {!isLast && (
        <div className="h-0.5 flex-1 bg-[#bfc8cb]/40 -mt-10 hidden md:block" />
      )}
    </div>
  );
}

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-white/70 backdrop-blur-md border border-white/50 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center gap-2 hover:-translate-y-1 transition-transform duration-300 group">
      <span className="text-xs text-[#3f484b] uppercase tracking-widest">{label}</span>
      <span
        className="text-5xl font-extrabold group-hover:scale-110 transition-transform duration-300"
        style={{ background: "linear-gradient(135deg,#00434f,#0d5c6b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
      >
        {value}
      </span>
      <span className="text-sm text-[#3f484b]">{sub}</span>
    </div>
  );
}

const defaultReviews = [
  {
    review_id: "default-1",
    quote: "Intervix transformed how I talk about my achievements. I felt like I had a secret weapon during my final interview at a Fortune 500 company.",
    name: "James Dalton",
    role: "Senior Product Manager",
    initials: "JD",
    rating: 5
  },
  {
    review_id: "default-2",
    quote: "The real-time speech analysis caught filler words I didn't even know I was using. Within a week, my confidence score jumped by 40%.",
    name: "Sarah Mitchell",
    role: "Data Scientist",
    initials: "SM",
    rating: 5
  },
  {
    review_id: "default-3",
    quote: "I landed my dream role as a Creative Director. The specific feedback on my CV-based questions was incredibly accurate to the actual interview.",
    name: "Alex Lee",
    role: "Creative Director",
    initials: "AL",
    rating: 5
  }
];

export default function LandingPage() {
  const navigate = useNavigate();
  const sectionsRef = useRef([]);
  const [reviews, setReviews] = useState(defaultReviews);

  const goToLogin = () => navigate("/login");

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await axios.get("/api/reviews/public");
        if (res.data && res.data.length > 0) {
          setReviews(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch public reviews, using defaults:", err);
      }
    };
    fetchReviews();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("opacity-100", "translate-y-0");
            entry.target.classList.remove("opacity-0", "translate-y-8");
          }
        });
      },
      { threshold: 0.1 }
    );
    sectionsRef.current.forEach((el) => {
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const addRef = (el) => {
    if (el && !sectionsRef.current.includes(el)) sectionsRef.current.push(el);
  };

  const handleSmoothScroll = (e, id) => {
    e.preventDefault();
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div
      className="min-h-screen text-[#111c2d] antialiased overflow-x-hidden"
      style={{ background: "linear-gradient(135deg,#EEF2F7 0%,#E2E8F0 100%)" }}
    >
      <nav className="fixed top-0 w-full z-50 backdrop-blur-md border-b border-white/20" style={{ background: "rgba(249,249,255,0.8)" }}>
        <div className="flex justify-between items-center px-6 py-4 max-w-[1280px] mx-auto">
          <Logo />
          <div className="hidden md:flex items-center gap-10">
            {[["Features", "#features"], ["How It Works", "#how-it-works"], ["Reviews", "#reviews"]].map(([label, href]) => (
              <a
                key={href}
                href={href}
                onClick={(e) => handleSmoothScroll(e, href)}
                className="text-sm font-medium text-[#3f484b] hover:text-[#00434f] transition-colors"
              >
                {label}
              </a>
            ))}
          </div>
          <button
            type="button"
            onClick={goToLogin}
            className="text-white text-sm font-bold px-5 py-2.5 rounded-full transition-all hover:opacity-90 active:scale-95"
            style={{ background: "linear-gradient(135deg,#00434f,#0d5c6b)" }}
          >
            Get Started
          </button>
        </div>
      </nav>

      <main className="pt-24 pb-20 px-4 md:px-6 max-w-[1280px] mx-auto">
        <section
          ref={addRef}
          className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-28 opacity-0 translate-y-8 transition-all duration-700 ease-out"
        >
          <div className="flex flex-col gap-6">
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border"
                style={{ background: "rgba(134,242,228,0.2)", borderColor: "rgba(109,216,203,0.3)", color: "#00434f" }}>
                <SparkleIcon className="w-3.5 h-3.5" />
                AI-Powered Interview Coach
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold leading-[1.08] tracking-tight">
              Land Your{" "}
              <span style={{ background: "linear-gradient(90deg,#00434f,#0d5c6b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Dream Job
              </span>{" "}
              With AI
            </h1>

            <p className="text-lg text-[#3f484b] max-w-lg leading-relaxed">
              Practice interviews, receive instant feedback, improve communication skills, and get career-ready with AI-powered coaching.
            </p>

            <div className="flex flex-wrap gap-4 mt-2">
              <button
                type="button"
                onClick={goToLogin}
                className="flex items-center gap-2 text-white font-bold px-7 py-3.5 rounded-full shadow-lg hover:opacity-90 active:scale-95 transition-all"
                style={{ background: "linear-gradient(135deg,#00434f,#0d5c6b)", boxShadow: "0 4px 20px rgba(0,67,79,0.25)" }}
              >
                Start Free Practice
                <ArrowIcon className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={(e) => handleSmoothScroll(e, "#how-it-works")}
                className="flex items-center gap-2 text-[#00434f] font-bold px-7 py-3.5 rounded-full border-2 border-[#00434f] hover:bg-[#00434f]/5 transition-all"
              >
                <PlayIcon className="w-4 h-4" />
                Watch Demo
              </button>
            </div>

            <div className="grid grid-cols-3 gap-6 mt-4 pt-6 border-t border-[#bfc8cb]/40">
              {[["10,000+", "Interviews Done"], ["95%", "Success Rate"], ["500+", "Partner Orgs"]].map(([num, lbl]) => (
                <div key={lbl} className="flex flex-col">
                  <span className="text-2xl font-bold" style={{ background: "linear-gradient(135deg,#00434f,#0d5c6b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    {num}
                  </span>
                  <span className="text-xs text-[#3f484b]">{lbl}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-4 rounded-[2rem] blur-2xl transition-all duration-700 group-hover:scale-105" style={{ background: "rgba(0,67,79,0.06)" }} />
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAjr9nFszTChydXbJ4C80LW68zzgnotALz1F2TudalbYeOgw2swKxS2Uh68Da9QdASr0GLCHcxR_FyJZqmX1edVRf_RPcUrZjRCcTByC7mxVHkPjQkCkO4bP_fTeDj-6-zQdbp5d_770hXOaeASFehzGsFUv6kWOS6A5sVJw9y1lysLh4kS770ziXotAekY14eWpXohdyvz7KnNQjvMCsmwt6nuQlQb7QMFhN0MqYyBUy2Lw4cWjxhXdXGPjytrrpINk1Go4PfLuSU"
                alt="Professional using Intervix"
                className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-[1.03]"
              />
            </div>

          </div>
        </section>

        <section
          id="features"
          ref={addRef}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-28 opacity-0 translate-y-8 transition-all duration-700 ease-out"
        >
          <StatCard label="Questions Generated" value="10" sub="Derived from your CV profile" />
          <StatCard label="Confidence Score" value="92%" sub="AI Evaluated Professionalism" />
          <StatCard label="Sessions Completed" value="0%" sub="Ready to start your first journey" />
        </section>

        <section
          id="how-it-works"
          ref={addRef}
          className="mb-28 opacity-0 translate-y-8 transition-all duration-700 ease-out"
        >
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-[#00434f] mb-3">A Proven Success Blueprint</h2>
            <p className="text-[#3f484b]">Simple steps from preparation to your new career.</p>
          </div>
          <div className="flex flex-col md:flex-row items-start gap-0 relative">
            <Step number="1" title="Upload your CV" description="Our AI analyzes your experience to generate role-specific questions." />
            <Step number="2" title="Practice with AI Coach" description="Simulate real scenarios with speech analysis and behavioral prompts." />
            <Step number="3" title="Land Your Job" description="Master your executive presence and walk into your interview with confidence." isLast />
          </div>
        </section>

        <section
          id="reviews"
          ref={addRef}
          className="mb-28 opacity-0 translate-y-8 transition-all duration-700 ease-out"
        >
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-[#00434f] mb-3">What Our Users Say</h2>
            <div className="flex justify-center gap-1">
              <Stars count={5} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((r) => (
              <ReviewCard
                key={r.review_id}
                quote={r.quote}
                name={r.name}
                role={r.role}
                initials={r.initials}
                rating={r.rating}
              />
            ))}
          </div>
        </section>

        <section
          ref={addRef}
          className="rounded-3xl p-12 text-center text-white relative overflow-hidden group opacity-0 translate-y-8 transition-all duration-700 ease-out"
          style={{ background: "linear-gradient(135deg,#00434f,#0d5c6b)" }}
        >
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full blur-3xl transition-transform duration-1000 group-hover:scale-150"
            style={{ background: "rgba(171,237,254,0.15)" }} />
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-4xl font-bold mb-4">Ready to Elevate Your Career?</h2>
            <p className="text-lg opacity-90 mb-10">Join 10,000+ professionals who have mastered their interviews with Intervix.</p>
            <button
              type="button"
              onClick={goToLogin}
              className="bg-white font-bold text-xl px-10 py-4 rounded-full shadow-lg hover:bg-[#f0f3ff] transition-all active:scale-95"
              style={{ color: "#00434f" }}
            >
              Start Your Free Trial
            </button>
          </div>
        </section>
      </main>

      <footer style={{ background: "#0D3B47" }} className="text-white">
        <div className="flex flex-col md:flex-row justify-between items-center px-6 py-14 max-w-[1280px] mx-auto gap-10">
          <div className="flex flex-col gap-3 items-center md:items-start">
            <Logo white />
            <p className="text-xs opacity-60 text-center md:text-left">&copy; 2024 Intervix AI. Empowering executive presence.</p>
          </div>

          <div className="flex flex-wrap justify-center gap-8">
            {["Privacy Policy", "Terms of Service", "Contact Us", "Careers"].map((item) => (
              <a key={item} href="#" className="text-sm font-medium opacity-80 hover:opacity-100 transition-opacity">
                {item}
              </a>
            ))}
          </div>

          <div className="flex gap-3">
            <a href="#" className="w-10 h-10 rounded-full flex items-center justify-center transition-all" style={{ background: "rgba(255,255,255,0.1)" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.2)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}>
              <GlobeIcon className="w-5 h-5" />
            </a>
            <a href="#" className="w-10 h-10 rounded-full flex items-center justify-center transition-all" style={{ background: "rgba(255,255,255,0.1)" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.2)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}>
              <HubIcon className="w-5 h-5" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
