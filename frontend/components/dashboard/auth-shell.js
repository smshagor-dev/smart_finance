import Link from "next/link";
import { Card } from "@/components/ui/card";
import { resolveAssetUrl } from "@/lib/uploads";

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
  const brandAsset = resolveAssetUrl(iconUrl) || resolveAssetUrl(logoUrl || "");
  const hasWideLogo = false;

  return (
    <main className="auth-shell relative flex min-h-[100dvh] items-center justify-center overflow-x-hidden overflow-y-auto bg-[#FFFFFF] px-3 py-4 min-[390px]:px-4 sm:px-6 sm:py-8 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(191,231,214,0.45),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(15,122,58,0.1),transparent_28%),linear-gradient(180deg,#FFFFFF_0%,rgba(191,231,214,0.22)_100%)]" />
      <div className="pointer-events-none absolute left-[-5rem] top-[-5rem] h-52 w-52 rounded-full bg-[#BFE7D6]/55 blur-3xl sm:h-72 sm:w-72" />
      <div className="pointer-events-none absolute bottom-[-6rem] right-[-4rem] h-56 w-56 rounded-full bg-[#0F7A3A]/10 blur-3xl sm:h-80 sm:w-80" />

      <Card className="relative my-0 w-full max-w-[92vw] overflow-hidden rounded-[1.9rem] border-[#0F7A3A]/15 bg-[#FFFFFF] shadow-[0_28px_90px_rgba(7,92,43,0.16)] min-[390px]:max-w-[25rem] min-[430px]:max-w-[27rem] sm:my-6 sm:max-w-3xl sm:rounded-[2.1rem] lg:grid lg:max-w-6xl lg:grid-cols-[1.02fr_0.98fr]">
        <section className="auth-hero relative min-h-[245px] overflow-hidden bg-[linear-gradient(160deg,#108A45_0%,#0F7A3A_52%,#075C2B_100%)] px-5 pb-[4.5rem] pt-6 text-[#FFFFFF] min-[390px]:min-h-[260px] min-[390px]:px-6 min-[390px]:pb-20 min-[430px]:min-h-[276px] sm:px-8 sm:pb-24 sm:pt-8 lg:flex lg:min-h-[760px] lg:flex-col lg:justify-between lg:px-10 lg:py-12">
          <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-[#FFFFFF]/12 sm:h-44 sm:w-44 lg:-right-16 lg:-top-12 lg:h-56 lg:w-56" />
          <div className="pointer-events-none absolute -left-24 -top-28 h-52 w-52 rounded-full bg-[#FFFFFF] opacity-95 sm:-left-28 sm:-top-32 sm:h-64 sm:w-64 lg:hidden" />
          <div className="pointer-events-none absolute -right-16 top-20 h-32 w-32 rounded-full bg-[#FFFFFF]/10 sm:h-40 sm:w-40 lg:hidden" />
          <div className="pointer-events-none absolute bottom-8 left-6 h-16 w-16 rounded-full border border-[#FFFFFF]/18 bg-[#FFFFFF]/8 sm:h-20 sm:w-20 lg:hidden" />
          <div className="pointer-events-none absolute right-8 top-1/2 h-24 w-24 -translate-y-1/2 rounded-full border border-[#FFFFFF]/14 bg-[#FFFFFF]/10 blur-[2px]" />
          <div className="pointer-events-none absolute bottom-[-2.35rem] left-1/2 h-24 w-[116%] -translate-x-1/2 rounded-t-[100%] bg-[#FFFFFF] min-[390px]:bottom-[-2.6rem] min-[390px]:h-28 min-[390px]:w-[118%] lg:hidden" />
          <div className="pointer-events-none absolute bottom-[-5rem] left-[-2rem] hidden h-72 w-72 rounded-[44%] border border-[#FFFFFF]/16 bg-[#FFFFFF]/8 lg:block" />

          <div className="relative z-10 mx-auto flex w-full max-w-md flex-col items-center text-center lg:mx-0 lg:max-w-none lg:items-start lg:text-left">
            <div className="flex flex-col items-center gap-3.5 lg:flex-row lg:items-center">
              <div
                className={`flex items-center justify-center overflow-hidden border border-[#FFFFFF]/18 bg-[#FFFFFF]/14 shadow-[0_12px_32px_rgba(0,0,0,0.12)] ${
                  hasWideLogo
                    ? "h-[4.5rem] rounded-[1.35rem] px-5 min-[390px]:h-[4.8rem] min-[390px]:px-[1.35rem] lg:h-14 lg:rounded-[1.15rem] lg:px-4"
                    : "h-[4.5rem] w-[4.5rem] rounded-[1.35rem] min-[390px]:h-[4.8rem] min-[390px]:w-[4.8rem] lg:h-14 lg:w-14 lg:rounded-full"
                }`}
              >
                {brandAsset ? (
                  <img
                    src={brandAsset}
                    alt={siteName || "App logo"}
                    className={hasWideLogo ? "max-h-11 w-auto max-w-[5.6rem] object-contain min-[390px]:max-w-[5.9rem] lg:max-h-8 lg:max-w-[8.5rem]" : "h-10 w-10 object-contain min-[390px]:h-11 min-[390px]:w-11 lg:h-8 lg:w-8"}
                  />
                ) : (
                  <span className="text-2xl font-semibold min-[390px]:text-[1.65rem] lg:text-lg">{siteName?.slice(0, 1)?.toUpperCase() || "F"}</span>
                )}
              </div>
              <div className="hidden lg:block">
                <p className="text-[0.78rem] uppercase tracking-[0.32em] text-[#FFFFFF]/78 min-[390px]:text-[0.82rem] lg:text-xs">{badgeText}</p>
                <p className="mt-1.5 text-[1.2rem] font-semibold tracking-[0.01em] text-[#FFFFFF] min-[390px]:text-[1.3rem] lg:mt-1 lg:text-lg">{siteName}</p>
              </div>
            </div>

            <div className="mt-5 max-w-[19rem] min-[390px]:mt-6 min-[390px]:max-w-[21rem] lg:mt-10 lg:max-w-md">
              <p className="text-[1.25rem] font-semibold leading-[1.2] text-[#FFFFFF] min-[390px]:text-[1.34rem] min-[430px]:text-[1.375rem] lg:text-[2rem]">{siteName}</p>
              <p className="mt-2.5 text-[0.98rem] font-normal leading-6 text-[#FFFFFF]/88 min-[390px]:text-[1.02rem] min-[430px]:text-[1.05rem] lg:text-[2.75rem] lg:font-bold lg:leading-[1.02] lg:tracking-[-0.03em] lg:text-[#FFFFFF]">{siteTagline}</p>
              <p className="mt-3 hidden text-sm leading-6 text-[#FFFFFF]/84 lg:block lg:text-base lg:leading-7">{siteDescription}</p>
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

        <section className="relative -mt-16 flex items-center justify-center px-0 pb-7 pt-0 min-[390px]:-mt-[4.5rem] min-[390px]:pb-8 min-[430px]:-mt-[4.75rem] sm:-mt-16 sm:px-6 sm:pb-10 lg:mt-0 lg:px-10 lg:py-12">
          <div className="pointer-events-none absolute left-0 top-0 h-28 w-28 rounded-br-[4rem] bg-[#BFE7D6]/40 lg:hidden" />
          <div className="w-full max-w-[92vw] min-[390px]:max-w-[24.5rem] min-[430px]:max-w-[26.5rem] sm:max-w-lg">
            <div className="auth-form-surface rounded-[1.8rem] bg-[#FFFFFF] px-4 pb-5 pt-4 shadow-[0_18px_45px_rgba(7,92,43,0.08)] min-[390px]:rounded-[2rem] min-[390px]:px-5 min-[390px]:pb-6 min-[390px]:pt-5 sm:p-4 lg:shadow-none">
              <div className="mx-auto max-w-md">
                <div className="text-center">
                  <p className="hidden text-[0.76rem] uppercase tracking-[0.28em] text-[#6B7280] lg:block lg:text-[0.8rem]">{isLogin ? "Secure Access" : "New Account"}</p>
                  <h2 className="mt-2.5 hidden text-[1.75rem] font-semibold leading-[1.08] tracking-[-0.03em] text-[#1F2937] lg:block lg:text-[2.1rem]">{heading}</h2>
                  <p className="mt-2.5 hidden text-sm leading-6 text-[#6B7280] lg:mt-3 lg:block lg:leading-7">{supportingText}</p>
                </div>

                <div className="mt-6 hidden lg:hidden">
                  <Link
                    href={sideActionHref}
                    className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#0F7A3A]/18 bg-[linear-gradient(135deg,#108A45_0%,#075C2B_100%)] px-5 text-sm font-semibold text-[#FFFFFF] shadow-[0_10px_24px_rgba(7,92,43,0.12)] transition hover:opacity-95"
                  >
                    {sideActionLabel}
                  </Link>
                </div>

                <div className="mt-6 min-[390px]:mt-7">{children}</div>

                <p className="mt-6 px-1 pb-1 text-center text-sm leading-6 text-[#6B7280] min-[390px]:mt-7">
                  {footerPrompt}{" "}
                  <Link href={footerHref} className="font-semibold text-[#075C2B] transition hover:text-[#0F7A3A]">
                    {footerLabel}
                  </Link>
                </p>
                <div className="mt-2 flex items-center justify-center gap-3 text-xs text-[#6B7280]">
                  <span className="h-px w-8 bg-[#0F7A3A]/12" />
                  <Link href="/policy" className="font-medium text-[#075C2B] transition hover:text-[#0F7A3A]">
                    Policy
                  </Link>
                  <span className="h-px w-8 bg-[#0F7A3A]/12" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </Card>
    </main>
  );
}
