/* Sample 23 — shared timeline + grid constants (seconds). Everything is a pure function of t. */
export const GW = 36, GH = 27;            // schematic pixel grid of the chip (real sensors: > 10^6 pixels)

export const T = {
  dur: 23.8,
  hook: [0, 1.9],                         // intact sensor, title
  explode: [1.75, 3.45],                  // layers separate, camera drops to the teardown view
  names: 2.45,                            // layer names stagger in from here
  scint: 3.75,                            // label 02 expands; light is shown leaving the scintillator
  fop: 5.15,                              // label 03 expands; light is shown crossing the fiber-optic plate
  cmos: 6.45,                             // label 04 expands; light reaches the chip, wells start to fill
  cmos2: 7.45,                            // second line: a transistor at every pixel
  exposeEnd: 8.75,                        // last X-ray dart leaves
  adc: 9.2,                               // label 05 expands
  read: [9.45, 11.55],                    // row-by-row read-out of the chip
  lag: 0.2,                               // chip -> screen delay
  img: 10.1,                              // label 06 expands
  refine: [11.8, 12.2],                   // coarse blocks -> smooth image
  sensorOut: [12.75, 13.6],               // sensor closes and leaves, PSP exhibit arrives
  pspIn: [12.95, 13.8],
  pspExpose: [13.95, 15.0],               // X-rays -> trapped electrons (latent image)
  pspScan: [15.1, 16.8],                  // red laser raster, blue-violet light -> photomultiplier
  pspErase: [16.9, 18.4],                 // bright light clears the plate
  pspOut: 18.95,                          // PSP labels fade
  family: [19.0, 19.9],                   // both detectors side by side
  endText: [19.85, 23.1],
  loop: [23.05, 23.8],                    // back to the hero pose
};
