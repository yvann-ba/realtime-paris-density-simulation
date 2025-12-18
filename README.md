# Paris Affluence 3D - Cloud Heatmap Visualization 🗼

Une visualisation web 3D interactive de la ville de Paris avec une heatmap en forme de nuages colorés représentant la densité d'affluence par zone.

![Paris Traffic Visualization](https://via.placeholder.com/800x400?text=Paris+3D+Traffic+Visualization)

## ✨ Fonctionnalités

- 🗺️ **Carte 3D** avec bâtiments extrudés (Mapbox GL JS)
- 🔷 **Hexagones H3** pour l'agrégation spatiale
- ☁️ **Effet nuage** semi-transparent avec gradient de couleurs
- 🎨 **Gradient de couleurs** : bleu → vert → jaune → rouge selon la densité
- ⏰ **Contrôle temporel** : slider pour voir l'affluence par heure
- 📅 **Sélection du jour** de la semaine
- ▶️ **Animation** automatique des heures
- 📊 **Statistiques** en temps réel

## 🛠️ Technologies

- **Frontend**: Mapbox GL JS + Deck.gl
- **Backend**: Node.js + Express
- **Indexation spatiale**: H3 (Uber)
- **Données**: Mock data réaliste basé sur les patterns d'affluence parisiens

## 🚀 Installation

### Prérequis

- Node.js v18+ 
- npm ou yarn
- Un token Mapbox (gratuit) : [Créer un compte](https://account.mapbox.com/access-tokens/)

### Étapes

1. **Cloner le projet**
```bash
cd paris_busy_vizualisation
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer le token Mapbox** (optionnel, un token de demo est inclus)
```bash
# Éditer le fichier .env
MAPBOX_TOKEN=votre_token_mapbox
```

4. **Lancer le serveur**
```bash
npm start
```

5. **Ouvrir dans le navigateur**
```
http://localhost:3000
```

## 📁 Structure du Projet

```
paris_busy_vizualisation/
├── frontend/
│   ├── index.html          # Page principale
│   ├── css/
│   │   └── styles.css      # Styles de l'interface
│   └── js/
│       ├── main.js         # Point d'entrée de l'app
│       ├── map.js          # Configuration Mapbox
│       ├── layers.js       # Layers Deck.gl (nuages H3)
│       ├── colorScale.js   # Gradient de couleurs
│       ├── controls.js     # Contrôles UI
│       └── dataService.js  # Gestion des données
│
├── backend/
│   ├── server.js           # Serveur Express
│   ├── routes/
│   │   └── traffic.js      # API endpoints
│   └── services/
│       ├── h3Aggregator.js      # Service H3
│       └── mockDataGenerator.js # Générateur de données
│
├── config/
│   └── mapbox.config.js    # Configuration Mapbox
│
├── .env                    # Variables d'environnement
├── package.json
└── README.md
```

## 🎮 Contrôles

| Contrôle | Description |
|----------|-------------|
| **Slider Heure** | Change l'heure affichée (0-23h) |
| **Sélecteur Jour** | Change le jour de la semaine |
| **Hauteur nuages** | Ajuste l'élévation des hexagones |
| **Transparence** | Ajuste l'opacité des nuages |
| **Bouton Animation** | Lance l'animation temporelle |

## 📊 API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/traffic?hour=14&day=5` | Données pour une heure/jour spécifique |
| `GET /api/traffic/all?day=5` | Toutes les heures d'un jour |
| `GET /api/traffic/stats` | Statistiques des données |
| `GET /api/health` | État du serveur |

## 🎨 Personnalisation

### Modifier le gradient de couleurs

Éditer `frontend/js/colorScale.js` :

```javascript
const COLOR_STOPS = [
  { value: 0, color: [41, 128, 185, 160] },   // Bleu
  { value: 50, color: [46, 204, 113, 180] },  // Vert
  { value: 100, color: [231, 76, 60, 220] }   // Rouge
];
```

### Ajouter des hotspots

Éditer `backend/services/mockDataGenerator.js` :

```javascript
const PARIS_HOTSPOTS = [
  { name: 'Mon Lieu', lat: 48.xxx, lng: 2.xxx, basePop: 70, radius: 0.01, type: 'tourist' },
  // ...
];
```

## 🔮 Évolutions possibles

- [ ] Intégration API BestTime.app pour données réelles
- [ ] Intégration Outscraper / Google Popular Times
- [ ] Mode comparaison entre deux heures
- [ ] Export des données en GeoJSON
- [ ] Filtrage par type de lieu
- [ ] Vue satellite

## 📝 Licence

MIT License - Libre d'utilisation

---

Fait avec ❤️ pour Paris
