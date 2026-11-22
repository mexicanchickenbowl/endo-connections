/* Sample 23 — shared timeline + grid constants (seconds). Everything is a pure function of t. */
export const GW = 36, GH = 27;            // schematic pixel grid of the chip (real sensors: > 10^6 pixels)
export const AW = 3.4, AD = 2.55;         // active area in world units (4:3), schematic

export const T = {
  dur: 24.0,
  hook: [0, 1.95],                        // intact sensor, title (title fades 1.65-2.0)
  explode: [1.55, 3.15],                  // layers separate, camera pulls back to the teardown view
  names: 2.4,                             // layer names stagger in from here
  scint: 3.4,                             // 02 expands; flashes in the scintillator
  fop: 4.6,                               // 03 expands; light is shown crossing the fiber-optic plate
  cmos: 5.8,                              // 04 expands; light reaches the chip, wells start to fill
  cmos2: 6.75,                            // second line: transistors in every pixel
  monitorIn: [7.65, 8.55],                // the small screen slides in (standby) as the read-out beat starts
  exposeEnd: 7.9,                         // last X-ray dart lands
  ghostOut: [8.0, 8.5],                   // ghost teeth fade
  adc: 8.2,                               // 05 expands
  read: [8.45, 10.35],                    // row-by-row read-out of the chip
  lag: 0.4,                               // chip -> screen delay
  img: 9.0,                               // 06 expands
  refine: [10.75, 11.15],                 // coarse blocks -> smooth image
  poster: 12.0,                           // complete labeled teardown, held 11.15-12.65
  labelsOut: 12.65,
  sensorOut: [12.65, 13.45],              // sensor closes and leaves, PSP plate on the scanner bed arrives
  pspIn: [12.8, 13.6],
  pspTitle: 13.25,
  pspExpose: [13.65, 14.55],              // X-rays -> trapped electrons (latent image); no read-out hardware in view
  carriageIn: [14.5, 14.95],              // laser + light guide + photomultiplier slide in only now
  pspScan: [14.95, 16.4],                 // red laser line scan, blue-violet light -> photomultiplier
  pspOut: 17.05,                          // PSP labels fade
  family: [17.1, 17.9],                   // scanner + screen leave together, then both detectors side by side
  endText: [17.8, 23.35],
  loop: [23.3, 24.0],                     // back to the hero pose
};
