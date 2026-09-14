# Drawing 02 — Machining Plan

## Workpiece

- Process: CNC turning
- Raw stock: Ø30 × 65 mm
- Finished component length: 50 mm
- Approximate workholding allowance: 15 mm
- Material: Cast iron, exact grade to be confirmed
- Units: Millimetres
- X programming: Diameter mode
- Work origin: X0 on spindle centreline and Z0 on finished front face

## Proposed tools

| Station | Tool | Purpose |
|---|---|---|
| T0101 | CNMG/DNMG turning tool | Facing and rough turning |
| T0202 | VNMG/DNMG finishing tool | Taper, radii and finish profile |
| T0303 | MGMN grooving tool | Ø9 relief and thread run-out |
| T0404 | 60° external threading tool | M12×1 thread |
| T0505 | Parting tool | Cut finished component from stock |

## Operation sequence

1. Load Ø30 stock and establish safe stick-out.
2. Face the right-hand end and establish Z0.
3. Rough-turn the external profile.
4. Finish the Ø24, Ø16, Ø12, Ø10 and Ø9 features.
5. Machine the taper from Ø16 to Ø10.
6. Machine the R3 and R4 transitions after geometry verification.
7. Produce the thread-relief groove.
8. Cut the M12×1 external thread.
9. Machine the C1 chamfer.
10. Inspect critical diameters and lengths.
11. Part off or reverse the component to finish the rear face.


## Provisional simulation parameters

These values are for demonstration and simulation only. Actual values must
be verified against the cast-iron grade, insert manufacturer's data and machine limits.

| Operation | Cutting speed | Feed | Radial depth |
|---|---:|---:|---:|
| Facing | 140 m/min | 0.15 mm/rev | As required |
| Rough turning | 140 m/min | 0.25 mm/rev | 1.5–2.0 mm |
| Finish turning | 160 m/min | 0.10 mm/rev | 0.2–0.4 mm |
| Grooving | 100 m/min | 0.08 mm/rev | Tool-dependent |
| M12×1 threading | 50–80 m/min | 1.00 mm/rev | Multiple passes |
| Parting | 80–100 m/min | 0.06 mm/rev | Tool-dependent |

## Safety assumptions

- Carbide inserts suitable for cast iron
- Maximum spindle speed limited with G50
- Constant surface speed enabled only after safe positioning
- Dry machining or suitable extraction preferred for cast-iron dust
- Tool offsets and insert nose radius require machine-side verification
- Program must pass graphical simulation and single-block prove-out