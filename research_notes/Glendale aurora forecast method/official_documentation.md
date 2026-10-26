# Glendale aurora app: what the developer has officially documented about its method

> **Method caveat (read first).** I could not open any of the developer's pages directly in this environment. WebFetch failed with DNS errors (`ENOTFOUND`) for aurora-alerts.uk, glendaleskye.com, chasingaurora.com.au, frontiersin.org, pressandjournal.co.uk and duluthnewstribune.com. curl through the proxy returned 403 CONNECT for the same hosts, and web.archive.org and r.jina.ai were also blocked. Every "quote" below therefore comes from a **search-engine snippet** of the named page (WebSearch, October 2026). The wording is what the search index returned for that URL, but I could not read the surrounding page text, check the exact current wording, or see version dates. Before relying on any quote in code, someone should open the pages in a normal browser: `aurora-alerts.uk/`, `/user-guide.php`, `/faqs.php`, `/faqs-advanced.php` and `/support.php`.

## 1. Which app is it? (identity, developer, location, distribution)

### Takeaway
"Glendale App" (also called "Aurora Alerts UK") is a free web app (PWA) at **https://aurora-alerts.uk/**. Its developer is **Andy Stables**, a crofter and aurora photographer in **Glendale, Isle of Skye, Scotland**, who also runs the "Glendale Skye Auroras" Facebook page and the @SkyeAuroras account on X. It is **not in the Apple App Store or Google Play**, so there are no store listings or store version histories to mine.

### Cited Findings
- Official site and page titles: "Glendale App - Worldwide Aurora Alerts" / "Aurora Alerts UK - Glendale App" / "Glendale App, the world's most accurate aurora app. Not in any app store." — [aurora-alerts.uk](https://aurora-alerts.uk/)
- Official sub-pages found in the search index:
  - User guide: "User Guide & Installation Instructions for Glendale App (aurora-alerts.uk)." — [user-guide.php](https://aurora-alerts.uk/user-guide.php)
  - FAQs — [faqs.php](https://aurora-alerts.uk/faqs.php)
  - Advanced FAQs — [faqs-advanced.php](https://aurora-alerts.uk/faqs-advanced.php)
  - Technical support — [support.php](https://aurora-alerts.uk/support.php)
  - Registration — [create-account.php](https://aurora-alerts.uk/create-account.php)
  - Privacy policy (titled "Glendale Skye Auroras") — [privacy-policy.php](https://aurora-alerts.uk/privacy-policy.php)
  - Companion promo page on the developer's tourism site — [glendaleskye.com/aurora-alerts-app.php](https://www.glendaleskye.com/aurora-alerts-app.php)
  - Substorm-phase photo guide — [glendaleskye.com/aurora-phases.php](https://www.glendaleskye.com/aurora-phases.php)
- Developer: "Glendale App was created by Andy Stables of the Glendale Skye Auroras Facebook Page to make it easy for people to see and photograph auroras worldwide." — snippet attributed to [aurora-alerts.uk](https://aurora-alerts.uk/) / [glendaleskye.com](https://www.glendaleskye.com/aurora-alerts-app.php)
- "Andy Stables is Admin of the Glendale Skye and Glendale Skye Auroras Facebook Pages." — snippet from [aurora-alerts.uk](https://aurora-alerts.uk/) results. Also see Flickr "About Andy Stables" — [flickr.com/people/glendaleskye](https://www.flickr.com/people/glendaleskye/)
- Press coverage, headline: "Skye crofter creates viral Northern Lights app". The snippet says the page had "more than 11,000 people following the Glendale Sky Auroras Facebook page" (older article; not opened) — [Press and Journal](https://www.pressandjournal.co.uk/fp/news/1140162/skye-crofter-creates-viral-aurora-app/)
- X account: "Aurora Alerts UK (Glendale App) (@SkyeAuroras)" — [x.com/skyeauroras](https://x.com/skyeauroras?lang=en)
- Distribution: "Download the app here: https://aurora-alerts.uk/. Glendale App is not in any app store. You can only get it from the link above." — [glendaleskye.com](https://www.glendaleskye.com/aurora-alerts-app.php)
- Installation: on Android, open the link in Chrome and use "Add To Home Screen". On iOS, open it in Safari. On iOS "it works fine ... in Safari but you will not get the push alerts" — [glendaleskye.com](https://www.glendaleskye.com/aurora-alerts-app.php), [user-guide.php](https://aurora-alerts.uk/user-guide.php)
- Cost and registration: the app is "totally free of charge" — [glendaleskye.com](https://www.glendaleskye.com/aurora-alerts-app.php). "You need to register to see live, real-time updates. Registration is free." / "no marketing. No cost." — [create-account.php](https://aurora-alerts.uk/create-account.php)
- Marketing claims (unverified): "the world's most accurate aurora alerting app", "over 215,000 users", "the only app in the world that provides real-time tracking of geomagnetic substorms", and a "100% accurate alternative to Kp" — [aurora-alerts.uk](https://aurora-alerts.uk/), [faqs.php](https://aurora-alerts.uk/faqs.php)
- Privacy policy: describes the developer as an individual who uses sighting reports for substorm research (search summary, not a verbatim quote) — [privacy-policy.php](https://aurora-alerts.uk/privacy-policy.php)

### Inferences
- The developer's own documentation is spread over the home page (which carries chart captions and "how to read" text), the user guide, the FAQ and the advanced FAQ. There is no separate glossary or changelog page in the search index.
- Because it is a web app, version changes are shipped silently. The support page mentions a "Force Update" button and in-app "must upgrade" messages, but no public release notes were found.

### Gaps
- No App Store or Google Play listing exists, so there is no store description or "What's new" history. (The "MyGlendale" app on Google Play belongs to the City of Glendale, CA, and is unrelated.)
- No public changelog or release notes were found. Facebook posts on Glendale Skye Auroras could not be searched or read.

## 2. Data sources named by the developer

### Takeaway
The developer names **DSCOVR, ACE and SDO** satellite data and NOAA's **Space Weather Prediction Center** for the solar wind, plus a set of **ground magnetometer networks** for the proprietary substorm index. Neither the site nor the snippets name specific NOAA product files (for example `propagated-solar-wind`, RTSW or OVATION).

### Cited Findings
- Acknowledgements, as summarised by search: live data feeds come from the "Tromsø Geophysical Observatory, Swedish Institute of Space Physics, the US Geological Survey, the Finnish Meteorological Institute, the British Geological Survey and Natural Resources Canada". "Solar wind data comes from the DSCOVR, ACE & SDO Satellites and the Space Weather Prediction Centre." — [aurora-alerts.uk](https://aurora-alerts.uk/)
- The app relies on substorm tracking and solar wind data rather than Kp, which it calls unreliable (search summary) — [aurora-alerts.uk](https://aurora-alerts.uk/), [glendaleskye.com](https://www.glendaleskye.com/aurora-alerts-app.php)
- Solar-wind trendlines: "The trendlines show the solar wind speed (V), density (N), temperature (T) and IMF strength (B) that is arriving at Earth now (left) and as far into the future as it is possible to see, at L1 satellites (right)." — [aurora-alerts.uk](https://aurora-alerts.uk/)
- The user guide warns that IMF figures on other apps are measured at a satellite far from Earth, so they lag by about 2 to 2.5 hours (search paraphrase of the user guide) — [user-guide.php](https://aurora-alerts.uk/user-guide.php)
- Magnetometer stackplot guidance: "drops of >200nT on the right-hand side of the graph" are the signal to look for on the Norwegian-line stackplot (search snippet; page attribution uncertain) — [aurora-alerts.uk](https://aurora-alerts.uk/)
- Independent academic review (2026): Glendale and Aurora Compass "displayed custom proprietary geomagnetic indices ... derived from ground magnetometer readings and reported in near real time. However, the methodologies for these indices were not publicly disclosed." — [Frontiers in Astronomy and Space Sciences, "Introduction: aurora apps as interfaces to space weather" (2026)](https://www.frontiersin.org/journals/astronomy-and-space-sciences/articles/10.3389/fspas.2026.1749567/xml)

### Inferences
- "Arriving at Earth now (left) ... at L1 (right)" means the app time-shifts L1 measurements to their estimated Earth-arrival time. NOAA SWPC's `propagated-solar-wind` product, or a self-computed ballistic shift (distance ÷ speed), would fit that description, but the developer does not say which.
- No cloud-cover source is named in what I found. Darkness is computed from the user's location (see section 5).

### Gaps
- The exact NOAA endpoints, the time-shift method and the cadence (1-minute vs 5-minute data) are not documented in anything I could reach.
- Hemispheric power, OVATION and cloud cover are not mentioned in any snippet.

## 3. IMF screen: Next / Now / Past windows, Bz/Bt charts, "percent negative", theta

### Takeaway
The developer documents a **30-minute window "currently arriving at Earth"** (Now), with one window on either side (Next and Past). The **"percentage" is how negative Bz was during the window, with 100% ideal.** The Bz/Bt chart shows Bt (top), Bz (middle) and an "optimum Bz" grey line (bottom). Theta is the **IMF clock angle (θ) plotted over the last 24 hours**. The IMF predicts activity **1 to 3 hours ahead**. One third-party guide says the window length **varies with solar wind speed**. The developer does not give an explicit formula for either the percentage or theta.

### Cited Findings
- Window definition: "The table shows an analysis of the interplanetary magnetic field in the 30 minute window that is currently arriving at Earth, with windows either side of it. The 'percentage' figure indicates how negative the Bz was, the ideal is 100% negative." — [aurora-alerts.uk](https://aurora-alerts.uk/)
- Chart lines: "Bt is at the top, Bz in the middle and the optimum Bz at the bottom (grey)." and "You want it to be negative, below the zero line, and as close to the lower grey line as possible." — [aurora-alerts.uk](https://aurora-alerts.uk/)
- Lead time: "IMF tells us about the future, not the present. We use it to predict activity 1 to 3 hours from now." — [aurora-alerts.uk](https://aurora-alerts.uk/) / [user-guide.php](https://aurora-alerts.uk/user-guide.php)
- "a well-aligned IMF arriving at Earth NOW does NOT result in aurora until 1 to 3 hours later." — [user-guide.php](https://aurora-alerts.uk/user-guide.php)
- What to look for: "ideally what we want is either a negative Bz, or a very wide separation between the Bz and Bt lines, over the course of the last hour." — [aurora-alerts.uk](https://aurora-alerts.uk/) / [faqs-advanced.php](https://aurora-alerts.uk/faqs-advanced.php)
- Theta: "The 24-hour theta plot shows the clock angle (θ) over the last 24 hours, which allows you to see the periods when the IMF was best aligned." — [aurora-alerts.uk](https://aurora-alerts.uk/)
- Developer's view on coupling functions (advanced FAQ): "academic literature will tell you that solar wind speed plus IMF Bt, By and Bz are the drivers of convection". For substorm purposes, though, the only parameters needed are "the IMF Bt and Bz at Earth". The FAQ says the clock-angle term in Newell and HPI "kicks in whenever Bz goes negative", the equations lack hysteresis, and "when Bz is positive, increasing By will cause the clock angle to increase", which can wrongly signal activity "even though no loading is occurring" — [faqs-advanced.php](https://aurora-alerts.uk/faqs-advanced.php)
- Third-party guide (not the developer): the percentage shows how much of the window's time Bz was negative, and 100% negative is best. If both the Now and Next rows are "lit", a substorm is underway or likely within about an hour. If Next is not lit, activity may fade. Once a substorm is in expansion, ignore the IMF/Bz predictions and focus on substorm strength. The window duration "varies based on Solar wind speed". The theta chart shows when the IMF "was best aligned with Earth, making it easier for auroras to happen". — [Chasing Aurora Australis, "Glendale App - Your Ultimate Guide" (c. mid-2025)](https://chasingaurora.com.au/glendale-app-your-ultimate-guide/)

### Inferences (not documented by the developer)
- **Percent negative:** the most natural reading of "how negative the Bz was" plus the third-party "how much of that time Bz was negative" is (number of samples in the window with Bz < 0) ÷ (number of valid samples) × 100. The developer's wording ("how negative") could also describe a magnitude-weighted measure, so treat this as a hypothesis.
- **"Optimum Bz" grey line:** this is most likely Bz = −Bt, the most negative Bz possible for the current field strength (field fully southward, θ = 180°). That reading fits "as close to the lower grey line as possible" and "a very wide separation between the Bz and Bt lines". Inference only.
- **Theta:** this is probably the standard GSM clock angle θ = atan2(By, Bz), in the range 0–180° (0° = northward, 180° = southward), the same convention as the [BoM clock-angle page](https://www.sws.bom.gov.au/Category/Solar/Solar%20Conditions/Solar%20Wind%20Clock%20Angle/Solar%20Wind%20Clock%20Angle.php). Given the developer's criticism of By-driven clock angles, the app's theta might be computed only from Bz and Bt (cos θ = Bz/Bt). The two give the same angle in magnitude, since |B_perp| ≈ √(By²+Bz²), but they differ if Bt includes Bx (NOAA's Bt is the total field). Unverified.
- **"Lit" rows and window length:** the third-party "lit" language suggests a pass/fail highlight on each window, perhaps based on the percentage. "Window length varies with solar wind speed" is consistent with windows defined in propagated/arrival time: a fixed 30-minute arrival window maps to a different length of L1 measurement time when speed changes across the window. Neither threshold nor mechanism is documented.

### Gaps
- No documented numeric threshold for a "good" percentage, no formula for theta, and no definition of how the Next and Past windows are anchored (contiguous 30-minute blocks vs. rolling). It is also unclear whether "Now" is centred on or ends at the current time.
- It is unclear whether the developer's own text says the window length varies with speed; I found only the third-party claim.

## 4. Substorm strength / index, colour levels and alert rules

### Takeaway
The app's headline metric is a proprietary, ground-magnetometer-based **"substorm strength" / Auroral Substorm Index (AS Index)** in nT (more negative = stronger), with phases **growth / onset / expansion / recovery**. Alerts escalate **onset → yellow → amber → red → major → severe → extreme**. Thresholds are lower for users closer to the auroral zone, and alerts are sent only when it is dark at the user's location. **No numeric nT thresholds were found in the official text.**

### Cited Findings
- Substorm strength: the headline negative nT value is "the strength of the aurora in the sky right now. The more negative it is, the stronger the aurora is at that minute". The app calls it "the single most important number on the app and overrides all others" — [aurora-alerts.uk](https://aurora-alerts.uk/)
- Phases: "growth" means the substorm is charging, "expansion" means energy is being released as aurora, and "recovery" means the aurora will slowly fade. The FAQ describes particles trapped on the night side until the field "snaps", which "catapults the particles into the atmosphere" — [faqs.php](https://aurora-alerts.uk/faqs.php), [aurora-alerts.uk](https://aurora-alerts.uk/)
- Index naming: "substorm strength (aka Auroral Substorm Index)" — [aurora-alerts.uk](https://aurora-alerts.uk/). The method is not disclosed — [Frontiers 2026](https://www.frontiersin.org/journals/astronomy-and-space-sciences/articles/10.3389/fspas.2026.1749567/xml)
- Basic alerts: "push notifications that the app sends automatically when it detects that an aurora is developing. An 'onset' alert is sent first as a warning that an aurora is starting, followed by yellow, amber, red, major, severe and extreme alerts as activity develops. Your device will receive these even when the app is not running." — [aurora-alerts.uk](https://aurora-alerts.uk/) / [user-guide.php](https://aurora-alerts.uk/user-guide.php)
- Activity alerts: "notifications that can be set to 'ping' your device only when the app is running. These occur much more frequently than the basic alerts. They alert you to all thresholds being crossed, auroras being reported by users and photos being uploaded." — [aurora-alerts.uk](https://aurora-alerts.uk/)
- Expansion Alarm (desktop): leave the app open in a browser tab and it "will start bleeping when a geomagnetic substorm goes into its Expansion Phase" — [glendaleskye.com](https://www.glendaleskye.com/aurora-alerts-app.php)
- Push alerts go to Android and to Chrome/Firefox/Edge on desktop. They cover expansion onset and activity reaching thresholds "strong enough ... to be photographed in your country", and are sent only when "it is dark enough for the aurora to be seen" — [glendaleskye.com](https://www.glendaleskye.com/aurora-alerts-app.php)
- Location-dependent threshold: "The threshold at which aurora becomes visible for you will be lower the closer to the auroral zone you are." — [aurora-alerts.uk](https://aurora-alerts.uk/)

### Inferences
- The alert logic appears to be driven by the magnetometer-based substorm index (onset/expansion detection plus level crossings), not by the IMF screen. Nothing found says that the IMF percentage or theta triggers a push alert.
- The yellow/amber/red levels are probably nT thresholds on the substorm index, scaled by distance from the auroral zone (or by country). The numbers are not public.

### Gaps
- No nT values for onset, yellow, amber, red, major, severe or extreme.
- No published onset/expansion detection algorithm, cooldowns or rate limits.
- No documented user-configurable thresholds beyond turning activity alerts on or off.
- No use of Kp, speed or density as alert triggers was documented.

## 5. Location handling, darkness, update frequency, premium features

### Takeaway
Location is read at app start, when a sighting is reported and when details are saved. It is used for darkness timing and for distance to the aurora, which feeds visibility probability. The developer documents "three factors": geomagnetic activity, clear sky and darkness. There is **no paid tier**; registration (free) unlocks live updates. **No update frequency is documented.**

### Cited Findings
- Location use: location is used "to work out when it is dark enough to catch auroras where you are located" and "to estimate how far away from the aurora you are and, therefore, the probability of it being visible for you" — [aurora-alerts.uk](https://aurora-alerts.uk/) / [faqs.php](https://aurora-alerts.uk/faqs.php)
- Location reads: the app "only reads your position once each time you start the app running, when you report a sighting and when you save your details" — [aurora-alerts.uk / user guide](https://aurora-alerts.uk/user-guide.php)
- Three factors: "There are three factors that are essential to getting an aurora: geomagnetic activity, clear sky and darkness." In summer "the window of darkness is very short, so the chances of meeting all three criteria is much lower" — [faqs.php](https://aurora-alerts.uk/faqs.php)
- Free, registration-gated live data — [create-account.php](https://aurora-alerts.uk/create-account.php)
- Updates of the app itself: the support page describes a "Force Update" button and the message "you must upgrade to a new version" — [support.php](https://aurora-alerts.uk/support.php)
- Substorm strength is described per "minute" ("the stronger the aurora is at that minute") — [aurora-alerts.uk](https://aurora-alerts.uk/)

### Inferences
- The "at that minute" wording suggests roughly 1-minute magnetometer cadence for the substorm index, but no refresh interval is documented.
- Registration is probably needed so that alerts can be sent per user location (darkness and distance). There are no premium features that change calculations.

### Gaps
- No documented refresh rate for the IMF or solar wind panels.
- No documented darkness definition (e.g. which solar depression angle: civil, nautical or astronomical).
- No documented visibility-probability formula, and no cloud-cover handling.
