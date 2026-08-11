"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";

const PK = "pk_test_Z29sZGVuLWRvYmVybWFuLTMwLmNsZXJrLmFjY291bnRzLmRldiQ";
const CLERK_JS_URL =
  "https://golden-doberman-30.clerk.accounts.dev/npm/@clerk/clerk-js@5/dist/clerk.browser.js";

export default function AdminLoginPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<"loading" | "ready" | "error">("loading");
  const [errMsg, setErrMsg] = useState("");
  const mountedRef = useRef(false);

  const initClerk = async () => {
    const clerk = (window as any).Clerk;
    if (!clerk) {
      setErrMsg("Clerk script did not load correctly. Please refresh.");
      setPhase("error");
      return;
    }

    try {
      if (!clerk.loaded) {
        await clerk.load();
      }

      // Already signed in → go to dashboard
      if (clerk.user) {
        router.replace("/admin/dashboard");
        return;
      }

      setPhase("ready");

      // Mount sign-in after state update (next tick so DOM is committed)
      setTimeout(() => {
        if (mountedRef.current) return;
        const el = document.getElementById("clerk-signin-root");
        if (el) {
          clerk.mountSignIn(el, {
            // After sign-in Clerk will redirect here automatically
            afterSignInUrl: "/admin/dashboard",
          });
          mountedRef.current = true;
        }
      }, 50);

      // Listen for successful auth
      clerk.addListener(({ user }: any) => {
        if (user) router.replace("/admin/dashboard");
      });
    } catch (err) {
      console.error("[Clerk] load failed:", err);
      setErrMsg("Failed to connect to Clerk. Check your publishable key.");
      setPhase("error");
    }
  };

  // ── Load Clerk dynamically on mount ───────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;

    const existingScript = document.querySelector(`script[src="${CLERK_JS_URL}"]`);
    if (existingScript) {
      if ((window as any).Clerk) {
        initClerk();
      } else {
        existingScript.addEventListener("load", initClerk);
      }
      return;
    }

    const script = document.createElement("script");
    script.src = CLERK_JS_URL;
    script.setAttribute("data-clerk-publishable-key", PK);
    script.async = true;
    script.onload = initClerk;
    script.onerror = () => {
      setErrMsg("Could not load Clerk script. Check your internet connection.");
      setPhase("error");
    };
    document.head.appendChild(script);
  }, []);


  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{background:#07070f}

        .login-root{
          min-height:100dvh;display:flex;align-items:center;justify-content:center;
          font-family:'Inter',sans-serif;
          background:radial-gradient(ellipse 90% 70% at 50% 0%,rgba(139,92,246,.18) 0%,transparent 60%),
                      radial-gradient(ellipse 60% 40% at 80% 80%,rgba(0,212,255,.10) 0%,transparent 50%),#07070f;
          padding:24px;position:relative;overflow:hidden;
        }
        .orb{position:absolute;border-radius:50%;filter:blur(80px);pointer-events:none;animation:drift 14s ease-in-out infinite alternate}
        .orb-1{width:500px;height:500px;background:rgba(139,92,246,.12);top:-100px;left:-150px}
        .orb-2{width:400px;height:400px;background:rgba(0,212,255,.09);bottom:-80px;right:-100px;animation-delay:-7s}
        @keyframes drift{from{transform:translate(0,0) scale(1)}to{transform:translate(30px,20px) scale(1.05)}}

        .grid-bg{
          position:absolute;inset:0;pointer-events:none;
          background-image:linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),
            linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px);
          background-size:60px 60px;
        }

        .card{
          position:relative;width:100%;max-width:460px;
          background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.09);
          border-radius:28px;padding:44px 40px;backdrop-filter:blur(24px);
          box-shadow:0 32px 80px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.07);
          animation:slideUp .5s cubic-bezier(.23,1,.32,1) both;
        }
        @keyframes slideUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}

        .badge{
          width:64px;height:64px;border-radius:18px;
          background:linear-gradient(135deg,#8b5cf6,#00d4ff);
          display:flex;align-items:center;justify-content:center;
          margin:0 auto 20px;box-shadow:0 0 40px rgba(139,92,246,.4);
        }
        .badge svg{width:30px;height:30px;color:#fff}

        h1{text-align:center;font-size:26px;font-weight:800;color:#fff;letter-spacing:-0.5px;margin-bottom:6px}
        .sub{text-align:center;font-size:13px;color:rgba(255,255,255,.4);margin-bottom:28px;line-height:1.5}

        /* Clerk mounts its own styled form here */
        #clerk-signin-root{min-height:400px;display:flex;flex-direction:column;align-items:center;justify-content:center}

        .spinner{width:28px;height:28px;border:3px solid rgba(139,92,246,.3);border-top-color:#8b5cf6;border-radius:50%;animation:spin .7s linear infinite;margin:40px auto}
        @keyframes spin{to{transform:rotate(360deg)}}
        .spin-label{text-align:center;font-size:12px;color:rgba(255,255,255,.35);margin-top:8px}

        .error-box{
          display:flex;align-items:flex-start;gap:10px;
          background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.25);
          border-radius:12px;padding:14px 16px;color:#f87171;font-size:13px;line-height:1.5;
          margin-top:8px;
        }
        .error-box svg{width:16px;height:16px;flex-shrink:0;margin-top:1px}

        .foot{text-align:center;font-size:11px;color:rgba(255,255,255,.2);margin-top:24px;line-height:1.6}
        .foot strong{color:rgba(255,255,255,.35)}
      `}</style>

      <div className="login-root">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="grid-bg" />

        <div className="card">
          <div className="badge">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </div>

          <h1>Admin Access</h1>
          <p className="sub">
            ParagonSoft Blogs · Operations Centre<br />
            Sign in with your Clerk account to continue.
          </p>

          {/* Clerk sign-in mounts here */}
          <div id="clerk-signin-root">
            {phase === "loading" && (
              <>
                <div className="spinner" />
                <p className="spin-label">Connecting to Clerk…</p>
              </>
            )}
            {phase === "error" && (
              <div className="error-box">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                {errMsg}
              </div>
            )}
          </div>

          <p className="foot">
            Secured by <strong>Clerk</strong> · Access is restricted to authorised users only.
          </p>
        </div>
      </div>
    </>
  );
}
