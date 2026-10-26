# Science and data basis for a short-term aurora forecast/alert app built on NOAA SWPC real-time solar wind (Glendale-style IMF screen)

Research environment note (applies to all sections): in this session, WebFetch could not resolve DNS for services.swpc.noaa.gov, www.swpc.noaa.gov, www.spaceweather.gov, aurorawatch.lancs.ac.uk, spaceweatherlive.com, frontiersin.org and mist.ac.uk. web.archive.org was also blocked, and direct curl to the SWPC feeds got HTTP 403 from the proxy. Findings below therefore rest on (a) WebSearch result snippets from primary pages (SWPC, NCEI, peer-reviewed abstracts) and (b) GitHub code-search hits from open-source projects that fetched the live feeds in 2026 and recorded their schemas. Treat GitHub-derived schema details as strong secondary evidence, not official documentation. No public information about the "Glendale" aurora app itself was found (see Gaps in section 2).

---

## 1. NOAA SWPC "propagated solar wind" products: propagation method, errors, cadence, columns, and RTSW / spacecraft differences

### Takeaway
SWPC's `products/geospace/propagated-solar-wind(.json|-1-hour.json)` holds 1-minute L1 data with a `propagated_time_tag` that SWPC computes by **simple ballistic (flat-plane convection) propagation** from L1 to **32 RE upstream**, which is the upstream boundary of the Geospace (Univ. of Michigan SWMF) model, not Earth or the nominal bow shock. Ballistic delays of 30–60+ min carry typical errors of about ±10–15 min. Tilted-front (Weimer) propagation did not do significantly better in real-time operations. Since 30 June 2026, SWPC no longer ingests DSCOVR: **SOLAR-1 (formerly SWFO-L1) is primary and ACE is backup**, with IMAP I-ALiRT to follow.

### Cited Findings
**Propagation method and target point**
- SWPC's Geospace Geomagnetic Activity Plot "displays real-time solar wind values **ballistically propagated** from L1 orbit to **32 Re** at the upstream boundary of the University of Michigan's Geospace model." — [SWPC Geospace Geomagnetic Activity Plot](https://www.spaceweather.gov/products/geospace-geomagnetic-activity-plot) (search snippet)
- SWPC's Real-Time Solar Wind page says its time-series plots can overlay "the Geospace propagated solar wind at 32 Earth radii". — [SWPC Real Time Solar Wind](https://prod-01-alb-www-swpc.woc.noaa.gov/products/real-time-solar-wind) (search snippet)
- Cash et al. (2016): "A simple **flat plane convection** delay method is currently used by the NOAA Space Weather Prediction Center (SWPC)". The paper built and validated an operational tool using the Weimer & King (2008) tilted phase-front technique. — [Cash et al. 2016, Space Weather 14(2):93–112, CU Experts record](https://experts.colorado.edu/display/pubid_134080); [NOAA IR record](https://repository.library.noaa.gov/view/noaa/15197)
- A 2025 review calls the simple method "flat delay" or "ballistic propagation" and says NOAA's Space Weather Forecast Office uses it. It cites Cash et al. (2016) for propagation times that are often around 1 h. — [Frontiers in Astron. Space Sci. 2025, 10.3389/fspas.2025.1675769](https://www.frontiersin.org/journals/astronomy-and-space-sciences/articles/10.3389/fspas.2025.1675769/full) (search snippet)
- The standard OMNI/flat-delay assumption is a planar phase front, normal to the ecliptic, that propagates radially at the solar wind speed. The delay then depends on spacecraft position, Earth's motion and solar wind speed. — [Baumann & McCloskey 2021, JSWSC (swsc200105)](https://www.swsc-journal.org/articles/swsc/full_html/2021/01/swsc200105/swsc200105.html) (search snippet)
- NASA's Weimer-propagated datasets (minimum-variance / tilted-front method) propagate to "a position just outside of the nominal bow shock (about 17, 0, 0 Re)". They compute the delay as (n̂·ΔR)/(n̂·V), where n̂ is the minimum-variance direction, and the method "does not work well for shocks and minimum variance directions with tilts greater than 70 degrees of the Sun-Earth line". — [data.nasa.gov ACE Weimer propagation details](https://data.nasa.gov/dataset/ace-solar-wind-weimer-propagation-details-at-1-min-resolution); [catalog.data.gov](https://catalog.data.gov/dataset/ace-solar-wind-weimer-propagation-details-at-1-min-resolution)

**Known errors**
- Cash et al. (2016): "By relying on a ballistic propagation method, delay time errors of ±15 min are common", but "no significant difference between the two propagation methods when run in a real-time operational environment" (flat vs. Weimer tilted front). — [Cash et al. 2016 (CU record)](https://vivo.colorado.edu/display/pubid_134080)
- The time difference between OMNI time-shifted IMF and the best-matching IMF "can reach ~15 min". — [Tasnim et al., EGU23-3379](https://meetingorganizer.copernicus.org/EGU23/EGU23-3379.html)
- For 380 interplanetary shocks (1998–2018, ACE), a random-forest model reduced the RMSE of the predicted L1→Earth delay to **4.8 min**, "a 15% improvement over the vector-delay method and 50% over the flat-delay method". This implies a flat-delay RMSE of roughly 9–10 min for shocks. — [Baumann & McCloskey 2021, JSWSC](https://www.swsc-journal.org/10.1051/swsc/2021026)
- The full delay chain has three parts: (1) L1 → bow shock, (2) bow shock → magnetopause, (3) magnetopause → ground. — [Baumann & McCloskey 2021 (search snippet)](https://elib.dlr.de/143595/1/swsc200105.pdf)
- Horbury et al. (2001), cited in a 2008 Annales paper, found that IMF orientation as well as speed affects the delay. The best estimates used the discontinuity normal (cross product of upstream and downstream fields). — [Annales Geophysicae 26, 2383 (2008)](https://angeo.copernicus.org/articles/26/2383/2008/angeo-26-2383-2008.pdf)

**Feed structure (propagated-solar-wind)**
- The directory `services.swpc.noaa.gov/products/geospace/` lists both `propagated-solar-wind.json` and `propagated-solar-wind-1-hour.json`. — [SWPC directory index (search snippet)](https://services.swpc.noaa.gov/products/geospace/)
- Format: an array of arrays, with row 0 as the header `[time_tag, speed, density, temperature, bx, by, bz, bt, vx, vy, vz, propagated_time_tag]` and later rows as one observation per minute. The full file is "~10,080 rows for a 7-day rolling window", and "vx/vy/vz are commonly null". `time_tag` is the L1 observation time and `propagated_time_tag` is the predicted arrival time. — GitHub: [clemensv/real-time-sources, feeders/noaa-swpc-l1 (README, acquisition.py, CONTAINER.md)](https://github.com/clemensv/real-time-sources/tree/main/feeders/noaa-swpc-l1). An example row there has time_tag 12:34Z and propagated_time_tag 13:12Z (38 min delay at 486 km/s).
- Same header recorded independently for `propagated-solar-wind-1-hour.json`. — GitHub: [SimenZhor/SWPC-NOAA-Realtime-Data, realtime_dscovr_data.py](https://github.com/SimenZhor/SWPC-NOAA-Realtime-Data); [Hotragn/HotEARTH docs/SUN_DATA_SOURCES.md (verified live 2026-07-18)](https://github.com/Hotragn/HotEARTH)
- HotEARTH (2026-07-18) reports that the old `products/solar-wind/mag-*.json` and `plasma-*.json` URLs return 404 and recommends `geospace/propagated-solar-wind*` and `products/summary/solar-wind-mag-field.json` (`{bt, bz_gsm, time_tag}`) plus `solar-wind-speed.json` instead. — [HotEARTH SUN_DATA_SOURCES.md](https://github.com/Hotragn/HotEARTH); also in [rtphokie/geomag-aurora RESOURCES.md](https://github.com/rtphokie/geomag-aurora)
- Neither source states the coordinate system of `bx, by, bz` in the propagated file. See Inferences.

**RTSW feeds and spacecraft (status as of Oct 2026)**
- "SWPC has stopped ingesting and processing DSCOVR data as of 2026-06-30." — [NCEI Space Weather Portal, DSCOVR](https://www.ncei.noaa.gov/cloud-access/space-weather-portal/overview?program=DSCOVR)
- "SOLAR-1 now serves as the primary solar wind source with ACE as our backup until IMAP I-ALiRT has 24/7 coverage". The legacy RTSW plot was removed. Notice dated 30 June 2026. — [SWPC news: Solar Wind Data and Display Changes](https://www.spaceweather.gov/news/solar-wind-data-and-display-changes); [mirror](https://swpc-drupal.woc.noaa.gov/news/solar-wind-data-and-display-changes)
- The new display (spaceweather.gov/products/solar-wind) became operational (experimental banner removed) per an August 2026 notice. SOLAR-1 = renamed SWFO-L1, launched 24 Sep 2025. Sources disagree on L1 arrival: 20 Jan 2026 (Wikipedia, scheduled) vs. 23 Jan 2026 (TechTimes). — [SWPC solar wind display](https://www.spaceweather.gov/products/solar-wind); [Wikipedia SWFO-L1](https://en.wikipedia.org/wiki/Space_Weather_Follow_On-Lagrange_1); [TechTimes 2026-08-17](https://www.techtimes.com/articles/324780/20260817/solar-1-debut-storm-dscovr-gone-bz-still-unreadable-until-cme-impact.htm)
- SWPC "maintains the ability to instantaneously switch which spacecraft is providing a particular type of RTSW data (IMF, plasma or energetic particles)", and the choice is indicated by the "Active" designation. "The last 24 hours of in situ data is available via static JSON files. There are separate files for mag, plasma and ephemeris, each of which includes the data for all of the available spacecraft." The new display does not yet show quality flags. — [SWPC solar wind product page (search snippet)](https://www.spaceweather.gov/products/solar-wind)
- SWFO-L1 magnetometer data are offered at 1-s and 1-min cadence as JSON. Legacy RTSW offered up to 1-s magnetometer and 20-s plasma data. — [SWPC SWFO user-readiness slides (Hill)](https://www.spaceweather.gov/sites/default/files/images/u97/5%20Hill%20SWPC.pdf); [SWPC RTSW page](https://www.swpc.noaa.gov/products/real-time-solar-wind)
- Record schema of `json/rtsw/rtsw_mag_1m.json` (from code): a list of dicts with `time_tag, active, source, bx_gsm, by_gsm, bz_gsm, bt, overall_quality, …`. `source` values include "SOLAR1", "ACE", "IMAP", "DSCOVR". The file is newest-first and covers 24 h. Companion file: `json/rtsw/rtsw_wind_1m.json` (proton_speed, proton_density, proton_temperature, source, active). — GitHub: [kd9taw/Nexus crates/propagation/src/solar_wind.rs](https://github.com/kd9taw/Nexus); [aaronwmorris/indi-allsky aurora.py](https://github.com/aaronwmorris/indi-allsky) (`'SOLAR1'  # SOLAR1 (active), ACE, IMAP, DSCOVR`); [MonumentalSystems/Global-Resonance operator_data_sources.py](https://github.com/MonumentalSystems/Global-Resonance) ("Select the active, quality-zero spacecraft record at each timestamp"); [smittix/intercept routes/space_weather.py](https://github.com/smittix/intercept) (newest first, "active" marks the operational source). One comment in smittix/intercept says "DSCOVR as 'SOLAR1'". **That conflicts** with SWPC's statement that SOLAR-1 is the SWFO-L1 spacecraft and is probably a developer error.

### Inferences
- **Ballistic delay formula (background knowledge, consistent with the sources above but not quoted from SWPC):** Δt ≈ (X_sc − X_target) / |V_x|. Here X_sc is the spacecraft GSE X position (L1 ≈ 1.5×10⁶ km ≈ 235 RE, though halo/Lissajous orbits vary it), X_target = 32 RE for the SWPC product, and V_x ≈ speed. At 400 km/s, (235 − 32) RE × 6371 km / 400 km/s ≈ 3230 s ≈ 54 min. At 800 km/s it is ≈ 27 min. A replication check: compute `propagated_time_tag − time_tag` per row and compare it with (X_L1 − 32 RE)/speed. Expect agreement within a minute or two if SWPC is purely ballistic. The ephemeris JSON gives the spacecraft position.
- **"32 RE" vs. Earth:** `propagated_time_tag` is the arrival time at about 32 RE upstream, not at the ground. Add roughly 5–10 min more (sheath plus magnetopause plus ionospheric response) for "Now at Earth" if an app wants ground effect (order of magnitude: 32 RE at 400 km/s is ~8.5 min in undisturbed flow, slower through the magnetosheath). This is uncertain and is not stated by SWPC.
- **Next / Now / Past windows (likely Glendale implementation):** rows with `propagated_time_tag > now` are "Next" (already measured at L1, not yet arrived; the lead time is the remaining delay, roughly 20–60 min). The row with `propagated_time_tag ≈ now` is "Now". Rows with `propagated_time_tag < now` are "Past". This is an inference about the app, not documented.
- Because ballistic error is about ±10–15 min, window boundaries finer than about 10 min are not physically meaningful. A Next/Now/Past split with windows of 15–30 min matches the timing accuracy.
- Coordinate system of `bz` in the propagated file: probably GSM, because SWPC RTSW mag fields are labelled `*_gsm` and the Geospace model ingests GSM. This is unverified.
- Latency: L1 real-time data reach SWPC within minutes. The JSON files are regenerated about once a minute. One project measured `cache-control: max-age=60` on SWPC JSON (ovation file, see section 4). Exact latency for propagated-solar-wind is not documented in sources found.

### Gaps
- Official SWPC documentation for `propagated-solar-wind.json` (method text, coordinate system, update cadence, handling of gaps or spacecraft switches) could not be loaded (DNS failure). The directory listing confirms only that it exists.
- Whether SWPC switched the propagation from flat-delay to Weimer after Cash et al. (2016): the 2016 paper and a 2025 review both describe SWPC as using ballistic/flat delay, so it is probably still ballistic. No 2026 confirmation was found.
- Exact quantitative MAE from Cash et al. (2016) beyond "±15 min common" was not retrieved. Case & Wild (2012) and Mailyan et al. (2008) error figures were not retrieved.
- Whether SOLAR-1's L1 orbit (which differs from DSCOVR's) changes typical delays was not found.

---

## 2. Definitions and conventions: GSM vs GSE Bz, clock angle θ, and "percent of time Bz southward"

### Takeaway
Use **GSM** components for coupling: Bz_GSM is the component projected along Earth's dipole-aligned Z axis, and RTSW publishes `bx_gsm, by_gsm, bz_gsm`. The IMF clock angle is measured in the GSM Y–Z plane from +Z (north): θ = atan2(By, Bz), so 0° is due north and ±180° is due south. Coupling functions use sin(θ/2) powers, which makes the sign of By irrelevant. No peer-reviewed or official definition of "% of time Bz negative" was found. It is an app-level statistic.

### Cited Findings
- The clock angle was introduced (Perreault & Akasofu) as the orientation of the IMF projection in the GSM Y–Z plane measured from the +Z axis. "The clock angle is the angle between geocentric solar magnetic (GSM) north and the projection of the IMF vector onto the GSM Y-Z plane." — [Earth Planets Space BF03351965](https://earth-planets-space.springeropen.com/track/pdf/10.1186/BF03351965) (search snippet); [science.gov topic page](https://www.science.gov/topicpages/i/imf+clock+angle)
- "v is solar wind speed, B_T = sqrt(B_z² + B_y²) and θ = arctan(B_y/B_z) is the so-called clock angle". In coupling functions the By effect is independent of its sign. — [arXiv 1805.10699 (Explicit IMF By-dependence…)](https://arxiv.org/pdf/1805.10699)
- chaosmagpy implements `clock_angle(By, Bz)` returning degrees and `coupling_Newell` using it. — [chaosmagpy docs](https://chaosmagpy.readthedocs.io/en/latest/functions/chaosmagpy.coordinate_utils.clock_angle.html)
- RTSW 1-min mag records carry `bx_gsm, by_gsm, bz_gsm, bt`. The older 1-day product carried `bx_gsm, by_gsm, bz_gsm, lon_gsm, lat_gsm, bt`. — [SimenZhor/SWPC-NOAA-Realtime-Data](https://github.com/SimenZhor/SWPC-NOAA-Realtime-Data); [kd9taw/Nexus](https://github.com/kd9taw/Nexus)
- Bt bounds Bz: |Bz| ≤ Bt, so a 5 nT field cannot give Bz below −5 nT. — [Gondwana Ecotours glossary (non-academic)](https://www.gondwanaecotours.com/trip-tips-alaska/northern-lights-glossary/bt/)
- Popular rule of thumb (non-peer-reviewed): "Bz sustained at −10 nT or below for 30 minutes or more" signals developing or intensifying aurora. — [Space Weather Tracker (lovable.app), IMF Bz page](https://www-spaceweathertracker-com.lovable.app/imf-bz)

### Inferences
- **Recommended formulas:**
  - Bt (as displayed by SWPC) = |B| = sqrt(Bx² + By² + Bz²). B_T in the Newell/Kan-Lee sense = sqrt(By² + Bz²) (the transverse field in the GSM Y–Z plane). An app should state which "Bt" it uses. SWPC's `bt` is the total field (background knowledge, consistent with Gondwana's description).
  - θ_c = atan2(By_GSM, Bz_GSM) in degrees, range (−180°, 180°]. Its magnitude |θ_c| is 0° northward, 90° pure ±By, 180° southward. Many apps display 0–360° (θ mod 360). Glendale's "theta" should be checked against both conventions. A quick test: a pure southward field should read 180°.
  - **Percent of time Bz southward over window W:** %S = 100 × N(Bz_GSM < 0) / N_valid, counting only non-null 1-min samples whose `propagated_time_tag` falls in W. Variants worth testing against Glendale: (a) a threshold below 0 (for example Bz < −1 nT, to ignore noise near zero); (b) the denominator including or excluding nulls; (c) using time_tag rather than propagated_time_tag.
- GSE vs GSM: Bz_GSE and Bz_GSM differ by a rotation about X through the dipole tilt angle. This is up to about 35° at solstice and UT extremes (background knowledge; the Russell–McPherron effect follows from it). An app using GSE Bz will mis-state southward fraction near solstices. SWPC's published fields are GSM, so no conversion is needed when using `bz_gsm`.

### Gaps
- No published source defines "percent of time Bz negative" as a standard index. It appears to be an app-specific statistic, possibly inspired by the half-wave rectified VBs concept (section 3). I found nothing documenting the Glendale app (name, developer, method). Searches for "Glendale aurora app" returned nothing relevant.
- The exact GSE↔GSM tilt range was not verified from a source in this session.

---

## 3. Solar wind–magnetosphere coupling functions and thresholds for short-term aurora/substorm prediction

### Takeaway
The best-validated single driver is Newell et al. (2007): dΦ_MP/dt = v^(4/3) B_T^(2/3) sin^(8/3)(θ_c/2). It correlated best with 9 of 10 magnetospheric indices, including Polar UVI auroral power. Akasofu's ε = 10⁷ v B² l₀² sin⁴(θ/2) W (l₀ = 7 RE) has a classic substorm threshold of about 10¹¹ W. Southward-IMF growth phases preceding substorms typically last tens of minutes to about 1 h, with a median of about 64–72 min for IMF-triggered substorms. They can be much shorter under strong driving, so a 30–60 min "sustained Bz south" window is reasonable but not a hard physical constant.

### Cited Findings
**Newell (2007) dΦ_MP/dt**
- dΦ_MP/dt = v^(4/3) B_T^(2/3) sin^(8/3)(θ_c/2). Physical reading: rate IMF lines approach the magnetopause (~v), fraction of lines that merge (sin^(8/3)(θ_c/2)), IMF magnitude (B_T), merging-line length ~(B_MP/B_T)^(1/3). It "correlated best with 9 out of 10 indices of magnetospheric activity". The exception is Dst, which correlates best (r = 0.87) with p^(1/2)·dΦ_MP/dt. — [Newell et al. 2007, JGR 112, A01206 (reference summary)](https://rjes.wdcb.ru/v20/2020ES000721/refsdir-721/Newe07.html); [EarthRef ERR 98173](https://earthref.org/ERR/98173/)
- Units: v in km/s, B_T in nT, θ_c = clock angle. chaosmagpy's implementation includes a factor 10⁻³ relative to the original definition. — [chaosmagpy coupling_Newell](https://chaosmagpy.readthedocs.io/en/latest/functions/chaosmagpy.coordinate_utils.coupling_Newell.html)
- OVATION Prime is driven by dΦ_MP/dt, "which predicts auroral power significantly better than Kp or other traditional parameters". — [data.gov: Ovation Prime Real-Time](https://catalog.data.gov/dataset/ovation-prime-real-time)
- A 2021 study found the PC index at 5–20 min delays correlates with auroral power better than the Newell function, but "the predicting abilities of the Newell's coupling function for the time delays of more than 20 minutes remain the best". — [Russ. Meteorol. Hydrol. 2021 (Springer 10.3103/S1068373921030080)](https://link.springer.com/article/10.3103/S1068373921030080); [MIG journal: On the Need to Reparametrize OVATION Prime (2010)](https://www.mig-journal.ru/en/archive-eng?id=5510)
- Newell et al. (2008), "Pairs of solar wind-magnetosphere coupling functions: Combining a merging term with a viscous term works best" (doi 10.1029/2007JA012825). — [EarthRef](https://earthref.org/ERR/116589/)

**Akasofu ε and Kan–Lee**
- ε = 10⁷ u B² l₀² sin⁴(θ/2) [W], with l₀ = 7 RE (u in km/s, B in nT; the 10⁷ factor absorbs the SI conversions). — [arXiv 2007.12352 (Supersubstorm energy analysis)](https://arxiv.org/pdf/2007.12352)
- Kan & Lee (1979): ε "can be identified semi-quantitatively as the dynamo power delivered from the solar wind to an open magnetosphere", and a substorm results when the dynamo power exceeds 10¹⁸ erg/s (= 10¹¹ W). — [NASA NTRS 19800065048](https://ntrs.nasa.gov/citations/19800065048) / [NTRS 19810055592](https://ntrs.nasa.gov/citations/19810055592) (search snippets)
- A 2005 study found that B² sin⁴(θ/2) is never recovered empirically and concluded that "the ε parameter … [is] less appropriate than a function of Bz". — [Int. J. Geomagn. Aeron. v04 gai03406](https://elpub.wdcb.ru/journals/ijga/v04/gai03406/gai03406.htm)

**Substorm timing vs southward IMF duration**
- Li et al. (2013), 379 southward-IMF turnings (1995–2011): growth phase lasts "from several minutes up to 2–3 h". It is shorter with stronger dayside reconnection E-field and faster solar wind. — [Li et al. 2013 JGR (PDF)](https://www.spaceweather.ac.cn/%7Ehli/papers/Li%20et%20al%202013%20JGR%20Solar%20wind%20impacts%20on%20growth%20phase%20duration%20and%20substorm%20intensity%20A%20statistical%20approach.pdf)
- Lyons et al. (1997): median growth-phase period of southward IMF before IMF-triggered classical substorms is about 64–72 min, with about 9 min from IMF trigger contact at the magnetopause to onset. — [Lyons et al. 1997 abstract (wind.nasa.gov)](https://wind.nasa.gov/imp8/abstracts/97-Lyons.htm)
- Fewer than 25% of 260 substorms (2001–2005) were associated with northward turnings of the IMF. — [Annales Geophysicae 27, 3559 (2009)](https://angeo.copernicus.org/articles/27/3559/2009/angeo-27-3559-2009.pdf)
- Longer substorms occur more often under stronger, longer-lasting southward IMF. — [Earth and Planetary Physics, Nov 2025 (DOAJ)](https://doaj.org/article/c6438fb4c0744232ad1dcbec26a74155)
- Anecdotal (forum, one observer): near-certain local aurora needed Bz ≈ −13 nT or lower for at least 1 h; around −10 nT relied on substorms. — [SpaceWeatherLive community forum](https://community.spaceweatherlive.com/topic/2816-unspecified-geomagnetic-activity/page/72/)

### Inferences
- **Formulas to implement (1-min, propagated data, GSM):**
  - θ_c = atan2(By, Bz). B_T = sqrt(By² + Bz²).
  - Newell: dΦ/dt = v^(4/3) · B_T^(2/3) · sin^(8/3)(|θ_c|/2). Units are (km/s)^(4/3)·nT^(2/3), often scaled by 10⁻³ or 10⁻⁴ for display. Quiet-time values are around 10³–10⁴ (unscaled) and storm values 2–5×10⁴ or more. This order of magnitude is from background knowledge and is unverified here, so calibrate against your own history.
  - Akasofu: ε[W] = 10⁷ · v[km/s] · B[nT]² · (7)² · sin⁴(θ_c/2). Substorm-prone when ε > about 10¹¹ W (Kan–Lee criterion).
  - Kan–Lee reconnection E-field (background knowledge, form not confirmed in a retrieved source): E_KL = v · B_T · sin²(θ_c/2). In mV/m, use v[km/s] · B_T[nT] · 10⁻³.
  - Rectified VBs (background knowledge): VBs = v · max(0, −Bz) (with Bs = −Bz when Bz < 0, else 0). In mV/m: 10⁻³ · v[km/s] · Bs[nT]. A sustained VBs of about 2–3 mV/m or more is commonly associated with storm-level driving (not verified here).
- **Duration logic:** "% of time Bz south" over the last 30–60 min is effectively a crude proxy for the time-integrated (rectified) coupling that loads the magnetotail during the growth phase. Lyons' 64–72 min median and Li's "several minutes to 2–3 h" justify a 60-min "Past" window plus an "accumulated loading" indicator such as ∫VBs dt or a mean of dΦ/dt over 60 min. They do not justify treating any single duration as a hard threshold.
- Mapping coupling to the equatorward edge of the aurora at a given magnetic latitude is best done through Kp or hemispheric power (section 4) rather than through raw coupling thresholds. No retrieved source gave direct coupling-to-latitude thresholds.

### Gaps
- The Newell (2008) Kp regression coefficients were not retrieved. Do not use a Kp-from-dΦ/dt formula without checking doi 10.1029/2007JA012825.
- Quantitative thresholds of dΦ/dt or ε for visible aurora at specific magnetic latitudes (e.g. 50°, 55°, 60° MLAT) were not found in retrievable sources.
- The Kan–Lee formula was not directly confirmed from a fetched source (form above is from background knowledge).

---

## 4. NOAA products useful for alerts: OVATION aurora forecast, hemispheric power, estimated (1-minute) Kp

### Takeaway
`json/ovation_aurora_latest.json` (OVATION Prime, run every 5 min) gives a 360×181 lon/lat grid of the probability of visible aurora (%) at "Forecast Time". Its lead time equals the actual L1 travel time (about 30–90 min), despite the "30-minute" name. When solar wind data are bad it falls back to Kp-driven forcing with no lead time. `json/planetary_k_index_1m.json` provides a 1-minute running estimated Kp (`estimated_kp` float, `kp_index` int) from 8 magnetometers. The official 3-hourly Kp is in `products/noaa-planetary-k-index.json`.

### Cited Findings
- SWPC: OVATION "provides a 30 to 90 minute forecast of the location and intensity of the aurora". The lead time is the L1→Earth solar wind travel time. When L1 data are bad or missing, "an alternative estimate of the solar wind forcing, based on the current Kp geomagnetic index is used … there is no forecast lead time." — [SWPC Aurora – 30 Minute Forecast](https://www.spaceweather.gov/products/aurora-30-minute-forecast) (search snippets); [swpc.noaa.gov mirror](https://swpc.noaa.gov/products/aurora-30-minute-forecast)
- WMO product portal: cadence 5 minutes. The product uses "a fixed 30-minute delay time between L1 and Earth, while actual delays vary from less than 30 minutes to an hour or so". This **conflicts** with the SWPC page and with live observations below that Forecast−Observation spans 49–65 min. The WMO text may describe an older version. — [SWPC/WMO Auroral Activity page](https://www.spaceweather.gov/content/wmo/auroral-activity)
- The UAF Geophysical Institute page says "NOAA SWPC OVATION is updated every 5 minutes". — [UAF GI Aurora Forecast](https://www.gi.alaska.edu/monitors/aurora-forecast)
- Real-time OVATION implements the Newell 2009/2010 work and "is run every 5 minutes producing precipitating energy flux for 4 distinct auroral types in 240 … geomagnetic latitude/longitude bins for each hemisphere". OVATION Prime-2013 is an upgrade of the 2010 version. — [data.gov Ovation Prime Real-Time](https://catalog.data.gov/dataset/ovation-prime-real-time); [JHU/APL SSUSI bibliography](https://ssusi.jhuapl.edu/bibliography?aname=Liou)
- JSON grid: "360 by 181 grid of probabilities in percent of visible aurora", lon 0–359, lat −90..90. "Every five minutes a new forecast is published for the coming 30 minutes." — [Cartopy gallery: Aurora forecast](https://cartopy.readthedocs.io/stable/gallery/scalar_data/aurora_forecast.html)
- Schema from live fetches: `{"Observation Time", "Forecast Time", "Data Format": "[Longitude, Latitude, Aurora]", "coordinates": [[lon, lat, p], …], "type": "MultiPoint"}`, 65,160 cells, about 0.9–1.4 MB (about 141 kB gzipped), `access-control-allow-origin: *`, `cache-control: max-age=60` (measured 2026-09-30). Example: Observation 11:07Z, Forecast 11:56Z (49 min). Another project measured Forecast−Observation of 61–65 min on 2026-10-16. — GitHub: [Sara-Managed-Projects/space-radar site/js/data/ovation.js](https://github.com/Sara-Managed-Projects/space-radar); [clemensv/real-time-sources tools/candidates/geomagnetic/noaa-ovation-aurora.md](https://github.com/clemensv/real-time-sources); [011-sam-110/Provenance lib/signals/aurora.ts](https://github.com/011-sam-110/Provenance)
- OVATION computes a globally integrated energy deposition (hemispheric power) in GW for up to 30 min ahead (secondary description). SpaceWeatherLive moderators say hemispheric power is computed from solar wind parameters, depends heavily on current and past Bz, and rises toward an equilibrium. One user reported no aurora seen at HP ≈ 100 GW at their site. — [Michigan Aurora Chasers: Using the Ovation Model](https://michiganaurorachasers.com/guides/using-the-ovation-model/); [SpaceWeatherLive community](https://community.spaceweatherlive.com/topic/4210-x19-cme/page/36/)
- A dataset abstract reports that auroral hemispheric power rises with solar wind speed, more so under northward than southward Bz. Southward Bz is the dominant factor and speed is second. — [UCAR data commons abstract](https://ckanprod.data-commons.k8s.ucar.edu/harvest/object/3fc0cb7d-87d3-4fcc-a7b5-9c180fff6fc8/html)
- An HP feed URL constant exists alongside OVATION in open-source code (`HEMI_POWER_URL`). Its exact path was not shown in the snippet. — [dividebysandwich/sdroxide crates/sdroxide-solar/src/aurora.rs](https://github.com/dividebysandwich/sdroxide)
- Planetary K: the SWPC chart "updates every minute". The estimated 3-h Kp uses magnetometers at Sitka, Meanook, Ottawa, Fredericksburg, Hartland, Wingst, Niemegk, and Canberra. K quantifies disturbances in the horizontal field component on a 0–9 scale. Kp=5 is G1, 6 is G2, 7 is G3, 8 and 9− are G4, and 9o is G5. — [SWPC Planetary K-index](https://swpc.noaa.gov/products/planetary-k-index)
- `json/planetary_k_index_1m.json`: an array of `{time_tag, kp_index, estimated_kp, kp}`, where time_tag is ISO UTC ("2026-01-21T05:13:00") and `estimated_kp` is a float. It covers about the last 6 h (forum). `products/noaa-planetary-k-index.json` returns record dicts `(time_tag, Kp, a_running, station_count)`. `products/noaa-estimated-planetary-k-index-1-minute.json` returns 404. — GitHub: [agessaman/meshcore-bot noaa_aurora_client.py](https://github.com/agessaman/meshcore-bot); [Hotragn/HotEARTH](https://github.com/Hotragn/HotEARTH); [SpaceWeatherLive forum: SWPC 1-minute Kp](https://community.spaceweatherlive.com/topic/1095-swpc-1-minute-kp-index/)

### Inferences
- For a "Next" aurora signal, OVATION's own lead time equals the propagated L1 delay. The app's Next window and OVATION's Forecast Time should line up. An app can show `Forecast Time − now` as the lead time.
- Point probability alert: look up the grid cell nearest the user (round lat to 1°, lon mod 360). Many apps also take the maximum over a poleward band, because aurora seen low on the horizon comes from poleward of the observer (by roughly 5–10° of latitude for a high-altitude red/green arc). This is a common practice, not documented by SWPC.
- If OVATION falls back to Kp (bad L1 data), the lead time collapses to zero. An app can detect this when `Forecast Time − Observation Time` is about 0 and should flag it.
- `estimated_kp` is a nowcast of the 3-h Kp from partial data. It is noisy within a 3-h block, so smoothing it (e.g. a 15-min mean) before thresholding avoids flapping alerts.

### Gaps
- Official SWPC documentation for the hemispheric-power text file (assumed `text/aurora-nowcast-hemi-power.txt`), including columns, cadence and whether it is a forecast or a nowcast, was not retrieved.
- The exact algorithm for the 1-minute estimated Kp (window length, scaling) was not found in official sources.
- How OVATION smooths or time-averages the solar-wind driver (e.g. weighting over prior hours) was not confirmed. Check Newell et al. 2010 or the OVATION Prime source.
- A documented conversion from OVATION % to "probability of seeing aurora" was not found beyond the SWPC description "probability of visible aurora".

---

## 5. Alert heuristics used by aurora alert services and ground-magnetometer substorm-onset detection

### Takeaway
AuroraWatch UK issues four-level alerts from an hourly magnetometer disturbance index in nT (quiet-day-curve-based, updated every 3 min). The commonly cited thresholds are **50 / 100 / 200 nT** for yellow / amber / red. Only the 200 nT red threshold is confirmed by an AuroraWatch-run source, and the rest come from a third party. The standard automated substorm-onset detector is Newell & Gjerloev (2011) on SuperMAG SML: a drop of more than 45 nT within 3 min (stepwise >15/30/45 nT at 1/2/3 min) followed by a sustained mean of less than −100 nT relative to onset for about 26 min.

### Cited Findings
**AuroraWatch UK**
- Four levels. Green: no significant activity, aurora unlikely anywhere in the UK. Yellow: minor activity, possible by eye from Scotland and by camera from N England and N Ireland. Amber: likely by eye from Scotland, N England and N Ireland, possible elsewhere, photos likely anywhere. Red: likely by eye and camera anywhere in the UK. Uses SAMNET and AuroraWatchNet magnetometers. — [AuroraWatch UK alerts (draft mirror, search snippet)](https://aurorawatch-draft.lancs.ac.uk/alerts/); [aurorawatch.lancs.ac.uk/alerts](https://aurorawatch.lancs.ac.uk/alerts/)
- Hourly activity index in nT. The value for the current hour updates every 3 minutes, which is why it is low early in the hour. Metrics include the maximum hourly range of H and E and the "maximum absolute combined disturbance of the H and E components … from the expected quiet-day curve value". — [AuroraWatch UK data explanation](https://aurorawatch.lancs.ac.uk/explanation/) (search snippets)
- Red threshold: a 2017 AuroraWatch blog describes a storm that "fell just short of the required **200 nT**, maxing out at 190 nT". A red alert was triggered by a magnetometer near Aberdeen while others sat just under the threshold. — [AuroraWatch UK blog (Lancaster)](https://wp.lancs.ac.uk/aurorawatchuk/page/4/); [27 March 2017 red alert](https://wp.lancs.ac.uk/aurorawatchuk/2017/03/28/27-march-red-alert/)
- Third-party table: Green < 50 nT (≈Kp 0–3), Yellow 50–100 nT (≈Kp 4), Amber 100–200 nT, Red ≥ 200 nT. This page is internally inconsistent for its higher red rows. — [Derekscope: Northern Lights](https://derekscope.co.uk/northern-lights/)
- Case et al. (2017), "AuroraWatch UK: An Automated Aurora Alert System", Earth and Space Science 4, 746: alerts are automated when disturbance reaches thresholds. A reprocessed database covers over 150,000 hours (99.94% availability) with nearly 9,000 hours of enhanced activity. The SAMNET triaxial fluxgate has 0.05 nT resolution. — [AGU/Wiley 10.1002/2017EA000328](https://agupubs.onlinelibrary.wiley.com/doi/full/10.1002/2017EA000328); [ADS](https://ui.adsabs.harvard.edu/abs/2017E&SS....4..746C/abstract); [Lancaster EPrints](https://eprints.lancs.ac.uk/id/eprint/88521/)
- AuroraWatch UK issues daytime alerts too, when nothing is visible (magnetic, not optical, criterion). — [AuroraWatch FAQ: daytime alerts](https://aurorawatch.lancs.ac.uk/faq/daytime-alerts/)

**NOAA / SpaceWeatherLive**
- NOAA's G-scale is tied to Kp: G1 = Kp 5 up to G5 = Kp 9o. — [SWPC Planetary K-index](https://swpc.noaa.gov/products/planetary-k-index)
- No official SpaceWeatherLive help text was retrieved (DNS failure). Its help page "The solar wind" exists at [spaceweatherlive.com/en/help/the-solar-wind.html](https://www.spaceweatherlive.com/en/help/the-solar-wind.html). Forum posts (non-authoritative) describe HP and Bz rules of thumb (see sections 3–4).

**Ground-magnetometer substorm onset**
- Newell & Gjerloev (2011) SML onset: a sharp SML decrease of more than 45 nT in 3 min, developing into a negative bay, with SML maintained below −100 nT relative to the initial value for the subsequent 26 min. — [Hajra et al., JGR (Birkeland Centre PDF)](https://birkeland.uib.no/wp-content/uploads/2018/02/130_Hajra_JGR_NOA.pdf)
- Stepwise: SML(t0+1) − SML(t0) < −15 nT, SML(t0+2) − SML(t0) < −30 nT, SML(t0+3) − SML(t0) < −45 nT, and (1/26) Σ_{t=t0+4}^{t0+29} SML(t) − SML(t0) < −100 nT. — [Kayode-Adeoye et al., NSF PAR](https://par.nsf.gov/servlets/purl/10549716) (search snippet; consistent with Hajra)
- SuperMAG distributes this as its default "newell" substorm catalogue (automated, 1-min SML, 1969–present, continuously revised). Alternatives include SOPHIE (Forsyth et al. 2015, percentile-based thresholds on SML) and Ohtani & Gjerloev (2020, stricter, for isolated substorms). Catalogues should not be merged naively. — [SWVO docs: SuperMAG substorm-onset catalogues](https://swvo.readthedocs.io/en/latest/supermag_substorms.html); [SOPHIE, NORA](https://nora.nerc.ac.uk/id/eprint/513213)

### Inferences
- **A replicable local "AuroraWatch-like" index** from a single magnetometer (e.g. an INTERMAGNET 1-min H component): activity_hour = max over the hour of |H(t) − QDC(t)| (or the max−min range of H within the clock hour). Then threshold at 50/100/200 nT for a mid-latitude (~54° geographic) station. Thresholds must be re-scaled for other magnetic latitudes, because disturbance amplitude grows poleward.
- A **real-time substorm-onset flag** for an app can apply the Newell–Gjerloev test to any 1-min H-component series from an auroral-zone station (as a local proxy for SML). The final confirmation needs 26–29 min of post-onset data, so issue a provisional alert after the 3-min drop and confirm later.
- Combining an upstream trigger (the "Next" window shows sustained southward Bz plus high dΦ/dt or ε > 10¹¹ W) with a ground confirmation (an H-bay drop of more than 45 nT in 3 min) mirrors the physical chain: loading over about 30–70 min, then onset.

### Gaps
- Official AuroraWatch UK nT values for yellow and amber, and whether thresholds apply to the hourly H range or to the QDC-based combined H/E disturbance, could not be confirmed from an AuroraWatch-run page (DNS failure). Only red = 200 nT is confirmed by an AuroraWatch blog.
- SpaceWeatherLive's official thresholds and colour scales for Bz, Bt, speed and HP were not retrievable.
- NOAA SWPC alert message codes for aurora (e.g. K-index warnings and alerts at K4/K5+) were not researched in depth here.
