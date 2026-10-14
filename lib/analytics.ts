import type { Dict, OverridedMixpanel } from "mixpanel-browser";

const TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;
const IS_PROD = process.env.NODE_ENV === "production";
const MAX_QUEUED = 100;

/** sessionStorage key: set before an OAuth redirect, read once the user is back signed in. */
export const OAUTH_PENDING_KEY = "pp-oauth-pending";

type Call = (mp: OverridedMixpanel) => void;

let client: OverridedMixpanel | null = null;
/** Calls made while the SDK is still downloading; `null` when analytics is off or already loaded. */
let queue: Call[] | null = null;

/** Events from local dev are logged to the console instead of polluting real data. */
function devLog(...args: unknown[]) {
  if (!IS_PROD && typeof window !== "undefined") console.debug("[analytics]", ...args);
}

function safely(fn: () => void) {
  try {
    fn();
  } catch {
    // Tracking must never break the app.
  }
}

function run(call: Call) {
  if (client) {
    const mp = client;
    safely(() => call(mp));
  } else if (queue && queue.length < MAX_QUEUED) {
    queue.push(call);
  }
}

/** Loads the SDK off the critical path; anything tracked before it arrives is replayed. */
export function initAnalytics() {
  if (client || queue || !TOKEN || !IS_PROD || typeof window === "undefined") return;
  queue = [];
  import("mixpanel-browser")
    .then(({ default: mp }) => {
      mp.init(TOKEN, {
        persistence: "localStorage",
        record_sessions_percent: 0,
        autocapture: {
          pageview: "url-with-path",
          click: true,
          capture_text_content: true,
          submit: true,
          input: false,
          scroll: false,
        },
      });
      client = mp;
      const pending = queue ?? [];
      queue = null;
      for (const call of pending) safely(() => call(mp));
    })
    .catch(() => {
      queue = null;
    });
}

export function track(event: string, props?: Dict) {
  devLog(event, props ?? {});
  run((mp) => mp.track(event, props));
}

export type UserTraits = {
  email?: string | null;
  name?: string | null;
  username?: string | null;
  sign_in_method?: string;
  goal?: string | null;
  fitness_level?: string | null;
  training_days?: number | null;
  level?: number;
  xp?: number;
  streak?: number;
  total_workout_minutes?: number;
  workouts_completed?: number;
};

function toPeople(traits: UserTraits): Dict {
  const { email, name, ...rest } = traits;
  const out: Dict = {};
  if (email) out.$email = email;
  if (name) out.$name = name;
  for (const [key, value] of Object.entries(rest)) {
    if (value !== undefined && value !== null) out[key] = value;
  }
  return out;
}

export function identifyUser(id: string, traits: UserTraits = {}) {
  devLog("identify", id, traits);
  run((mp) => {
    if (mp.get_distinct_id() !== id) mp.identify(id);
    mp.people.set(toPeople(traits));
  });
}

export function setUserTraits(traits: UserTraits) {
  devLog("traits", traits);
  run((mp) => mp.people.set(toPeople(traits)));
}

export function resetUser() {
  devLog("reset");
  run((mp) => mp.reset());
}
