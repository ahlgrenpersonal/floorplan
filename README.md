# Floorplan

Floorplan is a small iPhone-oriented PWA for checking whether furniture fits in the attached apartment floor plan.

## What is included

- The real dimensioned floor-plan image as the visual map, with hidden fit zones used only for placement and warnings.
- Real-size presets for beds, a crib, sofa, TV stand, nightstands, dresser, dining tables, chair, stroller, scooters, and coffee table.
- Drag, rotate, duplicate, and delete controls using real-world feet coordinates.
- Clear-layout control for quick retries.
- Offline PWA support through `sw.js`.

## Run

Open `index.html` directly for a quick look, or serve the folder locally so PWA service-worker behavior works:

```powershell
python -m http.server 8080
```

Then open `http://localhost:8080`.

On iPhone, open the served URL in Safari and use Share -> Add to Home Screen.
