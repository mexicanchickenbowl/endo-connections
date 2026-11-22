/* Sample 23 — shared timeline + grid constants (seconds). Everything is a pure function of t. */
export const GW = 36, GH = 27;            // schematic pixel grid of the chip (real sensors: > 10^6 pixels)
export const AW = 3.4, AD = 2.55;         // active area in world units (4:3), schematic

export const T = {
  dur: 24.0,
  hook: [0, 1.7],                         // intact sensor, title
  explode: [1.55, 3.15],                  // layers separate, camera pulls back to the teardown view
  monitorIn: [1.75, 3.1],                 // the small screen slides in below the stack
  names: 2.2,                             // layer names stagger in from here
  scint: 3.4,                             // 02 expands; flashes in the scintillator
  fop: 4.6,                               // 03 expands; light is shown crossing the fiber-optic plate
  cmos: 5.8,                              // 04 expands; light reaches the chip, wells start to fill
  cmos2: 6.75,                            // second line: a transistor at every pixel
  exposeEnd: 7.9,                         // last X-ray dart lands
  ghostOut: [8.0, 8.5],                   // ghost teeth fade
  adc: 8.2,                               // 05 expands
  read: [8.45, 10.35],                    // row-by-row read-out of the chip
  lag: 0.4,                               // chip -> screen delay
  img: 9.0,                               // 06 expands
  refine: [10.75, 11.15],                 // coarse blocks -> smooth image
  poster: 11.35,
  labelsOut: 11.6,
  sensorOut: [11.6, 12.4],                // sensor closes and leaves, PSP rig arrives
  pspIn: [11.75, 12.55],
  pspTitle: 12.2,
  pspExpose: [12.65, 13.65],              // X-rays -> trapped electrons (latent image)
  pspScan: [13.8, 15.4],                  // red laser line scan, blue-violet light -> photomultiplier
  carriageOut: [15.4, 15.9],
  eraseLabel: 15.2,
  eraseIn: [15.4, 15.9],                  // erase lamp (ring light) comes down
  eraseGlow: [15.85, 16.8],
  eraseDots: [16.0, 16.55],               // residual trapped electrons cleared
  pspOut: 17.05,                          // PSP labels fade
  family: [17.1, 17.9],                   // both detectors together
  endText: [17.85, 23.3],
  loop: [23.25, 24.0],                    // back to the hero pose
};
