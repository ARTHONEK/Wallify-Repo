(() => {
  "use strict";

  const canvas =
    document.getElementById("canvas");

  const ctx =
    canvas.getContext("2d", {
      alpha: false
    });

  const TAU =
    Math.PI * 2;

  const MAX_MOONS = 3;
  const MAX_SATELLITES = 3;
  const MAX_ROCKETS = 4;
  const MAX_SOLAR_PARTICLES = 20;
  const MAX_GARGANTUA_DEBRIS = 24;

  let width = 1;
  let height = 1;
  let dpr = 1;

  let elapsed = 0;
  let lastTime = 0;

  let paused = false;
  let frameScheduled = false;

  let offsetX = 0;
  let targetOffsetX = 0;

  let latestMetadata = null;
  let isCharging = false;

  let lastStarCount = -1;
  let previousPlanetType = "earth";

  let rocketTimer = 1.5;
  let solarFlareTimer = 5;

  const stars = [];
  const rockets = [];
  const solarParticles = [];

  const settings = {
    useMonet: false,
    palette: "default",

    planetType: "earth",
    speed: 1,
    planetScale: 1,

    starCount: 110,

    showSolarFlares: true,
    showAurora: true,
    showMarsBase: true,

    showMoon: true,
    moonCount: 1,

    showSatellite: true,
    satelliteCount: 1,
    showSignals: true,

    showOrbits: true,
    showISS: true
  };

  const scene = {
    x: 0,
    y: 0,
    radius: 100
  };

  const sun = {
    x: 0,
    y: 0,
    radius: 50,
    brightness: 1
  };

  const solarFlare = {
    active: false,
    age: 0,
    duration: 2.8,
    angle: 0,
    strength: 0
  };

  const marsBase = {
    visible: false,
    progress: 0,
    beaconTime: 0,
    landingX: 0,
    landingY: 0
  };

  const moons = Array.from(
    {
      length: MAX_MOONS
    },
    () => ({
      angle: 0,

      x: 0,
      y: 0,

      radius: 0,

      orbitX: 0,
      orbitY: 0,

      kind: "moon",
      styleIndex: 0,
      irregularity: 0,
      phase: 0
    })
  );

  const satellites = Array.from(
    {
      length: MAX_SATELLITES
    },
    () => ({
      angle: 0,

      x: 0,
      y: 0,

      size: 0,

      orbitX: 0,
      orbitY: 0
    })
  );

  const miniaturePlanets = [
    {
      type: "mercury",

      angle: 0,

      x: 0,
      y: 0,

      radius: 0,
      orbit: 0,

      speed: 0.72,
      phase: 0.3
    },

    {
      type: "venus",

      angle: 0,

      x: 0,
      y: 0,

      radius: 0,
      orbit: 0,

      speed: 0.52,
      phase: 2.1
    },

    {
      type: "earth",

      angle: 0,

      x: 0,
      y: 0,

      radius: 0,
      orbit: 0,

      speed: 0.39,
      phase: 4.15
    },

    {
      type: "mars",

      angle: 0,

      x: 0,
      y: 0,

      radius: 0,
      orbit: 0,

      speed: 0.31,
      phase: 5.35
    },

    {
      type: "jupiter",

      angle: 0,

      x: 0,
      y: 0,

      radius: 0,
      orbit: 0,

      speed: 0.22,
      phase: 1.35
    }
  ];

  const ufo = {
    angle: 0,

    x: 0,
    y: 0,

    size: 0
  };

  const iss = {
    angle: 0,

    x: 0,
    y: 0,

    size: 0,

    orbitX: 0,
    orbitY: 0
  };

  const transferRocket = {
    state: "waiting",
    timer: 2,

    progress: 0,
    duration: 7,

    startX: 0,
    startY: 0,

    controlX: 0,
    controlY: 0,

    endX: 0,
    endY: 0,

    x: 0,
    y: 0,

    previousX: 0,
    previousY: 0,

    angle: 0,
    size: 6,
    opacity: 1
  };

  const alienFleet = [
    {
      active: false,
      mode: "arrive",

      delay: 2.8,
      progress: 0,
      duration: 2.8,
      stay: 0,

      orbitAngle: 0,

      x: 0,
      y: 0,

      angle: 0,
      size: 16,
      alpha: 0,

      warpX: 0,
      warpY: 0
    },

    {
      active: false,
      mode: "arrive",

      delay: 6,
      progress: 0,
      duration: 3,
      stay: 0,

      orbitAngle: 2.4,

      x: 0,
      y: 0,

      angle: 0,
      size: 13,
      alpha: 0,

      warpX: 0,
      warpY: 0
    }
  ];

  const gargantua = {
    x: 0,
    y: 0,

    radius: 92,
    horizonRadius: 52,

    diskOuterRadius: 188,
    diskInnerRadius: 68,

    diskTilt: 0.3,
    diskThickness: 0.24,

    rotation: 0,

    photonPulse: 0,
    lensPulse: 0,

    brightness: 1
  };

  const miller = {
    angle: 0,

    x: 0,
    y: 0,

    radius: 30,

    orbitX: 240,
    orbitY: 92,

    phase: 1.25,

    depth: 0,
    behind: false
  };

  const endurance = {
    visible: true,

    x: 0,
    y: 0,

    previousX: 0,
    previousY: 0,

    angle: 0,
    spin: 0,

    radius: 18,

    orbitAngle: 0,
    orbitX: 300,
    orbitY: 118,

    alpha: 1
  };

  const ranger = {
    state: "docked",
    timer: 4,

    progress: 0,
    duration: 4,

    x: 0,
    y: 0,

    previousX: 0,
    previousY: 0,

    startX: 0,
    startY: 0,

    controlX: 0,
    controlY: 0,

    endX: 0,
    endY: 0,

    angle: 0,
    size: 8,
    alpha: 1
  };

  const plungeShuttle = {
    state: "waiting",
    timer: 0,

    progress: 0,
    duration: 8,

    angle: 0,
    spiralAngle: 0,

    x: 0,
    y: 0,

    previousX: 0,
    previousY: 0,

    size: 7,
    alpha: 0,

    stretch: 1
  };

  const gargantuaSequence = {
    time: 0,
    duration: 44,

    stage: "arrival",
    stageTime: 0,

    cycle: 0,

    millerLandingComplete: false,
    rangerReturned: false,
    shuttleReleased: false,

    flash: 0
  };

  const gargantuaDebris = Array.from(
    {
      length: MAX_GARGANTUA_DEBRIS
    },
    (
      _,
      index
    ) => ({
      active: true,

      angle:
        index /
        MAX_GARGANTUA_DEBRIS *
        TAU,

      distance:
        1.15 +
        (
          index % 7
        ) *
        0.18,

      speed:
        0.12 +
        (
          index % 5
        ) *
        0.027,

      size:
        1.2 +
        (
          index % 4
        ) *
        0.8,

      eccentricity:
        0.32 +
        (
          index % 3
        ) *
        0.07,

      heat: 0,

      alpha:
        0.4 +
        (
          index % 5
        ) *
        0.1,

      phase:
        index *
        1.73,

      spiral:
        0
    })
  );

  const palettes = {
    default: {
      background: "#041009",
      deepSpace: "#010503",

      primary: "#8ed8a5",
      primaryBright: "#d9ffe2",

      ocean: "#176b45",
      oceanDark: "#052e1d",

      land: "#79c98f",
      landBright: "#b0e8bd",

      clouds: "#e2f4e7",
      moon: "#c8dccb",

      satellite: "#e2eee5",

      sun: "#dfff9e",
      sunCore: "#faffe4",

      signal: "#82ffa8",
      panel: "#174b39",

      ufoMetal: "#afc6b7",
      ufoGlass: "#a8f8d0",

      aurora: "#6dffaf",
      auroraSecondary: "#8ed8ff",

      accretionHot: "#fff9dc",
      accretionWarm: "#ffd786",
      accretionOuter: "#d48542",
      accretionCold: "#6d4534",

      lensLight: "#fffde8",
      millerOcean: "#344d5a",
      millerLight: "#abc9d4"
    },

    gray: {
      background: "#101112",
      deepSpace: "#030405",

      primary: "#bfc4c2",
      primaryBright: "#f0f4f2",

      ocean: "#555d5a",
      oceanDark: "#202523",

      land: "#8f9693",
      landBright: "#c9cfcc",

      clouds: "#e5e9e7",
      moon: "#c5c9c7",

      satellite: "#edf0ef",

      sun: "#e1e5d7",
      sunCore: "#ffffff",

      signal: "#c2d8d0",
      panel: "#343b38",

      ufoMetal: "#aeb4b1",
      ufoGlass: "#cde5dc",

      aurora: "#d8eee6",
      auroraSecondary: "#bacbd3",

      accretionHot: "#ffffff",
      accretionWarm: "#d8dcd9",
      accretionOuter: "#858b88",
      accretionCold: "#3c4140",

      lensLight: "#ffffff",
      millerOcean: "#42494c",
      millerLight: "#cbd1cf"
    },

    orange: {
      background: "#160b04",
      deepSpace: "#050201",

      primary: "#ffb068",
      primaryBright: "#ffe1c1",

      ocean: "#9a481d",
      oceanDark: "#3b1607",

      land: "#d9783c",
      landBright: "#ffc08b",

      clouds: "#fff0df",
      moon: "#e0b58d",

      satellite: "#fff0e2",

      sun: "#ffd181",
      sunCore: "#fff9dc",

      signal: "#ff9b52",
      panel: "#613018",

      ufoMetal: "#c69a78",
      ufoGlass: "#ffd0a6",

      aurora: "#ffbd6c",
      auroraSecondary: "#ffe39f",

      accretionHot: "#fff9df",
      accretionWarm: "#ffc269",
      accretionOuter: "#df6e27",
      accretionCold: "#733018",

      lensLight: "#fff5d9",
      millerOcean: "#603b2b",
      millerLight: "#dfb18b"
    },

    red: {
      background: "#160606",
      deepSpace: "#050101",

      primary: "#ff8b82",
      primaryBright: "#ffd9d5",

      ocean: "#8d2928",
      oceanDark: "#350707",

      land: "#c64d49",
      landBright: "#ffaaa2",

      clouds: "#ffe7e4",
      moon: "#d8a5a1",

      satellite: "#ffebe9",

      sun: "#ffb48e",
      sunCore: "#fff4df",

      signal: "#ff746c",
      panel: "#5a1717",

      ufoMetal: "#ba8783",
      ufoGlass: "#ffc1bb",

      aurora: "#ff7e8a",
      auroraSecondary: "#ffc1a8",

      accretionHot: "#fff1df",
      accretionWarm: "#ff9b73",
      accretionOuter: "#c83d36",
      accretionCold: "#62191a",

      lensLight: "#fff1e8",
      millerOcean: "#542c35",
      millerLight: "#d7a7ad"
    },

    yellow: {
      background: "#151104",
      deepSpace: "#050400",

      primary: "#e9d36c",
      primaryBright: "#fff5bd",

      ocean: "#81701f",
      oceanDark: "#302804",

      land: "#b8a33e",
      landBright: "#f0dc7a",

      clouds: "#fff9d9",
      moon: "#d8cd9a",

      satellite: "#fff9df",

      sun: "#fff08d",
      sunCore: "#ffffe3",

      signal: "#ffe45d",
      panel: "#554a13",

      ufoMetal: "#bdb386",
      ufoGlass: "#fff0a8",

      aurora: "#fff078",
      auroraSecondary: "#d8ff9c",

      accretionHot: "#ffffed",
      accretionWarm: "#ffe66f",
      accretionOuter: "#c79e32",
      accretionCold: "#655018",

      lensLight: "#ffffed",
      millerOcean: "#555039",
      millerLight: "#d9d09c"
    },

    blue: {
      background: "#04101a",
      deepSpace: "#010409",

      primary: "#82c8ff",
      primaryBright: "#d5edff",

      ocean: "#175f91",
      oceanDark: "#06243b",

      land: "#629fc3",
      landBright: "#a8d8f2",

      clouds: "#e1f3ff",
      moon: "#aecbde",

      satellite: "#e7f5ff",

      sun: "#b8e4ff",
      sunCore: "#f3fcff",

      signal: "#66bdff",
      panel: "#173e58",

      ufoMetal: "#8daeba",
      ufoGlass: "#a9e3ff",

      aurora: "#67ddff",
      auroraSecondary: "#918dff",

      accretionHot: "#f4fcff",
      accretionWarm: "#9bdcff",
      accretionOuter: "#497fc0",
      accretionCold: "#202f67",

      lensLight: "#effbff",
      millerOcean: "#173c59",
      millerLight: "#8ac5e4"
    },

    brown: {
      background: "#120c08",
      deepSpace: "#040201",

      primary: "#d0a27d",
      primaryBright: "#f5dbc5",

      ocean: "#70452e",
      oceanDark: "#2b170d",

      land: "#a27352",
      landBright: "#d9ad89",

      clouds: "#f2e4d8",
      moon: "#c9ad97",

      satellite: "#f1e5dc",

      sun: "#e8c18b",
      sunCore: "#fff3d5",

      signal: "#d99a6a",
      panel: "#493023",

      ufoMetal: "#ad917c",
      ufoGlass: "#e0b996",

      aurora: "#dca77f",
      auroraSecondary: "#f0d39e",

      accretionHot: "#fff0d6",
      accretionWarm: "#d79b5e",
      accretionOuter: "#8e5534",
      accretionCold: "#44261d",

      lensLight: "#ffecd6",
      millerOcean: "#4f3c36",
      millerLight: "#c7a68f"
    }
  };

  let colors = {
    ...palettes.default
  };

  const continents = [
    {
      angle: 0.1,
      latitude: -0.22,
      width: 0.42,
      height: 0.19,
      rotation: 0.25
    },

    {
      angle: 1.05,
      latitude: 0.22,
      width: 0.27,
      height: 0.31,
      rotation: -0.45
    },

    {
      angle: 1.95,
      latitude: -0.06,
      width: 0.37,
      height: 0.22,
      rotation: 0.3
    },

    {
      angle: 2.8,
      latitude: 0.34,
      width: 0.24,
      height: 0.14,
      rotation: -0.15
    },

    {
      angle: 3.65,
      latitude: -0.33,
      width: 0.29,
      height: 0.17,
      rotation: 0.5
    },

    {
      angle: 4.55,
      latitude: 0.03,
      width: 0.43,
      height: 0.25,
      rotation: -0.35
    },

    {
      angle: 5.5,
      latitude: 0.3,
      width: 0.22,
      height: 0.15,
      rotation: 0.2
    }
  ];

  const moonCraters = [
    {
      x: -0.27,
      y: -0.12,
      size: 0.14
    },

    {
      x: 0.2,
      y: 0.16,
      size: 0.1
    },

    {
      x: 0.08,
      y: -0.3,
      size: 0.065
    },

    {
      x: -0.04,
      y: 0.31,
      size: 0.05
    }
  ];

  const marsCraters = [
    {
      x: -0.45,
      y: -0.25,
      size: 0.11
    },

    {
      x: 0.3,
      y: -0.2,
      size: 0.075
    },

    {
      x: 0.42,
      y: 0.28,
      size: 0.13
    },

    {
      x: -0.17,
      y: 0.39,
      size: 0.06
    },

    {
      x: 0.03,
      y: -0.49,
      size: 0.045
    }
  ];

  const moonStyles = {
    earth: [
      {
        kind: "moon",
        light: "#e8e2d7",
        middle: "#bbb6ac",
        dark: "#4e4d4a",
        irregularity: 0
      },

      {
        kind: "captured",
        light: "#c8bca6",
        middle: "#8e8372",
        dark: "#3d3832",
        irregularity: 0.12
      },

      {
        kind: "ice",
        light: "#e8f8ff",
        middle: "#a9c9d4",
        dark: "#49606a",
        irregularity: 0.04
      }
    ],

    mars: [
      {
        kind: "phobos",
        light: "#c5aa8a",
        middle: "#806852",
        dark: "#322821",
        irregularity: 0.24
      },

      {
        kind: "deimos",
        light: "#d0b895",
        middle: "#8d775f",
        dark: "#382f28",
        irregularity: 0.19
      },

      {
        kind: "rock",
        light: "#a98368",
        middle: "#6c4c3d",
        dark: "#2c1d19",
        irregularity: 0.28
      }
    ],

    jupiter: [
      {
        kind: "io",
        light: "#fff2a8",
        middle: "#d9a72f",
        dark: "#6d4319",
        irregularity: 0
      },

      {
        kind: "europa",
        light: "#f3e5c5",
        middle: "#c7ae83",
        dark: "#655742",
        irregularity: 0
      },

      {
        kind: "ganymede",
        light: "#d0c0a9",
        middle: "#857566",
        dark: "#34302d",
        irregularity: 0.03
      }
    ],

    saturn: [
      {
        kind: "titan",
        light: "#f6cf72",
        middle: "#bd7f32",
        dark: "#543019",
        irregularity: 0
      },

      {
        kind: "enceladus",
        light: "#f8ffff",
        middle: "#c6e4e9",
        dark: "#667a82",
        irregularity: 0
      },

      {
        kind: "rhea",
        light: "#ddd9d0",
        middle: "#9b9891",
        dark: "#444441",
        irregularity: 0.04
      }
    ]
  };

  function clamp(
    value,
    minimum,
    maximum
  ) {
    return Math.max(
      minimum,
      Math.min(
        maximum,
        value
      )
    );
  }

  function smoothStep(value) {
    const t =
      clamp(
        value,
        0,
        1
      );

    return (
      t *
      t *
      (
        3 -
        2 * t
      )
    );
  }

  function easeOutCubic(value) {
    const t =
      clamp(
        value,
        0,
        1
      );

    return (
      1 -
      Math.pow(
        1 - t,
        3
      )
    );
  }

  function easeInCubic(value) {
    const t =
      clamp(
        value,
        0,
        1
      );

    return t * t * t;
  }

  function easeInOutCubic(value) {
    const t =
      clamp(
        value,
        0,
        1
      );

    if (t < 0.5) {
      return (
        4 *
        t *
        t *
        t
      );
    }

    return (
      1 -
      Math.pow(
        -2 * t + 2,
        3
      ) /
      2
    );
  }

  function lerp(
    first,
    second,
    amount
  ) {
    return (
      first +
      (
        second -
        first
      ) *
      amount
    );
  }

  function quadratic(
    start,
    control,
    end,
    amount
  ) {
    const inverse =
      1 -
      amount;

    return (
      inverse *
      inverse *
      start +
      2 *
      inverse *
      amount *
      control +
      amount *
      amount *
      end
    );
  }

  function getSetting(
    key,
    fallback
  ) {
    if (
      window.WallpaperEngine
    ) {
      return (
        window.WallpaperEngine
          .getSetting(
            key,
            String(fallback)
          )
      );
    }

    return String(fallback);
  }

  function readNumber(
    value,
    fallback,
    minimum,
    maximum
  ) {
    const result =
      Number(value);

    if (
      !Number.isFinite(result)
    ) {
      return fallback;
    }

    return clamp(
      result,
      minimum,
      maximum
    );
  }

  function readBoolean(
    value,
    fallback
  ) {
    if (
      value === undefined ||
      value === null ||
      value === ""
    ) {
      return fallback;
    }

    return (
      String(value) ===
      "true"
    );
  }

  function readPlanetType(value) {
    if (
      value === "earth" ||
      value === "mars" ||
      value === "jupiter" ||
      value === "saturn" ||
      value === "gargantua"
    ) {
      return value;
    }

    return "earth";
  }

  function readPalette(value) {
    if (
      value === "default" ||
      value === "gray" ||
      value === "orange" ||
      value === "red" ||
      value === "yellow" ||
      value === "blue" ||
      value === "brown"
    ) {
      return value;
    }

    return "default";
  }

  function resetTransferRocket() {
    transferRocket.state =
      "waiting";

    transferRocket.timer = 2;
    transferRocket.progress = 0;
    transferRocket.opacity = 1;
  }

  function resetAlienFleet() {
    alienFleet[0].active = false;
    alienFleet[0].mode = "arrive";
    alienFleet[0].delay = 2.8;
    alienFleet[0].progress = 0;
    alienFleet[0].alpha = 0;

    alienFleet[1].active = false;
    alienFleet[1].mode = "arrive";
    alienFleet[1].delay = 6;
    alienFleet[1].progress = 0;
    alienFleet[1].alpha = 0;
  }

  function resetMarsBase() {
    marsBase.visible = false;
    marsBase.progress = 0;
    marsBase.beaconTime = 0;
  }

  function resetSolarFlare() {
    solarFlare.active = false;
    solarFlare.age = 0;
    solarFlare.strength = 0;

    solarParticles.length = 0;

    solarFlareTimer =
      6 +
      Math.random() *
      9;
  }

  function resetGargantuaDebris() {
    for (
      let index = 0;
      index <
      gargantuaDebris.length;
      index++
    ) {
      const debris =
        gargantuaDebris[index];

      debris.active = true;

      debris.angle =
        index /
        gargantuaDebris.length *
        TAU;

      debris.distance =
        1.15 +
        (
          index % 7
        ) *
        0.18;

      debris.spiral = 0;
      debris.heat = 0;

      debris.alpha =
        0.4 +
        (
          index % 5
        ) *
        0.1;
    }
  }

  function resetGargantuaSequence() {
    gargantuaSequence.time = 0;
    gargantuaSequence.stage =
      "arrival";

    gargantuaSequence.stageTime = 0;

    gargantuaSequence.millerLandingComplete =
      false;

    gargantuaSequence.rangerReturned =
      false;

    gargantuaSequence.shuttleReleased =
      false;

    gargantuaSequence.flash = 0;

    endurance.visible = true;
    endurance.alpha = 1;
    endurance.spin = 0;
    endurance.orbitAngle = -2.5;

    ranger.state = "docked";
    ranger.timer = 4;
    ranger.progress = 0;
    ranger.alpha = 1;

    plungeShuttle.state =
      "waiting";

    plungeShuttle.timer = 0;
    plungeShuttle.progress = 0;
    plungeShuttle.alpha = 0;
    plungeShuttle.stretch = 1;

    resetGargantuaDebris();
  }

  function loadSettings() {
    const oldPlanetType =
      settings.planetType;

    settings.useMonet =
      readBoolean(
        getSetting(
          "useMonet",
          false
        ),
        false
      );

    settings.palette =
      readPalette(
        getSetting(
          "palette",
          "default"
        )
      );

    settings.planetType =
      readPlanetType(
        getSetting(
          "planetType",
          "earth"
        )
      );

    settings.speed =
      readNumber(
        getSetting(
          "speed",
          1
        ),
        1,
        0.2,
        2.5
      );

    settings.planetScale =
      readNumber(
        getSetting(
          "planetScale",
          1
        ),
        1,
        0.75,
        1.3
      );

    settings.starCount =
      Math.round(
        readNumber(
          getSetting(
            "starCount",
            110
          ),
          110,
          20,
          180
        )
      );

    settings.showSolarFlares =
      readBoolean(
        getSetting(
          "showSolarFlares",
          true
        ),
        true
      );

    settings.showAurora =
      readBoolean(
        getSetting(
          "showAurora",
          true
        ),
        true
      );

    settings.showMarsBase =
      readBoolean(
        getSetting(
          "showMarsBase",
          true
        ),
        true
      );

    settings.showMoon =
      readBoolean(
        getSetting(
          "showMoon",
          true
        ),
        true
      );

    settings.moonCount =
      Math.round(
        readNumber(
          getSetting(
            "moonCount",
            1
          ),
          1,
          1,
          3
        )
      );

    settings.showSatellite =
      readBoolean(
        getSetting(
          "showSatellite",
          true
        ),
        true
      );

    settings.satelliteCount =
      Math.round(
        readNumber(
          getSetting(
            "satelliteCount",
            1
          ),
          1,
          1,
          3
        )
      );

    settings.showSignals =
      readBoolean(
        getSetting(
          "showSignals",
          true
        ),
        true
      );

    settings.showOrbits =
      readBoolean(
        getSetting(
          "showOrbits",
          true
        ),
        true
      );

    settings.showISS =
      readBoolean(
        getSetting(
          "showISS",
          true
        ),
        true
      );

    if (
      oldPlanetType !==
      settings.planetType
    ) {
      previousPlanetType =
        oldPlanetType;

      rockets.length = 0;
      rocketTimer = 1.5;

      resetTransferRocket();
      resetAlienFleet();
      resetMarsBase();

      if (
        settings.planetType ===
        "gargantua"
      ) {
        resetSolarFlare();
        resetGargantuaSequence();
      }
    }

    if (
      !settings.showSolarFlares ||
      settings.planetType ===
      "gargantua"
    ) {
      resetSolarFlare();
    }

    if (
      lastStarCount !==
      settings.starCount
    ) {
      lastStarCount =
        settings.starCount;

      createStars();
    }
  }

  function hexToRgb(hex) {
    const value =
      String(hex || "")
        .replace("#", "");

    if (
      !/^[0-9a-fA-F]{6}$/.test(
        value
      )
    ) {
      return {
        r: 142,
        g: 216,
        b: 165
      };
    }

    return {
      r:
        parseInt(
          value.slice(
            0,
            2
          ),
          16
        ),

      g:
        parseInt(
          value.slice(
            2,
            4
          ),
          16
        ),

      b:
        parseInt(
          value.slice(
            4,
            6
          ),
          16
        )
    };
  }

  function rgba(
    hex,
    alpha
  ) {
    const color =
      hexToRgb(hex);

    return (
      "rgba(" +
      color.r +
      "," +
      color.g +
      "," +
      color.b +
      "," +
      alpha +
      ")"
    );
  }

  function mix(
    first,
    second,
    amount
  ) {
    const a =
      hexToRgb(first);

    const b =
      hexToRgb(second);

    const t =
      clamp(
        amount,
        0,
        1
      );

    return (
      "rgb(" +
      Math.round(
        a.r +
        (
          b.r -
          a.r
        ) *
        t
      ) +
      "," +
      Math.round(
        a.g +
        (
          b.g -
          a.g
        ) *
        t
      ) +
      "," +
      Math.round(
        a.b +
        (
          b.b -
          a.b
        ) *
        t
      ) +
      ")"
    );
  }

  function updateColors(detail) {
    const monet =
      detail &&
      detail.accentColors;

    if (
      settings.useMonet &&
      monet
    ) {
      const primary =
        monet.primary ||
        palettes.default.primary;

      const secondary =
        monet.secondary ||
        palettes.default.land;

      const tertiary =
        monet.tertiary ||
        palettes.default.signal;

      const background =
        monet.background ||
        palettes.default.background;

      colors = {
        background,

        deepSpace:
          mix(
            background,
            "#000000",
            0.78
          ),

        primary,

        primaryBright:
          monet.onPrimaryContainer ||
          palettes.default.primaryBright,

        ocean:
          monet.primaryContainer ||
          palettes.default.ocean,

        oceanDark:
          mix(
            monet.primaryContainer ||
            palettes.default.ocean,
            "#000000",
            0.7
          ),

        land:
          secondary,

        landBright:
          mix(
            secondary,
            "#ffffff",
            0.35
          ),

        clouds:
          monet.onSurface ||
          palettes.default.clouds,

        moon:
          secondary,

        satellite:
          monet.onSurface ||
          palettes.default.satellite,

        sun:
          mix(
            primary,
            "#fff2a6",
            0.62
          ),

        sunCore:
          mix(
            primary,
            "#ffffff",
            0.85
          ),

        signal:
          tertiary,

        panel:
          mix(
            monet.primaryContainer ||
            palettes.default.panel,
            "#000000",
            0.35
          ),

        ufoMetal:
          mix(
            monet.surface ||
            palettes.default.ufoMetal,
            secondary,
            0.32
          ),

        ufoGlass:
          mix(
            tertiary,
            "#ffffff",
            0.35
          ),

        aurora:
          tertiary,

        auroraSecondary:
          mix(
            primary,
            tertiary,
            0.5
          ),

        accretionHot:
          mix(
            primary,
            "#ffffff",
            0.9
          ),

        accretionWarm:
          mix(
            primary,
            "#ffd36b",
            0.55
          ),

        accretionOuter:
          mix(
            tertiary,
            "#a8502e",
            0.45
          ),

        accretionCold:
          mix(
            background,
            tertiary,
            0.35
          ),

        lensLight:
          mix(
            primary,
            "#ffffff",
            0.94
          ),

        millerOcean:
          mix(
            background,
            tertiary,
            0.4
          ),

        millerLight:
          mix(
            secondary,
            "#ffffff",
            0.45
          )
      };

      return;
    }

    colors = {
      ...(
        palettes[
          settings.palette
        ] ||
        palettes.default
      )
    };
  }

  function seededRandom(seed) {
    const value =
      Math.sin(
        seed *
        912.47
      ) *
      43758.5453;

    return (
      value -
      Math.floor(value)
    );
  }

  function createStars() {
    stars.length = 0;

    for (
      let index = 0;
      index <
      settings.starCount;
      index++
    ) {
      stars.push({
        x:
          seededRandom(
            index * 5 + 1
          ),

        y:
          seededRandom(
            index * 7 + 2
          ),

        radius:
          0.4 +
          seededRandom(
            index * 11 + 3
          ) *
          1.4,

        alpha:
          0.25 +
          seededRandom(
            index * 13 + 4
          ) *
          0.65,

        phase:
          seededRandom(
            index * 17 + 5
          ) *
          TAU,

        speed:
          0.25 +
          seededRandom(
            index * 19 + 6
          ) *
          0.7,

        depth:
          0.3 +
          seededRandom(
            index * 23 + 7
          ) *
          0.7
      });
    }
  }

  function resize() {
    width =
      Math.max(
        1,
        window.innerWidth
      );

    height =
      Math.max(
        1,
        window.innerHeight
      );

    dpr =
      window.devicePixelRatio ||
      1;

    canvas.width =
      Math.round(
        width *
        dpr
      );

    canvas.height =
      Math.round(
        height *
        dpr
      );

    canvas.style.width =
      width +
      "px";

    canvas.style.height =
      height +
      "px";

    ctx.setTransform(
      dpr,
      0,
      0,
      dpr,
      0,
      0
    );
  }

  function circle(
    x,
    y,
    radius,
    color
  ) {
    ctx.beginPath();

    ctx.arc(
      x,
      y,
      radius,
      0,
      TAU
    );

    ctx.fillStyle =
      color;

    ctx.fill();
  }

  function updateGargantuaLayout() {
    const minimumSide =
      Math.min(
        width,
        height
      );

    gargantua.radius =
      clamp(
        minimumSide * 0.255,
        94,
        260
      );

    gargantua.horizonRadius =
      gargantua.radius *
      0.54;

    gargantua.diskInnerRadius =
      gargantua.radius *
      0.72;

    gargantua.diskOuterRadius =
      gargantua.radius *
      2.05;

    gargantua.x =
      width * 0.48 +
      offsetX *
      width *
      0.025;

    gargantua.y =
      height * 0.51;

    gargantua.rotation =
      elapsed * 0.09;

    gargantua.photonPulse =
      0.96 +
      Math.sin(
        elapsed * 1.15
      ) *
      0.04;

    gargantua.lensPulse =
      0.97 +
      Math.sin(
        elapsed * 0.43
      ) *
      0.03;

    miller.orbitX =
      gargantua.diskOuterRadius *
      1.42;

    miller.orbitY =
      gargantua.diskOuterRadius *
      0.48;

    miller.radius =
      clamp(
        gargantua.radius * 0.18,
        22,
        48
      );

    miller.angle =
      elapsed * 0.065 +
      miller.phase;

    miller.x =
      gargantua.x +
      Math.cos(
        miller.angle
      ) *
      miller.orbitX;

    miller.y =
      gargantua.y +
      Math.sin(
        miller.angle
      ) *
      miller.orbitY;

    miller.depth =
      Math.sin(
        miller.angle
      );

    miller.behind =
      miller.depth < 0;

    endurance.orbitX =
      gargantua.diskOuterRadius *
      1.72;

    endurance.orbitY =
      gargantua.diskOuterRadius *
      0.58;

    endurance.radius =
      clamp(
        gargantua.radius * 0.105,
        14,
        30
      );
  }
  function getPlanetSizeFactor() {
    if (
      settings.planetType ===
      "mars"
    ) {
      return 0.94;
    }

    if (
      settings.planetType ===
      "jupiter"
    ) {
      return 1.12;
    }

    if (
      settings.planetType ===
      "saturn"
    ) {
      return 1.03;
    }

    return 1;
  }

  function updateScene() {
    scene.radius =
      clamp(
        Math.min(
          width,
          height
        ) *
        0.225 *
        settings.planetScale *
        getPlanetSizeFactor(),
        78,
        235
      );

    scene.x =
      width * 0.53 +
      offsetX *
      width *
      0.045;

    scene.y =
      height * 0.61;
  }

  function updateSun() {
    const baseRadius =
      clamp(
        Math.min(
          width,
          height
        ) *
        0.115,
        45,
        112
      );

    if (
      settings.planetType ===
      "mars"
    ) {
      sun.radius =
        baseRadius * 0.72;

      sun.x =
        width * 0.055 +
        offsetX * 5;

      sun.y =
        height * 0.14;

      sun.brightness = 0.72;
    } else if (
      settings.planetType ===
      "jupiter"
    ) {
      sun.radius =
        baseRadius * 0.44;

      sun.x =
        width * 0.04 +
        offsetX * 5;

      sun.y =
        height * 0.12;

      sun.brightness = 0.5;
    } else if (
      settings.planetType ===
      "saturn"
    ) {
      sun.radius =
        baseRadius * 0.36;

      sun.x =
        width * 0.035 +
        offsetX * 5;

      sun.y =
        height * 0.115;

      sun.brightness = 0.42;
    } else {
      sun.radius =
        baseRadius;

      sun.x =
        width * 0.08 +
        offsetX * 5;

      sun.y =
        height * 0.16;

      sun.brightness = 1;
    }

    if (isCharging) {
      sun.brightness *= 1.16;
    }
  }

  function getMiniPlanetCount() {
    if (
      settings.planetType ===
      "mars"
    ) {
      return 3;
    }

    if (
      settings.planetType ===
      "jupiter"
    ) {
      return 4;
    }

    if (
      settings.planetType ===
      "saturn"
    ) {
      return 5;
    }

    return 2;
  }

  function updateMiniaturePlanets() {
    const count =
      getMiniPlanetCount();

    const baseOrbit =
      sun.radius * 1.55;

    const orbitStep =
      Math.max(
        sun.radius * 0.48,
        12
      );

    for (
      let index = 0;
      index < count;
      index++
    ) {
      const planet =
        miniaturePlanets[index];

      planet.orbit =
        baseOrbit +
        orbitStep * index;

      planet.angle =
        elapsed *
        planet.speed *
        settings.speed +
        planet.phase;

      planet.x =
        sun.x +
        Math.cos(
          planet.angle
        ) *
        planet.orbit;

      planet.y =
        sun.y +
        Math.sin(
          planet.angle
        ) *
        planet.orbit *
        0.36;

      planet.radius =
        Math.max(
          2.2,
          sun.radius *
          (
            0.045 +
            index * 0.008
          )
        );
    }
  }

  function getMoonStyle(
    planetType,
    index
  ) {
    const styles =
      moonStyles[
        planetType
      ] ||
      moonStyles.earth;

    return (
      styles[index] ||
      styles[0]
    );
  }

  function updateOrbitObjects() {
    const saturn =
      settings.planetType ===
      "saturn";

    const moonBase =
      saturn
        ? 2.12
        : 1.82;

    const satelliteBase =
      saturn
        ? 2.62
        : 2.34;

    for (
      let index = 0;
      index <
      settings.moonCount;
      index++
    ) {
      const moon =
        moons[index];

      const style =
        getMoonStyle(
          settings.planetType,
          index
        );

      moon.orbitX =
        scene.radius *
        (
          moonBase +
          index * 0.35
        );

      moon.orbitY =
        scene.radius *
        (
          0.7 +
          index * 0.13
        );

      moon.angle =
        elapsed *
        settings.speed *
        (
          0.33 +
          index * 0.055
        ) +
        index *
        TAU /
        settings.moonCount;

      moon.x =
        scene.x +
        Math.cos(
          moon.angle
        ) *
        moon.orbitX;

      moon.y =
        scene.y +
        Math.sin(
          moon.angle
        ) *
        moon.orbitY;

      moon.radius =
        scene.radius *
        (
          0.17 -
          index * 0.018
        );

      if (
        settings.planetType ===
        "mars"
      ) {
        moon.radius *=
          index === 0
            ? 0.72
            : 0.58;
      }

      if (
        settings.planetType ===
        "jupiter"
      ) {
        moon.radius *=
          0.88 +
          index * 0.08;
      }

      moon.kind =
        style.kind;

      moon.styleIndex =
        index;

      moon.irregularity =
        style.irregularity;

      moon.phase =
        index * 1.7;
    }

    for (
      let index = 0;
      index <
      settings.satelliteCount;
      index++
    ) {
      const satellite =
        satellites[index];

      satellite.orbitX =
        scene.radius *
        (
          satelliteBase +
          index * 0.28
        );

      satellite.orbitY =
        scene.radius *
        (
          0.97 +
          index * 0.12
        );

      satellite.angle =
        elapsed *
        settings.speed *
        (
          0.52 +
          index * 0.07
        ) +
        2.15 +
        index *
        TAU /
        settings.satelliteCount;

      satellite.x =
        scene.x +
        Math.cos(
          satellite.angle
        ) *
        satellite.orbitX;

      satellite.y =
        scene.y +
        Math.sin(
          satellite.angle
        ) *
        satellite.orbitY;

      satellite.size =
        clamp(
          scene.radius *
          (
            0.13 -
            index * 0.008
          ),
          13,
          28
        );
    }

    const mainMoon =
      moons[0];

    ufo.angle =
      elapsed *
      settings.speed *
      1.18 +
      0.8;

    ufo.size =
      clamp(
        scene.radius * 0.085,
        10,
        20
      );

    ufo.x =
      mainMoon.x +
      Math.cos(
        ufo.angle
      ) *
      mainMoon.radius *
      2.2;

    ufo.y =
      mainMoon.y +
      Math.sin(
        ufo.angle
      ) *
      mainMoon.radius *
      0.92;

    iss.orbitX =
      scene.radius * 2.9;

    iss.orbitY =
      scene.radius * 1.18;

    iss.angle =
      elapsed *
      settings.speed *
      0.24 -
      0.65;

    iss.x =
      scene.x +
      Math.cos(
        iss.angle
      ) *
      iss.orbitX;

    iss.y =
      scene.y +
      Math.sin(
        iss.angle
      ) *
      iss.orbitY;

    iss.size =
      clamp(
        scene.radius * 0.17,
        18,
        36
      );

    marsBase.landingX =
      scene.x -
      scene.radius * 0.54;

    marsBase.landingY =
      scene.y -
      scene.radius * 0.58;
  }

  function drawBackground() {
    const gradient =
      ctx.createRadialGradient(
        width * 0.48,
        height * 0.5,
        0,
        width * 0.48,
        height * 0.5,
        Math.max(
          width,
          height
        ) *
        0.85
      );

    gradient.addColorStop(
      0,
      mix(
        colors.background,
        colors.ocean,
        0.14
      )
    );

    gradient.addColorStop(
      0.55,
      colors.background
    );

    gradient.addColorStop(
      1,
      colors.deepSpace
    );

    ctx.globalAlpha = 1;
    ctx.fillStyle = gradient;

    ctx.fillRect(
      0,
      0,
      width,
      height
    );
  }

  function drawStars() {
    for (
      const star of stars
    ) {
      const pulse =
        0.8 +
        Math.sin(
          elapsed *
          star.speed +
          star.phase
        ) *
        0.2;

      ctx.globalAlpha =
        star.alpha *
        pulse;

      circle(
        star.x * width +
        offsetX *
        12 *
        star.depth,
        star.y * height,
        star.radius,
        colors.primaryBright
      );
    }

    ctx.globalAlpha = 1;
  }

  function drawSunGlow() {
    const glow =
      ctx.createRadialGradient(
        sun.x,
        sun.y,
        sun.radius * 0.1,
        sun.x,
        sun.y,
        sun.radius * 3.3
      );

    glow.addColorStop(
      0,
      rgba(
        colors.sunCore,
        0.72 *
        sun.brightness
      )
    );

    glow.addColorStop(
      0.25,
      rgba(
        colors.sun,
        0.28 *
        sun.brightness
      )
    );

    glow.addColorStop(
      1,
      rgba(
        colors.sun,
        0
      )
    );

    ctx.fillStyle = glow;

    ctx.fillRect(
      0,
      0,
      width,
      height
    );
  }

  function drawSunBody() {
    ctx.save();

    ctx.translate(
      sun.x,
      sun.y
    );

    ctx.rotate(
      elapsed * 0.035
    );

    for (
      let index = 0;
      index < 14;
      index++
    ) {
      const angle =
        index /
        14 *
        TAU;

      const length =
        sun.radius *
        (
          1.38 +
          (
            index % 3
          ) *
          0.13 +
          Math.sin(
            elapsed * 0.6 +
            index
          ) *
          0.06
        );

      ctx.beginPath();

      ctx.moveTo(
        Math.cos(angle) *
        sun.radius *
        1.04,
        Math.sin(angle) *
        sun.radius *
        1.04
      );

      ctx.lineTo(
        Math.cos(angle) *
        length,
        Math.sin(angle) *
        length
      );

      ctx.strokeStyle =
        rgba(
          colors.sun,
          0.18 *
          sun.brightness
        );

      ctx.lineWidth =
        index % 2 === 0
          ? 2
          : 1;

      ctx.stroke();
    }

    ctx.restore();

    const surface =
      ctx.createRadialGradient(
        sun.x -
        sun.radius * 0.33,
        sun.y -
        sun.radius * 0.36,
        sun.radius * 0.05,
        sun.x,
        sun.y,
        sun.radius
      );

    surface.addColorStop(
      0,
      colors.sunCore
    );

    surface.addColorStop(
      0.55,
      colors.sun
    );

    surface.addColorStop(
      1,
      mix(
        colors.sun,
        colors.primary,
        0.55
      )
    );

    circle(
      sun.x,
      sun.y,
      sun.radius,
      surface
    );
  }

  function startSolarFlare() {
    if (
      !settings.showSolarFlares ||
      settings.planetType ===
      "gargantua"
    ) {
      return;
    }

    solarFlare.active = true;
    solarFlare.age = 0;
    solarFlare.strength = 0;

    solarFlare.angle =
      -1.25 +
      Math.random() *
      0.7;

    solarParticles.length = 0;

    const particleCount =
      Math.min(
        MAX_SOLAR_PARTICLES,
        isCharging
          ? 20
          : 15
      );

    for (
      let index = 0;
      index <
      particleCount;
      index++
    ) {
      const angle =
        solarFlare.angle +
        (
          Math.random() -
          0.5
        ) *
        0.72;

      const speed =
        24 +
        Math.random() *
        48;

      solarParticles.push({
        x:
          sun.x +
          Math.cos(angle) *
          sun.radius *
          0.78,

        y:
          sun.y +
          Math.sin(angle) *
          sun.radius *
          0.78,

        vx:
          Math.cos(angle) *
          speed,

        vy:
          Math.sin(angle) *
          speed,

        age: 0,

        size:
          0.8 +
          Math.random() *
          1.6
      });
    }
  }

  function updateSolarFlare(dt) {
    if (
      !settings.showSolarFlares ||
      settings.planetType ===
      "gargantua"
    ) {
      return;
    }

    if (
      !solarFlare.active
    ) {
      solarFlareTimer -= dt;

      if (
        solarFlareTimer <= 0
      ) {
        startSolarFlare();

        solarFlareTimer =
          isCharging
            ? 6 +
              Math.random() *
              8
            : 10 +
              Math.random() *
              18;
      }

      return;
    }

    solarFlare.age += dt;

    const progress =
      solarFlare.age /
      solarFlare.duration;

    solarFlare.strength =
      Math.sin(
        clamp(
          progress,
          0,
          1
        ) *
        Math.PI
      );

    for (
      const particle of
      solarParticles
    ) {
      particle.age += dt;

      particle.x +=
        particle.vx *
        dt;

      particle.y +=
        particle.vy *
        dt;

      particle.vx *=
        Math.pow(
          0.992,
          dt * 60
        );

      particle.vy *=
        Math.pow(
          0.992,
          dt * 60
        );
    }

    if (
      solarFlare.age >=
      solarFlare.duration
    ) {
      resetSolarFlare();
    }
  }

  function drawSolarFlare() {
    if (
      !settings.showSolarFlares ||
      !solarFlare.active
    ) {
      return;
    }

    const intensity =
      solarFlare.strength;

    ctx.save();

    ctx.translate(
      sun.x,
      sun.y
    );

    ctx.rotate(
      solarFlare.angle
    );

    ctx.beginPath();

    ctx.moveTo(
      sun.radius * 0.5,
      -sun.radius * 0.22
    );

    ctx.bezierCurveTo(
      sun.radius * 1.15,
      -sun.radius * 0.8,
      sun.radius * 1.72,
      -sun.radius * 0.55,
      sun.radius * 2.15,
      -sun.radius * 0.08
    );

    ctx.bezierCurveTo(
      sun.radius * 1.7,
      sun.radius * 0.05,
      sun.radius * 1.25,
      sun.radius * 0.34,
      sun.radius * 0.5,
      sun.radius * 0.22
    );

    ctx.closePath();

    const flare =
      ctx.createLinearGradient(
        sun.radius * 0.5,
        0,
        sun.radius * 2.15,
        0
      );

    flare.addColorStop(
      0,
      rgba(
        colors.sunCore,
        0.7 *
        intensity
      )
    );

    flare.addColorStop(
      0.5,
      rgba(
        colors.sun,
        0.32 *
        intensity
      )
    );

    flare.addColorStop(
      1,
      rgba(
        colors.sun,
        0
      )
    );

    ctx.fillStyle = flare;
    ctx.fill();

    ctx.restore();

    for (
      const particle of
      solarParticles
    ) {
      const alpha =
        clamp(
          1 -
          particle.age /
          solarFlare.duration,
          0,
          1
        ) *
        intensity;

      circle(
        particle.x,
        particle.y,
        particle.size,
        rgba(
          colors.sunCore,
          alpha
        )
      );
    }
  }

  function drawMiniPlanetOrbit(
    planet
  ) {
    ctx.beginPath();

    ctx.ellipse(
      sun.x,
      sun.y,
      planet.orbit,
      planet.orbit * 0.36,
      0,
      0,
      TAU
    );

    ctx.strokeStyle =
      rgba(
        colors.primaryBright,
        0.065
      );

    ctx.lineWidth = 0.7;
    ctx.stroke();
  }

  function drawMiniaturePlanet(
    planet
  ) {
    let light =
      "#cfc4b1";

    let dark =
      "#4d4943";

    if (
      planet.type ===
      "venus"
    ) {
      light = "#f1d18b";
      dark = "#9b663c";
    } else if (
      planet.type ===
      "earth"
    ) {
      light = "#72cfa0";
      dark = "#174c78";
    } else if (
      planet.type ===
      "mars"
    ) {
      light = "#e78a59";
      dark = "#762f25";
    } else if (
      planet.type ===
      "jupiter"
    ) {
      light = "#e1c19a";
      dark = "#865a43";
    }

    const gradient =
      ctx.createRadialGradient(
        planet.x -
        planet.radius * 0.35,
        planet.y -
        planet.radius * 0.38,
        planet.radius * 0.05,
        planet.x,
        planet.y,
        planet.radius
      );

    gradient.addColorStop(
      0,
      light
    );

    gradient.addColorStop(
      1,
      dark
    );

    circle(
      planet.x,
      planet.y,
      planet.radius,
      gradient
    );

    if (
      planet.type ===
      "earth"
    ) {
      ctx.save();

      ctx.beginPath();

      ctx.arc(
        planet.x,
        planet.y,
        planet.radius,
        0,
        TAU
      );

      ctx.clip();

      ctx.beginPath();

      ctx.ellipse(
        planet.x -
        planet.radius * 0.2,
        planet.y,
        planet.radius * 0.38,
        planet.radius * 0.2,
        0.4,
        0,
        TAU
      );

      ctx.fillStyle =
        "rgba(164,220,125,0.65)";

      ctx.fill();
      ctx.restore();
    }

    if (
      planet.type ===
      "jupiter"
    ) {
      ctx.save();

      ctx.beginPath();

      ctx.arc(
        planet.x,
        planet.y,
        planet.radius,
        0,
        TAU
      );

      ctx.clip();

      ctx.strokeStyle =
        "rgba(255,229,195,0.5)";

      ctx.lineWidth =
        Math.max(
          0.5,
          planet.radius * 0.2
        );

      ctx.beginPath();

      ctx.moveTo(
        planet.x -
        planet.radius,
        planet.y -
        planet.radius * 0.2
      );

      ctx.lineTo(
        planet.x +
        planet.radius,
        planet.y -
        planet.radius * 0.2
      );

      ctx.moveTo(
        planet.x -
        planet.radius,
        planet.y +
        planet.radius * 0.35
      );

      ctx.lineTo(
        planet.x +
        planet.radius,
        planet.y +
        planet.radius * 0.35
      );

      ctx.stroke();
      ctx.restore();
    }
  }

  function drawMiniatureSystem() {
    const count =
      getMiniPlanetCount();

    for (
      let index = count - 1;
      index >= 0;
      index--
    ) {
      drawMiniPlanetOrbit(
        miniaturePlanets[index]
      );
    }

    drawSunGlow();

    for (
      let index = 0;
      index < count;
      index++
    ) {
      const planet =
        miniaturePlanets[index];

      if (
        Math.sin(
          planet.angle
        ) < 0
      ) {
        drawMiniaturePlanet(
          planet
        );
      }
    }

    drawSunBody();

    for (
      let index = 0;
      index < count;
      index++
    ) {
      const planet =
        miniaturePlanets[index];

      if (
        Math.sin(
          planet.angle
        ) >= 0
      ) {
        drawMiniaturePlanet(
          planet
        );
      }
    }

    drawSolarFlare();
  }

  function drawOrbit(
    x,
    y,
    radiusX,
    radiusY,
    alpha
  ) {
    if (
      !settings.showOrbits
    ) {
      return;
    }

    ctx.beginPath();

    ctx.ellipse(
      x,
      y,
      radiusX,
      radiusY,
      0,
      0,
      TAU
    );

    ctx.strokeStyle =
      rgba(
        colors.primary,
        alpha
      );

    ctx.lineWidth = 1;

    ctx.setLineDash(
      [4, 8]
    );

    ctx.stroke();

    ctx.setLineDash([]);
  }

  function drawMoonShape(
    moon,
    style
  ) {
    const radius =
      moon.radius;

    const surface =
      ctx.createRadialGradient(
        moon.x -
        radius * 0.35,
        moon.y -
        radius * 0.38,
        radius * 0.04,
        moon.x,
        moon.y,
        radius
      );

    surface.addColorStop(
      0,
      style.light
    );

    surface.addColorStop(
      0.58,
      style.middle
    );

    surface.addColorStop(
      1,
      style.dark
    );

    if (
      style.irregularity >
      0.1
    ) {
      ctx.save();

      ctx.translate(
        moon.x,
        moon.y
      );

      ctx.rotate(
        moon.angle * 0.7
      );

      ctx.beginPath();

      for (
        let index = 0;
        index <= 12;
        index++
      ) {
        const angle =
          index /
          12 *
          TAU;

        const variation =
          1 +
          Math.sin(
            angle * 3 +
            moon.phase
          ) *
          style.irregularity *
          0.28;

        const pointX =
          Math.cos(angle) *
          radius *
          variation;

        const pointY =
          Math.sin(angle) *
          radius *
          variation;

        if (
          index === 0
        ) {
          ctx.moveTo(
            pointX,
            pointY
          );
        } else {
          ctx.lineTo(
            pointX,
            pointY
          );
        }
      }

      ctx.closePath();

      ctx.fillStyle =
        surface;

      ctx.fill();
      ctx.restore();
    } else {
      circle(
        moon.x,
        moon.y,
        radius,
        surface
      );
    }

    ctx.save();

    ctx.beginPath();

    ctx.arc(
      moon.x,
      moon.y,
      radius,
      0,
      TAU
    );

    ctx.clip();

    for (
      const crater of
      moonCraters
    ) {
      const craterScale =
        style.kind === "ice"
          ? 0.55
          : style.kind === "io"
            ? 0.45
            : 1;

      circle(
        moon.x +
        crater.x *
        radius *
        craterScale,
        moon.y +
        crater.y *
        radius *
        craterScale,
        crater.size *
        radius *
        craterScale,
        "rgba(0,0,0,0.16)"
      );
    }

    if (
      style.kind === "phobos" ||
      style.kind === "deimos" ||
      style.kind === "rock"
    ) {
      ctx.strokeStyle =
        "rgba(255,220,174,0.16)";

      ctx.lineWidth =
        Math.max(
          1,
          radius * 0.07
        );

      ctx.beginPath();

      ctx.moveTo(
        moon.x -
        radius * 0.42,
        moon.y +
        radius * 0.1
      );

      ctx.lineTo(
        moon.x +
        radius * 0.38,
        moon.y -
        radius * 0.16
      );

      ctx.stroke();
    }

    if (
      style.kind === "europa" ||
      style.kind === "enceladus"
    ) {
      ctx.strokeStyle =
        "rgba(255,255,255,0.38)";

      ctx.lineWidth =
        Math.max(
          0.8,
          radius * 0.045
        );

      for (
        let index = 0;
        index < 4;
        index++
      ) {
        ctx.beginPath();

        ctx.moveTo(
          moon.x -
          radius * 0.55,
          moon.y +
          (
            index -
            1.5
          ) *
          radius *
          0.22
        );

        ctx.lineTo(
          moon.x +
          radius * 0.48,
          moon.y +
          (
            index -
            1.5
          ) *
          radius *
          0.15
        );

        ctx.stroke();
      }
    }

    ctx.restore();

    ctx.beginPath();

    ctx.arc(
      moon.x,
      moon.y,
      radius,
      0,
      TAU
    );

    ctx.strokeStyle =
      rgba(
        colors.primaryBright,
        0.2
      );

    ctx.lineWidth =
      Math.max(
        1,
        radius * 0.025
      );

    ctx.stroke();
  }

  function drawMoon(moon) {
    const style =
      getMoonStyle(
        settings.planetType,
        moon.styleIndex
      );

    const glow =
      ctx.createRadialGradient(
        moon.x,
        moon.y,
        moon.radius * 0.4,
        moon.x,
        moon.y,
        moon.radius * 1.7
      );

    glow.addColorStop(
      0,
      rgba(
        style.light,
        0.13
      )
    );

    glow.addColorStop(
      1,
      rgba(
        style.light,
        0
      )
    );

    circle(
      moon.x,
      moon.y,
      moon.radius * 1.7,
      glow
    );

    drawMoonShape(
      moon,
      style
    );
  }

  function drawUfo() {
    const size =
      ufo.size;

    ctx.save();

    ctx.translate(
      ufo.x,
      ufo.y
    );

    ctx.rotate(
      Math.sin(
        elapsed * 1.8
      ) *
      0.12
    );

    ctx.beginPath();

    ctx.ellipse(
      0,
      0,
      size,
      size * 0.34,
      0,
      0,
      TAU
    );

    ctx.fillStyle =
      colors.ufoMetal;

    ctx.fill();

    ctx.strokeStyle =
      rgba(
        colors.primaryBright,
        0.7
      );

    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.beginPath();

    ctx.ellipse(
      0,
      -size * 0.18,
      size * 0.48,
      size * 0.39,
      0,
      Math.PI,
      TAU
    );

    ctx.fillStyle =
      colors.ufoGlass;

    ctx.fill();

    for (
      let index = -2;
      index <= 2;
      index++
    ) {
      circle(
        index *
        size *
        0.32,
        size * 0.08,
        size * 0.075,
        index % 2 === 0
          ? colors.signal
          : colors.sun
      );
    }

    ctx.restore();
  }

  function drawAtmosphere(
    color,
    strength
  ) {
    const atmosphere =
      ctx.createRadialGradient(
        scene.x,
        scene.y,
        scene.radius * 0.75,
        scene.x,
        scene.y,
        scene.radius * 1.32
      );

    atmosphere.addColorStop(
      0,
      rgba(
        color,
        0
      )
    );

    atmosphere.addColorStop(
      0.72,
      rgba(
        color,
        0.05 *
        strength
      )
    );

    atmosphere.addColorStop(
      0.86,
      rgba(
        color,
        0.24 *
        strength
      )
    );

    atmosphere.addColorStop(
      1,
      rgba(
        color,
        0
      )
    );

    circle(
      scene.x,
      scene.y,
      scene.radius * 1.33,
      atmosphere
    );
  }

  function drawPlanetShade(
    darkness
  ) {
    const night =
      ctx.createLinearGradient(
        scene.x -
        scene.radius,
        scene.y,
        scene.x +
        scene.radius,
        scene.y
      );

    night.addColorStop(
      0,
      "rgba(0,0,0,0)"
    );

    night.addColorStop(
      0.5,
      "rgba(0,0,0,0.03)"
    );

    night.addColorStop(
      0.78,
      "rgba(0,0,0," +
      darkness * 0.55 +
      ")"
    );

    night.addColorStop(
      1,
      "rgba(0,0,0," +
      darkness +
      ")"
    );

    ctx.fillStyle =
      night;

    ctx.fillRect(
      scene.x -
      scene.radius,
      scene.y -
      scene.radius,
      scene.radius * 2,
      scene.radius * 2
    );
  }

  function drawContinent(
    x,
    y,
    widthValue,
    heightValue,
    rotation,
    color
  ) {
    ctx.save();

    ctx.translate(
      x,
      y
    );

    ctx.rotate(
      rotation
    );

    ctx.beginPath();

    ctx.ellipse(
      0,
      0,
      widthValue,
      heightValue,
      0,
      0,
      TAU
    );

    ctx.ellipse(
      widthValue * 0.44,
      -heightValue * 0.2,
      widthValue * 0.57,
      heightValue * 0.56,
      0.2,
      0,
      TAU
    );

    ctx.ellipse(
      -widthValue * 0.37,
      heightValue * 0.27,
      widthValue * 0.49,
      heightValue * 0.48,
      -0.3,
      0,
      TAU
    );

    ctx.fillStyle =
      color;

    ctx.fill();
    ctx.restore();
  }
  function drawAurora() {
    if (
      !settings.showAurora ||
      settings.planetType !==
      "earth"
    ) {
      return;
    }

    const radius =
      scene.radius;

    ctx.save();

    ctx.beginPath();

    ctx.arc(
      scene.x,
      scene.y,
      radius * 0.99,
      0,
      TAU
    );

    ctx.clip();

    ctx.globalCompositeOperation =
      "screen";

    for (
      let layer = 0;
      layer < 4;
      layer++
    ) {
      const phase =
        elapsed *
        (
          0.42 +
          layer * 0.07
        ) +
        layer * 1.3;

      ctx.beginPath();

      for (
        let index = 0;
        index <= 22;
        index++
      ) {
        const progress =
          index / 22;

        const angle =
          Math.PI * 1.08 +
          progress *
          Math.PI *
          0.78;

        const wave =
          Math.sin(
            progress *
            Math.PI *
            4 +
            phase
          ) *
          radius *
          0.025;

        const distance =
          radius *
          (
            0.74 +
            layer * 0.035
          ) +
          wave;

        const pointX =
          scene.x +
          Math.cos(angle) *
          distance;

        const pointY =
          scene.y +
          Math.sin(angle) *
          distance *
          0.82;

        if (
          index === 0
        ) {
          ctx.moveTo(
            pointX,
            pointY
          );
        } else {
          ctx.lineTo(
            pointX,
            pointY
          );
        }
      }

      ctx.strokeStyle =
        layer % 2 === 0
          ? rgba(
              colors.aurora,
              0.1 +
              layer * 0.025
            )
          : rgba(
              colors.auroraSecondary,
              0.1 +
              layer * 0.025
            );

      ctx.lineWidth =
        Math.max(
          2,
          radius *
          (
            0.025 +
            layer * 0.006
          )
        );

      ctx.lineCap =
        "round";

      ctx.stroke();
    }

    ctx.globalCompositeOperation =
      "source-over";

    ctx.restore();
  }

  function drawEarth() {
    const x =
      scene.x;

    const y =
      scene.y;

    const radius =
      scene.radius;

    drawAtmosphere(
      colors.primary,
      1
    );

    ctx.save();

    ctx.beginPath();

    ctx.arc(
      x,
      y,
      radius,
      0,
      TAU
    );

    ctx.clip();

    const ocean =
      ctx.createRadialGradient(
        x -
        radius * 0.42,
        y -
        radius * 0.45,
        radius * 0.04,
        x,
        y,
        radius * 1.15
      );

    ocean.addColorStop(
      0,
      mix(
        colors.ocean,
        colors.primaryBright,
        0.38
      )
    );

    ocean.addColorStop(
      0.38,
      colors.ocean
    );

    ocean.addColorStop(
      0.76,
      colors.oceanDark
    );

    ocean.addColorStop(
      1,
      mix(
        colors.oceanDark,
        "#000000",
        0.72
      )
    );

    ctx.fillStyle =
      ocean;

    ctx.fillRect(
      x - radius,
      y - radius,
      radius * 2,
      radius * 2
    );

    const rotation =
      elapsed *
      0.19 *
      settings.speed;

    for (
      const continent of
      continents
    ) {
      let longitude =
        continent.angle +
        rotation;

      longitude =
        (
          (
            longitude +
            Math.PI
          ) %
          TAU +
          TAU
        ) %
        TAU -
        Math.PI;

      const depth =
        Math.cos(
          longitude
        );

      if (
        depth <= 0
      ) {
        continue;
      }

      const continentX =
        x +
        Math.sin(
          longitude
        ) *
        radius *
        0.8;

      const continentY =
        y +
        continent.latitude *
        radius;

      const continentWidth =
        radius *
        continent.width *
        Math.max(
          0.12,
          depth
        );

      const continentHeight =
        radius *
        continent.height;

      const gradient =
        ctx.createLinearGradient(
          continentX,
          continentY -
          continentHeight,
          continentX,
          continentY +
          continentHeight
        );

      gradient.addColorStop(
        0,
        colors.landBright
      );

      gradient.addColorStop(
        1,
        colors.land
      );

      ctx.globalAlpha =
        0.62 +
        depth * 0.28;

      drawContinent(
        continentX,
        continentY,
        continentWidth,
        continentHeight,
        continent.rotation,
        gradient
      );
    }

    ctx.globalAlpha =
      0.16;

    for (
      let band = -3;
      band <= 3;
      band++
    ) {
      const wave =
        Math.sin(
          elapsed * 0.25 +
          band * 1.3
        ) *
        radius *
        0.08;

      ctx.beginPath();

      ctx.ellipse(
        x + wave,
        y +
        band *
        radius *
        0.2,
        radius * 0.85,
        radius * 0.065,
        0,
        0,
        TAU
      );

      ctx.strokeStyle =
        colors.clouds;

      ctx.lineWidth =
        Math.max(
          2,
          radius * 0.025
        );

      ctx.stroke();
    }

    ctx.globalAlpha = 1;

    drawPlanetShade(
      0.88
    );

    drawAurora();

    ctx.restore();

    ctx.beginPath();

    ctx.arc(
      x,
      y,
      radius,
      0,
      TAU
    );

    ctx.strokeStyle =
      rgba(
        colors.primary,
        0.58
      );

    ctx.lineWidth =
      Math.max(
        2,
        radius * 0.018
      );

    ctx.stroke();
  }

  function updateMarsBase(dt) {
    if (
      settings.planetType !==
      "mars" ||
      !settings.showMarsBase
    ) {
      marsBase.visible =
        false;

      marsBase.progress =
        0;

      return;
    }

    if (
      transferRocket.state ===
      "landed"
    ) {
      marsBase.visible =
        true;
    }

    if (
      marsBase.visible
    ) {
      marsBase.progress =
        Math.min(
          1,
          marsBase.progress +
          dt * 0.22
        );
    }

    marsBase.beaconTime +=
      dt;
  }

  function drawMarsBase() {
    if (
      settings.planetType !==
      "mars" ||
      !settings.showMarsBase ||
      !marsBase.visible
    ) {
      return;
    }

    const progress =
      smoothStep(
        marsBase.progress
      );

    const radius =
      scene.radius;

    const x =
      scene.x -
      radius * 0.45;

    const y =
      scene.y -
      radius * 0.56;

    const size =
      clamp(
        radius * 0.085,
        8,
        17
      );

    ctx.save();

    ctx.translate(
      x,
      y
    );

    ctx.rotate(
      -0.7
    );

    ctx.globalAlpha =
      progress;

    const beaconAlpha =
      0.35 +
      Math.sin(
        marsBase.beaconTime *
        4
      ) *
      0.25;

    const beaconGlow =
      ctx.createRadialGradient(
        0,
        -size * 1.55,
        0,
        0,
        -size * 1.55,
        size * 1.3
      );

    beaconGlow.addColorStop(
      0,
      rgba(
        colors.signal,
        beaconAlpha
      )
    );

    beaconGlow.addColorStop(
      1,
      rgba(
        colors.signal,
        0
      )
    );

    circle(
      0,
      -size * 1.55,
      size * 1.3,
      beaconGlow
    );

    ctx.beginPath();

    ctx.moveTo(
      0,
      -size * 0.25
    );

    ctx.lineTo(
      0,
      -size * 1.55
    );

    ctx.strokeStyle =
      colors.satellite;

    ctx.lineWidth =
      Math.max(
        1,
        size * 0.1
      );

    ctx.stroke();

    circle(
      0,
      -size * 1.55,
      size * 0.13,
      colors.signal
    );

    ctx.beginPath();

    ctx.arc(
      -size * 0.5,
      0,
      size * 0.58,
      Math.PI,
      TAU
    );

    ctx.lineTo(
      size * 0.08,
      0
    );

    ctx.closePath();

    const dome =
      ctx.createLinearGradient(
        0,
        -size,
        0,
        size * 0.2
      );

    dome.addColorStop(
      0,
      rgba(
        colors.primaryBright,
        0.92
      )
    );

    dome.addColorStop(
      1,
      rgba(
        colors.panel,
        0.9
      )
    );

    ctx.fillStyle =
      dome;

    ctx.fill();

    ctx.strokeStyle =
      rgba(
        colors.satellite,
        0.72
      );

    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.beginPath();

    ctx.arc(
      size * 0.58,
      size * 0.08,
      size * 0.42,
      Math.PI,
      TAU
    );

    ctx.lineTo(
      size,
      size * 0.08
    );

    ctx.closePath();

    ctx.fillStyle =
      rgba(
        colors.satellite,
        0.88
      );

    ctx.fill();

    ctx.strokeStyle =
      rgba(
        colors.primary,
        0.65
      );

    ctx.stroke();

    drawPanel(
      -size * 2.1,
      size * 0.34,
      size * 1.05,
      size * 0.48
    );

    drawPanel(
      size * 1.08,
      size * 0.34,
      size * 1.05,
      size * 0.48
    );

    ctx.restore();

    ctx.globalAlpha = 1;
  }

  function drawMars() {
    const x =
      scene.x;

    const y =
      scene.y;

    const radius =
      scene.radius;

    drawAtmosphere(
      "#e78b63",
      0.72
    );

    ctx.save();

    ctx.beginPath();

    ctx.arc(
      x,
      y,
      radius,
      0,
      TAU
    );

    ctx.clip();

    const surface =
      ctx.createRadialGradient(
        x -
        radius * 0.42,
        y -
        radius * 0.43,
        radius * 0.04,
        x,
        y,
        radius * 1.15
      );

    surface.addColorStop(
      0,
      "#f5ad76"
    );

    surface.addColorStop(
      0.32,
      "#d97548"
    );

    surface.addColorStop(
      0.68,
      "#a94732"
    );

    surface.addColorStop(
      1,
      "#4d211e"
    );

    ctx.fillStyle =
      surface;

    ctx.fillRect(
      x - radius,
      y - radius,
      radius * 2,
      radius * 2
    );

    const rotation =
      elapsed *
      settings.speed *
      0.14;

    for (
      let index = 0;
      index < 9;
      index++
    ) {
      const longitude =
        rotation +
        index * 1.17;

      const depth =
        Math.cos(
          longitude
        );

      if (
        depth <= 0
      ) {
        continue;
      }

      const patchX =
        x +
        Math.sin(
          longitude
        ) *
        radius *
        0.69;

      const patchY =
        y +
        Math.sin(
          index * 2.37
        ) *
        radius *
        0.48;

      const patchRadius =
        radius *
        (
          0.11 +
          index % 3 *
          0.027
        );

      const patch =
        ctx.createRadialGradient(
          patchX -
          patchRadius * 0.25,
          patchY -
          patchRadius * 0.22,
          0,
          patchX,
          patchY,
          patchRadius
        );

      patch.addColorStop(
        0,
        "rgba(255,177,117,0.15)"
      );

      patch.addColorStop(
        0.6,
        "rgba(98,39,31,0.2)"
      );

      patch.addColorStop(
        1,
        "rgba(67,25,23,0)"
      );

      ctx.beginPath();

      ctx.ellipse(
        patchX,
        patchY,
        patchRadius *
        Math.max(
          0.3,
          depth
        ),
        patchRadius * 0.68,
        index * 0.37,
        0,
        TAU
      );

      ctx.fillStyle =
        patch;

      ctx.fill();
    }

    for (
      const crater of
      marsCraters
    ) {
      const craterX =
        x +
        crater.x *
        radius;

      const craterY =
        y +
        crater.y *
        radius;

      const craterRadius =
        crater.size *
        radius;

      const craterGradient =
        ctx.createRadialGradient(
          craterX -
          craterRadius * 0.25,
          craterY -
          craterRadius * 0.3,
          craterRadius * 0.08,
          craterX,
          craterY,
          craterRadius
        );

      craterGradient.addColorStop(
        0,
        "rgba(255,177,117,0.28)"
      );

      craterGradient.addColorStop(
        0.55,
        "rgba(108,39,31,0.18)"
      );

      craterGradient.addColorStop(
        1,
        "rgba(67,25,23,0.5)"
      );

      circle(
        craterX,
        craterY,
        craterRadius,
        craterGradient
      );
    }

    const polarCap =
      ctx.createRadialGradient(
        x -
        radius * 0.08,
        y -
        radius * 0.88,
        0,
        x -
        radius * 0.08,
        y -
        radius * 0.88,
        radius * 0.35
      );

    polarCap.addColorStop(
      0,
      "rgba(255,244,224,0.9)"
    );

    polarCap.addColorStop(
      0.55,
      "rgba(245,218,190,0.45)"
    );

    polarCap.addColorStop(
      1,
      "rgba(245,218,190,0)"
    );

    ctx.fillStyle =
      polarCap;

    ctx.fillRect(
      x - radius,
      y - radius,
      radius * 2,
      radius * 0.58
    );

    drawMarsBase();

    drawPlanetShade(
      0.84
    );

    ctx.restore();

    ctx.beginPath();

    ctx.arc(
      x,
      y,
      radius,
      0,
      TAU
    );

    ctx.strokeStyle =
      "rgba(241,132,91,0.62)";

    ctx.lineWidth =
      Math.max(
        2,
        radius * 0.018
      );

    ctx.stroke();
  }

  function drawJupiter() {
    const x =
      scene.x;

    const y =
      scene.y;

    const radius =
      scene.radius;

    drawAtmosphere(
      "#e6c5a0",
      0.72
    );

    ctx.save();

    ctx.beginPath();

    ctx.arc(
      x,
      y,
      radius,
      0,
      TAU
    );

    ctx.clip();

    ctx.fillStyle =
      "#c9a77d";

    ctx.fillRect(
      x - radius,
      y - radius,
      radius * 2,
      radius * 2
    );

    const bands = [
      [
        "#ead6b8",
        -0.78,
        0.18
      ],
      [
        "#a96f50",
        -0.57,
        0.19
      ],
      [
        "#e7cba4",
        -0.35,
        0.2
      ],
      [
        "#b77a55",
        -0.12,
        0.18
      ],
      [
        "#e9d0ae",
        0.09,
        0.22
      ],
      [
        "#9f674b",
        0.34,
        0.17
      ],
      [
        "#dfbd94",
        0.54,
        0.21
      ],
      [
        "#b58260",
        0.77,
        0.17
      ]
    ];

    for (
      let index = 0;
      index < bands.length;
      index++
    ) {
      const band =
        bands[index];

      const wave =
        Math.sin(
          elapsed *
          settings.speed *
          (
            0.2 +
            index * 0.025
          ) +
          index
        ) *
        radius *
        0.055;

      ctx.beginPath();

      ctx.ellipse(
        x + wave,
        y +
        band[1] *
        radius,
        radius * 1.1,
        band[2] *
        radius,
        0,
        0,
        TAU
      );

      ctx.fillStyle =
        band[0];

      ctx.fill();
    }

    const spotX =
      x +
      radius * 0.34 +
      Math.sin(
        elapsed *
        settings.speed *
        0.13
      ) *
      radius *
      0.13;

    const spotY =
      y +
      radius * 0.3;

    const spot =
      ctx.createRadialGradient(
        spotX -
        radius * 0.06,
        spotY -
        radius * 0.035,
        0,
        spotX,
        spotY,
        radius * 0.28
      );

    spot.addColorStop(
      0,
      "#f2a07d"
    );

    spot.addColorStop(
      0.65,
      "#b94f3d"
    );

    spot.addColorStop(
      1,
      "rgba(116,47,37,0)"
    );

    ctx.beginPath();

    ctx.ellipse(
      spotX,
      spotY,
      radius * 0.25,
      radius * 0.12,
      -0.08,
      0,
      TAU
    );

    ctx.fillStyle =
      spot;

    ctx.fill();

    drawPlanetShade(
      0.76
    );

    ctx.restore();

    ctx.beginPath();

    ctx.arc(
      x,
      y,
      radius,
      0,
      TAU
    );

    ctx.strokeStyle =
      "rgba(236,205,169,0.55)";

    ctx.lineWidth =
      Math.max(
        2,
        radius * 0.018
      );

    ctx.stroke();
  }

  function drawSaturnRingHalf(
    startAngle,
    endAngle,
    alpha
  ) {
    const radius =
      scene.radius;

    const rings = [
      [
        1.42,
        0.05,
        "#c7ad7c"
      ],
      [
        1.58,
        0.075,
        "#ead5a7"
      ],
      [
        1.76,
        0.045,
        "#9d8158"
      ],
      [
        1.9,
        0.035,
        "#d9c49a"
      ]
    ];

    ctx.save();

    ctx.translate(
      scene.x,
      scene.y
    );

    ctx.rotate(
      -0.22
    );

    for (
      const ring of rings
    ) {
      ctx.beginPath();

      ctx.ellipse(
        0,
        0,
        radius *
        ring[0],
        radius *
        ring[0] *
        0.32,
        0,
        startAngle,
        endAngle
      );

      ctx.strokeStyle =
        rgba(
          ring[2],
          alpha
        );

      ctx.lineWidth =
        Math.max(
          1,
          radius *
          ring[1]
        );

      ctx.stroke();
    }

    ctx.restore();
  }

  function drawSaturnRingShadow() {
    const radius =
      scene.radius;

    ctx.save();

    ctx.beginPath();

    ctx.arc(
      scene.x,
      scene.y,
      radius,
      0,
      TAU
    );

    ctx.clip();

    ctx.translate(
      scene.x,
      scene.y
    );

    ctx.rotate(
      -0.22
    );

    ctx.beginPath();

    ctx.ellipse(
      0,
      radius * 0.08,
      radius * 1.04,
      radius * 0.18,
      0,
      0,
      TAU
    );

    ctx.strokeStyle =
      "rgba(45,32,18,0.34)";

    ctx.lineWidth =
      radius * 0.17;

    ctx.stroke();

    ctx.restore();
  }

  function drawSaturnBody() {
    const x =
      scene.x;

    const y =
      scene.y;

    const radius =
      scene.radius;

    drawAtmosphere(
      "#e7d4a8",
      0.62
    );

    ctx.save();

    ctx.beginPath();

    ctx.arc(
      x,
      y,
      radius,
      0,
      TAU
    );

    ctx.clip();

    const body =
      ctx.createRadialGradient(
        x -
        radius * 0.4,
        y -
        radius * 0.42,
        radius * 0.04,
        x,
        y,
        radius * 1.12
      );

    body.addColorStop(
      0,
      "#f5e5bb"
    );

    body.addColorStop(
      0.45,
      "#d5b77e"
    );

    body.addColorStop(
      1,
      "#765d3f"
    );

    ctx.fillStyle =
      body;

    ctx.fillRect(
      x - radius,
      y - radius,
      radius * 2,
      radius * 2
    );

    const bands = [
      "#f0dfb5",
      "#b99765",
      "#dec792",
      "#9e7f58",
      "#ead7aa",
      "#b79262",
      "#dcc28d"
    ];

    for (
      let index = 0;
      index < bands.length;
      index++
    ) {
      const bandY =
        y +
        (
          index - 3
        ) *
        radius *
        0.24;

      const wave =
        Math.sin(
          elapsed *
          settings.speed *
          0.16 +
          index
        ) *
        radius *
        0.035;

      ctx.beginPath();

      ctx.ellipse(
        x + wave,
        bandY,
        radius * 1.08,
        radius * 0.09,
        0,
        0,
        TAU
      );

      ctx.fillStyle =
        bands[index];

      ctx.globalAlpha =
        0.55;

      ctx.fill();
    }

    ctx.globalAlpha = 1;

    drawSaturnRingShadow();

    drawPlanetShade(
      0.76
    );

    ctx.restore();

    ctx.beginPath();

    ctx.arc(
      x,
      y,
      radius,
      0,
      TAU
    );

    ctx.strokeStyle =
      "rgba(237,215,171,0.6)";

    ctx.lineWidth =
      Math.max(
        2,
        radius * 0.018
      );

    ctx.stroke();
  }

  function drawPlanetBackLayer() {
    if (
      settings.planetType ===
      "saturn"
    ) {
      drawSaturnRingHalf(
        Math.PI,
        TAU,
        0.58
      );
    }
  }

  function drawPlanet() {
    if (
      settings.planetType ===
      "mars"
    ) {
      drawMars();
    } else if (
      settings.planetType ===
      "jupiter"
    ) {
      drawJupiter();
    } else if (
      settings.planetType ===
      "saturn"
    ) {
      drawSaturnBody();
    } else {
      drawEarth();
    }
  }

  function drawPlanetFrontLayer() {
    if (
      settings.planetType ===
      "saturn"
    ) {
      drawSaturnRingHalf(
        0,
        Math.PI,
        0.86
      );
    }
  }

  function drawGargantuaBackgroundLens() {
    const radius =
      gargantua.diskOuterRadius *
      1.28 *
      gargantua.lensPulse;

    const lens =
      ctx.createRadialGradient(
        gargantua.x,
        gargantua.y,
        gargantua.horizonRadius,
        gargantua.x,
        gargantua.y,
        radius
      );

    lens.addColorStop(
      0,
      "rgba(0,0,0,1)"
    );

    lens.addColorStop(
      0.22,
      "rgba(0,0,0,0.98)"
    );

    lens.addColorStop(
      0.43,
      rgba(
        colors.accretionCold,
        0.08
      )
    );

    lens.addColorStop(
      0.68,
      rgba(
        colors.accretionOuter,
        0.045
      )
    );

    lens.addColorStop(
      1,
      rgba(
        colors.accretionOuter,
        0
      )
    );

    circle(
      gargantua.x,
      gargantua.y,
      radius,
      lens
    );
  }

  function drawAccretionLayer(
    verticalScale,
    rotationOffset,
    alpha,
    lineScale,
    frontHalf
  ) {
    const bandCount = 18;

    ctx.save();

    ctx.translate(
      gargantua.x,
      gargantua.y
    );

    ctx.rotate(
      gargantua.diskTilt
    );

    for (
      let index = bandCount - 1;
      index >= 0;
      index--
    ) {
      const progress =
        index /
        (
          bandCount - 1
        );

      const radius =
        lerp(
          gargantua.diskInnerRadius,
          gargantua.diskOuterRadius,
          progress
        );

      const turbulence =
        Math.sin(
          gargantua.rotation *
          (
            1.4 +
            progress * 0.8
          ) +
          index * 1.72 +
          rotationOffset
        ) *
        gargantua.radius *
        0.024;

      const radiusX =
        radius +
        turbulence;

      const radiusY =
        radius *
        verticalScale *
        (
          0.94 +
          Math.sin(
            gargantua.rotation *
            0.8 +
            index
          ) *
          0.035
        );

      const heat =
        1 -
        progress;

      let color =
        colors.accretionOuter;

      if (
        heat > 0.72
      ) {
        color =
          colors.accretionHot;
      } else if (
        heat > 0.38
      ) {
        color =
          colors.accretionWarm;
      }

      const doppler =
        0.48 +
        Math.cos(
          gargantua.rotation *
          0.55 +
          index * 0.28
        ) *
        0.16;

      ctx.beginPath();

      ctx.ellipse(
        0,
        0,
        radiusX,
        radiusY,
        0,
        frontHalf
          ? 0
          : Math.PI,
        frontHalf
          ? Math.PI
          : TAU
      );

      ctx.strokeStyle =
        rgba(
          color,
          alpha *
          (
            0.34 +
            heat * 0.48 +
            doppler * 0.18
          )
        );

      ctx.lineWidth =
        Math.max(
          1,
          gargantua.radius *
          (
            0.022 +
            heat * 0.04
          ) *
          lineScale
        );

      ctx.stroke();
    }

    ctx.restore();
  }

  function drawAccretionBack() {
    drawAccretionLayer(
      gargantua.diskThickness,
      0,
      0.76,
      1,
      false
    );

    ctx.save();

    ctx.translate(
      gargantua.x,
      gargantua.y
    );

    const upperLens =
      ctx.createLinearGradient(
        0,
        -gargantua.radius * 1.6,
        0,
        -gargantua.horizonRadius * 0.3
      );

    upperLens.addColorStop(
      0,
      rgba(
        colors.accretionOuter,
        0
      )
    );

    upperLens.addColorStop(
      0.55,
      rgba(
        colors.accretionWarm,
        0.16
      )
    );

    upperLens.addColorStop(
      1,
      rgba(
        colors.accretionHot,
        0.42
      )
    );

    ctx.beginPath();

    ctx.ellipse(
      0,
      -gargantua.horizonRadius *
      0.62,
      gargantua.diskOuterRadius *
      0.9,
      gargantua.radius * 0.62,
      0,
      Math.PI,
      TAU
    );

    ctx.strokeStyle =
      upperLens;

    ctx.lineWidth =
      Math.max(
        2,
        gargantua.radius * 0.095
      );

    ctx.stroke();

    ctx.restore();
  }

  function drawEventHorizon() {
    const photonRadius =
      gargantua.horizonRadius *
      1.18 *
      gargantua.photonPulse;

    const photonGlow =
      ctx.createRadialGradient(
        gargantua.x,
        gargantua.y,
        gargantua.horizonRadius *
        0.82,
        gargantua.x,
        gargantua.y,
        photonRadius *
        1.32
      );

    photonGlow.addColorStop(
      0,
      "rgba(0,0,0,1)"
    );

    photonGlow.addColorStop(
      0.68,
      "rgba(0,0,0,1)"
    );

    photonGlow.addColorStop(
      0.82,
      rgba(
        colors.lensLight,
        0.7
      )
    );

    photonGlow.addColorStop(
      0.9,
      rgba(
        colors.accretionHot,
        0.22
      )
    );

    photonGlow.addColorStop(
      1,
      rgba(
        colors.accretionHot,
        0
      )
    );

    circle(
      gargantua.x,
      gargantua.y,
      photonRadius * 1.32,
      photonGlow
    );

    circle(
      gargantua.x,
      gargantua.y,
      gargantua.horizonRadius,
      "#000000"
    );

    ctx.beginPath();

    ctx.arc(
      gargantua.x,
      gargantua.y,
      photonRadius,
      0,
      TAU
    );

    ctx.strokeStyle =
      rgba(
        colors.lensLight,
        0.82
      );

    ctx.lineWidth =
      Math.max(
        1.5,
        gargantua.radius * 0.026
      );

    ctx.stroke();

    const shadow =
      ctx.createRadialGradient(
        gargantua.x -
        gargantua.horizonRadius *
        0.12,
        gargantua.y -
        gargantua.horizonRadius *
        0.1,
        0,
        gargantua.x,
        gargantua.y,
        gargantua.horizonRadius
      );

    shadow.addColorStop(
      0,
      "#000000"
    );

    shadow.addColorStop(
      0.74,
      "#000000"
    );

    shadow.addColorStop(
      1,
      "rgba(0,0,0,0.97)"
    );

    circle(
      gargantua.x,
      gargantua.y,
      gargantua.horizonRadius,
      shadow
    );
  }

  function drawAccretionFront() {
    drawAccretionLayer(
      gargantua.diskThickness,
      Math.PI,
      0.92,
      1.08,
      true
    );

    ctx.save();

    ctx.translate(
      gargantua.x,
      gargantua.y
    );

    ctx.rotate(
      gargantua.diskTilt
    );

    ctx.beginPath();

    ctx.ellipse(
      0,
      0,
      gargantua.diskInnerRadius *
      1.15,
      gargantua.diskInnerRadius *
      gargantua.diskThickness *
      0.72,
      0,
      0,
      Math.PI
    );

    ctx.strokeStyle =
      rgba(
        colors.accretionHot,
        0.88
      );

    ctx.lineWidth =
      Math.max(
        2,
        gargantua.radius * 0.052
      );

    ctx.stroke();

    ctx.beginPath();

    ctx.ellipse(
      0,
      gargantua.radius * 0.03,
      gargantua.diskOuterRadius *
      0.96,
      gargantua.diskOuterRadius *
      gargantua.diskThickness *
      0.76,
      0,
      0,
      Math.PI
    );

    ctx.strokeStyle =
      rgba(
        colors.accretionWarm,
        0.28
      );

    ctx.lineWidth =
      Math.max(
        1,
        gargantua.radius * 0.025
      );

    ctx.stroke();

    ctx.restore();
  }

  function drawMillerPlanet() {
    const radius =
      miller.radius;

    const glow =
      ctx.createRadialGradient(
        miller.x,
        miller.y,
        radius * 0.6,
        miller.x,
        miller.y,
        radius * 1.7
      );

    glow.addColorStop(
      0,
      rgba(
        colors.millerLight,
        0.14
      )
    );

    glow.addColorStop(
      1,
      rgba(
        colors.millerLight,
        0
      )
    );

    circle(
      miller.x,
      miller.y,
      radius * 1.7,
      glow
    );

    const surface =
      ctx.createRadialGradient(
        miller.x -
        radius * 0.35,
        miller.y -
        radius * 0.4,
        radius * 0.05,
        miller.x,
        miller.y,
        radius
      );

    surface.addColorStop(
      0,
      colors.millerLight
    );

    surface.addColorStop(
      0.35,
      colors.millerOcean
    );

    surface.addColorStop(
      1,
      mix(
        colors.millerOcean,
        "#000000",
        0.72
      )
    );

    circle(
      miller.x,
      miller.y,
      radius,
      surface
    );

    ctx.save();

    ctx.beginPath();

    ctx.arc(
      miller.x,
      miller.y,
      radius,
      0,
      TAU
    );

    ctx.clip();

    for (
      let index = -2;
      index <= 2;
      index++
    ) {
      const wave =
        Math.sin(
          elapsed *
          (
            0.45 +
            index * 0.035
          ) +
          index
        ) *
        radius *
        0.07;

      ctx.beginPath();

      ctx.ellipse(
        miller.x + wave,
        miller.y +
        index *
        radius *
        0.22,
        radius * 0.95,
        radius * 0.055,
        0,
        0,
        TAU
      );

      ctx.strokeStyle =
        rgba(
          colors.millerLight,
          0.28
        );

      ctx.lineWidth =
        Math.max(
          1,
          radius * 0.04
        );

      ctx.stroke();
    }

    ctx.restore();

    ctx.beginPath();

    ctx.arc(
      miller.x,
      miller.y,
      radius,
      0,
      TAU
    );

    ctx.strokeStyle =
      rgba(
        colors.millerLight,
        0.5
      );

    ctx.lineWidth =
      Math.max(
        1,
        radius * 0.035
      );

    ctx.stroke();

    if (
      miller.behind
    ) {
      const lensAlpha =
        clamp(
          1 -
          Math.abs(
            Math.cos(
              miller.angle
            )
          ),
          0,
          1
        );

      ctx.beginPath();

      ctx.arc(
        gargantua.x,
        gargantua.y,
        gargantua.horizonRadius *
        (
          1.25 +
          lensAlpha * 0.16
        ),
        miller.angle -
        0.16,
        miller.angle +
        0.16
      );

      ctx.strokeStyle =
        rgba(
          colors.millerLight,
          0.34 *
          lensAlpha
        );

      ctx.lineWidth =
        Math.max(
          1,
          miller.radius * 0.22
        );

      ctx.stroke();
    }
  }

  function updateGargantuaDebris(dt) {
    for (
      let index = 0;
      index <
      gargantuaDebris.length;
      index++
    ) {
      const debris =
        gargantuaDebris[index];

      if (
        !debris.active
      ) {
        debris.active = true;

        debris.distance =
          1.65 +
          (
            index % 6
          ) *
          0.15;

        debris.spiral = 0;
        debris.heat = 0;
        debris.alpha = 0.4;
      }

      const proximity =
        clamp(
          1 -
          (
            debris.distance -
            0.62
          ) /
          1.45,
          0,
          1
        );

      debris.angle +=
        dt *
        debris.speed *
        (
          1 +
          proximity * 8
        );

      debris.spiral +=
        dt *
        (
          0.008 +
          proximity * 0.028
        );

      debris.distance -=
        dt *
        (
          0.004 +
          proximity * 0.018
        );

      debris.heat =
        proximity;

      if (
        debris.distance <= 0.57
      ) {
        debris.active = false;
      }
    }
  }

  function drawGargantuaDebris(
    front
  ) {
    for (
      const debris of
      gargantuaDebris
    ) {
      if (
        !debris.active
      ) {
        continue;
      }

      const depth =
        Math.sin(
          debris.angle +
          debris.phase
        );

      if (
        front
          ? depth < 0
          : depth >= 0
      ) {
        continue;
      }

      const distance =
        gargantua.diskOuterRadius *
        debris.distance;

      const x =
        gargantua.x +
        Math.cos(
          debris.angle +
          debris.phase
        ) *
        distance;

      const y =
        gargantua.y +
        Math.sin(
          debris.angle +
          debris.phase
        ) *
        distance *
        debris.eccentricity;

      const heat =
        debris.heat;

      const size =
        debris.size *
        (
          1 +
          heat * 0.8
        );

      if (
        heat > 0.42
      ) {
        const trailLength =
          size *
          (
            4 +
            heat * 10
          );

        const tangent =
          debris.angle +
          debris.phase +
          Math.PI / 2;

        ctx.beginPath();

        ctx.moveTo(
          x,
          y
        );

        ctx.lineTo(
          x -
          Math.cos(tangent) *
          trailLength,
          y -
          Math.sin(tangent) *
          trailLength *
          debris.eccentricity
        );

        const trail =
          ctx.createLinearGradient(
            x,
            y,
            x -
            Math.cos(tangent) *
            trailLength,
            y -
            Math.sin(tangent) *
            trailLength *
            debris.eccentricity
          );

        trail.addColorStop(
          0,
          rgba(
            colors.accretionHot,
            debris.alpha *
            heat
          )
        );

        trail.addColorStop(
          1,
          rgba(
            colors.accretionOuter,
            0
          )
        );

        ctx.strokeStyle =
          trail;

        ctx.lineWidth =
          Math.max(
            1,
            size * 0.65
          );

        ctx.lineCap =
          "round";

        ctx.stroke();
      }

      circle(
        x,
        y,
        size,
        heat > 0.68
          ? colors.accretionHot
          : heat > 0.35
            ? colors.accretionWarm
            : rgba(
                colors.moon,
                debris.alpha
              )
      );
    }
  }

  function drawGargantuaSceneBase() {
    drawBackground();
    drawStars();

    drawGargantuaBackgroundLens();

    drawGargantuaDebris(
      false
    );

    if (
      miller.behind
    ) {
      drawMillerPlanet();
    }

    drawAccretionBack();

    drawEventHorizon();

    drawAccretionFront();

    drawGargantuaDebris(
      true
    );

    if (
      !miller.behind
    ) {
      drawMillerPlanet();
    }
  }
  function drawEndurance() {
    if (
      !endurance.visible ||
      endurance.alpha <= 0
    ) {
      return;
    }

    const radius =
      endurance.radius;

    ctx.save();

    ctx.translate(
      endurance.x,
      endurance.y
    );

    ctx.rotate(
      endurance.angle
    );

    ctx.globalAlpha =
      endurance.alpha;

    const glow =
      ctx.createRadialGradient(
        0,
        0,
        radius * 0.3,
        0,
        0,
        radius * 1.8
      );

    glow.addColorStop(
      0,
      rgba(
        colors.primary,
        0.18
      )
    );

    glow.addColorStop(
      1,
      rgba(
        colors.primary,
        0
      )
    );

    circle(
      0,
      0,
      radius * 1.8,
      glow
    );

    ctx.rotate(
      endurance.spin
    );

    ctx.beginPath();

    ctx.arc(
      0,
      0,
      radius,
      0,
      TAU
    );

    ctx.strokeStyle =
      colors.satellite;

    ctx.lineWidth =
      Math.max(
        2,
        radius * 0.25
      );

    ctx.stroke();

    ctx.beginPath();

    ctx.arc(
      0,
      0,
      radius * 0.58,
      0,
      TAU
    );

    ctx.strokeStyle =
      rgba(
        colors.primaryBright,
        0.48
      );

    ctx.lineWidth =
      Math.max(
        1,
        radius * 0.055
      );

    ctx.stroke();

    for (
      let index = 0;
      index < 12;
      index++
    ) {
      const angle =
        index /
        12 *
        TAU;

      const moduleX =
        Math.cos(angle) *
        radius;

      const moduleY =
        Math.sin(angle) *
        radius;

      ctx.save();

      ctx.translate(
        moduleX,
        moduleY
      );

      ctx.rotate(angle);

      const moduleWidth =
        radius * 0.3;

      const moduleHeight =
        radius * 0.39;

      ctx.fillStyle =
        index % 3 === 0
          ? colors.primaryBright
          : colors.satellite;

      ctx.fillRect(
        -moduleWidth * 0.5,
        -moduleHeight * 0.5,
        moduleWidth,
        moduleHeight
      );

      ctx.strokeStyle =
        rgba(
          colors.panel,
          0.85
        );

      ctx.lineWidth = 1;

      ctx.strokeRect(
        -moduleWidth * 0.5,
        -moduleHeight * 0.5,
        moduleWidth,
        moduleHeight
      );

      if (
        index % 3 === 0
      ) {
        ctx.fillStyle =
          rgba(
            colors.signal,
            0.6
          );

        ctx.fillRect(
          -moduleWidth * 0.32,
          -moduleHeight * 0.36,
          moduleWidth * 0.64,
          moduleHeight * 0.18
        );
      }

      ctx.restore();
    }

    ctx.beginPath();

    ctx.moveTo(
      -radius * 0.55,
      0
    );

    ctx.lineTo(
      radius * 0.55,
      0
    );

    ctx.moveTo(
      0,
      -radius * 0.55
    );

    ctx.lineTo(
      0,
      radius * 0.55
    );

    ctx.strokeStyle =
      rgba(
        colors.satellite,
        0.7
      );

    ctx.lineWidth =
      Math.max(
        1,
        radius * 0.065
      );

    ctx.stroke();

    ctx.beginPath();

    ctx.arc(
      0,
      0,
      radius * 0.19,
      0,
      TAU
    );

    ctx.fillStyle =
      colors.panel;

    ctx.fill();

    ctx.strokeStyle =
      colors.primaryBright;

    ctx.lineWidth =
      Math.max(
        1,
        radius * 0.045
      );

    ctx.stroke();

    ctx.restore();

    ctx.globalAlpha = 1;
  }

  function drawRanger(
    vehicle,
    stretch = 1
  ) {
    if (
      vehicle.alpha <= 0
    ) {
      return;
    }

    const size =
      vehicle.size;

    ctx.save();

    ctx.translate(
      vehicle.x,
      vehicle.y
    );

    ctx.rotate(
      vehicle.angle +
      Math.PI / 2
    );

    ctx.scale(
      1,
      stretch
    );

    ctx.globalAlpha =
      vehicle.alpha;

    const engineIntensity =
      vehicle.state === "landing"
        ? 0.55
        : vehicle.state === "surface"
          ? 0
          : 1;

    if (
      engineIntensity > 0
    ) {
      const engineGlow =
        ctx.createRadialGradient(
          0,
          size * 0.56,
          0,
          0,
          size * 0.56,
          size * 1.4
        );

      engineGlow.addColorStop(
        0,
        rgba(
          colors.signal,
          0.55 *
          engineIntensity
        )
      );

      engineGlow.addColorStop(
        1,
        rgba(
          colors.signal,
          0
        )
      );

      ctx.fillStyle =
        engineGlow;

      ctx.fillRect(
        -size * 1.3,
        -size * 0.4,
        size * 2.6,
        size * 2.4
      );

      ctx.beginPath();

      ctx.moveTo(
        -size * 0.22,
        size * 0.42
      );

      ctx.lineTo(
        0,
        size *
        (
          1.05 +
          Math.sin(
            elapsed * 22
          ) *
          0.13
        )
      );

      ctx.lineTo(
        size * 0.22,
        size * 0.42
      );

      ctx.closePath();

      ctx.fillStyle =
        rgba(
          colors.signal,
          0.72 *
          engineIntensity
        );

      ctx.fill();
    }

    ctx.beginPath();

    ctx.moveTo(
      0,
      -size
    );

    ctx.lineTo(
      size * 0.78,
      size * 0.34
    );

    ctx.lineTo(
      size * 0.46,
      size * 0.58
    );

    ctx.lineTo(
      0,
      size * 0.42
    );

    ctx.lineTo(
      -size * 0.46,
      size * 0.58
    );

    ctx.lineTo(
      -size * 0.78,
      size * 0.34
    );

    ctx.closePath();

    const hull =
      ctx.createLinearGradient(
        -size,
        -size,
        size,
        size
      );

    hull.addColorStop(
      0,
      mix(
        colors.satellite,
        "#ffffff",
        0.24
      )
    );

    hull.addColorStop(
      0.5,
      colors.satellite
    );

    hull.addColorStop(
      1,
      mix(
        colors.satellite,
        "#000000",
        0.46
      )
    );

    ctx.fillStyle =
      hull;

    ctx.fill();

    ctx.strokeStyle =
      rgba(
        colors.primaryBright,
        0.64
      );

    ctx.lineWidth =
      Math.max(
        1,
        size * 0.065
      );

    ctx.stroke();

    ctx.beginPath();

    ctx.moveTo(
      -size * 0.27,
      -size * 0.35
    );

    ctx.lineTo(
      0,
      -size * 0.65
    );

    ctx.lineTo(
      size * 0.27,
      -size * 0.35
    );

    ctx.lineTo(
      size * 0.18,
      -size * 0.02
    );

    ctx.lineTo(
      -size * 0.18,
      -size * 0.02
    );

    ctx.closePath();

    ctx.fillStyle =
      rgba(
        colors.ufoGlass,
        0.82
      );

    ctx.fill();

    ctx.beginPath();

    ctx.moveTo(
      -size * 0.52,
      size * 0.23
    );

    ctx.lineTo(
      -size * 0.22,
      size * 0.16
    );

    ctx.moveTo(
      size * 0.52,
      size * 0.23
    );

    ctx.lineTo(
      size * 0.22,
      size * 0.16
    );

    ctx.strokeStyle =
      colors.panel;

    ctx.lineWidth =
      Math.max(
        1,
        size * 0.1
      );

    ctx.stroke();

    ctx.restore();

    ctx.globalAlpha = 1;
  }

  function setRangerRoute(
    state,
    startX,
    startY,
    controlX,
    controlY,
    endX,
    endY,
    duration
  ) {
    ranger.state =
      state;

    ranger.progress = 0;
    ranger.duration =
      duration;

    ranger.startX =
      startX;

    ranger.startY =
      startY;

    ranger.controlX =
      controlX;

    ranger.controlY =
      controlY;

    ranger.endX =
      endX;

    ranger.endY =
      endY;

    ranger.x =
      startX;

    ranger.y =
      startY;

    ranger.previousX =
      startX;

    ranger.previousY =
      startY;

    ranger.alpha = 1;
  }

  function updateRangerPath(dt) {
    ranger.progress +=
      dt /
      ranger.duration;

    const rawProgress =
      clamp(
        ranger.progress,
        0,
        1
      );

    const progress =
      easeInOutCubic(
        rawProgress
      );

    const inverse =
      1 -
      progress;

    ranger.previousX =
      ranger.x;

    ranger.previousY =
      ranger.y;

    ranger.x =
      inverse *
      inverse *
      ranger.startX +
      2 *
      inverse *
      progress *
      ranger.controlX +
      progress *
      progress *
      ranger.endX;

    ranger.y =
      inverse *
      inverse *
      ranger.startY +
      2 *
      inverse *
      progress *
      ranger.controlY +
      progress *
      progress *
      ranger.endY;

    const dx =
      ranger.x -
      ranger.previousX;

    const dy =
      ranger.y -
      ranger.previousY;

    if (
      Math.abs(dx) +
      Math.abs(dy) >
      0.001
    ) {
      ranger.angle =
        Math.atan2(
          dy,
          dx
        );
    }
  }

  function startRangerDescent() {
    const dockingAngle =
      endurance.spin +
      Math.PI * 0.45;

    const startX =
      endurance.x +
      Math.cos(
        dockingAngle
      ) *
      endurance.radius *
      1.15;

    const startY =
      endurance.y +
      Math.sin(
        dockingAngle
      ) *
      endurance.radius *
      1.15;

    const landingAngle =
      -2.15;

    const endX =
      miller.x +
      Math.cos(
        landingAngle
      ) *
      miller.radius *
      0.78;

    const endY =
      miller.y +
      Math.sin(
        landingAngle
      ) *
      miller.radius *
      0.78;

    setRangerRoute(
      "descent",
      startX,
      startY,
      (
        startX +
        endX
      ) *
      0.5 +
      gargantua.radius *
      0.55,
      Math.min(
        startY,
        endY
      ) -
      gargantua.radius *
      0.72,
      endX,
      endY,
      5.2
    );
  }

  function startRangerAscent() {
    const dockingAngle =
      endurance.spin +
      Math.PI * 0.45;

    const endX =
      endurance.x +
      Math.cos(
        dockingAngle
      ) *
      endurance.radius *
      1.15;

    const endY =
      endurance.y +
      Math.sin(
        dockingAngle
      ) *
      endurance.radius *
      1.15;

    setRangerRoute(
      "ascent",
      ranger.x,
      ranger.y,
      (
        ranger.x +
        endX
      ) *
      0.5 -
      gargantua.radius *
      0.45,
      Math.min(
        ranger.y,
        endY
      ) -
      gargantua.radius *
      0.68,
      endX,
      endY,
      4.8
    );
  }

  function startPlungeShuttle() {
    plungeShuttle.state =
      "spiral";

    plungeShuttle.timer = 0;
    plungeShuttle.progress = 0;
    plungeShuttle.duration = 8.5;

    plungeShuttle.spiralAngle =
      endurance.orbitAngle +
      0.45;

    plungeShuttle.x =
      endurance.x;

    plungeShuttle.y =
      endurance.y;

    plungeShuttle.previousX =
      plungeShuttle.x;

    plungeShuttle.previousY =
      plungeShuttle.y;

    plungeShuttle.size =
      clamp(
        endurance.radius * 0.38,
        5,
        10
      );

    plungeShuttle.alpha = 1;
    plungeShuttle.stretch = 1;

    gargantuaSequence.shuttleReleased =
      true;
  }

  function updateEnduranceOrbit(dt) {
    const sequenceTime =
      gargantuaSequence.time;

    endurance.previousX =
      endurance.x;

    endurance.previousY =
      endurance.y;

    if (
      gargantuaSequence.stage ===
      "arrival"
    ) {
      const progress =
        easeOutCubic(
          clamp(
            gargantuaSequence.stageTime /
            6,
            0,
            1
          )
        );

      const targetAngle =
        -2.15;

      const targetX =
        gargantua.x +
        Math.cos(
          targetAngle
        ) *
        endurance.orbitX;

      const targetY =
        gargantua.y +
        Math.sin(
          targetAngle
        ) *
        endurance.orbitY;

      endurance.x =
        lerp(
          -width * 0.2,
          targetX,
          progress
        );

      endurance.y =
        lerp(
          height * 0.2,
          targetY,
          progress
        ) -
        Math.sin(
          progress *
          Math.PI
        ) *
        gargantua.radius *
        0.42;

      endurance.orbitAngle =
        targetAngle;

      endurance.alpha =
        clamp(
          progress * 3,
          0,
          1
        );
    } else if (
      gargantuaSequence.stage ===
      "departure"
    ) {
      const progress =
        easeInCubic(
          clamp(
            gargantuaSequence.stageTime /
            6,
            0,
            1
          )
        );

      const startAngle =
        endurance.orbitAngle;

      const startX =
        gargantua.x +
        Math.cos(
          startAngle
        ) *
        endurance.orbitX;

      const startY =
        gargantua.y +
        Math.sin(
          startAngle
        ) *
        endurance.orbitY;

      endurance.x =
        lerp(
          startX,
          width * 1.25,
          progress
        );

      endurance.y =
        lerp(
          startY,
          height * 0.18,
          progress
        ) -
        Math.sin(
          progress *
          Math.PI
        ) *
        gargantua.radius *
        0.35;

      endurance.alpha =
        clamp(
          (
            1 -
            progress
          ) *
          2.5,
          0,
          1
        );
    } else {
      let speed =
        0.09;

      if (
        gargantuaSequence.stage ===
        "ranger-return"
      ) {
        speed = 0.075;
      }

      if (
        gargantuaSequence.stage ===
        "release"
      ) {
        speed = 0.11;
      }

      endurance.orbitAngle +=
        dt *
        speed;

      endurance.x =
        gargantua.x +
        Math.cos(
          endurance.orbitAngle
        ) *
        endurance.orbitX;

      endurance.y =
        gargantua.y +
        Math.sin(
          endurance.orbitAngle
        ) *
        endurance.orbitY;

      endurance.alpha = 1;
    }

    const dx =
      endurance.x -
      endurance.previousX;

    const dy =
      endurance.y -
      endurance.previousY;

    if (
      Math.abs(dx) +
      Math.abs(dy) >
      0.001
    ) {
      endurance.angle =
        Math.atan2(
          dy,
          dx
        );
    }

    endurance.spin +=
      dt *
      (
        0.65 +
        Math.sin(
          sequenceTime * 0.18
        ) *
        0.08
      );
  }

  function updateRanger(dt) {
    if (
      ranger.state ===
      "docked"
    ) {
      const dockingAngle =
        endurance.spin +
        Math.PI * 0.45;

      ranger.x =
        endurance.x +
        Math.cos(
          dockingAngle
        ) *
        endurance.radius *
        1.15;

      ranger.y =
        endurance.y +
        Math.sin(
          dockingAngle
        ) *
        endurance.radius *
        1.15;

      ranger.angle =
        endurance.angle;

      ranger.alpha = 0;

      return;
    }

    if (
      ranger.state ===
      "surface"
    ) {
      ranger.timer -=
        dt;

      const landingAngle =
        -2.15;

      ranger.x =
        miller.x +
        Math.cos(
          landingAngle
        ) *
        miller.radius *
        0.78;

      ranger.y =
        miller.y +
        Math.sin(
          landingAngle
        ) *
        miller.radius *
        0.78;

      ranger.angle =
        landingAngle +
        Math.PI / 2;

      ranger.alpha = 1;

      if (
        ranger.timer <= 0
      ) {
        startRangerAscent();
      }

      return;
    }

    updateRangerPath(dt);

    if (
      ranger.state ===
      "descent" &&
      ranger.progress >=
      0.72
    ) {
      ranger.state =
        "landing";
    }

    if (
      (
        ranger.state ===
        "descent" ||
        ranger.state ===
        "landing"
      ) &&
      ranger.progress >= 1
    ) {
      ranger.state =
        "surface";

      ranger.timer =
        5.5;

      ranger.progress = 0;

      gargantuaSequence.millerLandingComplete =
        true;

      return;
    }

    if (
      ranger.state ===
      "ascent" &&
      ranger.progress >= 1
    ) {
      ranger.state =
        "docked";

      ranger.progress = 0;

      ranger.alpha = 0;

      gargantuaSequence.rangerReturned =
        true;
    }
  }

  function updatePlungeShuttle(dt) {
    if (
      plungeShuttle.state !==
      "spiral"
    ) {
      return;
    }

    plungeShuttle.progress +=
      dt /
      plungeShuttle.duration;

    const progress =
      clamp(
        plungeShuttle.progress,
        0,
        1
      );

    const eased =
      easeInCubic(
        progress
      );

    plungeShuttle.previousX =
      plungeShuttle.x;

    plungeShuttle.previousY =
      plungeShuttle.y;

    const turns =
      1.6 +
      eased * 6.2;

    const angle =
      plungeShuttle.spiralAngle +
      turns *
      TAU *
      progress;

    const radiusX =
      lerp(
        endurance.orbitX *
        0.72,
        gargantua.horizonRadius *
        0.08,
        eased
      );

    const radiusY =
      lerp(
        endurance.orbitY *
        0.72,
        gargantua.horizonRadius *
        0.025,
        eased
      );

    plungeShuttle.x =
      gargantua.x +
      Math.cos(angle) *
      radiusX;

    plungeShuttle.y =
      gargantua.y +
      Math.sin(angle) *
      radiusY;

    const dx =
      plungeShuttle.x -
      plungeShuttle.previousX;

    const dy =
      plungeShuttle.y -
      plungeShuttle.previousY;

    if (
      Math.abs(dx) +
      Math.abs(dy) >
      0.001
    ) {
      plungeShuttle.angle =
        Math.atan2(
          dy,
          dx
        );
    }

    plungeShuttle.stretch =
      1 +
      Math.pow(
        progress,
        3
      ) *
      4.8;

    plungeShuttle.alpha =
      progress < 0.86
        ? 1
        : clamp(
            (
              1 -
              progress
            ) /
            0.14,
            0,
            1
          );

    gargantuaSequence.flash =
      progress > 0.9
        ? Math.sin(
            clamp(
              (
                progress -
                0.9
              ) /
              0.1,
              0,
              1
            ) *
            Math.PI
          )
        : 0;

    if (
      progress >= 1
    ) {
      plungeShuttle.state =
        "gone";

      plungeShuttle.alpha = 0;

      gargantuaSequence.flash = 1;
    }
  }

  function updateGargantuaSequence(dt) {
    gargantuaSequence.time +=
      dt;

    if (
      gargantuaSequence.time >=
      gargantuaSequence.duration
    ) {
      gargantuaSequence.cycle++;

      resetGargantuaSequence();
    }

    const time =
      gargantuaSequence.time;

    if (
      time < 6
    ) {
      gargantuaSequence.stage =
        "arrival";

      gargantuaSequence.stageTime =
        time;
    } else if (
      time < 11
    ) {
      gargantuaSequence.stage =
        "orbit";

      gargantuaSequence.stageTime =
        time -
        6;
    } else if (
      time < 17
    ) {
      gargantuaSequence.stage =
        "ranger-descent";

      gargantuaSequence.stageTime =
        time -
        11;

      if (
        ranger.state ===
        "docked"
      ) {
        startRangerDescent();
      }
    } else if (
      time < 23
    ) {
      gargantuaSequence.stage =
        "miller-surface";

      gargantuaSequence.stageTime =
        time -
        17;
    } else if (
      time < 29
    ) {
      gargantuaSequence.stage =
        "ranger-return";

      gargantuaSequence.stageTime =
        time -
        23;

      if (
        ranger.state ===
        "surface"
      ) {
        ranger.timer =
          Math.min(
            ranger.timer,
            0.2
          );
      }
    } else if (
      time < 34
    ) {
      gargantuaSequence.stage =
        "release";

      gargantuaSequence.stageTime =
        time -
        29;

      if (
        ranger.state ===
        "docked" &&
        plungeShuttle.state ===
        "waiting" &&
        gargantuaSequence.stageTime >
        1.5
      ) {
        startPlungeShuttle();
      }
    } else if (
      time < 42
    ) {
      gargantuaSequence.stage =
        "departure";

      gargantuaSequence.stageTime =
        time -
        34;
    } else {
      gargantuaSequence.stage =
        "reset";

      gargantuaSequence.stageTime =
        time -
        42;
    }

    updateEnduranceOrbit(dt);
    updateRanger(dt);
    updatePlungeShuttle(dt);
    updateGargantuaDebris(dt);

    if (
      gargantuaSequence.stage !==
      "reset"
    ) {
      gargantuaSequence.flash *=
        Math.pow(
          0.92,
          dt * 60
        );
    }
  }

  function drawRangerTrajectory() {
    if (
      ranger.state ===
      "docked" ||
      ranger.state ===
      "surface"
    ) {
      return;
    }

    ctx.beginPath();

    ctx.moveTo(
      ranger.previousX,
      ranger.previousY
    );

    ctx.lineTo(
      ranger.x,
      ranger.y
    );

    ctx.strokeStyle =
      rgba(
        colors.signal,
        0.36 *
        ranger.alpha
      );

    ctx.lineWidth =
      Math.max(
        1,
        ranger.size * 0.3
      );

    ctx.lineCap =
      "round";

    ctx.stroke();
  }

  function drawPlungeTrail() {
    if (
      plungeShuttle.state !==
      "spiral" ||
      plungeShuttle.alpha <= 0
    ) {
      return;
    }

    const progress =
      clamp(
        plungeShuttle.progress,
        0,
        1
      );

    const trailLength =
      plungeShuttle.size *
      (
        4 +
        progress * 15
      );

    ctx.beginPath();

    ctx.moveTo(
      plungeShuttle.x,
      plungeShuttle.y
    );

    ctx.lineTo(
      plungeShuttle.x -
      Math.cos(
        plungeShuttle.angle
      ) *
      trailLength,
      plungeShuttle.y -
      Math.sin(
        plungeShuttle.angle
      ) *
      trailLength
    );

    const trail =
      ctx.createLinearGradient(
        plungeShuttle.x,
        plungeShuttle.y,
        plungeShuttle.x -
        Math.cos(
          plungeShuttle.angle
        ) *
        trailLength,
        plungeShuttle.y -
        Math.sin(
          plungeShuttle.angle
        ) *
        trailLength
      );

    trail.addColorStop(
      0,
      rgba(
        colors.accretionHot,
        0.78 *
        plungeShuttle.alpha
      )
    );

    trail.addColorStop(
      0.45,
      rgba(
        colors.accretionWarm,
        0.38 *
        plungeShuttle.alpha
      )
    );

    trail.addColorStop(
      1,
      rgba(
        colors.accretionOuter,
        0
      )
    );

    ctx.strokeStyle =
      trail;

    ctx.lineWidth =
      Math.max(
        1,
        plungeShuttle.size *
        (
          0.35 +
          progress
        )
      );

    ctx.lineCap =
      "round";

    ctx.stroke();
  }

  function drawGargantuaFlash() {
    if (
      gargantuaSequence.flash <=
      0.001
    ) {
      return;
    }

    const flash =
      gargantuaSequence.flash;

    const glow =
      ctx.createRadialGradient(
        gargantua.x,
        gargantua.y,
        gargantua.horizonRadius *
        0.4,
        gargantua.x,
        gargantua.y,
        gargantua.diskOuterRadius *
        1.1
      );

    glow.addColorStop(
      0,
      rgba(
        colors.lensLight,
        0.72 *
        flash
      )
    );

    glow.addColorStop(
      0.28,
      rgba(
        colors.accretionHot,
        0.34 *
        flash
      )
    );

    glow.addColorStop(
      1,
      rgba(
        colors.accretionOuter,
        0
      )
    );

    circle(
      gargantua.x,
      gargantua.y,
      gargantua.diskOuterRadius *
      1.1,
      glow
    );
  }

  function drawGargantuaFarObjects() {
    if (
      miller.behind
    ) {
      drawMillerPlanet();
    }

    const enduranceDepth =
      Math.sin(
        endurance.orbitAngle
      );

    if (
      endurance.visible &&
      enduranceDepth < 0
    ) {
      drawEndurance();
    }

    if (
      ranger.state !==
      "docked" &&
      ranger.y <
      gargantua.y
    ) {
      drawRangerTrajectory();

      drawRanger(
        ranger,
        1
      );
    }

    if (
      plungeShuttle.state ===
      "spiral" &&
      plungeShuttle.y <
      gargantua.y
    ) {
      drawPlungeTrail();

      drawRanger(
        plungeShuttle,
        plungeShuttle.stretch
      );
    }
  }

  function drawGargantuaNearObjects() {
    if (
      !miller.behind
    ) {
      drawMillerPlanet();
    }

    const enduranceDepth =
      Math.sin(
        endurance.orbitAngle
      );

    if (
      endurance.visible &&
      enduranceDepth >= 0
    ) {
      drawEndurance();
    }

    if (
      ranger.state !==
      "docked" &&
      ranger.y >=
      gargantua.y
    ) {
      drawRangerTrajectory();

      drawRanger(
        ranger,
        1
      );
    }

    if (
      plungeShuttle.state ===
      "spiral" &&
      plungeShuttle.y >=
      gargantua.y
    ) {
      drawPlungeTrail();

      drawRanger(
        plungeShuttle,
        plungeShuttle.stretch
      );
    }
  }

  function drawGargantuaSequence() {
    drawBackground();
    drawStars();

    drawGargantuaBackgroundLens();

    drawGargantuaDebris(
      false
    );

    drawGargantuaFarObjects();

    drawAccretionBack();

    drawEventHorizon();

    drawAccretionFront();

    drawGargantuaDebris(
      true
    );

    drawGargantuaNearObjects();

    drawGargantuaFlash();

    if (
      gargantuaSequence.stage ===
      "reset"
    ) {
      const fade =
        clamp(
          gargantuaSequence.stageTime /
          2,
          0,
          1
        );

      ctx.fillStyle =
        "rgba(0,0,0," +
        fade +
        ")";

      ctx.fillRect(
        0,
        0,
        width,
        height
      );
    }
  }

  function drawWormhole() {
    if (
      settings.planetType !==
      "saturn"
    ) {
      return;
    }

    const radius =
      clamp(
        scene.radius * 0.36,
        34,
        78
      );

    const x =
      clamp(
        scene.x +
        scene.radius * 1.42,
        radius * 1.2,
        width -
        radius * 1.2
      );

    const y =
      clamp(
        scene.y +
        scene.radius * 0.92,
        radius * 1.2,
        height -
        radius * 1.2
      );

    const pulse =
      0.96 +
      Math.sin(
        elapsed * 1.25
      ) *
      0.04;

    const currentRadius =
      radius *
      pulse;

    const halo =
      ctx.createRadialGradient(
        x,
        y,
        currentRadius * 0.1,
        x,
        y,
        currentRadius * 1.8
      );

    halo.addColorStop(
      0,
      "rgba(0,0,0,0)"
    );

    halo.addColorStop(
      0.5,
      rgba(
        colors.sun,
        0.24
      )
    );

    halo.addColorStop(
      0.72,
      rgba(
        colors.primary,
        0.2
      )
    );

    halo.addColorStop(
      1,
      rgba(
        colors.primary,
        0
      )
    );

    circle(
      x,
      y,
      currentRadius * 1.8,
      halo
    );

    ctx.save();

    ctx.translate(
      x,
      y
    );

    ctx.rotate(
      -0.24
    );

    for (
      let index = 0;
      index < 12;
      index++
    ) {
      const layer =
        1 -
        index * 0.055;

      ctx.save();

      ctx.rotate(
        elapsed *
        (
          index % 2 === 0
            ? 0.08
            : -0.055
        ) +
        index * 0.12
      );

      ctx.beginPath();

      ctx.ellipse(
        0,
        0,
        currentRadius *
        layer,
        currentRadius *
        layer *
        (
          0.38 +
          Math.sin(
            elapsed *
            (
              0.38 +
              index * 0.025
            ) +
            index
          ) *
          0.07
        ),
        0,
        0,
        TAU
      );

      ctx.strokeStyle =
        index % 3 === 0
          ? rgba(
              colors.sunCore,
              0.34 -
              index * 0.021
            )
          : index % 3 === 1
            ? rgba(
                colors.sun,
                0.34 -
                index * 0.021
              )
            : rgba(
                colors.primary,
                0.34 -
                index * 0.021
              );

      ctx.lineWidth =
        Math.max(
          1,
          currentRadius *
          (
            0.05 -
            index * 0.002
          )
        );

      ctx.stroke();
      ctx.restore();
    }

    ctx.beginPath();

    ctx.ellipse(
      0,
      0,
      currentRadius * 0.62,
      currentRadius * 0.25,
      0,
      0,
      TAU
    );

    ctx.fillStyle =
      "#000000";

    ctx.fill();

    ctx.beginPath();

    ctx.ellipse(
      0,
      0,
      currentRadius * 1.1,
      currentRadius * 0.16,
      0,
      0,
      TAU
    );

    ctx.strokeStyle =
      rgba(
        colors.sunCore,
        0.62
      );

    ctx.lineWidth =
      Math.max(
        2,
        currentRadius * 0.055
      );

    ctx.stroke();

    ctx.restore();
  }

  function drawPanel(
    x,
    y,
    panelWidth,
    panelHeight
  ) {
    ctx.fillStyle =
      colors.panel;

    ctx.fillRect(
      x,
      y,
      panelWidth,
      panelHeight
    );

    ctx.strokeStyle =
      rgba(
        colors.primary,
        0.9
      );

    ctx.lineWidth = 1;

    ctx.strokeRect(
      x,
      y,
      panelWidth,
      panelHeight
    );

    ctx.beginPath();

    ctx.moveTo(
      x +
      panelWidth / 2,
      y
    );

    ctx.lineTo(
      x +
      panelWidth / 2,
      y +
      panelHeight
    );

    ctx.moveTo(
      x,
      y +
      panelHeight / 2
    );

    ctx.lineTo(
      x +
      panelWidth,
      y +
      panelHeight / 2
    );

    ctx.strokeStyle =
      rgba(
        colors.primary,
        0.42
      );

    ctx.stroke();
  }

  function drawSignals(
    satellite
  ) {
    if (
      !settings.showSignals
    ) {
      return;
    }

    const cycle =
      (
        elapsed *
        settings.speed
      ) %
      2;

    ctx.save();

    ctx.translate(
      satellite.x,
      satellite.y
    );

    ctx.rotate(
      satellite.angle +
      Math.PI / 2
    );

    for (
      let index = 0;
      index < 3;
      index++
    ) {
      const progress =
        (
          cycle / 2 -
          index * 0.16 +
          1
        ) %
        1;

      ctx.beginPath();

      ctx.arc(
        0,
        0,
        satellite.size *
        (
          0.8 +
          progress * 2.4
        ),
        -0.8,
        0.8
      );

      ctx.strokeStyle =
        rgba(
          colors.signal,
          Math.max(
            0,
            0.65 -
            progress * 0.58
          )
        );

      ctx.lineWidth =
        2 -
        progress;

      ctx.stroke();
    }

    ctx.restore();
  }

  function drawSatellite(
    satellite
  ) {
    const size =
      satellite.size;

    ctx.save();

    ctx.translate(
      satellite.x,
      satellite.y
    );

    ctx.rotate(
      satellite.angle +
      Math.PI / 2
    );

    ctx.fillStyle =
      colors.satellite;

    ctx.fillRect(
      -size * 0.32,
      -size * 0.25,
      size * 0.64,
      size * 0.5
    );

    drawPanel(
      -size * 1.22,
      -size * 0.3,
      size * 0.78,
      size * 0.6
    );

    drawPanel(
      size * 0.44,
      -size * 0.3,
      size * 0.78,
      size * 0.6
    );

    ctx.beginPath();

    ctx.moveTo(
      0,
      -size * 0.25
    );

    ctx.lineTo(
      0,
      -size * 0.75
    );

    ctx.strokeStyle =
      colors.satellite;

    ctx.lineWidth = 1.5;
    ctx.stroke();

    circle(
      0,
      -size * 0.8,
      size * 0.1,
      colors.signal
    );

    ctx.beginPath();

    ctx.arc(
      0,
      size * 0.27,
      size * 0.3,
      0,
      Math.PI
    );

    ctx.strokeStyle =
      colors.primary;

    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
  }

  function drawISS() {
    const size =
      iss.size;

    ctx.save();

    ctx.translate(
      iss.x,
      iss.y
    );

    ctx.rotate(
      iss.angle +
      Math.PI / 2
    );

    ctx.fillStyle =
      colors.satellite;

    ctx.fillRect(
      -size * 0.85,
      -size * 0.09,
      size * 1.7,
      size * 0.18
    );

    drawPanel(
      -size * 1.9,
      -size * 0.52,
      size * 0.82,
      size * 0.42
    );

    drawPanel(
      -size * 1.9,
      size * 0.1,
      size * 0.82,
      size * 0.42
    );

    drawPanel(
      size * 1.08,
      -size * 0.52,
      size * 0.82,
      size * 0.42
    );

    drawPanel(
      size * 1.08,
      size * 0.1,
      size * 0.82,
      size * 0.42
    );

    ctx.beginPath();

    ctx.moveTo(
      -size * 1.08,
      -size * 0.62
    );

    ctx.lineTo(
      -size * 1.08,
      size * 0.62
    );

    ctx.moveTo(
      size * 1.08,
      -size * 0.62
    );

    ctx.lineTo(
      size * 1.08,
      size * 0.62
    );

    ctx.strokeStyle =
      colors.satellite;

    ctx.lineWidth =
      Math.max(
        1,
        size * 0.05
      );

    ctx.stroke();

    for (
      let index = -2;
      index <= 2;
      index++
    ) {
      ctx.beginPath();

      ctx.ellipse(
        index *
        size *
        0.34,
        0,
        size * 0.2,
        size * 0.14,
        0,
        0,
        TAU
      );

      ctx.fillStyle =
        index === 0
          ? colors.primaryBright
          : colors.satellite;

      ctx.fill();
    }

    ctx.restore();
  }

  function launchRocket() {
    if (
      settings.planetType !==
      "earth"
    ) {
      return;
    }

    const angle =
      -2.25 +
      Math.random() *
      0.85;

    rockets.push({
      x:
        scene.x +
        Math.cos(angle) *
        scene.radius *
        0.94,

      y:
        scene.y +
        Math.sin(angle) *
        scene.radius *
        0.94,

      vx:
        Math.cos(angle) *
        (
          32 +
          Math.random() *
          13
        ),

      vy:
        Math.sin(angle) *
        (
          32 +
          Math.random() *
          13
        ),

      angle,
      age: 0,

      duration:
        4.2 +
        Math.random() *
        1.2,

      size:
        clamp(
          scene.radius *
          0.055,
          6,
          12
        )
    });

    if (
      rockets.length >
      MAX_ROCKETS
    ) {
      rockets.shift();
    }
  }

  function updateRockets(dt) {
    if (
      settings.planetType !==
      "earth"
    ) {
      rockets.length = 0;
      rocketTimer = 1.5;
      return;
    }

    rocketTimer -= dt;

    if (
      rocketTimer <= 0
    ) {
      launchRocket();

      rocketTimer =
        3.2 +
        Math.random() *
        3.5;
    }

    for (
      let index =
        rockets.length - 1;
      index >= 0;
      index--
    ) {
      const rocket =
        rockets[index];

      rocket.age += dt;

      const drag =
        Math.pow(
          0.994,
          dt * 60
        );

      rocket.vx *= drag;
      rocket.vy *= drag;

      rocket.x +=
        rocket.vx * dt;

      rocket.y +=
        rocket.vy * dt;

      rocket.angle =
        Math.atan2(
          rocket.vy,
          rocket.vx
        );

      if (
        rocket.age >=
        rocket.duration
      ) {
        rockets.splice(
          index,
          1
        );
      }
    }
  }

  function drawRocketShape(
    x,
    y,
    angle,
    size,
    opacity,
    braking = false
  ) {
    ctx.save();

    ctx.translate(
      x,
      y
    );

    ctx.rotate(
      angle +
      Math.PI / 2
    );

    ctx.globalAlpha =
      opacity;

    ctx.beginPath();

    ctx.moveTo(
      -size * 0.24,
      size * 0.44
    );

    ctx.lineTo(
      0,
      size *
      (
        braking
          ? 0.95
          : 1.35 +
            Math.sin(
              elapsed * 24
            ) *
            0.15
      )
    );

    ctx.lineTo(
      size * 0.24,
      size * 0.44
    );

    ctx.closePath();

    ctx.fillStyle =
      colors.sun;

    ctx.fill();

    ctx.beginPath();

    ctx.moveTo(
      0,
      -size
    );

    ctx.quadraticCurveTo(
      size * 0.45,
      -size * 0.35,
      size * 0.32,
      size * 0.48
    );

    ctx.lineTo(
      -size * 0.32,
      size * 0.48
    );

    ctx.quadraticCurveTo(
      -size * 0.45,
      -size * 0.35,
      0,
      -size
    );

    ctx.fillStyle =
      colors.satellite;

    ctx.fill();

    circle(
      0,
      -size * 0.33,
      size * 0.16,
      colors.primary
    );

    ctx.beginPath();

    ctx.moveTo(
      -size * 0.3,
      size * 0.12
    );

    ctx.lineTo(
      -size * 0.66,
      size * 0.62
    );

    ctx.lineTo(
      -size * 0.25,
      size * 0.43
    );

    ctx.closePath();

    ctx.moveTo(
      size * 0.3,
      size * 0.12
    );

    ctx.lineTo(
      size * 0.66,
      size * 0.62
    );

    ctx.lineTo(
      size * 0.25,
      size * 0.43
    );

    ctx.closePath();

    ctx.fillStyle =
      colors.primary;

    ctx.fill();

    ctx.restore();

    ctx.globalAlpha = 1;
  }

  function drawRockets() {
    if (
      settings.planetType !==
      "earth"
    ) {
      return;
    }

    for (
      const rocket of rockets
    ) {
      const opacity =
        clamp(
          1 -
          rocket.age /
          rocket.duration,
          0,
          1
        );

      drawRocketShape(
        rocket.x,
        rocket.y,
        rocket.angle,
        rocket.size,
        opacity,
        false
      );
    }
  }

  function startTransferRocket() {
    const earth =
      miniaturePlanets[2];

    transferRocket.state =
      "flight";

    transferRocket.progress = 0;

    transferRocket.duration =
      7 /
      Math.max(
        0.55,
        settings.speed
      );

    transferRocket.startX =
      earth.x;

    transferRocket.startY =
      earth.y;

    transferRocket.endX =
      scene.x -
      scene.radius * 0.68;

    transferRocket.endY =
      scene.y -
      scene.radius * 0.68;

    transferRocket.controlX =
      (
        earth.x +
        scene.x
      ) /
      2 +
      width * 0.12;

    transferRocket.controlY =
      Math.min(
        earth.y,
        scene.y
      ) -
      height * 0.25;

    transferRocket.x =
      transferRocket.startX;

    transferRocket.y =
      transferRocket.startY;

    transferRocket.previousX =
      transferRocket.x;

    transferRocket.previousY =
      transferRocket.y;

    transferRocket.size =
      clamp(
        scene.radius *
        0.045,
        5,
        9
      );

    transferRocket.opacity = 1;
  }

  function updateTransferRocket(dt) {
    if (
      settings.planetType !==
      "mars"
    ) {
      resetTransferRocket();
      return;
    }

    if (
      transferRocket.state ===
      "waiting"
    ) {
      transferRocket.timer -= dt;

      if (
        transferRocket.timer <= 0
      ) {
        startTransferRocket();
      }

      return;
    }

    if (
      transferRocket.state ===
      "landed"
    ) {
      transferRocket.timer -= dt;

      if (
        transferRocket.timer <= 0
      ) {
        transferRocket.state =
          "waiting";

        transferRocket.timer = 4;
      }

      return;
    }

    transferRocket.progress +=
      dt /
      transferRocket.duration;

    const t =
      smoothStep(
        transferRocket.progress
      );

    const inverse =
      1 -
      t;

    transferRocket.previousX =
      transferRocket.x;

    transferRocket.previousY =
      transferRocket.y;

    transferRocket.endX =
      scene.x -
      scene.radius * 0.68;

    transferRocket.endY =
      scene.y -
      scene.radius * 0.68;

    transferRocket.x =
      inverse *
      inverse *
      transferRocket.startX +
      2 *
      inverse *
      t *
      transferRocket.controlX +
      t *
      t *
      transferRocket.endX;

    transferRocket.y =
      inverse *
      inverse *
      transferRocket.startY +
      2 *
      inverse *
      t *
      transferRocket.controlY +
      t *
      t *
      transferRocket.endY;

    transferRocket.angle =
      Math.atan2(
        transferRocket.y -
        transferRocket.previousY,
        transferRocket.x -
        transferRocket.previousX
      );

    transferRocket.opacity =
      transferRocket.progress <
      0.94
        ? 1
        : clamp(
            (
              1 -
              transferRocket.progress
            ) /
            0.06,
            0,
            1
          );

    if (
      transferRocket.progress >= 1
    ) {
      transferRocket.state =
        "landed";

      transferRocket.timer = 3;

      if (
        settings.showMarsBase
      ) {
        marsBase.visible = true;
      }
    }
  }

  function drawTransferRocket() {
    if (
      settings.planetType !==
      "mars" ||
      transferRocket.state !==
      "flight"
    ) {
      return;
    }

    ctx.beginPath();

    ctx.moveTo(
      transferRocket.previousX,
      transferRocket.previousY
    );

    ctx.lineTo(
      transferRocket.x,
      transferRocket.y
    );

    ctx.strokeStyle =
      rgba(
        colors.sun,
        0.34 *
        transferRocket.opacity
      );

    ctx.lineWidth =
      transferRocket.size *
      0.42;

    ctx.lineCap =
      "round";

    ctx.stroke();

    drawRocketShape(
      transferRocket.x,
      transferRocket.y,
      transferRocket.angle,
      transferRocket.size,
      transferRocket.opacity,
      transferRocket.progress >
      0.78
    );
  }

  function beginAlienEvent(ship) {
    ship.active = true;
    ship.mode = "arrive";
    ship.progress = 0;

    ship.duration =
      1.8 +
      Math.random() *
      1.2;

    ship.stay =
      4 +
      Math.random() *
      5;

    ship.orbitAngle =
      Math.random() *
      TAU;

    ship.warpX =
      Math.random() < 0.5
        ? -width * 0.18
        : width * 1.18;

    ship.warpY =
      height *
      (
        0.22 +
        Math.random() *
        0.48
      );

    ship.size =
      clamp(
        scene.radius *
        (
          0.09 +
          Math.random() *
          0.035
        ),
        12,
        24
      );

    ship.alpha = 0;
  }

  function updateAlienFleet(dt) {
    if (
      settings.planetType !==
      "jupiter"
    ) {
      resetAlienFleet();
      return;
    }

    for (
      const ship of
      alienFleet
    ) {
      if (
        !ship.active
      ) {
        ship.delay -= dt;

        if (
          ship.delay <= 0
        ) {
          beginAlienEvent(
            ship
          );
        }

        continue;
      }

      if (
        ship.mode ===
        "arrive"
      ) {
        ship.progress +=
          dt /
          ship.duration;

        const t =
          easeOutCubic(
            ship.progress
          );

        const targetX =
          scene.x +
          Math.cos(
            ship.orbitAngle
          ) *
          scene.radius *
          1.7;

        const targetY =
          scene.y +
          Math.sin(
            ship.orbitAngle
          ) *
          scene.radius *
          0.72;

        ship.x =
          ship.warpX +
          (
            targetX -
            ship.warpX
          ) *
          t;

        ship.y =
          ship.warpY +
          (
            targetY -
            ship.warpY
          ) *
          t -
          Math.sin(
            t *
            Math.PI
          ) *
          scene.radius *
          0.45;

        ship.angle =
          Math.atan2(
            targetY -
            ship.y,
            targetX -
            ship.x
          );

        ship.alpha =
          clamp(
            ship.progress * 4,
            0,
            1
          );

        if (
          ship.progress >= 1
        ) {
          ship.mode =
            "orbit";

          ship.progress = 0;
        }
      } else if (
        ship.mode ===
        "orbit"
      ) {
        ship.stay -= dt;

        ship.orbitAngle +=
          dt *
          settings.speed *
          0.36;

        ship.x =
          scene.x +
          Math.cos(
            ship.orbitAngle
          ) *
          scene.radius *
          1.7;

        ship.y =
          scene.y +
          Math.sin(
            ship.orbitAngle
          ) *
          scene.radius *
          0.72;

        ship.angle =
          ship.orbitAngle +
          Math.PI / 2;

        ship.alpha = 1;

        if (
          ship.stay <= 0
        ) {
          ship.mode =
            "depart";

          ship.progress = 0;

          ship.warpX =
            ship.x <
            scene.x
              ? -width * 0.2
              : width * 1.2;

          ship.warpY =
            height *
            (
              0.15 +
              Math.random() *
              0.7
            );
        }
      } else {
        ship.progress +=
          dt /
          ship.duration;

        const t =
          easeInCubic(
            ship.progress
          );

        const startX =
          scene.x +
          Math.cos(
            ship.orbitAngle
          ) *
          scene.radius *
          1.7;

        const startY =
          scene.y +
          Math.sin(
            ship.orbitAngle
          ) *
          scene.radius *
          0.72;

        ship.x =
          startX +
          (
            ship.warpX -
            startX
          ) *
          t;

        ship.y =
          startY +
          (
            ship.warpY -
            startY
          ) *
          t -
          Math.sin(
            t *
            Math.PI
          ) *
          scene.radius *
          0.38;

        ship.angle =
          Math.atan2(
            ship.warpY -
            ship.y,
            ship.warpX -
            ship.x
          );

        ship.alpha =
          clamp(
            (
              1 -
              ship.progress
            ) *
            3,
            0,
            1
          );

        if (
          ship.progress >= 1
        ) {
          ship.active = false;

          ship.delay =
            4 +
            Math.random() *
            8;
        }
      }
    }
  }

  function drawAlienShip(ship) {
    if (
      !ship.active ||
      ship.alpha <= 0
    ) {
      return;
    }

    const size =
      ship.size;

    ctx.save();

    ctx.translate(
      ship.x,
      ship.y
    );

    ctx.rotate(
      ship.angle +
      Math.PI / 2
    );

    ctx.globalAlpha =
      ship.alpha;

    if (
      ship.mode !==
      "orbit"
    ) {
      const intensity =
        Math.sin(
          clamp(
            ship.progress,
            0,
            1
          ) *
          Math.PI
        );

      ctx.beginPath();

      ctx.moveTo(
        -size * 0.3,
        size * 0.35
      );

      ctx.lineTo(
        0,
        size *
        (
          5 +
          intensity * 4
        )
      );

      ctx.lineTo(
        size * 0.3,
        size * 0.35
      );

      ctx.closePath();

      ctx.fillStyle =
        rgba(
          colors.signal,
          0.4 *
          intensity
        );

      ctx.fill();
    }

    ctx.beginPath();

    ctx.moveTo(
      0,
      -size
    );

    ctx.lineTo(
      size * 0.88,
      size * 0.5
    );

    ctx.lineTo(
      size * 0.28,
      size * 0.34
    );

    ctx.lineTo(
      0,
      size * 0.72
    );

    ctx.lineTo(
      -size * 0.28,
      size * 0.34
    );

    ctx.lineTo(
      -size * 0.88,
      size * 0.5
    );

    ctx.closePath();

    ctx.fillStyle =
      colors.ufoMetal;

    ctx.fill();

    ctx.strokeStyle =
      rgba(
        colors.primaryBright,
        0.62
      );

    ctx.lineWidth =
      Math.max(
        1,
        size * 0.06
      );

    ctx.stroke();

    ctx.beginPath();

    ctx.ellipse(
      0,
      -size * 0.18,
      size * 0.3,
      size * 0.42,
      0,
      0,
      TAU
    );

    ctx.fillStyle =
      rgba(
        colors.ufoGlass,
        0.82
      );

    ctx.fill();

    ctx.restore();

    ctx.globalAlpha = 1;
  }

  function drawOrbitLines() {
    if (
      settings.showMoon
    ) {
      for (
        let index = 0;
        index <
        settings.moonCount;
        index++
      ) {
        drawOrbit(
          scene.x,
          scene.y,
          moons[index].orbitX,
          moons[index].orbitY,
          0.18 -
          index * 0.025
        );
      }

      drawOrbit(
        moons[0].x,
        moons[0].y,
        moons[0].radius * 2.2,
        moons[0].radius * 0.92,
        0.2
      );
    }

    if (
      settings.showSatellite
    ) {
      for (
        let index = 0;
        index <
        settings.satelliteCount;
        index++
      ) {
        drawOrbit(
          scene.x,
          scene.y,
          satellites[index].orbitX,
          satellites[index].orbitY,
          0.13 -
          index * 0.02
        );
      }
    }

    if (
      settings.planetType ===
      "earth" &&
      settings.showISS
    ) {
      drawOrbit(
        scene.x,
        scene.y,
        iss.orbitX,
        iss.orbitY,
        0.11
      );
    }
  }

  function drawFarObjects() {
    if (
      settings.showMoon
    ) {
      for (
        let index = 0;
        index <
        settings.moonCount;
        index++
      ) {
        if (
          Math.sin(
            moons[index].angle
          ) < 0
        ) {
          drawMoon(
            moons[index]
          );
        }
      }

      if (
        Math.sin(
          moons[0].angle
        ) < 0
      ) {
        drawUfo();
      }
    }

    if (
      settings.showSatellite
    ) {
      for (
        let index = 0;
        index <
        settings.satelliteCount;
        index++
      ) {
        const satellite =
          satellites[index];

        if (
          Math.sin(
            satellite.angle
          ) < 0
        ) {
          drawSignals(
            satellite
          );

          drawSatellite(
            satellite
          );
        }
      }
    }

    if (
      settings.planetType ===
      "earth" &&
      settings.showISS &&
      Math.sin(
        iss.angle
      ) < 0
    ) {
      drawISS();
    }

    if (
      settings.planetType ===
      "jupiter"
    ) {
      for (
        const ship of
        alienFleet
      ) {
        if (
          ship.active &&
          ship.y <
          scene.y
        ) {
          drawAlienShip(
            ship
          );
        }
      }
    }
  }

  function drawNearObjects() {
    if (
      settings.showMoon
    ) {
      for (
        let index = 0;
        index <
        settings.moonCount;
        index++
      ) {
        if (
          Math.sin(
            moons[index].angle
          ) >= 0
        ) {
          drawMoon(
            moons[index]
          );
        }
      }

      if (
        Math.sin(
          moons[0].angle
        ) >= 0
      ) {
        drawUfo();
      }
    }

    if (
      settings.showSatellite
    ) {
      for (
        let index = 0;
        index <
        settings.satelliteCount;
        index++
      ) {
        const satellite =
          satellites[index];

        if (
          Math.sin(
            satellite.angle
          ) >= 0
        ) {
          drawSignals(
            satellite
          );

          drawSatellite(
            satellite
          );
        }
      }
    }

    if (
      settings.planetType ===
      "earth" &&
      settings.showISS &&
      Math.sin(
        iss.angle
      ) >= 0
    ) {
      drawISS();
    }

    if (
      settings.planetType ===
      "jupiter"
    ) {
      for (
        const ship of
        alienFleet
      ) {
        if (
          ship.active &&
          ship.y >=
          scene.y
        ) {
          drawAlienShip(
            ship
          );
        }
      }
    }
  }

  function updateNormalScene(dt) {
    updateScene();
    updateSun();
    updateMiniaturePlanets();
    updateOrbitObjects();

    updateSolarFlare(dt);
    updateRockets(dt);
    updateTransferRocket(dt);
    updateMarsBase(dt);
    updateAlienFleet(dt);
  }

  function renderNormalScene() {
    drawBackground();
    drawStars();
    drawMiniatureSystem();

    if (
      settings.planetType ===
      "saturn"
    ) {
      drawWormhole();
    }

    drawOrbitLines();
    drawFarObjects();
    drawPlanetBackLayer();
    drawPlanet();
    drawPlanetFrontLayer();
    drawRockets();
    drawTransferRocket();
    drawNearObjects();
  }

  function update(dt) {
    elapsed += dt;

    offsetX +=
      (
        targetOffsetX -
        offsetX
      ) *
      Math.min(
        1,
        dt * 4
      );

    if (
      settings.planetType ===
      "gargantua"
    ) {
      updateGargantuaLayout();
      updateGargantuaSequence(dt);
    } else {
      updateNormalScene(dt);
    }
  }

  function render() {
    if (
      settings.planetType ===
      "gargantua"
    ) {
      drawGargantuaSequence();
    } else {
      renderNormalScene();
    }
  }

  function frame(now) {
    frameScheduled = false;

    if (paused) {
      return;
    }

    if (!lastTime) {
      lastTime = now;
    }

    const dt =
      Math.min(
        (
          now -
          lastTime
        ) /
        1000,
        0.1
      );

    lastTime = now;

    update(dt);
    render();
    requestFrame();
  }

  function requestFrame() {
    if (
      paused ||
      frameScheduled
    ) {
      return;
    }

    frameScheduled = true;

    requestAnimationFrame(
      frame
    );
  }

  function pause() {
    paused = true;
    lastTime = 0;
  }

  function resume() {
    paused = false;
    lastTime = 0;

    requestFrame();
  }

  function applyMetadata(metadata) {
    latestMetadata =
      metadata ||
      latestMetadata;

    if (
      latestMetadata &&
      latestMetadata.battery &&
      typeof
      latestMetadata.battery
        .isCharging ===
      "boolean"
    ) {
      isCharging =
        latestMetadata.battery
          .isCharging;
    }

    loadSettings();

    updateColors(
      latestMetadata
    );
  }

  window.addEventListener(
    "wallpaperEngineReady",
    event => {
      applyMetadata(
        event.detail
      );

      resume();
    }
  );

  window.addEventListener(
    "wallpaperUpdate",
    event => {
      applyMetadata(
        event.detail
      );
    }
  );

  window.addEventListener(
    "wallpaperThemeChange",
    event => {
      applyMetadata(
        event.detail
      );
    }
  );

  window.addEventListener(
    "wallpaperCharging",
    event => {
      applyMetadata(
        event.detail
      );

      if (
        settings.planetType !==
        "gargantua"
      ) {
        solarFlareTimer =
          Math.min(
            solarFlareTimer,
            1.5
          );
      }
    }
  );

  window.addEventListener(
    "wallpaperDischarging",
    event => {
      applyMetadata(
        event.detail
      );
    }
  );

  window.addEventListener(
    "wallpaperPause",
    pause
  );

  window.addEventListener(
    "wallpaperResume",
    resume
  );

  window.addEventListener(
    "wallpaperScreenOff",
    pause
  );

  window.addEventListener(
    "wallpaperScreenOn",
    event => {
      applyMetadata(
        event.detail
      );

      resume();
    }
  );

  window.addEventListener(
    "wallpaperOffset",
    event => {
      const value =
        Number(
          event.detail &&
          event.detail.xOffset
        );

      if (
        Number.isFinite(value)
      ) {
        targetOffsetX =
          (
            value -
            0.5
          ) *
          2;
      }
    }
  );

  window.addEventListener(
    "resize",
    () => {
      resize();

      if (
        settings.planetType ===
        "gargantua"
      ) {
        updateGargantuaLayout();
      } else {
        updateScene();
        updateSun();
        updateMiniaturePlanets();
        updateOrbitObjects();
      }
    }
  );

  resize();
  loadSettings();

  if (
    window.WallpaperEngine
  ) {
    try {
      latestMetadata =
        window.WallpaperEngine
          .getMetadata();
    } catch (error) {
      latestMetadata = null;
    }
  }

  applyMetadata(
    latestMetadata
  );

  if (
    settings.planetType ===
    "gargantua"
  ) {
    updateGargantuaLayout();
    resetGargantuaSequence();
  } else {
    updateScene();
    updateSun();
    updateMiniaturePlanets();
    updateOrbitObjects();
  }

  requestFrame();
})();
