// yashdave003.github.io — main client script
// Responsibilities:
//   1. Inject the footer SVG banner (kept here so it lives in one source-of-truth file)
//   2. Footer banner pause/play on click or keyboard
//   3. Theme toggle (light/dark) with localStorage persistence
//   4. Active-nav highlighting based on current URL

(function () {
  const FOOTER_HTML = `<svg viewBox="0 0 800 180" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id="sky-f" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"   class="sky-top"/>
        <stop offset="58%"  class="sky-mid"/>
        <stop offset="100%" class="sky-bot"/>
      </linearGradient>
      <linearGradient id="sand-f" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"   class="sand-top"/>
        <stop offset="100%" class="sand-bot"/>
      </linearGradient>
      <linearGradient id="hills-f" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"   class="hills-top"/>
        <stop offset="100%" class="hills-bot"/>
      </linearGradient>
      <linearGradient id="green-f" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"   class="grass-top"/>
        <stop offset="100%" class="grass-bot"/>
      </linearGradient>
      <linearGradient id="water-f" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"   class="water-top"/>
        <stop offset="100%" class="water-bot"/>
      </linearGradient>
      <!-- Far background hills (slightly desaturated blue-grey, hazy) -->
      <linearGradient id="bg-hills-f" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"   class="bg-hills-top"/>
        <stop offset="100%" class="bg-hills-bot"/>
      </linearGradient>
  
      <!-- Clip paths for vehicle identity bands.
           F-bus band:    scene-x ∈ [195, 612]  (between Doe Library and Salesforce centers)
           Caltrain band: scene-x ∈ [612, 774]  (between Salesforce and Hoover Tower centers)
           Dubai Metro: drawn unclipped underneath — visible wherever the other two aren't.
           Vehicle y range varies (bus y=116-132, Caltrain y=112-132), clipped generously across full height. -->
      <clipPath id="clip-fbus-f" clipPathUnits="userSpaceOnUse">
        <rect x="195" y="0" width="417" height="180"/>
      </clipPath>
      <clipPath id="clip-caltrain-f" clipPathUnits="userSpaceOnUse">
        <rect x="612" y="0" width="162" height="180"/>
      </clipPath>
      <clipPath id="clip-dubai-f" clipPathUnits="userSpaceOnUse">
        <!-- Dubai Metro visible only in the gap zones [0..195] and [774..800] -->
        <rect x="0" y="0" width="195" height="180"/>
        <rect x="774" y="0" width="26" height="180"/>
      </clipPath>
    </defs>
  
    <!-- 1. SKY -->
    <rect width="800" height="180" fill="url(#sky-f)"/>
    <!-- Sun / Moon: clickable group — doubles as a secondary theme toggle. main.js binds click + Enter/Space. -->
    <g class="sun-moon" role="button" tabindex="0" aria-label="Toggle dark mode">
      <circle cx="50" cy="30" r="16" fill="#f5d9a0" opacity="0.45"/>
      <!-- Sun halo (r=24): adds warmth around the sun in light; hidden in dark since the moon shouldn't glow on its dark side -->
      <circle class="sun-halo" cx="50" cy="30" r="24" fill="#f5d9a0" opacity="0.10"/>
      <!-- Crescent shadow: dark-mode only — carves the right side of the disc to make a waxing crescent (open right) -->
      <circle class="moon-shadow" cx="55.5" cy="29" r="14" fill="#0a0820"/>
    </g>
  
    <!-- 1a-stars. NIGHT STARS — dark-mode only via .night-stars class. Vague Orion above the bay
         (Betelgeuse + Bellatrix shoulders, 3-star belt, Rigel + Saiph feet — no sword to keep it
         spare) + 7 scatter stars placed in open-sky areas, avoiding tall landmarks. -->
    <g class="night-stars">
      <!-- Orion (rotated ~15° CW around center 458,40 to match the orion-flashcard.jpg reference).
           Per-star size + opacity scaled to real apparent magnitude (smaller mag = brighter):
             Rigel (0.13) brightest blue; Betelgeuse (0.45) bright red; Bellatrix (1.64);
             Alnilam (1.69, mid belt); Alnitak (1.74, east belt); Saiph (2.09); Mintaka (2.23, dimmest). -->
      <circle cx="446" cy="16" r="0.85" fill="#f5d0a0" opacity="0.92"/> <!-- Betelgeuse (red) -->
      <circle cx="482" cy="28" r="0.6"  fill="#d8e0e8" opacity="0.72"/> <!-- Bellatrix -->
      <circle cx="448" cy="33" r="0.5"  fill="#e8e8e8" opacity="0.65"/> <!-- Alnitak (east belt) -->
      <circle cx="458" cy="38" r="0.55" fill="#e8e8e8" opacity="0.75"/> <!-- Alnilam (mid belt) -->
      <circle cx="467" cy="42" r="0.45" fill="#e8e8e8" opacity="0.55"/> <!-- Mintaka (west belt) -->
      <circle cx="434" cy="52" r="0.45" fill="#e8e8e8" opacity="0.5"/>  <!-- Saiph (dimmest foot) -->
      <circle cx="466" cy="63" r="0.9"  fill="#d8e0f0" opacity="0.95"/> <!-- Rigel (brightest, blue) -->
      <!-- Scatter (placed away from tall landmarks: Burj at x≈87, Salesforce at x≈615, Hoover at x≈774) -->
      <circle cx="125" cy="15" r="0.4"  fill="#e8e8e8" opacity="0.6"/>
      <circle cx="210" cy="22" r="0.5"  fill="#e8e8e8" opacity="0.7"/>
      <circle cx="310" cy="14" r="0.35" fill="#e8e8e8" opacity="0.55"/>
      <circle cx="375" cy="40" r="0.4"  fill="#e8e8e8" opacity="0.5"/>
      <circle cx="550" cy="18" r="0.45" fill="#e8e8e8" opacity="0.6"/>
      <circle cx="660" cy="24" r="0.4"  fill="#e8e8e8" opacity="0.6"/>
      <circle cx="740" cy="12" r="0.35" fill="#e8e8e8" opacity="0.55"/>
    </g>

    <!-- 1b. FAR BACKGROUND HILLS (continuous, hazy, taller around Berkeley & Stanford) -->
    <path d="M 0,148 Q 80,118 160,128 Q 200,108 260,98 Q 320,108 400,114 Q 480,108 560,118 Q 640,96 720,108 Q 760,116 800,128 L 800,180 L 0,180 Z" fill="url(#bg-hills-f)" opacity="0.55"/>
  
    <!-- 1c. SUTRO TOWER — drawn between the two background-hills layers; color-matched to first range so it reads as part of that atmospheric depth -->
    <g opacity="0.55">
      <!-- Splayed A-frame lattice base -->
      <line x1="590" y1="86" x2="580" y2="146" stroke="#b0c0d0" stroke-width="1.3"/>
      <line x1="590" y1="86" x2="590" y2="146" stroke="#b0c0d0" stroke-width="1.3"/>
      <line x1="590" y1="86" x2="600" y2="146" stroke="#b0c0d0" stroke-width="1.3"/>
      <!-- Horizontal cross-bracing -->
      <line x1="582" y1="134" x2="598" y2="134" stroke="#b0c0d0" stroke-width="0.7"/>
      <line x1="584" y1="122" x2="596" y2="122" stroke="#b0c0d0" stroke-width="0.7"/>
      <line x1="586" y1="110" x2="594" y2="110" stroke="#b0c0d0" stroke-width="0.7"/>
      <line x1="587" y1="98"  x2="593" y2="98"  stroke="#b0c0d0" stroke-width="0.7"/>
      <!-- Diagonal X-bracing -->
      <line x1="582" y1="134" x2="588" y2="122" stroke="#b0c0d0" stroke-width="0.5" opacity="0.7"/>
      <line x1="598" y1="134" x2="592" y2="122" stroke="#b0c0d0" stroke-width="0.5" opacity="0.7"/>
      <line x1="584" y1="122" x2="589" y2="110" stroke="#b0c0d0" stroke-width="0.5" opacity="0.7"/>
      <line x1="596" y1="122" x2="591" y2="110" stroke="#b0c0d0" stroke-width="0.5" opacity="0.7"/>
      <line x1="586" y1="110" x2="589" y2="98"  stroke="#b0c0d0" stroke-width="0.5" opacity="0.7"/>
      <line x1="594" y1="110" x2="591" y2="98"  stroke="#b0c0d0" stroke-width="0.5" opacity="0.7"/>
      <!-- Lower platform -->
      <rect x="582" y="92" width="16" height="2" fill="#b0c0d0"/>
      <rect x="582" y="90" width="16" height="2" fill="#b0c0d0"/>
      <!-- Upper platform -->
      <rect x="584" y="80" width="12" height="2" fill="#b0c0d0"/>
      <rect x="584" y="78" width="12" height="2" fill="#b0c0d0"/>
      <!-- Trunk between platforms (so upper crown doesn't read as floating) -->
      <rect x="588" y="82" width="4" height="8" fill="#b0c0d0"/>
      <!-- Three vertical antennas (shortened a touch more) -->
      <rect x="585"   y="69" width="1.2" height="9"  fill="#b0c0d0"/>
      <rect x="589.4" y="66" width="1.2" height="12" fill="#b0c0d0"/>
      <rect x="593.8" y="69" width="1.2" height="9"  fill="#b0c0d0"/>
    </g>
  
    <!-- Second range w/ Twin Peaks profile around x=555..600 (covers Sutro's lower half) -->
    <path class="mid-range-hills" d="M 380,148 Q 440,128 500,134 Q 530,124 555,107 Q 575,114 583,113 Q 588,108 600,108 Q 615,118 640,124 Q 680,112 740,118 Q 780,124 800,134 L 800,180 L 380,180 Z" fill="#a8a89a" opacity="0.85"/>

    <!-- Hill house specks — dark-mode only. Sodium-yellow lights representing houses on the
         hillsides at night (Berkeley hills, Twin Peaks slope, Stanford foothills). Placed in
         landmark-free gaps so they actually show; clustered in 3 visual groups. -->
    <g class="hill-lights">
      <!-- Berkeley hills cluster (between Burj at x≈85, Doe at x≈169..223, Crane at x≈269..295) -->
      <circle cx="175" cy="124" r="0.55" fill="#e8c060" opacity="0.85"/>
      <circle cx="200" cy="110" r="0.5" fill="#e8c060" opacity="0.8"/>
      <circle cx="218" cy="109" r="0.5" fill="#e8c060" opacity="0.75"/>
      <circle cx="240" cy="115" r="0.55" fill="#e8c060"/>
      <circle cx="252" cy="112" r="0.6" fill="#e8c060"/>
      <circle cx="258" cy="118" r="0.45" fill="#e8c060" opacity="0.75"/>
      <circle cx="263" cy="105" r="0.5" fill="#e8c060" opacity="0.8"/>
      <circle cx="268" cy="110" r="0.5" fill="#e8c060" opacity="0.8"/>
      <circle cx="290" cy="105" r="0.5" fill="#e8c060" opacity="0.85"/>
      <circle cx="305" cy="108" r="0.55" fill="#e8c060" opacity="0.9"/>
      <circle cx="320" cy="110" r="0.55" fill="#e8c060" opacity="0.9"/>
      <circle cx="336" cy="115" r="0.5" fill="#e8c060" opacity="0.8"/>
      <!-- Bay-east hill slope (just before Ferry) -->
      <circle cx="528" cy="125" r="0.5" fill="#e8c060" opacity="0.85"/>
      <circle cx="548" cy="119" r="0.5" fill="#e8c060" opacity="0.85"/>
      <!-- Twin Peaks / Marin cluster (between Salesforce at x≈625, Memorial Church at x≈685) -->
      <circle cx="635" cy="123" r="0.55" fill="#e8c060"/>
      <circle cx="642" cy="118" r="0.5" fill="#e8c060" opacity="0.8"/>
      <circle cx="648" cy="115" r="0.5" fill="#e8c060" opacity="0.85"/>
      <circle cx="652" cy="120" r="0.5" fill="#e8c060" opacity="0.85"/>
      <circle cx="660" cy="112" r="0.5" fill="#e8c060" opacity="0.8"/>
      <circle cx="668" cy="117" r="0.55" fill="#e8c060" opacity="0.9"/>
      <circle cx="675" cy="123" r="0.45" fill="#e8c060" opacity="0.7"/>
      <circle cx="678" cy="121" r="0.45" fill="#e8c060" opacity="0.75"/>
      <!-- Stanford foothills cluster (between Memorial Church at x≈731, Hoover at x≈770) -->
      <circle cx="742" cy="122" r="0.55" fill="#e8c060"/>
      <circle cx="750" cy="125" r="0.45" fill="#e8c060" opacity="0.75"/>
      <circle cx="755" cy="118" r="0.5" fill="#e8c060" opacity="0.8"/>
      <circle cx="758" cy="124" r="0.5" fill="#e8c060" opacity="0.8"/>
      <circle cx="785" cy="128" r="0.45" fill="#e8c060" opacity="0.75"/>
      <circle cx="792" cy="125" r="0.5" fill="#e8c060" opacity="0.85"/>
    </g>
  
    <!-- 2. GROUND -->
    <!-- Dubai sand: 0–160 (narrowed from 205) -->
    <rect x="0" y="148" width="160" height="32" fill="url(#sand-f)"/>
    <ellipse class="day-highlight" cx="55"  cy="150" rx="55" ry="9" fill="#d8c4a0" opacity="0.55"/>
    <ellipse class="day-highlight" cx="125" cy="151" rx="32" ry="8" fill="#d8c4a0" opacity="0.45"/>
    <!-- Berkeley green grass: 150–310 (was 150–340; trimmed to meet new water position) -->
    <ellipse cx="230" cy="160" rx="100" ry="28" fill="url(#green-f)"/>
    <ellipse class="day-highlight" cx="160" cy="161" rx="50"  ry="20" fill="#7a9a6a" opacity="0.7"/>
    <ellipse class="day-highlight" cx="300" cy="161" rx="40"  ry="20" fill="#5a7a4a" opacity="0.7"/>
    <rect x="150" y="148" width="160" height="32" fill="url(#green-f)"/>
    <!-- SF: 340–615 (bigger water section, integrated Yerba Buena, downtown landmarks) -->
    <ellipse cx="555" cy="160" rx="80" ry="26" fill="url(#green-f)"/>
    <ellipse class="day-highlight" cx="605" cy="162" rx="35"  ry="18" fill="#7a9a6a" opacity="0.7"/>
    <!-- East shore (Embarcadero side of SF) — shifted left 30px to match bridge -->
    <rect x="510" y="148" width="105" height="32" fill="url(#green-f)"/>
    <!-- Wide bay water spanning the bridge — shifted left 30px -->
    <rect x="310" y="146" width="200" height="34" fill="url(#water-f)"/>
    <rect class="day-highlight" x="310" y="146" width="200" height="6"  fill="#c8eaf8" opacity="0.45"/>
    <!-- Fog veil over SF area — shifted left 30px, widened to cover full SF zone -->
    <rect class="day-highlight" x="310" y="140" width="305" height="14" fill="#f0e6d3" opacity="0.22"/>
    <!-- Stanford: 600–800 -->
    <ellipse cx="700" cy="160" rx="115" ry="26" fill="url(#green-f)"/>
    <ellipse class="day-highlight" cx="605" cy="161" rx="45"  ry="18" fill="#8aaa7a" opacity="0.7"/>
    <ellipse class="day-highlight" cx="790" cy="162" rx="55"  ry="18" fill="#7a9a6a" opacity="0.7"/>
    <rect x="600" y="148" width="200" height="32" fill="url(#green-f)"/>
  
    <!-- 3. BACKGROUND BUILDINGS -->
    <!-- Dubai cluster + Frame -->
    <rect x="8"  y="124" width="16" height="24" fill="#3d3020"/>
    <rect x="26" y="130" width="12" height="18" fill="#2a1a0e"/>
    <rect x="42" y="108" width="6"  height="40" fill="#4a3828"/>
    <rect x="55" y="108" width="6"  height="40" fill="#4a3828"/>
    <rect x="42" y="108" width="19" height="6"  fill="#4a3828"/>
    <rect x="118" y="128" width="14" height="20" fill="#3d3020"/>
    <!-- Palm transition (now at x≈145) -->
    <rect x="148" y="126" width="3" height="22" fill="#5a4020"/>
    <ellipse cx="149" cy="124" rx="9"  ry="5" fill="#5a7a3a" opacity="0.85"/>
    <ellipse cx="142" cy="127" rx="7"  ry="4" fill="#4a6a2a" opacity="0.7" transform="rotate(-20,142,127)"/>
    <ellipse cx="156" cy="127" rx="7"  ry="4" fill="#5a7a3a" opacity="0.7" transform="rotate(20,156,127)"/>
    <!-- Berkeley small distant bldgs -->
    <rect x="157" y="142" width="10" height="6" fill="#6a5030"/>
    <rect x="288" y="142" width="10" height="6" fill="#5a4028"/>
    <!-- SF small bg buildings (between landmarks, set back) -->
    <rect x="530" y="135" width="8"  height="13" fill="#3d3020"/>
    <rect x="608" y="130" width="6"  height="18" fill="#2a1a0e"/>
    <!-- Stanford small bg buildings (between Mem Church and Hoover, set back) -->
    <rect x="625" y="142" width="12" height="6" fill="#6a5030"/>
    <rect x="660" y="141" width="10" height="7" fill="#6a5030"/>
    <rect x="745" y="142" width="14" height="6" fill="#5a4028"/>
  
    <!-- 4. ELEVATED GUIDEWAY -->
    <g class="guideway-pillars" fill="#8a7a60">
      <rect x="17"  y="134" width="10" height="3"/><rect x="20"  y="136" width="4" height="12"/>
      <rect x="63"  y="134" width="10" height="3"/><rect x="66"  y="136" width="4" height="12"/>
      <rect x="109" y="134" width="10" height="3"/><rect x="112" y="136" width="4" height="12"/>
      <rect x="155" y="134" width="10" height="3"/><rect x="158" y="136" width="4" height="12"/>
      <rect x="201" y="134" width="10" height="3"/><rect x="204" y="136" width="4" height="12"/>
      <rect x="247" y="134" width="10" height="3"/><rect x="250" y="136" width="4" height="12"/>
      <rect x="293" y="134" width="10" height="3"/><rect x="296" y="136" width="4" height="12"/>
      <!-- Skip over bay water -->
      <rect x="528" y="134" width="10" height="3"/><rect x="531" y="136" width="4" height="12"/>
      <rect x="574" y="134" width="10" height="3"/><rect x="577" y="136" width="4" height="12"/>
      <rect x="620" y="134" width="10" height="3"/><rect x="623" y="136" width="4" height="12"/>
      <rect x="666" y="134" width="10" height="3"/><rect x="669" y="136" width="4" height="12"/>
      <rect x="712" y="134" width="10" height="3"/><rect x="715" y="136" width="4" height="12"/>
      <rect x="758" y="134" width="10" height="3"/><rect x="761" y="136" width="4" height="12"/>
    </g>
    <!-- Beam broken into two segments so it doesn't overlap with the bay bridge (345..540).
         Pillars on the left already end at x=349, pillars on the right start at x=528. -->
    <rect class="guideway-beam" x="0"   y="132" width="305" height="3" fill="#9a8a70"/>
    <rect class="guideway-beam" x="540" y="132" width="260" height="3" fill="#9a8a70"/>
    <line x1="0"   y1="132.5" x2="305" y2="132.5" stroke="#7a6045" stroke-width="0.6" opacity="0.5"/>
    <line x1="540" y1="132.5" x2="800" y2="132.5" stroke="#7a6045" stroke-width="0.6" opacity="0.5"/>
    <line x1="0"   y1="134.5" x2="305" y2="134.5" stroke="#7a6045" stroke-width="0.4" opacity="0.4"/>
    <line x1="540" y1="134.5" x2="800" y2="134.5" stroke="#7a6045" stroke-width="0.4" opacity="0.4"/>
  
    <!-- 5. TRAIN LAYER — animated with seamless zone-based identity swap.
         Two copies of each train silhouette (Metro, BART, Caltrain) are rendered.
         Copy A uses animation phase 0; Copy B is offset by half a cycle (-8s delay)
         so as one train exits the right, another enters the left.
         Metro is the base layer; BART and Caltrain overlay it within their clip bands. -->
  
    <!-- ─── COPY A ─── -->
  
    <!-- Dubai Metro (Copy A) — clipped to [0..195] ∪ [774..800] so only one vehicle visible per zone -->
    <g clip-path="url(#clip-dubai-f)">
      <g class="train-anim-a">
      <g transform="translate(115,0) scale(-1,1)">
      <rect x="2"   y="114" width="113" height="2" rx="1" class="dubai-roof" fill="#e8f0f4"/>
      <path d="M 11,116 Q 4,116 2,120 Q 0,123 2,126 Q 4,130 11,130 L 11,116 Z" class="dubai-body" fill="#48b4e4"/>
      <path d="M 11,117 Q 5,117 3,120 Q 2,123 3,126 Q 5,129 11,129 L 11,117 Z" class="dubai-window" fill="#1e2028"/>
      <rect x="11"  y="116" width="32"  height="16" rx="0.5" class="dubai-body" fill="#48b4e4"/>
      <rect x="13"  y="118" width="7"   height="11" rx="0.5" class="dubai-window" fill="#1e2028"/>
      <rect x="22"  y="118" width="7"   height="11" rx="0.5" class="dubai-window" fill="#1e2028"/>
      <rect x="31"  y="118" width="6"   height="11" rx="0.5" class="dubai-window" fill="#1e2028"/>
      <rect x="44"  y="118" width="2"   height="13" rx="0.5" fill="#3a8abf" opacity="0.4"/>
      <rect x="46"  y="116" width="30"  height="16" rx="0.5" class="dubai-body" fill="#48b4e4"/>
      <rect x="48"  y="118" width="6"   height="11" rx="0.5" class="dubai-window" fill="#1e2028"/>
      <rect x="56"  y="118" width="6"   height="11" rx="0.5" class="dubai-window" fill="#1e2028"/>
      <rect x="64"  y="118" width="6"   height="11" rx="0.5" class="dubai-window" fill="#1e2028"/>
      <rect x="77"  y="118" width="2"   height="13" rx="0.5" fill="#3a8abf" opacity="0.4"/>
      <rect x="79"  y="116" width="30"  height="16" rx="0.5" class="dubai-body" fill="#48b4e4"/>
      <rect x="81"  y="118" width="6"   height="11" rx="0.5" class="dubai-window" fill="#1e2028"/>
      <rect x="89"  y="118" width="6"   height="11" rx="0.5" class="dubai-window" fill="#1e2028"/>
      <rect x="97"  y="118" width="5"   height="11" rx="0.5" class="dubai-window" fill="#1e2028"/>
      <path d="M 109,116 Q 115,116 115,123 Q 115,132 109,132 L 109,116 Z" class="dubai-body" fill="#48b4e4"/>
      <rect x="2"   y="131" width="113" height="1.5" rx="0.8" fill="#3898c8" opacity="0.4"/>
      </g>
    </g>
    </g>
    <!-- F-BUS (Copy A) — clipped to band [195, 612]; geometry shifted +59 so nose at local x=111..115 aligns with Dubai Metro / Caltrain noses -->
    <g clip-path="url(#clip-fbus-f)">
      <g class="train-anim-a">
      <g transform="translate(59,0)">
        <!-- Body silhouette w/ wheel cutouts (chord y=130, apex y=128) -->
        <path d="M 3,116 L 52,116 Q 56,116 56,120 L 56,130 L 48,130 A 2,2 0 0 0 44,130 L 12,130 A 2,2 0 0 0 8,130 L 0,130 L 0,120 Q 0,116 3,116 Z" class="fbus-body" fill="#1f3825"/>
        <!-- Window band (dark glass) -->
        <rect x="3" y="118" width="50" height="5.5" class="fbus-window" fill="#2a3040" opacity="0.92"/>
        <!-- Window mullions -->
        <line x1="12" y1="118" x2="12" y2="123.5" stroke="#1f3825" stroke-width="0.55"/>
        <line x1="20" y1="118" x2="20" y2="123.5" stroke="#1f3825" stroke-width="0.55"/>
        <line x1="28" y1="118" x2="28" y2="123.5" stroke="#1f3825" stroke-width="0.55"/>
        <line x1="36" y1="118" x2="36" y2="123.5" stroke="#1f3825" stroke-width="0.55"/>
        <line x1="44" y1="118" x2="44" y2="123.5" stroke="#1f3825" stroke-width="0.55"/>
        <!-- Cream stripe -->
        <rect x="0" y="127" width="56" height="1.6" class="fbus-stripe" fill="#d8c8a8"/>
        <!-- Doors -->
        <rect x="30" y="126" width="2.4" height="4" fill="#0a1a10" opacity="0.85"/>
        <rect x="49" y="126" width="2.4" height="4" fill="#0a1a10" opacity="0.85"/>
        <!-- Yellow LED route header at front -->
        <rect x="49.5" y="117" width="5" height="1.2" fill="#f5d850"/>
        <!-- Roof line shadow -->
        <line x1="3" y1="116.6" x2="52" y2="116.6" stroke="#162a1a" stroke-width="0.3" opacity="0.6"/>
        <!-- Wheels: r=2, centered y=130 -->
        <circle cx="10" cy="130" r="2"   fill="#141414"/>
        <circle cx="10" cy="130" r="0.8" fill="#3a3a3a"/>
        <circle cx="10" cy="130" r="0.3" fill="#1a1a1a"/>
        <circle cx="46" cy="130" r="2"   fill="#141414"/>
        <circle cx="46" cy="130" r="0.8" fill="#3a3a3a"/>
        <circle cx="46" cy="130" r="0.3" fill="#1a1a1a"/>
        <!-- Underbody shadow between wheels -->
        <line x1="12" y1="130.2" x2="44" y2="130.2" stroke="#0a1a10" stroke-width="0.35" opacity="0.55"/>
      </g>
    </g>
    </g>
    <!-- Caltrain EMU (Copy A) — clipped to band [558, 774] -->
    <g clip-path="url(#clip-caltrain-f)">
      <g class="train-anim-a">
      <g transform="translate(110,0) scale(-1,1)">
        <path d="M 11,112 Q -1,112 -5,118 Q -7,122 -5,126 Q -1,132 11,132 L 11,112 Z" class="caltrain-body" fill="#e8e8ec"/>
        <path d="M 11,112 Q -1,112 -5,118 L 11,118 Z" class="caltrain-stripe" fill="#b82020"/>
        <path d="M 11,113 Q 1,113 -3,118 L 11,118 Z" class="caltrain-window" fill="#8ab0c8" opacity="0.7"/>
        <rect x="-4" y="120" width="14" height="8" rx="0.5" class="caltrain-window" fill="#8ab0c8" opacity="0.55"/>
        <rect x="11" y="112" width="36" height="20" rx="0.5" class="caltrain-body" fill="#e8e8ec"/>
        <rect x="11" y="112" width="36" height="6"  rx="0.5" class="caltrain-stripe" fill="#b82020"/>
        <rect x="14" y="114" width="7"  height="3"  rx="0.5" class="caltrain-window" fill="#8ab0c8" opacity="0.75"/>
        <rect x="23" y="114" width="7"  height="3"  rx="0.5" class="caltrain-window" fill="#8ab0c8" opacity="0.75"/>
        <rect x="32" y="114" width="7"  height="3"  rx="0.5" class="caltrain-window" fill="#8ab0c8" opacity="0.75"/>
        <rect x="41" y="114" width="5"  height="3"  rx="0.5" class="caltrain-window" fill="#8ab0c8" opacity="0.75"/>
        <rect x="14" y="121" width="7"  height="8"  rx="0.5" class="caltrain-window" fill="#8ab0c8" opacity="0.6"/>
        <rect x="23" y="121" width="7"  height="8"  rx="0.5" class="caltrain-window" fill="#8ab0c8" opacity="0.6"/>
        <rect x="32" y="121" width="7"  height="8"  rx="0.5" class="caltrain-window" fill="#8ab0c8" opacity="0.6"/>
        <rect x="41" y="121" width="5"  height="8"  rx="0.5" class="caltrain-window" fill="#8ab0c8" opacity="0.6"/>
        <line x1="11" y1="120" x2="47" y2="120" stroke="#c0c8d0" stroke-width="0.5"/>
        <rect x="47" y="112" width="34" height="20" rx="0.5" class="caltrain-body" fill="#e8e8ec"/>
        <rect x="47" y="112" width="34" height="6"  rx="0.5" class="caltrain-stripe" fill="#b82020"/>
        <rect x="50" y="114" width="7"  height="3"  rx="0.5" class="caltrain-window" fill="#8ab0c8" opacity="0.75"/>
        <rect x="59" y="114" width="7"  height="3"  rx="0.5" class="caltrain-window" fill="#8ab0c8" opacity="0.75"/>
        <rect x="68" y="114" width="7"  height="3"  rx="0.5" class="caltrain-window" fill="#8ab0c8" opacity="0.75"/>
        <rect x="50" y="121" width="7"  height="8"  rx="0.5" class="caltrain-window" fill="#8ab0c8" opacity="0.6"/>
        <rect x="59" y="121" width="7"  height="8"  rx="0.5" class="caltrain-window" fill="#8ab0c8" opacity="0.6"/>
        <rect x="68" y="121" width="7"  height="8"  rx="0.5" class="caltrain-window" fill="#8ab0c8" opacity="0.6"/>
        <line x1="47" y1="120" x2="81" y2="120" stroke="#c0c8d0" stroke-width="0.5"/>
        <rect x="81" y="112" width="26" height="20" rx="0.5" class="caltrain-body" fill="#e8e8ec"/>
        <rect x="81" y="112" width="26" height="6"  rx="0.5" class="caltrain-stripe" fill="#b82020"/>
        <rect x="84" y="114" width="7"  height="3"  rx="0.5" class="caltrain-window" fill="#8ab0c8" opacity="0.75"/>
        <rect x="93" y="114" width="7"  height="3"  rx="0.5" class="caltrain-window" fill="#8ab0c8" opacity="0.75"/>
        <rect x="84" y="121" width="7"  height="8"  rx="0.5" class="caltrain-window" fill="#8ab0c8" opacity="0.6"/>
        <rect x="93" y="121" width="7"  height="8"  rx="0.5" class="caltrain-window" fill="#8ab0c8" opacity="0.6"/>
        <line x1="81" y1="120" x2="107" y2="120" stroke="#c0c8d0" stroke-width="0.5"/>
        <path d="M 107,112 Q 117,112 117,122 Q 117,132 107,132 L 107,112 Z" class="caltrain-stripe" fill="#b82020"/>
        <rect x="108" y="117" width="6" height="8" rx="0.8" class="caltrain-window" fill="#8ab0c8" opacity="0.55"/>
        <rect x="-5"  y="131" width="121" height="1.5" rx="0.8" fill="#c0c8d0" opacity="0.35"/>
      </g>
    </g>
    </g>
  
    <!-- 6. FOREGROUND LANDMARKS -->
  
    <!-- BURJ KHALIFA v3 — widened ~25% (same height), asymmetric stepped silhouette per
         burj_night.jpg reference. Each setback narrows on ONE side only (alternating L/R going up).
         Spire gets class="burj-spire" so it can render white in dark mode (per reference).
         (Dubai cluster — shifted right 5px to clear Dubai metro frame) -->
    <g transform="translate(5, 0)">
      <rect x="76"  y="144" width="20"   height="4"  fill="#2a1a0e"/>
      <rect x="81"  y="128" width="15"   height="18" fill="#2a1a0e"/>
      <rect x="81"  y="108" width="11.5" height="22" fill="#2a1a0e"/>
      <rect x="84"  y="88"  width="8.5"  height="22" fill="#2a1a0e"/>
      <rect x="84"  y="68"  width="6"    height="22" fill="#2a1a0e"/>
      <rect x="86"  y="48"  width="4"    height="22" fill="#2a1a0e"/>
      <rect x="86"  y="30"  width="2.5"  height="20" fill="#2a1a0e"/>
      <rect class="burj-spire" x="86.9" y="22" width="0.7" height="9" fill="#2a1a0e"/>
    </g>

    <!-- DUBAI DARK-MODE LIGHTING — minimalist, iconic-only. Hidden in light mode.
         Per the burj_night.jpg reference: viewing decks light up only on the side where each
         asymmetric setback exposes a ledge (alternating L/R going up). Plus aviation beacon.
         Coordinates account for translate(5,0) on the Burj group. -->
    <g class="dubai-lights">
      <!-- Deck widths taper going up: 5 → 3.5 → 3 → 2.5 → 2 → 1.5 -->
      <!-- Lower observation deck: base→tier2 LEFT ledge (w=5) -->
      <rect x="81"   y="145.5" width="5"   height="0.55" fill="#d8dcd8" opacity="0.7"/>
      <!-- T2→T3 RIGHT ledge (w=3.5) -->
      <rect x="97.5" y="127.5" width="3.5" height="0.55" fill="#d8dcd8" opacity="0.75"/>
      <!-- T3→T4 LEFT ledge (w=3) -->
      <rect x="86"   y="107.5" width="3"   height="0.55" fill="#d8dcd8" opacity="0.7"/>
      <!-- T4→T5 RIGHT ledge (w=2.5) -->
      <rect x="95"   y="87.5"  width="2.5" height="0.5"  fill="#d8dcd8" opacity="0.7"/>
      <!-- T5→T6 LEFT ledge (w=2) -->
      <rect x="89"   y="67.5"  width="2"   height="0.5"  fill="#d8dcd8" opacity="0.65"/>
      <!-- T6→T7 RIGHT ledge (w=1.5) -->
      <rect x="93.5" y="47.5"  width="1.5" height="0.5"  fill="#d8dcd8" opacity="0.6"/>
    </g>
  
    <!-- ━━━ BERKELEY ZONE: Doe + Campanile + Gateway ━━━ -->
  
    <!-- DOE LIBRARY v3 (x≈166.5–223.5 after −20px shift; widened +5px symmetric for prominence; colonnade w/ 14 columns + red-tile gable roof) -->
    <g transform="translate(-20, 0)">
      <!-- Rusticated base -->
      <rect x="186.5" y="138" width="57" height="10" fill="#2a1a0e"/>
    <rect x="186.5" y="147" width="57" height="1" fill="#1a0e06"/>
    <rect x="186.5" y="137" width="57" height="1" fill="#3d2a10"/>
    <!-- Central porch + entrance + steps -->
    <rect x="212" y="142" width="6" height="6" fill="#1a0e06"/>
    <rect x="214" y="144" width="2" height="4" fill="#0e0804"/>
    <rect x="210" y="147" width="10" height="1" fill="#2a1a0e"/>
    <!-- Main colonnade story -->
    <rect x="186.5" y="120" width="57" height="18" fill="#3d2a10"/>
    <!-- Recessed glass wall behind colonnade -->
    <rect x="192" y="122" width="46" height="15" fill="#dceef8" opacity="0.22"/>
    <!-- 14 columns: paired corners + uniform middle row -->
    <g fill="#3d2a10">
      <rect x="192.4" y="121" width="1.2" height="16"/>
      <rect x="194.2" y="121" width="1.2" height="16"/>
      <rect x="197.8" y="121" width="1.2" height="16"/>
      <rect x="201.2" y="121" width="1.2" height="16"/>
      <rect x="204.6" y="121" width="1.2" height="16"/>
      <rect x="208.0" y="121" width="1.2" height="16"/>
      <rect x="211.4" y="121" width="1.2" height="16"/>
      <rect x="217.4" y="121" width="1.2" height="16"/>
      <rect x="220.8" y="121" width="1.2" height="16"/>
      <rect x="224.2" y="121" width="1.2" height="16"/>
      <rect x="227.6" y="121" width="1.2" height="16"/>
      <rect x="231.0" y="121" width="1.2" height="16"/>
      <rect x="234.6" y="121" width="1.2" height="16"/>
      <rect x="236.4" y="121" width="1.2" height="16"/>
    </g>
    <!-- Column capitals band -->
    <rect x="187.5" y="120" width="55" height="1" fill="#2a1a0e"/>
    <!-- Entablature / cornice -->
    <rect x="186.5" y="118" width="57" height="2" fill="#3d2a10"/>
    <rect x="186.5" y="117" width="57" height="1" fill="#2a1a0e"/>
    <!-- Red-tile gable roof (bevel compressed to y=113–114 so y=114+ is full-width, hiding the Dubai Metro's white roof at y=114–116; bevel margin 3px from each body edge) -->
    <polygon points="186.5,117 243.5,117 243.5,114 240.5,113 189.5,113 186.5,114" fill="#3d2010"/>
    <!-- Skylight strips on roof slope -->
    <rect x="194" y="114" width="10" height="0.7" fill="#dceef8" opacity="0.40"/>
    <rect x="206" y="114" width="10" height="0.7" fill="#dceef8" opacity="0.40"/>
    <rect x="218" y="114" width="10" height="0.7" fill="#dceef8" opacity="0.40"/>
    <rect x="230" y="114" width="8"  height="0.7" fill="#dceef8" opacity="0.40"/>
    <rect x="187.5" y="112.6" width="55" height="0.6" fill="#2a1a0e"/>
    <!-- Faint base-story window slots -->
    <rect x="194" y="141" width="2" height="3" fill="#dceef8" opacity="0.18"/>
    <rect x="199" y="141" width="2" height="3" fill="#dceef8" opacity="0.18"/>
    <rect x="204" y="141" width="2" height="3" fill="#dceef8" opacity="0.18"/>
    <rect x="224" y="141" width="2" height="3" fill="#dceef8" opacity="0.18"/>
    <rect x="229" y="141" width="2" height="3" fill="#dceef8" opacity="0.18"/>
    <rect x="234" y="141" width="2" height="3" fill="#dceef8" opacity="0.18"/>
    </g>
  
    <!-- SATHER TOWER v1 (x≈231–245 after additional −7px shift; center x≈238) -->
    <g transform="translate(52.5, 44.4) scale(0.70)">
      <!-- Base / plinth -->
      <rect x="255" y="145" width="20" height="3" fill="#3d2a10"/>
      <rect x="256" y="143" width="18" height="2" fill="#3d2a10"/>
      <!-- Main shaft -->
      <rect x="258" y="82" width="14" height="61" fill="#3d2a10"/>
      <!-- Clock face glint on shaft -->
      <rect x="263" y="93" width="4" height="4" fill="#dceef8" opacity="0.32"/>
      <rect x="264" y="94" width="2" height="2" fill="#2a1a0e" opacity="0.6"/>
      <!-- Cornice below belfry -->
      <rect x="256" y="80" width="18" height="2" fill="#3d2a10"/>
      <!-- Belfry / observation deck -->
      <rect x="257" y="72" width="16" height="8" fill="#3d2a10"/>
      <path d="M 258.5,79 L 258.5,75 A 1.5,1.5 0 0 1 261.5,75 L 261.5,79 Z" fill="#dceef8" opacity="0.42"/>
      <path d="M 263.5,79 L 263.5,75 A 1.5,1.5 0 0 1 266.5,75 L 266.5,79 Z" fill="#dceef8" opacity="0.42"/>
      <path d="M 268.5,79 L 268.5,75 A 1.5,1.5 0 0 1 271.5,75 L 271.5,79 Z" fill="#dceef8" opacity="0.42"/>
      <!-- Top cornice / parapet -->
      <rect x="256" y="70" width="18" height="2" fill="#3d2a10"/>
      <!-- Pyramidal copper roof -->
      <polygon points="257,70 273,70 265,56" fill="#2a1a0e"/>
      <!-- Finial / pinnacle -->
      <rect x="264.5" y="53" width="1" height="3" fill="#2a1a0e"/>
      <circle cx="265" cy="52.5" r="0.6" fill="#2a1a0e"/>
    </g>
  
    <!-- (Berkeley Gateway dropped — replaced by Container Crane below) -->

    <!-- CONTAINER CRANE v3 (Oakland dock; final x=269..295.5 after right +6px nudge) -->
    <g transform="translate(97.5, 74) scale(0.5)">
      <!-- Dock platform -->
      <rect x="344" y="146" width="52" height="2" fill="#3d3020"/>
      <!-- Waterside A-frame leg pair -->
      <rect x="349.5" y="82"  width="1.2" height="64" fill="#3d3020"/>
      <rect x="357.5" y="82"  width="1.2" height="64" fill="#3d3020"/>
      <rect x="349"   y="144" width="9"   height="2"  fill="#3d3020"/>
      <rect x="350.7" y="128" width="6.8" height="0.8" fill="#3d3020"/>
      <rect x="350.7" y="112" width="6.8" height="0.8" fill="#3d3020"/>
      <rect x="350.7" y="96"  width="6.8" height="0.8" fill="#3d3020"/>
      <line x1="350.5" y1="128" x2="357.5" y2="112" stroke="#3d3020" stroke-width="0.4" opacity="0.8"/>
      <line x1="357.5" y1="128" x2="350.5" y2="112" stroke="#3d3020" stroke-width="0.4" opacity="0.8"/>
      <line x1="350.5" y1="112" x2="357.5" y2="96"  stroke="#3d3020" stroke-width="0.4" opacity="0.8"/>
      <line x1="357.5" y1="112" x2="350.5" y2="96"  stroke="#3d3020" stroke-width="0.4" opacity="0.8"/>
      <line x1="350.5" y1="96"  x2="357.5" y2="82"  stroke="#3d3020" stroke-width="0.4" opacity="0.8"/>
      <line x1="357.5" y1="96"  x2="350.5" y2="82"  stroke="#3d3020" stroke-width="0.4" opacity="0.8"/>
      <!-- Landside A-frame leg pair -->
      <rect x="381.5" y="82"  width="1.2" height="64" fill="#3d3020"/>
      <rect x="389.5" y="82"  width="1.2" height="64" fill="#3d3020"/>
      <rect x="381"   y="144" width="9"   height="2"  fill="#3d3020"/>
      <rect x="382.7" y="128" width="6.8" height="0.8" fill="#3d3020"/>
      <rect x="382.7" y="112" width="6.8" height="0.8" fill="#3d3020"/>
      <rect x="382.7" y="96"  width="6.8" height="0.8" fill="#3d3020"/>
      <line x1="382.5" y1="128" x2="389.5" y2="112" stroke="#3d3020" stroke-width="0.4" opacity="0.8"/>
      <line x1="389.5" y1="128" x2="382.5" y2="112" stroke="#3d3020" stroke-width="0.4" opacity="0.8"/>
      <line x1="382.5" y1="112" x2="389.5" y2="96"  stroke="#3d3020" stroke-width="0.4" opacity="0.8"/>
      <line x1="389.5" y1="112" x2="382.5" y2="96"  stroke="#3d3020" stroke-width="0.4" opacity="0.8"/>
      <line x1="382.5" y1="96"  x2="389.5" y2="82"  stroke="#3d3020" stroke-width="0.4" opacity="0.8"/>
      <line x1="389.5" y1="96"  x2="382.5" y2="82"  stroke="#3d3020" stroke-width="0.4" opacity="0.8"/>
      <!-- Upper portal beam -->
      <rect x="346" y="80" width="48" height="3"  fill="#3d3020"/>
      <rect x="346" y="78" width="48" height="1"  fill="#3d3020" opacity="0.9"/>
      <polygon points="349,82 354,78 358,82" fill="#3d3020" opacity="0.85"/>
      <polygon points="381,82 386,78 390,82" fill="#3d3020" opacity="0.85"/>
      <!-- Apex superstructure (machine house) -->
      <rect x="362" y="68" width="28" height="10" fill="#3d3020"/>
      <polygon points="372,68 378,68 376,58 374,58" fill="#3d3020"/>
      <rect x="374" y="55" width="2" height="3" fill="#3d3020"/>
      <!-- Counterweight / landside machine house -->
      <rect x="388" y="71" width="6" height="7" fill="#3d3020"/>
      <!-- Operator cabin -->
      <rect x="356" y="82" width="4" height="5" fill="#3d3020"/>
      <rect x="357" y="83.5" width="2" height="1" fill="#dceef8" opacity="0.45"/>
      <!-- Boom (raised / parked) -->
      <polygon points="362,73 363.5,73 344.5,35.5 343,36" fill="#3d3020"/>
      <polygon points="364.2,71.5 365.7,71.7 346.5,33.7 344.9,33.7" fill="#3d3020" opacity="0.85"/>
      <line x1="360.5" y1="71" x2="362.7" y2="73.5" stroke="#3d3020" stroke-width="0.4" opacity="0.8"/>
      <line x1="356.0" y1="62" x2="358.2" y2="64.5" stroke="#3d3020" stroke-width="0.4" opacity="0.8"/>
      <line x1="351.5" y1="53" x2="353.7" y2="55.5" stroke="#3d3020" stroke-width="0.4" opacity="0.8"/>
      <line x1="347.0" y1="44" x2="349.2" y2="46.5" stroke="#3d3020" stroke-width="0.4" opacity="0.8"/>
      <!-- Backstay + forestay cables -->
      <line x1="345" y1="36" x2="375" y2="56" stroke="#3d3020" stroke-width="0.4" opacity="0.7"/>
      <line x1="346" y1="34.5" x2="376" y2="55.5" stroke="#3d3020" stroke-width="0.4" opacity="0.7"/>
      <line x1="350" y1="46" x2="354" y2="78.5" stroke="#3d3020" stroke-width="0.35" opacity="0.6"/>
      <!-- Tip sheave block -->
      <rect x="342.5" y="34" width="3" height="1.5" fill="#3d3020"/>
    </g>

    <!-- ━━━ SF ZONE: Bay Bridge + Transamerica + Salesforce ━━━ -->
  
    <!-- BAY BRIDGE — wider water section, Yerba Buena Island integrated as a hill the bridge docks into.
         Geography (left→right from Berkeley/East Bay POV): East Bay → east span (SAS) → Yerba Buena hill → west span (suspension) → SF Embarcadero
         Water spans x=340 to x=540 (200px wide). -->
  
    <!-- ORACLE PARK v3 (RELOCATED to SF zone as translucent background landmark; final footprint x=533.5..566.5, centered at x=550, 60% width, opacity AND color matched to Sutro) -->
    <!-- TEMPORARILY HIDDEN — preserved in code for potential later re-enable -->
    <g transform="translate(219.23, -4) scale(0.5077, 1)" opacity="0.55" display="none">
      <g transform="translate(614, 78)">
        <!-- brick arcade -->
        <rect x="5" y="64" width="65" height="10" fill="#b0c0d0"/>
        <path d="M 7,72 q 1.3,-5 2.6,0 M 10.5,72 q 1.3,-5 2.6,0 M 14,72 q 1.3,-5 2.6,0 M 17.5,72 q 1.3,-5 2.6,0
                 M 21,72 q 1.3,-5 2.6,0 M 24.5,72 q 1.3,-5 2.6,0 M 28,72 q 1.3,-5 2.6,0 M 31.5,72 q 1.3,-5 2.6,0
                 M 35,72 q 1.3,-5 2.6,0 M 38.5,72 q 1.3,-5 2.6,0 M 42,72 q 1.3,-5 2.6,0 M 45.5,72 q 1.3,-5 2.6,0
                 M 49,72 q 1.3,-5 2.6,0 M 52.5,72 q 1.3,-5 2.6,0 M 56,72 q 1.3,-5 2.6,0 M 59.5,72 q 1.3,-5 2.6,0
                 M 63,72 q 1.3,-5 2.6,0 M 66.5,72 q 1.3,-5 2.6,0"
              stroke="#dceef8" stroke-width="0.5" fill="none" opacity="0.45"/>
        <line x1="5" y1="64" x2="70" y2="64" stroke="#b0c0d0" stroke-width="0.4" opacity="0.65"/>
        <!-- sloping seating bowl -->
        <path d="M 5,64 L 5,56 L 14,51 L 22,44 L 47,44 L 52,47 L 65,47 L 65,64 Z" fill="#b0c0d0"/>
        <path d="M 5,56 L 14,51 L 22,44 L 47,44 L 52,47 L 65,47" stroke="#b0c0d0" stroke-width="0.4" fill="none" opacity="0.7"/>
        <rect x="24" y="45" width="20" height="0.9" fill="#dceef8" opacity="0.4"/>
        <!-- Rafter light boxes on legs -->
        <g transform="translate(24, 38)">
          <rect x="0" y="0" width="3.5" height="3.5" fill="none" stroke="#b0c0d0" stroke-width="0.4"/>
          <line x1="0" y1="1.75" x2="3.5" y2="1.75" stroke="#b0c0d0" stroke-width="0.3"/>
          <line x1="0.5" y1="3.5" x2="0.5" y2="6" stroke="#b0c0d0" stroke-width="0.4"/>
          <line x1="3"   y1="3.5" x2="3"   y2="6" stroke="#b0c0d0" stroke-width="0.4"/>
        </g>
        <g transform="translate(30, 38)">
          <rect x="0" y="0" width="3.5" height="3.5" fill="none" stroke="#b0c0d0" stroke-width="0.4"/>
          <line x1="0" y1="1.75" x2="3.5" y2="1.75" stroke="#b0c0d0" stroke-width="0.3"/>
          <line x1="0.5" y1="3.5" x2="0.5" y2="6" stroke="#b0c0d0" stroke-width="0.4"/>
          <line x1="3"   y1="3.5" x2="3"   y2="6" stroke="#b0c0d0" stroke-width="0.4"/>
        </g>
        <g transform="translate(36, 38)">
          <rect x="0" y="0" width="3.5" height="3.5" fill="none" stroke="#b0c0d0" stroke-width="0.4"/>
          <line x1="0" y1="1.75" x2="3.5" y2="1.75" stroke="#b0c0d0" stroke-width="0.3"/>
          <line x1="0.5" y1="3.5" x2="0.5" y2="6" stroke="#b0c0d0" stroke-width="0.4"/>
          <line x1="3"   y1="3.5" x2="3"   y2="6" stroke="#b0c0d0" stroke-width="0.4"/>
        </g>
        <g transform="translate(42, 38)">
          <rect x="0" y="0" width="3.5" height="3.5" fill="none" stroke="#b0c0d0" stroke-width="0.4"/>
          <line x1="0" y1="1.75" x2="3.5" y2="1.75" stroke="#b0c0d0" stroke-width="0.3"/>
          <line x1="0.5" y1="3.5" x2="0.5" y2="6" stroke="#b0c0d0" stroke-width="0.4"/>
          <line x1="3"   y1="3.5" x2="3"   y2="6" stroke="#b0c0d0" stroke-width="0.4"/>
        </g>
        <!-- LEFT TOWER (single tall trussed frame, right-field corner) -->
        <rect x="8.5" y="36" width="0.9" height="38" fill="#b0c0d0"/>
        <rect x="13"  y="36" width="0.9" height="38" fill="#b0c0d0"/>
        <line x1="8.5" y1="42" x2="13.9" y2="42" stroke="#b0c0d0" stroke-width="0.5"/>
        <line x1="8.5" y1="50" x2="13.9" y2="50" stroke="#b0c0d0" stroke-width="0.5"/>
        <line x1="8.5" y1="58" x2="13.9" y2="58" stroke="#b0c0d0" stroke-width="0.5"/>
        <line x1="8.5" y1="66" x2="13.9" y2="66" stroke="#b0c0d0" stroke-width="0.5"/>
        <rect x="6" y="32" width="11" height="4" fill="#b0c0d0"/>
        <rect x="7" y="28" width="9"  height="4" fill="#b0c0d0"/>
        <!-- RIGHT CLUSTER (paired, taller frames flanking scoreboard, left-field corner) -->
        <rect x="52" y="32" width="0.9" height="42" fill="#b0c0d0"/>
        <rect x="57" y="32" width="0.9" height="42" fill="#b0c0d0"/>
        <line x1="52" y1="38" x2="57.9" y2="38" stroke="#b0c0d0" stroke-width="0.5"/>
        <line x1="52" y1="46" x2="57.9" y2="46" stroke="#b0c0d0" stroke-width="0.5"/>
        <line x1="52" y1="54" x2="57.9" y2="54" stroke="#b0c0d0" stroke-width="0.5"/>
        <line x1="52" y1="62" x2="57.9" y2="62" stroke="#b0c0d0" stroke-width="0.5"/>
        <line x1="52" y1="70" x2="57.9" y2="70" stroke="#b0c0d0" stroke-width="0.5"/>
        <rect x="49" y="28" width="12" height="4" fill="#b0c0d0"/>
        <rect x="50" y="24" width="10" height="4" fill="#b0c0d0"/>
        <rect x="62" y="34" width="0.9" height="40" fill="#b0c0d0"/>
        <rect x="67" y="34" width="0.9" height="40" fill="#b0c0d0"/>
        <line x1="62" y1="40" x2="67.9" y2="40" stroke="#b0c0d0" stroke-width="0.5"/>
        <line x1="62" y1="48" x2="67.9" y2="48" stroke="#b0c0d0" stroke-width="0.5"/>
        <line x1="62" y1="56" x2="67.9" y2="56" stroke="#b0c0d0" stroke-width="0.5"/>
        <line x1="62" y1="64" x2="67.9" y2="64" stroke="#b0c0d0" stroke-width="0.5"/>
        <line x1="62" y1="72" x2="67.9" y2="72" stroke="#b0c0d0" stroke-width="0.5"/>
        <rect x="59" y="30" width="12" height="4" fill="#b0c0d0"/>
        <rect x="60" y="26" width="10" height="4" fill="#b0c0d0"/>
        <!-- SCOREBOARD between paired frames -->
        <rect x="57.9" y="38" width="4.1" height="14" fill="#b0c0d0"/>
        <rect x="58.2" y="38.8" width="3.6" height="6.5" fill="#dceef8" opacity="0.42"/>
      </g>
    </g>
  
    <!-- ━ BAY BRIDGE CLUSTER (Yerba Buena + East span + West span + Ferry Building + boat) — shifted left 30px ━ -->
    <g transform="translate(-30, 0)">
    <!-- ━ YERBA BUENA ISLAND, x=410–460 (narrower for more water) ━ -->
    <path d="M 410,148
             Q 420,132 432,124
             Q 442,118 450,122
             Q 456,128 460,148 Z" fill="#3d3020"/>
    <path d="M 418,140 Q 430,126 440,120 Q 448,119 455,124"
          stroke="#4a3d2a" stroke-width="0.8" fill="none" opacity="0.7"/>
    <ellipse cx="430" cy="125" rx="3" ry="1.5" fill="#2a1e0e" opacity="0.7"/>
    <ellipse cx="440" cy="121" rx="3" ry="1.5" fill="#2a1e0e" opacity="0.7"/>
    <ellipse cx="448" cy="123" rx="3" ry="1.5" fill="#2a1e0e" opacity="0.7"/>
  
    <!-- ━ EAST SPAN (SAS, single tower, cable loops over tower & anchors at deck), x=345–425 ━ -->
    <!-- East-side causeway approach deck — small extension (~7 units) past the leftmost pier to close the gap with the train guideway -->
    <rect x="334" y="132" width="41" height="3" fill="#3d3020"/>
    <!-- Single tall SAS tower at x=380 — extends from above the deck down to water foundation -->
    <rect x="378" y="82" width="4" height="66" fill="#3d3020"/>
    <rect x="377" y="80" width="6" height="3" fill="#3d3020"/>
    <!-- SAS main deck — continues from tower into Yerba Buena hill (deck pokes into hill at x≈425) -->
    <rect x="375" y="132" width="50" height="3" fill="#3d3020"/>
    <!-- Single main cable: anchors AT deck level (y=128), curves up to tower top.
         Control points placed BELOW the diagonal so cable sags toward deck (proper catenary shape). -->
    <path d="M 348,132 Q 358,126 380,82 Q 402,126 412,132"
          stroke="#3d3020" stroke-width="1.1" fill="none" opacity="0.92"/>
    <!-- Suspenders (top y matches cable y at each x exactly) -->
    <line x1="356" y1="123.8" x2="356" y2="132" stroke="#3d3020" stroke-width="0.55" opacity="0.6"/>
    <line x1="362" y1="114.9" x2="362" y2="132" stroke="#3d3020" stroke-width="0.55" opacity="0.6"/>
    <line x1="368" y1="104.8" x2="368" y2="132" stroke="#3d3020" stroke-width="0.55" opacity="0.6"/>
    <line x1="374" y1="93.7"  x2="374" y2="132" stroke="#3d3020" stroke-width="0.55" opacity="0.6"/>
    <line x1="386" y1="93.7"  x2="386" y2="132" stroke="#3d3020" stroke-width="0.55" opacity="0.6"/>
    <line x1="392" y1="104.8" x2="392" y2="132" stroke="#3d3020" stroke-width="0.55" opacity="0.6"/>
    <line x1="400" y1="118.0" x2="400" y2="132" stroke="#3d3020" stroke-width="0.55" opacity="0.6"/>
    <line x1="406" y1="126.3" x2="406" y2="132" stroke="#3d3020" stroke-width="0.55" opacity="0.6"/>
  
    <!-- ━ WEST SPAN (classic 2-tower suspension), x=455–540 ━ -->
    <!-- Deck enters Yerba Buena hill at x=455 (where hill silhouette meets y=128 deck height) -->
    <rect x="455" y="132" width="85" height="3" fill="#3d3020"/>
    <!-- Approach pier on SF side dropping to water -->
    <rect x="538" y="135" width="2" height="13" fill="#3d3020" opacity="0.7"/>
  
    <!-- Tower 1 (x=478) — extends from above deck down to water foundation -->
    <rect x="476" y="86" width="3"  height="62" fill="#3d3020"/>
    <rect x="484" y="86" width="3"  height="62" fill="#3d3020"/>
    <rect x="476" y="86" width="11" height="3"  fill="#3d3020"/>
    <rect x="476" y="100" width="11" height="2" fill="#3d3020"/>
    <rect x="476" y="118" width="11" height="2" fill="#3d3020"/>
    <rect x="478" y="82" width="7"  height="4"  fill="#3d3020"/>
  
    <!-- Tower 2 (x=520) -->
    <rect x="518" y="86" width="3"  height="62" fill="#3d3020"/>
    <rect x="526" y="86" width="3"  height="62" fill="#3d3020"/>
    <rect x="518" y="86" width="11" height="3"  fill="#3d3020"/>
    <rect x="518" y="100" width="11" height="2" fill="#3d3020"/>
    <rect x="518" y="118" width="11" height="2" fill="#3d3020"/>
    <rect x="520" y="82" width="7"  height="4"  fill="#3d3020"/>
  
    <!-- Single main cable: gentle sweep up from anchor to each tower, mild catenary between towers
         (control y=120 dips midpoint to y≈102, ~18px below tower tops, for a more sculpted suspension shape). -->
    <path d="M 457,132 Q 467,126 481,84 Q 502,120 524,84 Q 537,126 540,132"
          stroke="#3d3020" stroke-width="1.2" fill="none" opacity="0.92"/>

    <!-- Suspenders (top y matches cable y exactly at each x). class="bay-light": in dark mode these become the "Bay Lights" LED strips.
         Central suspenders (x=490..518) re-scaled to match the deeper catenary. -->
    <line class="bay-light" x1="460" y1="129.5" x2="460" y2="132" stroke="#3d3020" stroke-width="0.55" opacity="0.6"/>
    <line class="bay-light" x1="467" y1="119.0" x2="467" y2="132" stroke="#3d3020" stroke-width="0.55" opacity="0.6"/>
    <line class="bay-light" x1="474" y1="103.4" x2="474" y2="132" stroke="#3d3020" stroke-width="0.55" opacity="0.6"/>
    <line class="bay-light" x1="490" y1="96"    x2="490" y2="132" stroke="#3d3020" stroke-width="0.55" opacity="0.6"/>
    <line class="bay-light" x1="495" y1="100"   x2="495" y2="132" stroke="#3d3020" stroke-width="0.55" opacity="0.6"/>
    <line class="bay-light" x1="501" y1="102"   x2="501" y2="132" stroke="#3d3020" stroke-width="0.55" opacity="0.6"/>
    <line class="bay-light" x1="507" y1="101"   x2="507" y2="132" stroke="#3d3020" stroke-width="0.55" opacity="0.6"/>
    <line class="bay-light" x1="513" y1="98"    x2="513" y2="132" stroke="#3d3020" stroke-width="0.55" opacity="0.6"/>
    <line class="bay-light" x1="518" y1="92"    x2="518" y2="132" stroke="#3d3020" stroke-width="0.55" opacity="0.6"/>
    <line class="bay-light" x1="530" y1="103.1" x2="530" y2="132" stroke="#3d3020" stroke-width="0.55" opacity="0.6"/>
    <line class="bay-light" x1="535" y1="118.5" x2="535" y2="132" stroke="#3d3020" stroke-width="0.55" opacity="0.6"/>
    <line x1="538" y1="127.1" x2="538" y2="132" stroke="#3d3020" stroke-width="0.55" opacity="0.6"/>
  
    <!-- SF FERRY BOAT (docked at Ferry Building; native x=344–404 scaled to 85% then positioned so bow tip lands at x=537, with hull seated in water; v1 25-element design w/ grey body) -->
    <g transform="translate(193.6, 24.05) scale(0.85)">
      <!-- HULLS (twin catamaran) -->
      <path d="M 348,141 L 402,141 L 404,143 L 402,146 L 392,147 L 384,146.5 L 376,146.5 L 368,146.5 L 360,146.5 L 352,146 L 348,144 Z" class="ferry-body" fill="#b0b4b8"/>
      <path d="M 346,142 L 400,142 L 401.5,143.5 L 399,145.8 L 388,146.3 L 372,146.3 L 356,146.3 L 350,145.5 L 346,143.8 Z" class="ferry-hull" fill="#9aa0a4" opacity="0.85"/>
      <!-- Catamaran tells: dark wedges at bow waterline -->
      <path d="M 400,146 L 402.2,144.6 L 402.4,146 Z" fill="#3d5a8a" opacity="0.55"/>
      <path d="M 397,146.3 L 398.5,145.4 L 398.7,146.3 Z" fill="#3d5a8a" opacity="0.35"/>
      <!-- Blue accent stripe (SF Bay Ferry livery) -->
      <path d="M 348,141 L 358,141 L 376,143 L 392,141.3 L 402,141 L 404,143 L 402,144 L 392,142.6 L 378,144.2 L 360,142 L 348,142 Z" fill="#3d5a8a"/>
      <!-- Green underline band -->
      <path d="M 348,143.2 L 360,143 L 378,145 L 392,143.6 L 400,143.4 L 401.5,144.2 L 392,143.9 L 378,145.6 L 360,143.5 L 348,143.6 Z" fill="#6a9a4a" opacity="0.55"/>
      <!-- DECK 1 (lower cabin) -->
      <rect x="348" y="136" width="54" height="5" class="ferry-body" fill="#b0b4b8"/>
      <path d="M 402,136 L 404,138 L 404,141 L 402,141 Z" class="ferry-body" fill="#b0b4b8"/>
      <rect x="350" y="137.2" width="51" height="2.4" class="fbus-window" fill="#2a3040" opacity="0.92"/>
      <rect x="350" y="137.2" width="51" height="0.9" fill="#dceef8" opacity="0.35"/>
      <line x1="356" y1="137.2" x2="356" y2="139.6" stroke="#b0b4b8" stroke-width="0.18"/>
      <line x1="362" y1="137.2" x2="362" y2="139.6" stroke="#b0b4b8" stroke-width="0.18"/>
      <line x1="368" y1="137.2" x2="368" y2="139.6" stroke="#b0b4b8" stroke-width="0.18"/>
      <line x1="374" y1="137.2" x2="374" y2="139.6" stroke="#b0b4b8" stroke-width="0.18"/>
      <line x1="380" y1="137.2" x2="380" y2="139.6" stroke="#b0b4b8" stroke-width="0.18"/>
      <line x1="386" y1="137.2" x2="386" y2="139.6" stroke="#b0b4b8" stroke-width="0.18"/>
      <line x1="392" y1="137.2" x2="392" y2="139.6" stroke="#b0b4b8" stroke-width="0.18"/>
      <line x1="398" y1="137.2" x2="398" y2="139.6" stroke="#b0b4b8" stroke-width="0.18"/>
      <!-- Wordmark band hint -->
      <rect x="350" y="140" width="51" height="0.7" fill="#3d5a8a" opacity="0.35"/>
      <!-- DECK 2 (upper cabin) -->
      <rect x="352" y="132" width="48" height="4" class="ferry-body" fill="#b0b4b8"/>
      <rect x="354" y="133" width="44" height="2" class="fbus-window" fill="#2a3040" opacity="0.92"/>
      <rect x="354" y="133" width="44" height="0.8" fill="#dceef8" opacity="0.35"/>
      <line x1="360" y1="133" x2="360" y2="135" stroke="#b0b4b8" stroke-width="0.18"/>
      <line x1="366" y1="133" x2="366" y2="135" stroke="#b0b4b8" stroke-width="0.18"/>
      <line x1="372" y1="133" x2="372" y2="135" stroke="#b0b4b8" stroke-width="0.18"/>
      <line x1="378" y1="133" x2="378" y2="135" stroke="#b0b4b8" stroke-width="0.18"/>
      <line x1="384" y1="133" x2="384" y2="135" stroke="#b0b4b8" stroke-width="0.18"/>
      <line x1="390" y1="133" x2="390" y2="135" stroke="#b0b4b8" stroke-width="0.18"/>
      <rect x="352" y="135.7" width="48" height="0.4" fill="#7a8084" opacity="0.7"/>
      <!-- WHEELHOUSE -->
      <rect x="386" y="130" width="10" height="2" class="ferry-body" fill="#b0b4b8"/>
      <rect x="387" y="130.6" width="8" height="1.1" class="fbus-window" fill="#2a3040" opacity="0.9"/>
      <rect x="387" y="130.6" width="8" height="0.45" fill="#dceef8" opacity="0.45"/>
      <!-- Antenna mast + radar dome -->
      <line x1="391" y1="130" x2="391" y2="126.5" stroke="#2a1a0e" stroke-width="0.18"/>
      <line x1="389.5" y1="127.6" x2="392.5" y2="127.6" stroke="#2a1a0e" stroke-width="0.16"/>
      <circle cx="391" cy="129.2" r="0.45" class="fbus-window" fill="#2a3040"/>
      <!-- Subtle wake at stern -->
      <ellipse cx="346" cy="146.4" rx="3" ry="0.35" fill="#ffffff" opacity="0.55"/>
    </g>
  
    <!-- FERRY BUILDING v1 (x≈537.5–582, low arcade w/ arched windows + Giralda-style clock tower) -->
    <!-- Arcade body -->
    <rect x="538" y="134" width="44" height="14" fill="#3d2a10"/>
    <rect x="538" y="146" width="44" height="2" fill="#2a1a0e"/>
    <rect x="538" y="133" width="44" height="1.2" fill="#2a1a0e"/>
    <rect x="537.5" y="132.2" width="45" height="1" fill="#3d2a10"/>
    <!-- Arched arcade windows: left wing x 539..556 -->
    <path d="M 539,146 L 539,141 A 1.75 2.5 0 0 1 542.5,141 L 542.5,146 Z" fill="#1a0e08"/>
    <path d="M 543.5,146 L 543.5,141 A 1.75 2.5 0 0 1 547,141 L 547,146 Z" fill="#1a0e08"/>
    <path d="M 548,146 L 548,141 A 1.75 2.5 0 0 1 551.5,141 L 551.5,146 Z" fill="#1a0e08"/>
    <path d="M 552.5,146 L 552.5,141 A 1.75 2.5 0 0 1 556,141 L 556,146 Z" fill="#1a0e08"/>
    <!-- Right wing arches: x 564..581 -->
    <path d="M 564,146 L 564,141 A 1.75 2.5 0 0 1 567.5,141 L 567.5,146 Z" fill="#1a0e08"/>
    <path d="M 568.5,146 L 568.5,141 A 1.75 2.5 0 0 1 572,141 L 572,146 Z" fill="#1a0e08"/>
    <path d="M 573,146 L 573,141 A 1.75 2.5 0 0 1 576.5,141 L 576.5,146 Z" fill="#1a0e08"/>
    <path d="M 577.5,146 L 577.5,141 A 1.75 2.5 0 0 1 581,141 L 581,146 Z" fill="#1a0e08"/>
    <!-- Upper-story window glints -->
    <rect x="540" y="135" width="1.2" height="2" fill="#dceef8" opacity="0.32"/>
    <rect x="544.5" y="135" width="1.2" height="2" fill="#dceef8" opacity="0.32"/>
    <rect x="549" y="135" width="1.2" height="2" fill="#dceef8" opacity="0.32"/>
    <rect x="553.5" y="135" width="1.2" height="2" fill="#dceef8" opacity="0.32"/>
    <rect x="565" y="135" width="1.2" height="2" fill="#dceef8" opacity="0.32"/>
    <rect x="569.5" y="135" width="1.2" height="2" fill="#dceef8" opacity="0.32"/>
    <rect x="574" y="135" width="1.2" height="2" fill="#dceef8" opacity="0.32"/>
    <rect x="578.5" y="135" width="1.2" height="2" fill="#dceef8" opacity="0.32"/>
    <!-- Clock tower (Giralda-inspired) — centered at x=560 -->
    <rect x="555.5" y="132" width="9" height="2" fill="#3d2a10"/>
    <rect x="556" y="114" width="8" height="20" fill="#3d2a10"/>
    <!-- Shaft window slits -->
    <rect x="559.5" y="126" width="1" height="3" fill="#1a0e08"/>
    <rect x="559.5" y="119" width="1" height="3" fill="#1a0e08"/>
    <!-- Clock stage -->
    <rect x="554.5" y="109" width="11" height="5" fill="#3d2a10"/>
    <circle cx="560" cy="111.5" r="2.1" fill="#dceef8" opacity="0.55"/>
    <circle cx="560" cy="111.5" r="2.1" fill="none" stroke="#1a0e08" stroke-width="0.35"/>
    <line x1="560" y1="111.5" x2="560" y2="110.1" stroke="#1a0e08" stroke-width="0.3"/>
    <line x1="560" y1="111.5" x2="561" y2="111.5" stroke="#1a0e08" stroke-width="0.3"/>
    <!-- Cornice between clock stage and belfry -->
    <rect x="554" y="108.2" width="12" height="0.8" fill="#2a1a0e"/>
    <!-- Belfry: arched openings -->
    <rect x="555" y="103" width="10" height="5.5" fill="#3d2a10"/>
    <path d="M 556,108 L 556,105.5 A 0.9 1.5 0 0 1 557.8,105.5 L 557.8,108 Z" fill="#dceef8" opacity="0.42"/>
    <path d="M 559.1,108 L 559.1,105.5 A 0.9 1.5 0 0 1 560.9,105.5 L 560.9,108 Z" fill="#dceef8" opacity="0.42"/>
    <path d="M 562.2,108 L 562.2,105.5 A 0.9 1.5 0 0 1 564,105.5 L 564,108 Z" fill="#dceef8" opacity="0.42"/>
    <!-- Upper cornice above belfry -->
    <rect x="554.5" y="102.2" width="11" height="0.8" fill="#2a1a0e"/>
    <!-- Small upper lantern (stacked tier) -->
    <rect x="557.5" y="99.5" width="5" height="2.7" fill="#3d2a10"/>
    <rect x="558.5" y="100.2" width="0.7" height="1.5" fill="#dceef8" opacity="0.35"/>
    <rect x="559.65" y="100.2" width="0.7" height="1.5" fill="#dceef8" opacity="0.35"/>
    <rect x="560.8" y="100.2" width="0.7" height="1.5" fill="#dceef8" opacity="0.35"/>
    <!-- Pyramidal cap + finial -->
    <polygon points="556.5,99.5 563.5,99.5 560,95.5" fill="#3d2a10"/>
    <line x1="560" y1="95.5" x2="560" y2="92.5" stroke="#3d2a10" stroke-width="0.8"/>
    <circle cx="560" cy="92" r="0.7" fill="#3d2a10"/>
    </g>
  
    <!-- TRANSAMERICA PYRAMID v2 — steep pyramid converging near a point at the top, with the iconic
         flying-buttress wings repositioned to the upper-middle (where they actually are on the real
         building) and shaped as blades that flare wider near the top.
         (native x=585..601 shifted left 18px → final x=567..583; base y=148, spire tip y=66) -->
    <g transform="translate(-18, 0)">
    <!-- Main pyramidal body (steep taper: base 16 wide → top 2 wide, ratio 8:1) -->
    <polygon points="585,148 601,148 594,72 592,72" fill="#3d2a10"/>
    <!-- Subtle shadow on right face for 3D read -->
    <polygon points="593,148 601,148 594,72 593,72" fill="#2a1a0e" opacity="0.45"/>
    <!-- Flying-buttress wings — upper portion, y=92..115. Thin flared triangular shape:
         inner edge follows pyramid slope, outer edge is vertical. Top ~2.66 wide, bottom ~0.54. -->
    <polygon points="590.16,92 587.5,92 587.5,115 588.04,115" fill="#3d2a10"/>
    <polygon points="595.84,92 598.5,92 598.5,115 597.96,115" fill="#3d2a10"/>
    <!-- Vertical window-column strips on body -->
    <line x1="588"   y1="148" x2="592.5" y2="74" stroke="#dceef8" stroke-width="0.25" opacity="0.22"/>
    <line x1="593"   y1="148" x2="593.0" y2="74" stroke="#dceef8" stroke-width="0.25" opacity="0.22"/>
    <line x1="598"   y1="148" x2="593.5" y2="74" stroke="#dceef8" stroke-width="0.25" opacity="0.22"/>
    <!-- Faint horizontal banding (mechanical floors) -->
    <line x1="586.5" y1="130" x2="599.5" y2="130" stroke="#1a0e08" stroke-width="0.25" opacity="0.45"/>
    <line x1="588.5" y1="110" x2="598.5" y2="110" stroke="#1a0e08" stroke-width="0.25" opacity="0.4"/>
    <line x1="590.5" y1="90"  x2="595.5" y2="90"  stroke="#1a0e08" stroke-width="0.25" opacity="0.35"/>
    <!-- Top crown / observation deck (small horizontal cap just below spire) -->
    <rect x="591" y="71" width="4" height="1.2" fill="#2a1a0e"/>
    <!-- Central spire (thin tapered shaft from y=72 up to y=66) -->
    <polygon points="592.4,72 593.6,72 593.1,66 592.9,66" fill="#2a1a0e"/>
    </g>
  
    <!-- SALESFORCE TOWER v1 (x≈604–620 after slimming to 80% width; gentle taper + straight crown lantern w/ banding; height preserved) -->
    <g transform="translate(120, 0) scale(0.8, 1)">
      <!-- Body silhouette: gentle taper + straight crown lantern + tiny rounded cap -->
      <path d="M 605,148
               L 605.6,87
               L 606.4,73
               L 606.4,65
               Q 606.4,63.4 608,63.2
               L 622,63.2
               Q 623.6,63.4 623.6,65
               L 623.6,73
               L 624.4,87
               L 625,148 Z"
            fill="#2a1a0e"/>
      <!-- Day for Night crown tip: subtle slate accent in light mode, warm gold glow in dark mode -->
      <rect class="sf-crown-tip" x="610.5" y="63.4" width="9" height="0.9" fill="#4a5868" opacity="0.55"/>
      <!-- Subtle vertical mullion hints on the shaft -->
      <line x1="610.5" y1="148" x2="610.7" y2="75" stroke="#3d2a10" stroke-width="0.25" opacity="0.5"/>
      <line x1="615"   y1="148" x2="615"   y2="73" stroke="#3d2a10" stroke-width="0.25" opacity="0.5"/>
      <line x1="619.5" y1="148" x2="619.3" y2="75" stroke="#3d2a10" stroke-width="0.25" opacity="0.5"/>
      <!-- Window glints on the shaft -->
      <rect x="608" y="97"  width="9" height="1.2" fill="#dceef8" opacity="0.22"/>
      <rect x="608" y="113" width="9" height="1.2" fill="#dceef8" opacity="0.20"/>
      <rect x="608" y="129" width="9" height="1.2" fill="#dceef8" opacity="0.20"/>
      <!-- Crown lantern: densely banded horizontal ribs (the LED art housing) -->
      <line x1="606.4" y1="64"   x2="623.6" y2="64"   stroke="#1a0e08" stroke-width="0.4" opacity="0.85"/>
      <line x1="606.4" y1="65.5" x2="623.6" y2="65.5" stroke="#1a0e08" stroke-width="0.4" opacity="0.85"/>
      <line x1="606.4" y1="67"   x2="623.6" y2="67"   stroke="#1a0e08" stroke-width="0.4" opacity="0.85"/>
      <line x1="606.4" y1="68.5" x2="623.6" y2="68.5" stroke="#1a0e08" stroke-width="0.4" opacity="0.85"/>
      <line x1="606.4" y1="70"   x2="623.6" y2="70"   stroke="#1a0e08" stroke-width="0.4" opacity="0.85"/>
      <line x1="606.4" y1="71.5" x2="623.6" y2="71.5" stroke="#1a0e08" stroke-width="0.4" opacity="0.85"/>
      <!-- Faint warm glow from the lantern -->
      <rect x="607.5" y="65" width="15" height="6" fill="#dceef8" opacity="0.10"/>
      <!-- Transition band at top of shaft / base of lantern -->
      <line x1="606" y1="73.5" x2="624" y2="73.5" stroke="#1a0e08" stroke-width="0.6" opacity="0.7"/>
      <!-- Subtle horizontal banding on the shaft (mechanical floor lines) -->
      <line x1="606" y1="80"  x2="624" y2="80"  stroke="#1a0e08" stroke-width="0.3" opacity="0.45"/>
      <line x1="606" y1="87"  x2="624" y2="87"  stroke="#1a0e08" stroke-width="0.3" opacity="0.4"/>
      <line x1="606" y1="105" x2="624" y2="105" stroke="#1a0e08" stroke-width="0.3" opacity="0.35"/>
      <line x1="606" y1="123" x2="624" y2="123" stroke="#1a0e08" stroke-width="0.3" opacity="0.35"/>
      <line x1="606" y1="141" x2="624" y2="141" stroke="#1a0e08" stroke-width="0.3" opacity="0.35"/>
    </g>
  
    <!-- ━━━ STANFORD ZONE: Memorial Church + Hoover ━━━ -->
  
    <!-- MEMORIAL CHURCH (x≈697 after +10px shift to balance Stanford zone) -->
    <g transform="translate(10, 0)">
      <rect x="690" y="115" width="34" height="33" fill="#3d3020"/>
      <rect x="685" y="125" width="5" height="23" fill="#3d3020"/>
      <polygon points="684,125 691,125 687.5,117" fill="#3d3020"/>
      <rect x="724" y="125" width="5" height="23" fill="#3d3020"/>
      <polygon points="723,125 730,125 726.5,117" fill="#3d3020"/>
      <polygon points="694,115 720,115 707,98" fill="#3d3020"/>
      <circle cx="707" cy="108" r="4" fill="#dceef8" opacity="0.45"/>
      <circle cx="707" cy="108" r="4" fill="none" stroke="#1a0e08" stroke-width="0.6"/>
      <line x1="707" y1="98" x2="707" y2="89" stroke="#3d3020" stroke-width="1.4"/>
      <line x1="704" y1="92" x2="710" y2="92" stroke="#3d3020" stroke-width="1.2"/>
      <rect x="703" y="133" width="8" height="15" fill="#1a0e08"/>
      <path d="M 703,133 Q 707,126 711,133" fill="#1a0e08"/>
    </g>
  
    <!-- HOOVER TOWER v2 (centered at x=774; chonkier shaft, segmental dome, arched carillon — scaled to 70% with ground-anchored compensation, footprint now x=764.55..783.45) -->
    <g transform="translate(764.2, 44.4) scale(0.70)">
      <!-- Base -->
      <rect x="0.5" y="144" width="27" height="4" fill="#2a1a0e"/>
      <rect x="1.5" y="140" width="25" height="4" fill="#3d2a10"/>
      <path d="M 2.5,140 L 2.5,134 L 4.5,132 L 23.5,132 L 25.5,134 L 25.5,140 Z" fill="#3d2a10"/>
      <path d="M 12,140 L 12,137 Q 12,135 14,135 Q 16,135 16,137 L 16,140 Z" fill="#1a0e08"/>
      <!-- Shaft (width 21, shortened 5px → height 19) -->
      <rect x="3.5" y="113" width="21" height="19" fill="#3d2a10"/>
      <line x1="4" y1="113" x2="4" y2="132" stroke="#2a1a0e" stroke-width="0.3" opacity="0.7"/>
      <line x1="24" y1="113" x2="24" y2="132" stroke="#1a0e08" stroke-width="0.3" opacity="0.4"/>
      <rect x="13.65" y="117" width="0.7" height="2" fill="#dceef8" opacity="0.22"/>
      <rect x="13.65" y="123" width="0.7" height="2" fill="#dceef8" opacity="0.22"/>
      <rect x="13.65" y="129" width="0.7" height="2" fill="#dceef8" opacity="0.22"/>
      <!-- Lower cornice -->
      <rect x="2.5" y="109" width="23" height="4" fill="#2a1a0e"/>
      <!-- Carillon w/ three tall arched openings -->
      <rect x="3.5" y="91" width="21" height="18" fill="#3d2a10"/>
      <path d="M 5,107 L 5,95.5 Q 5,93 7.5,93 Q 10,93 10,95.5 L 10,107 Z" fill="#dceef8" opacity="0.38"/>
      <path d="M 5,107 L 5,95.5 Q 5,93 7.5,93 Q 10,93 10,95.5 L 10,107 Z" fill="none" stroke="#1a0e08" stroke-width="0.18" opacity="0.6"/>
      <path d="M 11.5,107 L 11.5,95.5 Q 11.5,93 14,93 Q 16.5,93 16.5,95.5 L 16.5,107 Z" fill="#dceef8" opacity="0.38"/>
      <path d="M 11.5,107 L 11.5,95.5 Q 11.5,93 14,93 Q 16.5,93 16.5,95.5 L 16.5,107 Z" fill="none" stroke="#1a0e08" stroke-width="0.18" opacity="0.6"/>
      <path d="M 18,107 L 18,95.5 Q 18,93 20.5,93 Q 23,93 23,95.5 L 23,107 Z" fill="#dceef8" opacity="0.38"/>
      <path d="M 18,107 L 18,95.5 Q 18,93 20.5,93 Q 23,93 23,95.5 L 23,107 Z" fill="none" stroke="#1a0e08" stroke-width="0.18" opacity="0.6"/>
      <!-- Upper cornice -->
      <rect x="2.5" y="87" width="23" height="4" fill="#2a1a0e"/>
      <!-- Drum -->
      <rect x="5" y="83" width="18" height="4" fill="#3d2a10"/>
      <!-- Dome (shallow segmental) -->
      <path d="M 3.5,83 Q 3.5,73 14,73 Q 24.5,73 24.5,83 Z" fill="#2a1a0e"/>
      <path d="M 7,75 Q 14,72 21,75" fill="none" stroke="#3d2a10" stroke-width="0.3" opacity="0.6"/>
      <!-- Finial -->
      <line x1="14" y1="73" x2="14" y2="67" stroke="#2a1a0e" stroke-width="0.5"/>
      <circle cx="14" cy="66.4" r="0.8" fill="#2a1a0e"/>
      <circle cx="14" cy="64.6" r="0.4" fill="#2a1a0e"/>
    </g>
  
  </svg>
  <div style="position:absolute;bottom:10px;right:14px;font-size:10px;font-family:Georgia,serif;color:rgba(42,26,14,0.3);pointer-events:none;" id="footer-hint">click to pause</div>`;

  // 1. Inject footer banner
  const footerBanner = document.getElementById('footer-banner');
  if (footerBanner) {
    footerBanner.innerHTML = FOOTER_HTML;
    footerBanner.setAttribute('role', 'button');
    footerBanner.setAttribute('tabindex', '0');
    footerBanner.setAttribute('aria-label', 'Pause or play the footer animation');
    footerBanner.setAttribute('aria-pressed', 'false');

    // 2. Pause/play on click or keyboard (Enter / Space)
    const footerHint = document.getElementById('footer-hint');
    let paused = false;
    const toggle = () => {
      paused = !paused;
      footerBanner.classList.toggle('paused', paused);
      footerBanner.setAttribute('aria-pressed', paused ? 'true' : 'false');
      if (footerHint) footerHint.textContent = paused ? 'click to play' : 'click to pause';
    };
    footerBanner.addEventListener('click', toggle);
    footerBanner.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      }
    });
  }

  // 3. Theme toggle — top-right button + clickable sun/moon in the footer SVG
  const themeToggle = document.getElementById('themeToggle');
  const html = document.documentElement;
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    html.dataset.theme = savedTheme;
    if (themeToggle) themeToggle.textContent = savedTheme === 'dark' ? '☽' : '☀';
  }
  const toggleTheme = () => {
    const isDark = html.dataset.theme === 'dark';
    html.dataset.theme = isDark ? '' : 'dark';
    if (themeToggle) themeToggle.textContent = isDark ? '☀' : '☽';
    localStorage.setItem('theme', isDark ? '' : 'dark');
  };
  if (themeToggle) themeToggle.addEventListener('click', toggleTheme);

  const sunMoon = footerBanner && footerBanner.querySelector('.sun-moon');
  if (sunMoon) {
    sunMoon.addEventListener('click', e => {
      e.stopPropagation();
      toggleTheme();
    });
    sunMoon.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
        toggleTheme();
      }
    });
  }

  // 4. Active nav highlighting based on current URL
  const path = window.location.pathname;
  const filename = path.substring(path.lastIndexOf('/') + 1) || 'index.html';
  document.querySelectorAll('.tab-btn').forEach(link => {
    const href = link.getAttribute('href');
    const target = href === './' ? 'index.html' : href;
    if (target === filename) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });

})();
