import Link from "next/link";
import { Card } from "@/components/ui/card";

export function AuthShell({ mode = "login", siteName, siteTagline, siteDescription, logoUrl, iconUrl, children }) {
  const isLogin = mode === "login";
  const badgeText = isLogin ? "Welcome Back" : "Get Started";
  const heading = isLogin ? `Login to ${siteName}` : `Create your ${siteName} account`;
  const supportingText = isLogin
    ? "Use your existing credentials to continue into your finance workspace."
    : "Set up your account with the same secure registration flow and start from a cleaner, calmer onboarding screen.";
  const sideActionHref = isLogin ? "/register" : "/login";
  const sideActionLabel = isLogin ? "Create account" : "Sign in";
  const footerPrompt = isLogin ? "Don't have an account yet?" : "Already have an account?";
  const footerHref = isLogin ? "/register" : "/login";
  const footerLabel = isLogin ? "Register here" : "Login here";
  const brandAsset = logoUrl || iconUrl || "";
  const hasWideLogo = Boolean(logoUrl);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#FFFFFF] px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(191,231,214,0.45),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(15,122,58,0.1),transparent_28%),linear-gradient(180deg,#FFFFFF_0%,rgba(191,231,214,0.22)_100%)]" />
      <div className="pointer-events-none absolute left-[-5rem] top-[-5rem] h-52 w-52 rounded-full bg-[#BFE7D6]/55 blur-3xl sm:h-72 sm:w-72" />
      <div className="pointer-events-none absolute bottom-[-6rem] right-[-4rem] h-56 w-56 rounded-full bg-[#0F7A3A]/10 blur-3xl sm:h-80 sm:w-80" />

      <Card className="relative w-full max-w-6xl overflow-hidden rounded-[2rem] border-[#0F7A3A]/15 bg-[#FFFFFF] shadow-[0_28px_90px_rgba(7,92,43,0.16)] lg:grid lg:grid-cols-[1.02fr_0.98fr]">
        <section className="relative min-h-[38svh] overflow-hidden bg-[linear-gradient(160deg,#108A45_0%,#0F7A3A_52%,#075C2B_100%)] px-6 pb-16 pt-8 text-[#FFFFFF] sm:px-8 sm:pb-20 sm:pt-10 lg:flex lg:min-h-[760px] lg:flex-col lg:justify-between lg:px-10 lg:py-12">
          <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-[#FFFFFF]/12 sm:h-44 sm:w-44 lg:-right-16 lg:-top-12 lg:h-56 lg:w-56" />
          <div className="pointer-events-none absolute -left-24 -top-28 h-52 w-52 rounded-full bg-[#FFFFFF] opacity-95 sm:-left-28 sm:-top-32 sm:h-64 sm:w-64 lg:hidden" />
          <div className="pointer-events-none absolute -right-16 top-20 h-32 w-32 rounded-full bg-[#FFFFFF]/10 sm:h-40 sm:w-40 lg:hidden" />
          <div className="pointer-events-none absolute bottom-8 left-6 h-16 w-16 rounded-full border border-[#FFFFFF]/18 bg-[#FFFFFF]/8 sm:h-20 sm:w-20 lg:hidden" />
          <div className="pointer-events-none absolute right-8 top-1/2 h-24 w-24 -translate-y-1/2 rounded-full border border-[#FFFFFF]/14 bg-[#FFFFFF]/10 blur-[2px]" />
          <div className="pointer-events-none absolute bottom-[-2.75rem] left-1/2 h-28 w-[120%] -translate-x-1/2 rounded-t-[100%] bg-[#FFFFFF] lg:hidden" />
          <div className="pointer-events-none absolute bottom-[-5rem] left-[-2rem] hidden h-72 w-72 rounded-[44%] border border-[#FFFFFF]/16 bg-[#FFFFFF]/8 lg:block" />

          <div className="relative z-10 mx-auto flex w-full max-w-md flex-col items-center text-center lg:mx-0 lg:max-w-none lg:items-start lg:text-left">
            <div className="flex flex-col items-center gap-3 lg:flex-row lg:items-center">
              <div className={`flex items-center justify-center overflow-hidden border border-[#FFFFFF]/20 bg-[#FFFFFF]/14 shadow-[0_12px_32px_rgba(0,0,0,0.12)] ${hasWideLogo ? "h-14 rounded-[1.15rem] px-4" : "h-14 w-14 rounded-full"}`}>
                {brandAsset ? (
                  <img
                    src={brandAsset}
                    alt={siteName || "App logo"}
                    className={hasWideLogo ? "max-h-8 w-auto max-w-[8.5rem] object-contain" : "h-8 w-8 object-contain"}
                  />
                ) : (
                  <span className="text-lg font-semibold">{siteName?.slice(0, 1)?.toUpperCase() || "F"}</span>
                )}
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-[#FFFFFF]/72">{badgeText}</p>
                <p className="mt-1 text-lg font-semibold">{siteName}</p>
              </div>
            </div>

            <div className="mt-7 max-w-sm sm:mt-8 lg:mt-10 lg:max-w-md">
              <p className="text-[1.7rem] font-semibold leading-tight sm:text-[2rem] lg:text-[2.75rem]">{siteTagline}</p>
              <p className="mt-3 hidden text-sm leading-6 text-[#FFFFFF]/84 sm:text-base sm:leading-7 lg:mt-4 lg:block">{siteDescription}</p>
            </div>
          </div>

          <div className="relative z-10 mt-7 hidden rounded-[2rem] border border-[#FFFFFF]/18 bg-[#075C2B]/28 p-5 shadow-[0_16px_40px_rgba(0,0,0,0.14)] backdrop-blur-sm sm:p-6 lg:mt-12 lg:block">
            <p className="text-sm leading-7 text-[#FFFFFF]/84">{supportingText}</p>
            <Link
              href={sideActionHref}
              className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full border border-[#FFFFFF]/18 bg-[linear-gradient(135deg,#108A45_0%,#075C2B_100%)] px-6 text-sm font-semibold text-[#FFFFFF] shadow-[0_12px_28px_rgba(0,0,0,0.16)] transition hover:opacity-95"
            >
              {sideActionLabel}
            </Link>
          </div>
        </section>

        <section className="relative -mt-10 flex items-center justify-center px-5 pb-8 pt-3 sm:-mt-12 sm:px-8 sm:pb-10 sm:pt-4 lg:mt-0 lg:px-10 lg:py-12">
          <div className="pointer-events-none absolute left-0 top-0 h-28 w-28 rounded-br-[4rem] bg-[#BFE7D6]/40 lg:hidden" />
          <div className="w-full max-w-lg">
            <div className="rounded-[2rem] bg-[#FFFFFF] p-2 shadow-[0_18px_45px_rgba(7,92,43,0.08)] sm:p-4 lg:shadow-none">
              <div className="mx-auto max-w-md">
                <div className="text-center">
                  <p className="text-xs uppercase tracking-[0.28em] text-[#6B7280]">{isLogin ? "Secure Access" : "New Account"}</p>
                  <h2 className="mt-3 text-3xl font-semibold leading-tight text-[#1F2937] sm:text-[2.1rem]">{heading}</h2>
                  <p className="mt-3 hidden text-sm leading-7 text-[#6B7280] lg:block">{supportingText}</p>
                </div>

                <div className="mt-6 hidden lg:hidden">
                  <Link
                    href={sideActionHref}
                    className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#0F7A3A]/18 bg-[linear-gradient(135deg,#108A45_0%,#075C2B_100%)] px-5 text-sm font-semibold text-[#FFFFFF] shadow-[0_10px_24px_rgba(7,92,43,0.12)] transition hover:opacity-95"
                  >
                    {sideActionLabel}
                  </Link>
                </div>

                <div className="mt-8">{children}</div>

                <p className="mt-6 text-sm text-[#6B7280]">
                  {footerPrompt}{" "}
                  <Link href={footerHref} className="font-semibold text-[#075C2B] transition hover:text-[#0F7A3A]">
                    {footerLabel}
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </section>
      </Card>
    </main>
  );
}
