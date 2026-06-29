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
  <div style="position:absolute;bottom:10px;right:14px;font-size:10px;font-family:Georgia,serif;color:rgba(42,26,14,0.3);pointer-events:none;" id="footer-hint"></div>`;

  // 1. Inject footer banner
  const footerBanner = document.getElementById('footer-banner');
  if (footerBanner) {
    footerBanner.innerHTML = FOOTER_HTML;
    footerBanner.setAttribute('role', 'button');
    footerBanner.setAttribute('tabindex', '0');
    footerBanner.setAttribute('aria-label', 'Stop or resume the banner animation');
    // (interaction is wired in the sky-cycle block below)
  }

  // 2b. Sky cycle + interactivity + theme.
  //     The banner sky runs a continuous day↔night cycle: the sun and moon trace one looping arc
  //     (sun by day, moon by night; rising left, setting right), the glow blooming at the horizon
  //     where each disc rises/sets. Two controls on one Web Animations clock: clicking ANYWHERE on the
  //     banner stops/continues time (sky, train, and jet freeze and resume together); the top-right
  //     ☀/☽ button picks the day/night pole — flips the page theme, eases the sky there, and holds
  //     time at that pole. prefers-reduced-motion freezes a static day/night frame.
  (function setupSky() {
    const html = document.documentElement;
    const themeToggle = document.getElementById('themeToggle');
    const setTheme = dark => {
      html.dataset.theme = dark ? 'dark' : '';
      if (themeToggle) themeToggle.textContent = dark ? '☽' : '☀';
      localStorage.setItem('theme', dark ? 'dark' : '');
    };
    if (localStorage.getItem('theme')) setTheme(localStorage.getItem('theme') === 'dark');
    // (top-right button's click handler is wired below, once the sky mode machine exists, so it can
    //  pin the sky to the matching day/night pole — keeping button + sky in sync.)

    const banner = document.getElementById('footer-banner');
    const svg = banner && banner.querySelector('svg');
    if (!svg) return;

    const CYCLE = 60, D = CYCLE + 's';

    // Sky → fixed 5-stop set the states share (offsets 0/27/50/73/100); colours driven below.
    const sky = svg.querySelector('#sky-f');
    if (sky) sky.innerHTML = '<stop offset="0%"/><stop offset="27%"/><stop offset="50%"/><stop offset="73%"/><stop offset="100%"/>';

    // Defs: soft radial glows for the sun + moon.
    const defs = svg.querySelector('defs');
    if (defs) defs.insertAdjacentHTML('beforeend',
      '<radialGradient id="ap-sunglow"><stop offset="0%" stop-color="#ffd089" stop-opacity="0.9"/><stop offset="45%" stop-color="#ff9d52" stop-opacity="0.4"/><stop offset="100%" stop-color="#ff7a40" stop-opacity="0"/></radialGradient>' +
      // always-on soft radiance around the sun disc (visible even at midday, like the old corner sun)
      '<radialGradient id="ap-sunhalo"><stop offset="0%" stop-color="#fff0c8" stop-opacity="0.55"/><stop offset="55%" stop-color="#ffe6a8" stop-opacity="0.2"/><stop offset="100%" stop-color="#ffe6a8" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="ap-moonglow"><stop offset="0%" stop-color="#b8c4e0" stop-opacity="0.5"/><stop offset="100%" stop-color="#b8c4e0" stop-opacity="0"/></radialGradient>' +
      // jet contrail — bright stop colour shifts with time of day
      '<linearGradient id="contrail" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#fff" stop-opacity="0"/><stop id="contrail-b" offset="100%" stop-color="#fff" stop-opacity="0.6"/></linearGradient>');

    // Orbiting luminaries, inserted right after the sky so landmarks occlude them when low.
    const RSUN = 13, RMOON = 13, RtMOON = 16; // bigger discs; larger RtMOON = thicker-bellied crescent
    const crescent = 'M 0,' + (-RMOON) + ' A ' + RMOON + ',' + RMOON + ' 0 0,0 0,' + RMOON + ' A ' + RtMOON + ',' + RtMOON + ' 0 0,1 0,' + (-RMOON) + ' Z';
    const skyRect = svg.querySelector('rect[fill="url(#sky-f)"]');
    if (skyRect) skyRect.insertAdjacentHTML('afterend',
      // sun: big horizon-bloom glow (animated) + always-on soft halo (midday radiance) + disc
      '<g id="ap-sun" style="mix-blend-mode:screen"><ellipse id="ap-sun-glow" cx="0" cy="0" rx="62" ry="40" fill="url(#ap-sunglow)" opacity="0"/><circle cx="0" cy="0" r="26" fill="url(#ap-sunhalo)"/></g>' +
      '<g id="ap-sun-disc"><circle cx="0" cy="0" r="' + RSUN + '" fill="#fff1cf"/></g>' +
      // moon: faint cool glow + bold warm-taupe crescent (translucent #f5d9a0 reads taupe over night sky)
      '<g id="ap-moon"><ellipse cx="0" cy="0" rx="42" ry="30" fill="url(#ap-moonglow)" opacity="0"/><path d="' + crescent + '" fill="#f5d9a0" fill-opacity="0.6"/></g>' +
      // jet: in front of sun & moon, behind the foreground landmarks. Occasional pass; look keyed to time of day.
      '<g id="ap-jet">' +
        '<rect x="-128" y="25.1" width="122" height="0.7" fill="url(#contrail)"/>' +
        '<rect x="-128" y="26.8" width="122" height="0.7" fill="url(#contrail)"/>' +
        '<g transform="translate(0,26)" fill="#3a3a42">' +
          '<path d="M 4,0 L -10,-1.2 L -10,1.2 Z"/>' +
          '<path d="M -2,0 L -10,-5 L -6,0 Z"/>' +
          '<path d="M -2,0 L -10,5 L -6,0 Z"/>' +
          '<path d="M -9,0 L -11.5,-3.5 L -9,-0.4 Z"/>' +
        '</g>' +
        '<g id="ap-jet-nav" transform="translate(0,26)" style="opacity:0">' +
          '<circle cx="-9" cy="-4.4" r="0.75" fill="#ff3838"/>' +
          '<circle cx="-9" cy="4.4" r="0.75" fill="#36ff48"/>' +
          '<circle class="jet-strobe" cx="3" cy="0" r="0.8" fill="#fff"/>' +
        '</g>' +
      '</g>');

    // Ellipse arc: apex at p=0 (noon); sun rises ~p79 (left), sets ~p21 (right); moon = sun + 50%.
    const CX = 400, CY = 188, RX = 372, RY = 156;
    const posAt = p => { const th = 2 * Math.PI * (p / 100); return [CX + RX * Math.sin(th), CY - RY * Math.cos(th)]; };

    // Colour states (sky / ground / lights), keyed to sun altitude via the timeline below.
    const STATES = {
      day:      { sky:['#c5dff0','#cfe6f4','#dceef8','#dce8f2','#cfe2f0'], water:['#a8d4ec','#88bcd8'], grass:['#8aaa7a','#5a7a4a'], sand:['#e2d0b0','#cdb890'], bgh:['#b8c8d8','#a8b8c8'], midhill:'#a8a89a', gbeam:'#9a8a70', gpillar:'#8a7a60', dayhl:1, stars:0, hill:0, dubai:0, baylight:'#3d3020', crown:'#4a5868', spire:'#2a1a0e', dbody:'#48b4e4', droof:'#e8f0f4', fbody:'#1f3825', cbody:'#e8e8ec' },
      golden:   { sky:['#1e2f5e','#5a5a8e','#b87a86','#ee9568','#ffc873'], water:['#eca673','#6d5a78'], grass:['#6e5e3e','#2c2414'], sand:['#cf9a60','#97642f'], bgh:['#7e6e8e','#5f5070'], midhill:'#3d3250', gbeam:'#6a563c', gpillar:'#5e4c34', dayhl:0, stars:0, hill:0, dubai:0, baylight:'#6a5a40', crown:'#9a7a3a', spire:'#2a1a0e', dbody:'#3f6e86', droof:'#c7b596', fbody:'#1c3020', cbody:'#d6cdc2' },
      bluehour: { sky:['#0e1a3a','#1f2b52','#3a3a63','#7a4a5a','#cf7038'], water:['#5a4a5e','#0e1730'], grass:['#34384a','#161a26'], sand:['#4a4250','#2a2434'], bgh:['#34324e','#242238'], midhill:'#1f1d30', gbeam:'#6a563c', gpillar:'#5e4c34', dayhl:0, stars:0.5, hill:0.6, dubai:0.7, baylight:'#9a7a50', crown:'#caa040', spire:'#8a8a90', dbody:'#2a4456', droof:'#6a6c78', fbody:'#142418', cbody:'#6a6870' },
      night:    { sky:['#08061a','#0d0920','#120c2a','#180e22','#1e100a'], water:['#0a1428','#050a18'], grass:['#1a2a14','#0e1a0a'], sand:['#2a1e0e','#1e1408'], bgh:['#1a2030','#141a28'], midhill:'#1c1726', gbeam:'#3a2f1e', gpillar:'#332817', dayhl:0, stars:1, hill:1, dubai:1, baylight:'#f0e6c0', crown:'#f5d850', spire:'#d8dcd8', dbody:'#264458', droof:'#5a5c66', fbody:'#142418', cbody:'#2e3036' },
      dawn:     { sky:['#2a2f55','#4a4a78','#9a6a86','#e8a886','#ffd9a8'], water:['#d6a690','#5a5a72'], grass:['#62584a','#2a2418'], sand:['#b89a86','#806452'], bgh:['#8a7a92','#6a5e76'], midhill:'#46405a', gbeam:'#6a563c', gpillar:'#5e4c34', dayhl:0, stars:0.28, hill:0, dubai:0, baylight:'#5a5266', crown:'#5a5868', spire:'#3a2a1e', dbody:'#5a7e92', droof:'#cabfc0', fbody:'#243a2c', cbody:'#dcd4cc' }
    };
    const TL = [[0,'day'],[10,'day'],[16,'golden'],[23,'bluehour'],[34,'night'],[66,'night'],[78,'dawn'],[90,'day'],[100,'day']];

    const T = [];
    for (let i = 0; i < 5; i++) T.push({ sel: '#sky-f stop:nth-child(' + (i + 1) + ')', prop: 'stop-color', key: 'sky', idx: i });
    for (let i = 0; i < 2; i++) T.push({ sel: '#water-f stop:nth-child(' + (i + 1) + ')', prop: 'stop-color', key: 'water', idx: i });
    T.push({ sel: '.grass-top', prop: 'stop-color', key: 'grass', idx: 0 }, { sel: '.grass-bot', prop: 'stop-color', key: 'grass', idx: 1 });
    T.push({ sel: '.sand-top', prop: 'stop-color', key: 'sand', idx: 0 }, { sel: '.sand-bot', prop: 'stop-color', key: 'sand', idx: 1 });
    T.push({ sel: '.bg-hills-top', prop: 'stop-color', key: 'bgh', idx: 0 }, { sel: '.bg-hills-bot', prop: 'stop-color', key: 'bgh', idx: 1 });
    [['.mid-range-hills', 'fill', 'midhill'], ['.guideway-beam', 'fill', 'gbeam'], ['.guideway-pillars', 'fill', 'gpillar'],
     ['.day-highlight', 'opacity', 'dayhl'], ['.night-stars', 'opacity', 'stars'], ['.hill-lights', 'opacity', 'hill'], ['.dubai-lights', 'opacity', 'dubai'],
     ['.bay-light', 'stroke', 'baylight'], ['.sf-crown-tip', 'fill', 'crown'], ['.burj-spire', 'fill', 'spire'],
     ['.dubai-body', 'fill', 'dbody'], ['.dubai-roof', 'fill', 'droof'], ['.fbus-body', 'fill', 'fbody'], ['.caltrain-body', 'fill', 'cbody']
    ].forEach(([sel, prop, key]) => T.push({ sel, prop, key, idx: null }));
    const valOf = (s, t) => { const v = STATES[s][t.key]; return t.idx == null ? v : v[t.idx]; };

    // Force the day-/night-only layers to render so the cycle's opacity (not data-theme) drives them;
    // hide the legacy corner sun/moon (replaced by the orbiting luminary).
    const forceShow = '#footer-banner .night-stars,#footer-banner .hill-lights,#footer-banner .dubai-lights,#footer-banner .day-highlight{display:inline !important;}' +
      '#footer-banner .sun-moon{display:none !important;}';

    // ── keyframes: colours + orbit motion + glow/disc ──
    // 0.5% sampling (was 4%) → a smooth, even path with no polygon jerk. Timing stays linear in the
    // ellipse angle, so the sun keeps lingering at the horizon — long, slow sunrises/sunsets.
    const fmt = v => Math.round(v * 10) / 10;
    let css = forceShow, n = 0;
    const bySel = {}; T.forEach(t => (bySel[t.sel] = bySel[t.sel] || []).push(t));
    for (const sel in bySel) {
      const names = [];
      for (const t of bySel[sel]) {
        const nm = 'ap' + (n++); let body = '';
        for (const [pct, s] of TL) body += pct + '%{' + t.prop + ':' + valOf(s, t) + ';}';
        css += '@keyframes ' + nm + '{' + body + '}'; names.push(nm + ' ' + D + ' linear infinite');
      }
      css += sel + '{animation:' + names.join(',') + ';}';
    }
    let sunKf = '', moonKf = '';
    for (let i = 0; i <= 200; i++) {
      const p = i / 2, s = posAt(p), m = posAt(p + 50);
      sunKf += p + '%{transform:translate(' + fmt(s[0]) + 'px,' + fmt(s[1]) + 'px);}';
      moonKf += p + '%{transform:translate(' + fmt(m[0]) + 'px,' + fmt(m[1]) + 'px);}';
    }
    css += '@keyframes ap-sun-move{' + sunKf + '}#ap-sun-disc,#ap-sun{animation:ap-sun-move ' + D + ' linear infinite;}';
    css += '@keyframes ap-moon-move{' + moonKf + '}#ap-moon{animation:ap-moon-move ' + D + ' linear infinite;}';
    css += '@keyframes ap-sunglow-op{0%{opacity:0.06}10%{opacity:0.25}16%{opacity:0.75}21%{opacity:0.95}25%{opacity:0.5}30%{opacity:0}70%{opacity:0}79%{opacity:0.9}85%{opacity:0.5}92%{opacity:0.2}100%{opacity:0.06}}#ap-sun-glow{animation:ap-sunglow-op ' + D + ' linear infinite;}';
    css += '@keyframes ap-disc-fill{0%{fill:#fff3d0}14%{fill:#ffc070}20%{fill:#ff9048}26%{fill:#ff7838}30%{fill:#ff7838}74%{fill:#ff7838}80%{fill:#ff9048}88%{fill:#ffc878}100%{fill:#fff3d0}}#ap-sun-disc circle{animation:ap-disc-fill ' + D + ' linear infinite;}';
    css += '@keyframes ap-moonglow-op{0%{opacity:0}30%{opacity:0}40%{opacity:0.25}50%{opacity:0.35}60%{opacity:0.25}70%{opacity:0}100%{opacity:0}}#ap-moon ellipse{animation:ap-moonglow-op ' + D + ' linear infinite;}';

    // Jet: contrail colour + nav-light opacity ride the sky clock (named ap-*, so they pin with the sky);
    // the traverse + strobe run independently. One slow pass every ~170s, varied across the day.
    const JET = { day: ['#ffffff', 0], golden: ['#ffd6a8', 0], bluehour: ['#e8c2c2', 0.8], night: ['#c2cdec', 1], dawn: ['#ffd8c0', 0.15] };
    let jt = '', jn = '';
    for (const [pct, s] of TL) { jt += pct + '%{stop-color:' + JET[s][0] + ';}'; jn += pct + '%{opacity:' + JET[s][1] + ';}'; }
    css += '@keyframes ap-jettrail{' + jt + '}#contrail-b{animation:ap-jettrail ' + D + ' linear infinite;}';
    css += '@keyframes ap-jetnav{' + jn + '}#ap-jet-nav{animation:ap-jetnav ' + D + ' linear infinite;}';
    css += '@keyframes jet-fly{0%,10%{transform:translateX(-160px)}15%{transform:translateX(965px)}100%{transform:translateX(965px)}}#ap-jet{animation:jet-fly 170s linear infinite;}';
    css += '@keyframes jet-strobe{0%,90%{opacity:0.15}94%{opacity:1}100%{opacity:0.15}}.jet-strobe{animation:jet-strobe 1.5s linear infinite;}';
    css += '@media (prefers-reduced-motion:reduce){#ap-jet{display:none;}}';

    const styleEl = document.createElement('style'); styleEl.id = 'sky-cycle-style'; styleEl.textContent = css; document.head.appendChild(styleEl);

    // ── interaction: one Web Animations clock; two controls — click banner = stop/continue time,
    //    ☀/☽ button = pick the day/night pole. reduced-motion → static pin. ──
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const durMs = () => CYCLE * 1000;
    const skyAnims = () => document.getAnimations().filter(a => a.animationName && a.animationName.indexOf('ap') === 0);
    const pinStatic = () => { const dark = html.dataset.theme === 'dark'; skyAnims().forEach(a => { a.pause(); try { a.currentTime = (dark ? 0.5 : 0) * durMs(); } catch (_) {} }); };

    // `timeStopped` is the only interactive state besides theme. Stop/continue freezes or resumes the
    // WHOLE scene at once — sky, train, and jet — so nothing moves while time is stopped.
    let timeStopped = false, token = 0;
    const stopTime = () => { ++token; document.getAnimations().forEach(a => a.pause()); timeStopped = true; };
    const startTime = () => { ++token; document.getAnimations().forEach(a => a.play()); timeStopped = false; };

    const easeTo = (targetP, onDone) => {             // forward-only constant-rate scrub of the SKY to a pole
      const my = ++token, A = skyAnims(); if (!A.length) return;
      A.forEach(a => a.pause());
      const d = durMs(), cur = ((((A[0].currentTime || 0) % d) + d) % d) / d * 100;
      let dist = (((targetP - cur) % 100) + 100) % 100; if (dist < 2) dist += 100;
      const Tm = dist * 80, t0 = performance.now(); // 80ms per cycle-unit → a 50-unit day↔night toggle ≈ 4s
      const step = now => {
        if (my !== token) return;                    // a stop/continue click interrupts the ease
        const k = Math.min(1, (now - t0) / Tm), ms = ((cur + dist * k) % 100) / 100 * d;
        A.forEach(a => { try { a.currentTime = ms; } catch (_) {} });
        if (k < 1) requestAnimationFrame(step); else if (onDone) onDone();
      };
      requestAnimationFrame(step);
    };

    const toggleTime = () => {
      if (reduce.matches) { setTheme(html.dataset.theme !== 'dark'); return; } // no cycle to stop → flip theme (re-pin via observer)
      timeStopped ? startTime() : stopTime();
    };

    // The entire banner is one stop/continue-time surface (sky + train + jet move together). Keyboard mirrors it.
    svg.insertAdjacentHTML('beforeend', '<rect id="ap-timehit" x="0" y="0" width="800" height="180" fill="none" pointer-events="all" style="cursor:pointer"/>');
    svg.querySelector('#ap-timehit').addEventListener('click', toggleTime);
    if (banner) banner.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleTime(); } });

    // Start free-playing (or static under reduced motion). Defer a frame so the animations exist.
    requestAnimationFrame(() => { if (reduce.matches) pinStatic(); });
    reduce.addEventListener('change', () => { if (reduce.matches) pinStatic(); else startTime(); });
    new MutationObserver(() => { if (reduce.matches) pinStatic(); }).observe(html, { attributes: true, attributeFilter: ['data-theme'] });

    // Top-right ☀/☽ button — picks the day/night MODE: flips page theme, eases the sky to the matching
    // pole, then holds time there (train + jet included). Click the banner to continue the cycle.
    if (themeToggle) themeToggle.addEventListener('click', () => {
      const dark = html.dataset.theme !== 'dark';
      setTheme(dark);
      if (!reduce.matches) easeTo(dark ? 50 : 0, stopTime);
    });
  })();

  // 3. (Theme toggle is handled inside the sky-cycle block above.)

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
