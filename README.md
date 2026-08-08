# Path Weaver

PathWise is an interactive decision-making companion.

People constantly face decisions where there isn't one obvious correct answer:

Should I change schools?

Should I take a gap year?

Which university should I choose?

Should I move to another city?

Should I accept this opportunity?

Should I start a business?

Should I choose one career over another?

Normal AI tools usually respond with a wall of text:

"Here are the pros and cons..."

PathWise does something fundamentally different.

It maps the decision.

The user gives PathWise a decision and explains their situation.

PathWise turns that into an interactive visual map showing:

Decision → Options → Consequences → Further decisions → Outcomes

The user can then explore different futures rather than simply reading an answer.

The decision map is the core product and the MVP.

2. THE PRODUCT PHILOSOPHY

PathWise should feel like:

a smart friend + a thoughtful consultant.

Not:

a chatbot.

Not:

an AI answer generator.

PathWise should help the user think.

It should point out things they may have missed.

It should explain tradeoffs honestly.

It should challenge assumptions when appropriate.

It should never pretend to know the future with certainty.

The tone should be:

human

calm

intelligent

direct

thoughtful

reassuring without being cheesy

Example:

Instead of:

"Based on your responses, Option A has a 78% probability of success."

Prefer:

"I'd lean toward this path because it gives you more flexibility without closing off your other options."

And:

"The catch is that you'll be trading a year of time for that flexibility."

PathWise should feel like someone is thinking through the decision alongside you.

3. THE CORE EXPERIENCE

The complete product flow is:

Landing Page
↓
Start a Decision
↓
Quick Context
↓
Decision
↓
PathWise builds the map
↓
Interactive Decision Map
↓
Explore individual paths
↓
Timeline / Comparison / Insights
↓
Recommendation
↓
What If?

The user should spend most of their time exploring the Decision Map.

Everything else supports the map.

4. VISUAL IDENTITY

Create a completely new visual identity for PathWise.

Do NOT use any previous PathWise branding.

Do NOT make it look like a generic AI SaaS website.

The aesthetic should be:

premium

editorial

sophisticated

calm

intelligent

modern

minimal

slightly unconventional

memorable

Think premium digital product + editorial design, not "startup landing page."

5. COLOR SYSTEM

Create one coherent visual palette.

Do not use random colors throughout the UI.

Avoid the typical:

blue/purple AI gradient

neon accents

glowing backgrounds

excessive gradients

Use a restrained palette with:

primary background

secondary background

primary text

secondary text

subtle border

one carefully chosen accent

The accent should be used intentionally for things such as:

active paths

important actions

selected nodes

progress

important insights

The entire application should feel like it belongs to one visual world.

6. TYPOGRAPHY

Typography is part of the brand.

Do NOT use generic fonts such as:

Inter

Roboto

Arial

Manrope

Use a distinctive but readable combination.

Use:

Canela + Sohne for display/headings
Manrope for body/UI

Use the display typography selectively.

Large decision titles and major headlines should feel editorial.

UI text should remain extremely readable.

Do not make everything look like a magazine.

7. LANDING PAGE

The landing page has one job:

Explain PathWise in under 30 seconds.

The user should understand:

What PathWise is.

Why it is different.

What they can do with it.

How to start.

Do not create a giant marketing page.

Keep it clean and minimal.

8. HERO

The hero should communicate the concept immediately.

Possible positioning:

Some decisions deserve more than an answer.

Then explain:

PathWise turns complicated decisions into paths you can explore — so you can see what each choice could lead to before you make it.

Primary CTA:

Start a decision

Secondary CTA:

See how it works

Do not fill the hero with generic AI copy.

9. LANDING PAGE SCROLL EXPERIENCE

The landing page should visually demonstrate what PathWise does.

This is a major part of the design.

As the user scrolls, a decision path should physically grow across the page.

Start with:

        ●
        │
        │

Then as the user scrolls:

        ●
        │
        │
        ●
       / \
      /   \
     ●     ●

Then:

        Decision
            │
       ┌────┴────┐
       │         │
     Path A    Path B
       │         │
    ┌──┴──┐    ┌─┴──┐
    ●     ●    ●    ●

The paths should literally draw themselves as the user scrolls.

Nodes should appear naturally.

Labels should fade in as their corresponding branches become relevant.

The animation should feel like the user is discovering the decision tree.

This should communicate the entire PathWise concept without requiring paragraphs of explanation.

Use scroll-linked animation with smooth interpolation.

Do not make it gimmicky.

10. INTERACTIVE LANDING DEMO

Include a small interactive map demonstration.

The user should be able to:

hover nodes

click nodes

reveal branches

inspect a path

zoom slightly

The demo should feel like a miniature version of the actual product.

It should make the user think:

"I want to try this with my own decision."

11. GUEST MODE

Users should NOT be forced to sign up immediately.

Provide:

Guest Mode

A guest can create:

1 medium-detail decision per day

No account required.

The guest experience must be genuinely useful.

Do not intentionally make it terrible just to force signup.

After the decision is used, show the user what additional value signing in provides.

12. FREE ACCOUNT

When the user creates an account, they receive:

1 high-detail decision

and

2 medium-detail decisions

per billing/usage period as defined by the application.

High-detail decisions should genuinely provide more depth.

For example:

Medium:

Decision
├── Path A
├── Path B
└── Path C

High:

Decision
├── Path A
│ ├── Consequence
│ │ ├── Further choice
│ │ └── Outcome
│ └── Tradeoff
├── Path B
│ ├── ...
│ └── ...
└── Path C
└── ...

Do not just increase text length.

Increase the decision depth and exploration value.

13. PATHWISE PRO

Create a premium tier called:

PathWise Pro

Do not make it feel like an aggressive SaaS paywall.

Pro can provide:

more decisions

more high-detail decisions

deeper decision maps

more branches

deeper insights

more What-If exploration

advanced comparisons

saved decision history

expanded context

richer analysis

The product should make the value of Pro obvious through the experience.

Do not plaster "UPGRADE NOW" everywhere.

14. START A DECISION

When the user clicks Start a Decision, begin a conversational but structured setup.

Do NOT immediately show a giant form.

Start with:

What are you trying to decide?

Example:

"Should I leave my current school?"

Then progressively collect context.

The questions should be adaptive to the decision.

For example, for a school decision:

What is making you consider leaving?

What would you want from a new school?

How important are your current friendships?

What are your academic priorities?

Are there financial/location constraints?

For a career decision, the questions should be completely different.

Do not create one universal questionnaire.

15. CONTEXT

The user should be able to provide:

current situation

desired outcome

priorities

constraints

concerns

important background

Allow natural language.

Do not force users to answer everything.

The system should collect only information that actually matters to the decision.

16. GENERATING EXPERIENCE

After the user submits their decision, show a beautiful transition.

Do not show:

Loading...

Instead communicate that PathWise is building the decision.

For example:

Understanding your situation
↓
Finding realistic paths
↓
Mapping consequences
↓
Building your decision

The animation should feel connected to the map.

The final transition should visually evolve into the actual map.

17. THE DECISION MAP

THIS IS THE MOST IMPORTANT FEATURE.

The Decision Map is not a normal flowchart.

It is not a collection of cards.

It is not a generic ReactFlow diagram.

It should feel like an interactive landscape of possibilities.

18. MAP STRUCTURE

The root is the user's actual decision.

Example:

             Should I leave school?
                       │
              ┌────────┴────────┐
              ↓                 ↓
         Stay where I am     Leave
                                │
                       ┌────────┴────────┐
                       ↓                 ↓
                  New school         Gap year

The hierarchy must be visually obvious.

Branches should feel like they are growing naturally from the original decision.

19. PROGRESSIVE DISCLOSURE

Do NOT show the entire decision tree immediately.

This is critical.

At a zoomed-out level:

Level 1

Only major paths.

Decision
↓
A B C

Zoom in:

Level 2

Reveal secondary decisions.

A
├── A1
└── A2

Zoom further:

Level 3

Reveal:

consequences

tradeoffs

risks

pros

cons

requirements

next decisions

This makes the map progressively more detailed as the user explores it.

The map should feel almost like discovering a landscape.

20. MAP CAMERA

The map must support:

Pan

Natural drag interaction.

Zoom

Smooth mouse-wheel / trackpad zoom.

Focus

Clicking a node smoothly moves the camera toward it.

Reset

Return to the root decision.

Expand

Reveal deeper branches.

Collapse

Hide branches.

Use smooth camera interpolation.

Never instantly teleport the user around the map.

21. NODE INTERACTION

Nodes should have multiple visual states:

default

hover

selected

connected

muted

expanded

Hovering a node should highlight its connected path.

Clicking it should focus the camera and reveal relevant information.

Selected paths should remain visually prominent.

Unrelated paths should become quieter rather than disappearing.

22. MAP DETAIL

When zoomed out:

Show only:

node title

basic relationship

When zoomed in:

Reveal:

short description

key tradeoff

pros

cons

risk indicators

relevant metadata

Do not show giant cards.

The map should remain the primary visual.

23. PATH DETAIL PANEL

Clicking a significant node should open a contextual detail panel.

The map stays visible.

Example:

Take a gap year

Gives you more time to prepare, but delays your next step.

Why consider it

...

Upside

...

Tradeoff

...

Watch out for

...

Next

...

The panel should slide/fade in smoothly.

Closing it should return the user immediately to map exploration.

24. PATH HIGHLIGHTING

When the user selects a path:

Highlight the entire route:

Decision
│
└── Path A
│
├── A1
│
└── A2

The selected route becomes visually clear.

Other routes become subdued.

This allows the user to understand one possible future at a time.

25. COMPARISON

Allow users to select two or more paths.

Then compare them.

The comparison should be based on the actual decision.

Potential factors:

time

cost

risk

flexibility

difficulty

alignment with goals

But do NOT hard-code these as universal categories.

The criteria should adapt to the decision.

26. TIMELINE

Every major path should have its own timeline.

Example:

NOW
│
├── Research
│
├── Talk to family
│
├── Make decision
│
├── Apply
│
└── Start

The timeline should be connected to the map.

Selecting a timeline event should highlight the relevant path/node.

Changing the selected path should change the timeline.

27. INSIGHTS

Insights should not be generic AI bullet points.

They should feel like observations from someone who actually understands the situation.

Examples:

"The biggest tradeoff here isn't money. It's time."

"This option keeps more doors open, but it also delays your next decision."

"You seem to care more about flexibility than speed. That makes Path B a stronger fit."

Keep insights concise.

Prefer a few genuinely useful insights over 20 generic ones.

28. RECOMMENDATION

PathWise can recommend a path, but it must remain humble.

Example:

I'd lean toward Path B.

Then:

Why

...

The downside

...

What I'm least certain about

...

What could change this

...

Never pretend the recommendation is objective truth.

PathWise is helping the user reason.

The user remains in control.

29. WHAT IF?

Create an interactive What-If mode.

The user can modify important assumptions.

Examples:

What if I prioritize speed?

What if my budget is lower?

What if I don't take a gap year?

What if staying near home becomes essential?

The map should update dynamically.

Affected branches should transition smoothly.

Do not reload the page.

The user should visually see how changing one assumption changes their possible paths.

30. DECISION HISTORY

Signed-in users can save decisions.

Create a simple "My Decisions" area.

Show:

decision title

date

last updated

recommended path

continue button

Do not turn this into a generic dashboard.

It should feel like a library of decisions.

31. NAVIGATION

Keep navigation minimal.

Possible structure:

PATHWISE

Explore
My Decisions
Pro

Profile

The map should always remain the center of the application.

32. ANIMATION SYSTEM

PathWise should have a distinctive motion language.

Use motion to explain relationships.

Important animations:

paths drawing

branches extending

nodes appearing

camera movement

node expansion

detail panels

path highlighting

What-If transitions

timeline progression

scroll-driven landing page

Use subtle spring physics where appropriate.

Avoid:

bouncing everything

excessive scaling

slow animations

meaningless hover animations

animations on every text element

The product should feel smooth, not animated for the sake of being animated.

33. MICROINTERACTIONS

Examples:

Hover node:

→ connected branches gently respond.

Click node:

→ camera moves toward it.

Expand:

→ branch grows outward.

Select path:

→ entire route becomes emphasized.

Open detail:

→ panel enters while map remains visible.

Change What-If:

→ affected branches morph into their new state.

Return to root:

→ camera smoothly pulls back.

34. MOBILE

Desktop is the primary experience.

The map needs space.

But mobile must remain usable.

On mobile:

pinch zoom

drag/pan

focused branch views

vertical hierarchy where appropriate

detail panels become bottom sheets

do not attempt to fit the entire tree into the viewport

35. PERFORMANCE

Design the map to scale.

Eventually a decision could have many nodes.

Use:

progressive rendering

lazy expansion

viewport awareness

efficient state updates

smooth camera transforms

avoid rendering unnecessary deep branches

The map must remain responsive.

36. IMPORTANT DATA MODEL

All PathWise experiences should originate from a shared decision object.

Conceptually:

Decision
├── User context
├── Goals
├── Constraints
├── Priorities
├── Root decision
├── Paths
│ ├── Branches
│ ├── Consequences
│ ├── Pros
│ ├── Cons
│ ├── Risks
│ └── Next decisions
├── Timeline
├── Insights
└── Recommendation

The map, timeline, comparison, insights, recommendation, and What-If system must all reference the same underlying decision.

Do not build each screen as an independent piece of content.

If a path changes, everything related to it should update.

37. RESPONSIVENESS OF CONTENT

PathWise must never generate generic content just to fill a UI.

If there are only three meaningful paths:

Show three.

If there are five:

Show five.

If a timeline only has six meaningful milestones:

Show six.

Do not artificially generate content to make the interface look fuller.

38. EMPTY / ERROR STATES

Make them feel like part of the product.

Do not use generic:

"Something went wrong."

Use calm, human messaging.

Example:

"I couldn't map this one properly yet. Try giving me a little more context."

Do not blame the user.

39. GUEST → ACCOUNT TRANSITION

After a guest finishes their decision, do not immediately block them with a signup wall.

Let them experience the result.

Then explain:

"Want to keep this decision?"

Sign in to save it.

Similarly, after using their free allowance:

Explain what signing in or upgrading unlocks.

Keep the experience respectful.

40. PRODUCT PRIORITIES

Build in this order:

Phase 1 — Core

Design system

Landing page

Decision creation flow

Decision data model

Interactive Decision Map

Phase 2 — Map depth

Progressive zoom detail

Node interactions

Path highlighting

Detail panels

Camera transitions

Expand/collapse

Phase 3 — Decision tools

Timeline

Comparison

Insights

Recommendation

What-If

Phase 4 — Product

Guest mode

Authentication

Usage limits

Saved decisions

PathWise Pro

41. MOST IMPORTANT DESIGN RULE

The map is not decoration.

It is the product.

If the landing page is beautiful but the map feels like a generic node graph, PathWise has failed.

The map should be the thing people remember.

It should make someone think:

"I've never seen decisions represented like this."

42. FINAL PRODUCT FEEL

When someone opens PathWise, they should NOT think:

"This is another AI wrapper."

They should think:

"This is a tool for actually thinking."

It should feel like:

beautiful software for complicated human decisions.

Premium without being pretentious.

Minimal without being empty.

Intelligent without being robotic.

Interactive without being gimmicky.

And most importantly:

PathWise should feel like it is sitting beside the user, helping them think through the decision — not standing above them giving them an answer.

Build the product around that feeling.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
