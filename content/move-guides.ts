/**
 * Plain-language explanations for every move used in workouts, written for
 * someone who has never heard of the exercise.
 */
export type MoveGuide = {
  /** What the move is, in one sentence anyone can picture. */
  what: string;
  /** What it does for you. */
  why: string;
  /** Short, ordered steps. */
  how: string[];
  /** A gentler version for beginners or tired days. */
  easier?: string;
};

const GUIDES: Record<string, MoveGuide> = {
  "jumping jacks": {
    what: "A classic warm-up jump: you hop your feet out wide while swinging your arms overhead, then hop back together.",
    why: "Raises your heart rate and warms up your whole body so the rest of the workout feels easier and safer.",
    how: [
      "Stand tall, feet together, arms by your sides.",
      "Hop your feet out wider than your hips as your arms sweep up overhead.",
      "Hop back to the start. Keep a steady, bouncy rhythm.",
    ],
    easier: "No jumping: step one foot out to the side while raising your arms, then switch sides.",
  },
  "bodyweight squats": {
    what: "Sitting down into an invisible chair and standing back up — the most important leg exercise there is.",
    why: "Strengthens your thighs and glutes, the muscles you use to stand up, climb stairs and lift things.",
    how: [
      "Stand with feet shoulder-width apart, toes turned slightly out.",
      "Push your hips back and bend your knees as if sitting into a chair. Keep your chest up.",
      "Go as low as is comfortable, then push through your whole foot to stand.",
    ],
    easier: "Squat down onto a real chair, touch it lightly, and stand back up.",
  },
  "push-up hold": {
    what: "Holding the top of a push-up: a straight, rigid body supported on your hands and toes, without moving.",
    why: "Builds the shoulder, arm and core strength you need before doing full push-ups.",
    how: [
      "Place your hands on the floor under your shoulders.",
      "Step your feet back so your body is a straight line from head to heels.",
      "Squeeze your stomach and glutes, breathe, and hold still.",
    ],
    easier: "Drop your knees to the floor, or hold the position with your hands on a table or wall.",
  },
  "glute bridge": {
    what: "Lying on your back with knees bent and lifting your hips up toward the ceiling, like making a bridge.",
    why: "Wakes up and strengthens your glutes (buttocks), which protects your lower back and knees.",
    how: [
      "Lie on your back, knees bent, feet flat and hip-width apart.",
      "Press through your heels and lift your hips until knees, hips and shoulders line up.",
      "Squeeze your glutes for a second at the top, then lower slowly.",
    ],
    easier: "Lift your hips only halfway, and pause on the floor between reps.",
  },
  "glute bridge march": {
    what: "A glute bridge where, once your hips are up, you lift one foot at a time as if marching.",
    why: "Makes each side of your glutes work on its own and trains your hips to stay level and stable.",
    how: [
      "Lift into a glute bridge and hold your hips high.",
      "Lift one foot a few centimetres off the floor, put it down, then lift the other.",
      "Keep your hips from dropping or tilting. Each lift counts as one rep.",
    ],
    easier: "Do regular glute bridges instead, keeping both feet down.",
  },
  "standing march": {
    what: "Marching on the spot, lifting each knee up in front of you.",
    why: "A gentle way to bring your heart rate down or up and practise balance between moves.",
    how: [
      "Stand tall with your hands on your hips or swinging naturally.",
      "Lift one knee to about hip height, lower it, then lift the other.",
      "Keep a relaxed, steady pace and breathe normally.",
    ],
    easier: "Lift your knees lower and hold a wall or chair for balance.",
  },
  "neck circles": {
    what: "Slowly rolling your head in a half-circle from shoulder to shoulder.",
    why: "Loosens a stiff neck — especially helpful after long hours at a desk or on your phone.",
    how: [
      "Sit or stand tall with your shoulders relaxed.",
      "Drop your chin toward your chest, then slowly roll your head toward one shoulder.",
      "Roll back through the middle to the other shoulder. Move slowly, never force it.",
    ],
    easier: "Just tilt your ear toward each shoulder and hold for a few breaths.",
  },
  "shoulder rolls": {
    what: "Lifting your shoulders up toward your ears and rolling them back and down in a circle.",
    why: "Releases tension in your upper back and shoulders and improves posture.",
    how: [
      "Stand or sit tall with arms hanging loosely.",
      "Lift both shoulders up, squeeze them back, then let them drop down.",
      "Make each circle big and slow. One full circle is one rep.",
    ],
  },
  "wall push-ups": {
    what: "A push-up done standing, with your hands on a wall instead of the floor.",
    why: "Strengthens your chest, shoulders and arms — the easiest way to learn the push-up movement.",
    how: [
      "Stand an arm's length from a wall and place your hands on it at shoulder height.",
      "Keeping your body straight, bend your elbows and bring your chest toward the wall.",
      "Push the wall away to straighten your arms.",
    ],
    easier: "Stand closer to the wall — the closer you are, the easier it gets.",
  },
  "hip opener stretch": {
    what: "A deep lunge stretch that opens up the front of your hips.",
    why: "Undoes the tightness that builds up in your hips from sitting, which can ease lower-back stiffness.",
    how: [
      "Step one foot forward into a lunge and lower your back knee to the floor.",
      "Shift your hips gently forward until you feel a stretch in the front of the back hip.",
      "Stay tall and breathe slowly. Switch legs halfway through.",
    ],
    easier: "Put a cushion under your back knee and hold a chair for balance.",
  },
  "calf raises": {
    what: "Rising up onto your tiptoes and lowering back down.",
    why: "Strengthens your calves and ankles, which helps with walking, running and balance.",
    how: [
      "Stand tall with feet hip-width apart, holding a wall if you like.",
      "Press through the balls of your feet to lift your heels as high as you can.",
      "Lower your heels slowly back to the floor.",
    ],
    easier: "Hold onto a wall or chair and rise only halfway.",
  },
  "dead bug": {
    what: "Lying on your back with arms and legs in the air (like a bug on its back) and slowly reaching opposite arm and leg away.",
    why: "Teaches your deep core muscles to keep your lower back safe while your limbs move — great for back health.",
    how: [
      "Lie on your back, arms pointing at the ceiling, knees bent at 90° above your hips.",
      "Press your lower back into the floor, then slowly lower your right arm and left leg toward the floor.",
      "Bring them back and switch sides. Move slowly and keep your back flat.",
    ],
    easier: "Move only your legs, one at a time, tapping a heel to the floor.",
  },
  plank: {
    what: "Holding your body straight and still like a plank of wood, resting on your forearms and toes.",
    why: "Strengthens your whole core — stomach, back and shoulders — which supports almost every other move.",
    how: [
      "Place your forearms on the floor with elbows under your shoulders.",
      "Step your feet back so your body forms a straight line from head to heels.",
      "Squeeze your stomach and glutes. Breathe steadily and don't let your hips sag.",
    ],
    easier: "Rest on your knees instead of your toes, keeping a straight line from head to knees.",
  },
  "bird dog": {
    what: "On hands and knees, you reach one arm forward and the opposite leg back, like a pointing hunting dog.",
    why: "Trains balance and the muscles along your spine, and teaches your core to stay steady.",
    how: [
      "Start on hands and knees, hands under shoulders, knees under hips.",
      "Slowly reach your right arm forward and left leg back until both are straight.",
      "Pause, return, then switch sides. Keep your hips level, as if balancing a cup on your back.",
    ],
    easier: "Lift just one arm or just one leg at a time.",
  },
  "side plank": {
    what: "A plank done on your side, balancing on one forearm and the side of your feet.",
    why: "Strengthens the muscles along the sides of your waist, which keep you stable when you twist and carry things.",
    how: [
      "Lie on your side with your elbow directly under your shoulder.",
      "Stack your feet, then lift your hips so your body is a straight line.",
      "Hold still and breathe. Don't let your hips drop toward the floor.",
    ],
    easier: "Bend your knees and balance on your bottom knee instead of your feet.",
  },
  "side plank reach": {
    what: "A side plank where you sweep your top arm under your body and back up toward the ceiling.",
    why: "Adds rotation to the side plank, challenging your waist, shoulders and balance together.",
    how: [
      "Get into a side plank, top arm pointing to the ceiling.",
      "Slowly thread that arm under your body, rotating your chest toward the floor.",
      "Sweep it back up to the ceiling. Keep your hips lifted the whole time.",
    ],
    easier: "Do it from your knees, or hold a regular side plank.",
  },
  "hollow hold": {
    what: "Lying on your back and lifting your shoulders and legs off the floor so your body forms a shallow banana shape.",
    why: "One of the best exercises for deep stomach strength, used by gymnasts.",
    how: [
      "Lie on your back and press your lower back firmly into the floor.",
      "Lift your head, shoulders and straight legs a little off the floor, arms reaching forward.",
      "Hold the shape and breathe. If your back lifts off the floor, bend your knees.",
    ],
    easier: "Keep your knees bent and pulled in toward your chest.",
  },
  "hollow rock": {
    what: "Holding the hollow (banana) shape and gently rocking back and forth on your back like a rocking chair.",
    why: "Builds stomach strength and control while your body is moving.",
    how: [
      "Get into a hollow hold: back pressed down, shoulders and legs lifted.",
      "Keep the shape rigid and rock gently toward your shoulders, then toward your hips.",
      "Each rock back and forth is one rep. Don't let the shape fold.",
    ],
    easier: "Do a hollow hold with bent knees instead of rocking.",
  },
  "squat to stand": {
    what: "Bending down to hold your toes, sinking into a deep squat, then standing up tall.",
    why: "Loosens your hamstrings, hips and ankles at the same time — a great warm-up for leg day.",
    how: [
      "Stand with feet shoulder-width apart and fold forward to grab your toes (bend your knees as needed).",
      "Keeping hold, drop your hips into a deep squat and lift your chest.",
      "Let go, stand up tall and reach your arms overhead.",
    ],
    easier: "Hold your shins instead of your toes and don't squat as deep.",
  },
  "reverse lunges": {
    what: "Stepping one foot backward and lowering your back knee toward the floor, then stepping back up.",
    why: "Strengthens each leg on its own and is gentler on the knees than stepping forward.",
    how: [
      "Stand tall with feet hip-width apart.",
      "Step one foot back and bend both knees until your back knee hovers near the floor.",
      "Push through your front heel to return. Alternate legs.",
    ],
    easier: "Take a smaller step and only lower halfway; hold a chair for balance.",
  },
  "sumo squat pulse": {
    what: "A wide-stance squat where you stay low and make small up-and-down bounces.",
    why: "Keeps your inner thighs and glutes working without a break, building endurance.",
    how: [
      "Stand with feet wide and toes turned out.",
      "Squat down until your thighs are close to parallel with the floor.",
      "Stay low and pulse up and down a few centimetres. Keep your chest up.",
    ],
    easier: "Don't squat as deep, and stand up fully for a breath when you need to.",
  },
  "single-leg balance": {
    what: "Standing on one leg and holding still.",
    why: "Improves balance and strengthens the small stabilising muscles around your ankle, knee and hip.",
    how: [
      "Stand tall and shift your weight onto one foot.",
      "Lift the other foot off the floor, knee slightly bent.",
      "Fix your eyes on a point ahead and hold. Hands can go on your hips.",
    ],
    easier: "Rest a fingertip on a wall, or keep your raised toes lightly touching the floor.",
  },
  "good mornings": {
    what: "With hands behind your head, you bow forward from your hips with a flat back, then stand up — like a polite bow.",
    why: "Strengthens your hamstrings and lower back and teaches the hip hinge used when lifting things safely.",
    how: [
      "Stand with feet hip-width apart, hands lightly behind your head, knees soft.",
      "Push your hips back and tip your chest forward with a flat back.",
      "When you feel a stretch in the back of your legs, squeeze your glutes to stand up.",
    ],
    easier: "Cross your hands over your chest and bow only halfway.",
  },
  "hip hinge": {
    what: "Bending forward by pushing your hips backward while keeping your back flat — the move behind every safe lift.",
    why: "Teaches you to lift with your legs and hips instead of your lower back.",
    how: [
      "Stand tall, feet hip-width apart, hands on your hips, knees slightly bent.",
      "Push your hips back as if closing a car door with your bottom, letting your chest tip forward.",
      "Keep your back flat. Stand up by squeezing your glutes and driving your hips forward.",
    ],
    easier: "Stand with your back to a wall a little in front of you and practise tapping it with your hips.",
  },
  "single-leg rdl": {
    what: "Balancing on one leg and tipping forward with a flat back while the other leg reaches back, like a seesaw.",
    why: "Strengthens the back of each leg and your glutes while training balance.",
    how: [
      "Stand on one leg with a soft knee.",
      "Tip your chest forward as the other leg lifts straight back behind you. Keep your hips level.",
      "Go until your body is nearly parallel to the floor, then return to standing.",
    ],
    easier: "Keep your back toes lightly touching the floor, or hold a chair.",
  },
  "push-ups": {
    what: "Lowering your chest to the floor and pushing back up, with your body held straight on your hands and toes.",
    why: "Builds strength in your chest, shoulders, arms and core all at once.",
    how: [
      "Start in a high plank: hands a little wider than your shoulders, body straight.",
      "Bend your elbows (angled back, not out to the sides) to lower your chest toward the floor.",
      "Push the floor away to straighten your arms. Keep your hips in line.",
    ],
    easier: "Do them with your knees on the floor, or with your hands on a table or wall.",
  },
  "pike push-ups": {
    what: "A push-up done with your hips raised high so your body makes an upside-down V.",
    why: "Shifts the work onto your shoulders — a bodyweight way to build shoulder strength.",
    how: [
      "From a push-up position, walk your feet in and lift your hips high.",
      "Bend your elbows to lower the top of your head toward the floor between your hands.",
      "Push back up to straight arms.",
    ],
    easier: "Lower only a little, or hold the upside-down V shape without bending your arms.",
  },
  "tricep dips": {
    what: "Sitting on the edge of a chair, sliding off and bending your elbows to lower your body, then pushing back up.",
    why: "Strengthens the back of your arms (triceps), which you use whenever you push something.",
    how: [
      "Sit on the edge of a sturdy chair, hands gripping the edge beside your hips.",
      "Slide your hips off the chair and bend your elbows straight back to lower yourself.",
      "Press through your palms to straighten your arms. Keep your shoulders away from your ears.",
    ],
    easier: "Bend your knees and keep your feet close to the chair, and lower only a little.",
  },
  "plank shoulder tap": {
    what: "Holding a high plank and lifting one hand at a time to tap the opposite shoulder.",
    why: "Strengthens your core and shoulders while teaching your hips not to rock.",
    how: [
      "Start in a high plank on your hands, feet a little wider than usual.",
      "Lift one hand and tap the opposite shoulder, then put it down.",
      "Switch hands. Keep your hips as still as possible. Each tap is one rep.",
    ],
    easier: "Do the taps with your knees on the floor.",
  },
  "superman hold": {
    what: "Lying face down and lifting your arms, chest and legs off the floor at the same time, like Superman flying.",
    why: "Strengthens the muscles along your back that keep you upright and help your posture.",
    how: [
      "Lie on your stomach with arms stretched out in front.",
      "Lift your arms, chest and legs a few centimetres off the floor.",
      "Hold, looking at the floor to keep your neck relaxed. Breathe steadily.",
    ],
    easier: "Lift only your arms and chest, or only your legs.",
  },
  "prone y raise": {
    what: "Lying face down and lifting your arms off the floor in a Y shape, thumbs pointing up.",
    why: "Strengthens the small muscles between your shoulder blades that pull your shoulders back for better posture.",
    how: [
      "Lie on your stomach with your arms stretched overhead in a Y, thumbs up.",
      "Squeeze your shoulder blades together and lift your arms a few centimetres.",
      "Pause, then lower slowly. Keep your forehead down.",
    ],
    easier: "Bend your elbows into a W shape and lift from there.",
  },
  "jump squats": {
    what: "A squat where you jump into the air as you stand up, then land softly into the next squat.",
    why: "Builds explosive leg power and gets your heart pumping.",
    how: [
      "Squat down with feet shoulder-width apart.",
      "Drive up hard and jump, swinging your arms.",
      "Land softly on the balls of your feet and sink straight into the next squat.",
    ],
    easier: "Do fast bodyweight squats rising onto your toes, without leaving the floor.",
  },
  "walking lunges": {
    what: "Taking long steps forward and lowering your back knee toward the floor with each step.",
    why: "Strengthens your legs and glutes one side at a time and improves balance.",
    how: [
      "Step forward with one leg and lower until both knees bend to about 90°.",
      "Keep your chest up and your front knee over your ankle.",
      "Push off and bring your back foot forward into the next lunge. Each step is one rep.",
    ],
    easier: "Step back to the start after each lunge instead of walking, and hold a wall.",
  },
  "wall sit": {
    what: "Leaning your back against a wall and sliding down until you're sitting on an invisible chair — then holding.",
    why: "Builds thigh strength and endurance without any impact on your joints.",
    how: [
      "Stand with your back flat against a wall, feet about half a step in front of you.",
      "Slide down until your knees are bent, ideally to about 90°.",
      "Hold still with your back on the wall and breathe.",
    ],
    easier: "Don't slide as low — a higher position is much easier.",
  },
  "lateral lunges": {
    what: "Stepping out wide to one side and bending that knee while the other leg stays straight.",
    why: "Works your legs side-to-side, strengthening inner thighs and glutes and loosening your hips.",
    how: [
      "Stand with feet together.",
      "Take a big step to the side, push your hips back and bend that knee. Keep the other leg straight.",
      "Push off to return to standing. Alternate sides.",
    ],
    easier: "Take a smaller step and bend the knee only a little.",
  },
  burpees: {
    what: "A full-body move: squat down, jump your feet back to a plank, jump them in, then jump up.",
    why: "Works almost every muscle and pushes your heart rate up fast — a great calorie burner.",
    how: [
      "From standing, squat down and put your hands on the floor.",
      "Jump or step your feet back into a plank, then jump or step them back in.",
      "Stand up and jump, reaching your arms overhead.",
    ],
    easier: "Step back and forward one foot at a time, and skip the jump at the top.",
  },
  "mountain climbers": {
    what: "In a high plank, you drive your knees toward your chest one at a time, like running while in a push-up position.",
    why: "Raises your heart rate while strengthening your core and shoulders.",
    how: [
      "Start in a high plank, hands under your shoulders.",
      "Drive one knee toward your chest, then switch legs quickly.",
      "Keep your hips low and level and breathe rhythmically.",
    ],
    easier: "Step each knee in slowly instead of running, or put your hands on a bench.",
  },
  "squat thrusters": {
    what: "A squat followed by an explosive stand where you push your arms straight up overhead.",
    why: "Links your legs, core and shoulders in one powerful move and gets your heart rate up.",
    how: [
      "Hold your hands at your shoulders like you're carrying a bar.",
      "Squat down, then drive up quickly.",
      "As you stand, push your hands straight up overhead. Bring them back down as you squat again.",
    ],
    easier: "Squat less deep and move at a slower pace.",
  },
  "high knees": {
    what: "Running on the spot while lifting your knees up high in front of you.",
    why: "A quick cardio burst that raises your heart rate and works your hips and core.",
    how: [
      "Stand tall with arms bent at your sides.",
      "Run on the spot, driving each knee up toward hip height.",
      "Pump your arms and land lightly on the balls of your feet.",
    ],
    easier: "March with high knees instead of running.",
  },
  "push-up to down dog": {
    what: "A push-up, then pushing your hips up and back into an upside-down V (the yoga 'downward dog').",
    why: "Combines upper-body strength with a stretch for your shoulders, hamstrings and calves.",
    how: [
      "Do one push-up from a high plank.",
      "Push your hips up and back so your body forms an upside-down V, heels reaching down.",
      "Shift forward back into the plank for the next rep.",
    ],
    easier: "Do the push-up on your knees, then lift into the V.",
  },
  "world's greatest stretch": {
    what: "A lunge where you place one hand down and twist the other arm up to the ceiling — it stretches nearly everything.",
    why: "Opens your hips, hamstrings, chest and upper back in one move — perfect after sitting.",
    how: [
      "Step into a long lunge and put both hands on the floor inside your front foot.",
      "Rotate your chest and reach the arm on the front-leg side up to the ceiling.",
      "Bring it down and switch sides when you're halfway through.",
    ],
    easier: "Put your back knee on the floor.",
  },
  "cat-cow": {
    what: "On hands and knees, you slowly arch your back up like a scared cat, then let it dip down like a cow.",
    why: "Gently moves every part of your spine to ease stiffness and back tension.",
    how: [
      "Start on hands and knees, hands under shoulders, knees under hips.",
      "Breathe in: let your belly drop and lift your chest and gaze (cow).",
      "Breathe out: round your back up and tuck your chin (cat). Flow slowly with your breath.",
    ],
  },
  "thoracic rotation": {
    what: "On hands and knees, you put one hand behind your head and rotate that elbow up toward the ceiling.",
    why: "Loosens your upper back so you can twist and reach more easily, and improves posture.",
    how: [
      "Start on hands and knees and place one hand behind your head.",
      "Bring that elbow down toward your other wrist.",
      "Then rotate it up toward the ceiling, following it with your eyes. Each up-and-down is one rep.",
    ],
    easier: "Do it sitting in a chair, arms crossed over your chest, rotating side to side.",
  },
  "deep squat hold": {
    what: "Sinking all the way down into a deep squat and resting there.",
    why: "Improves the mobility of your hips, knees and ankles — the way people naturally sit in many cultures.",
    how: [
      "Stand with feet a little wider than shoulder-width, toes out.",
      "Lower down as deep as you can, keeping your heels on the floor if possible.",
      "Press your elbows gently against your inner knees and breathe slowly.",
    ],
    easier: "Hold onto a door frame or table, or put a folded towel under your heels.",
  },
  "forward fold": {
    what: "Standing and folding forward from your hips, letting your upper body hang toward the floor.",
    why: "Stretches the backs of your legs and releases tension in your back and neck.",
    how: [
      "Stand with feet hip-width apart, knees soft.",
      "Bend forward from your hips and let your head and arms hang heavy.",
      "Breathe slowly. Bend your knees as much as you need.",
    ],
    easier: "Rest your hands on your shins or a chair instead of reaching the floor.",
  },
  "copenhagen prep": {
    what: "A side plank variation with your top leg resting on a bench or sofa, which makes your inner thigh do the work.",
    why: "Strengthens the inner thigh muscles that protect your groin and knees.",
    how: [
      "Lie on your side next to a sofa or bench and rest your top knee on it.",
      "Prop yourself up on your forearm and lift your hips so your body is straight.",
      "Hold, then switch sides halfway through.",
    ],
    easier: "Keep your bottom knee lightly on the floor for support.",
  },
  "bear crawl hold": {
    what: "On hands and knees, you lift your knees just a few centimetres off the floor and hold.",
    why: "Fires up your core and shoulders together with very little strain on your back.",
    how: [
      "Start on hands and knees, hands under shoulders, knees under hips.",
      "Tuck your toes and lift your knees about 3 cm off the floor.",
      "Keep your back flat and hold still while breathing.",
    ],
    easier: "Lift your knees for a few seconds, rest, and lift again.",
  },
  "child's pose": {
    what: "Kneeling and sitting back on your heels, then folding forward with your arms stretched out and forehead down.",
    why: "A restful stretch for your back, hips and shoulders that calms your breathing.",
    how: [
      "Kneel on the floor with big toes touching and knees apart.",
      "Sit your hips back toward your heels and walk your hands forward.",
      "Rest your forehead down and breathe slowly into your back.",
    ],
    easier: "Put a pillow under your hips or forehead.",
  },
  "figure-4 stretch": {
    what: "Lying on your back, crossing one ankle over the opposite knee to make a '4' shape, then pulling your legs in.",
    why: "Stretches the deep muscles of your hip and buttock, which often tighten from sitting.",
    how: [
      "Lie on your back with knees bent.",
      "Cross one ankle over the other knee.",
      "Reach through and pull the bottom thigh toward your chest until you feel a stretch. Breathe.",
    ],
    easier: "Keep your bottom foot on the floor and just gently press the top knee away.",
  },
  "supine twist": {
    what: "Lying on your back and letting both bent knees drop to one side while your shoulders stay down.",
    why: "Gently releases your lower back and spine — a relaxing way to end a session.",
    how: [
      "Lie on your back, knees bent, arms out to the sides.",
      "Let both knees fall slowly to one side while your shoulders stay on the floor.",
      "Breathe and relax. Switch sides halfway through.",
    ],
  },
  "box breathing": {
    what: "Breathing in a slow, even 'box' pattern: in for 4, hold for 4, out for 4, hold for 4.",
    why: "Calms your nervous system and brings your heart rate down after training.",
    how: [
      "Sit or lie comfortably and close your eyes if you like.",
      "Breathe in through your nose for 4 counts, then hold for 4.",
      "Breathe out slowly for 4 counts, then hold for 4. Repeat.",
    ],
  },
  "cool-down stretch": {
    what: "A gentle, easy stretch of whatever feels tight to finish your workout.",
    why: "Helps your heart rate settle and your muscles relax so you recover better.",
    how: [
      "Stand or sit comfortably.",
      "Slowly stretch your legs, hips, arms and shoulders, holding each stretch for a few breaths.",
      "Never bounce or push into pain — it should feel relieving.",
    ],
  },
};

const ALIASES: Record<string, string> = {
  squats: "bodyweight squats",
  squat: "bodyweight squats",
  lunges: "walking lunges",
  "cat-cow stretch": "cat-cow",
  "dead bug slow": "dead bug",
  "calf raise burn": "calf raises",
  "push-up": "push-ups",
};

export type ResolvedGuide = {
  guide: MoveGuide;
  /** Set for one-sided moves named with a trailing L / R. */
  side: "left" | "right" | null;
};

/** Finds the guide for a workout step name like "Side Plank L" or "Tricep Dips (chair)". */
export function getMoveGuide(name: string): ResolvedGuide | null {
  let key = name.toLowerCase().replace(/\([^)]*\)/g, "").trim();
  let side: ResolvedGuide["side"] = null;
  const sideMatch = key.match(/\s+(l|r)$/);
  if (sideMatch) {
    side = sideMatch[1] === "l" ? "left" : "right";
    key = key.slice(0, sideMatch.index).trim();
  }
  key = ALIASES[key] ?? key;
  const guide = GUIDES[key];
  return guide ? { guide, side } : null;
}

export const FALLBACK_GUIDE: MoveGuide = {
  what: "A bodyweight move done at your own pace.",
  why: "Builds strength and control as part of today's session.",
  how: [
    "Set up in a stable position.",
    "Move slowly and with control through a comfortable range.",
    "Breathe steadily and stop if anything feels sharp or painful.",
  ],
};
