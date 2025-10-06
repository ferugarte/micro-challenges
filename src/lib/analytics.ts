type EventName =
  | "onboarding_completed"
  | "activity_start" | "activity_end"
  | "challenge_start" | "challenge_end"
  | "paywall_view" | "trial_start" | "subscribe_click" | "subscribe_success" | "subscribe_fail";

export function track(event: EventName, payload: Record<string, any> = {}) {
  try {
    const rec = { t: Date.now(), event, ...payload };
    // por ahora: console + localStorage; luego envía a tu BE
    console.log("[analytics]", rec);
    const key = "apps_ninos_events";
    const arr = JSON.parse(localStorage.getItem(key) ?? "[]");
    arr.push(rec);
    localStorage.setItem(key, JSON.stringify(arr));
  } catch(e){}
}