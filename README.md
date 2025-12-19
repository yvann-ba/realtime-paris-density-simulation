# Paris Traffic Density Simulation

An interactive 3D web visualization simulating foot traffic in Paris. This project uses mathematical models to generate realistic movement patterns based on city points of interest.

Feel free to contact me on linkedin for help or if you just want to chat about cool geospatial/AI stuff : https://www.linkedin.com/in/yvann-barbot/

I'm working on this big planetary engine thing right now : https://terra-lab.ai/


https://github.com/user-attachments/assets/126584bd-428e-4492-986f-9e259a30aac1


## Features

- **H3 Indexing**: Uses the H3 hexagonal grid system for high-performance spatial aggregation.
- **Granular Heatmap**: Generates a fluid density field with thousands of interpolated points.
- **Realistic Simulation**: Algorithms based on hotspots with temporal multipliers to simulate urban life cycles.
- **GPU Performance**: High-performance rendering using Deck.gl and Mapbox GL JS.
- **Temporal Interpolation**: Smooth transitions between hours for continuous traffic animation.

## Technologies

- **Frontend**: Mapbox GL JS, Deck.gl
- **Backend**: Node.js, Express
- **Spatial Indexing**: H3 (Uber)
- **Data**: Mathematical simulation based on Paris patterns.

## Installation

### Prerequisites

- Node.js v18+ 
- A Mapbox token

### Steps

1. **Clone the project**
```bash
git clone https://github.com/yvann-ba/realtime-paris-density-simulation.git
cd realtime-paris-density-simulation
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure Mapbox token**
Create a `.env` file at the root:
```bash
MAPBOX_TOKEN=your_mapbox_token_here
```

4. **Start the server**
```bash
npm start
```

5. **Open in browser**
```
http://localhost:3000
```

## Simulation Logic

The simulation relies on several key concepts:

1. **Hotspots**: Over 50 points of interest each with an influence radius and base intensity.
2. **Temporal Profiles**: Each location type has its own 24h and day-of-week traffic curve.
3. **Gaussian Interpolation**: Heatmap points are calculated via a Gaussian falloff function to create natural gradients.
4. **Jittering**: Random variations added to simulate the organic nature of crowds.

