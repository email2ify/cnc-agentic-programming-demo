# CNC Agentic Programming Demo

An educational interview demonstration of a drawing-to-CNC turning workflow. It combines CAD evidence, FANUC-compatible training programs, fetched NC text, STL-based component views and an original browser-generated training-lathe scene.

## Local startup

From the repository root, run:

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000/`. A static HTTP server is required because the page fetches local NC files and STL assets.

## GitHub Pages deployment

Push the repository to GitHub, then open **Settings -> Pages**. Select **Deploy from a branch**, choose `main` and the `/ (root)` folder, and save. GitHub Pages will publish the static `index.html` site at the repository Pages URL.

## Repository structure

- `cad/exports/`: STEP and STL CAD evidence
- `programs/fanuc/`: FANUC training NC programs
- `simulation/`: profile simulation NC program
- `documentation/`: drawing analysis, machining plan, cutting data and Fusion workflow
- `web/`: CSS and ES-module Three.js application code

## Workflow

1. Analyse the drawing and assumptions.
2. Build the turning profile in Fusion 360 and export evidence.
3. Prepare a controller-specific FANUC candidate in diameter programming mode.
4. Review the fetched program line by line in the browser digital twin.
5. Complete controller and machine-side verification before any physical use.

The Mori Seiki option remains a placeholder because the exact MAPPS, FANUC or Mitsubishi controller has not been confirmed. FANUC syntax shown here is a training candidate, not a universal Mori Seiki program.

## Safety

This project is not machine approved. The browser view is a deterministic educational approximation. It does not certify controller behavior, calculate collisions, remove material, verify offsets or replace qualified CNC supervision. See [documentation/digital-twin-limitations.md](documentation/digital-twin-limitations.md).

## Interview demonstration sequence

Show the status strip, switch between finished part, raw stock, compare and machine view, select the FANUC program, step through blocks, call out the highlighted controller cycles, then explain the verification boundary and safety checks required before prove-out.
