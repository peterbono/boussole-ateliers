# Boussole Ateliers

Site statique qui oriente vers les bons ateliers produit selon le stade de l'entreprise (idée, pré-PMF, post-PMF, scale-up, produit mature), le déclencheur et l'horizon. Trois vues : Orienter (questionnaire, parcours ordonné), Matrice (stade × phase, tableau ou cards), Bibliothèque (61 ateliers, aperçu SVG, ouverture dans FigJam, copie image ou SVG).

## Fichiers

- `index.html` : la page, styles et logique (moteur de recommandation, vues, dialog d'aperçu, copie presse-papier).
- `data.js` : le référentiel. Stades, tailles d'équipe, déclencheurs, objectifs, horizons, phases, la liste `T` des ateliers (pertinence par stade, objectifs, déclencheurs, durée, participants, livrable) et l'objet `FIGJAM` (clé du fichier FigJam communautaire et node-id de la section de chaque atelier).
- `layouts.js` : la spec de layout de chaque atelier (`columns`, `quadrant`, `canvas`, `grid`, `tree`, `flow`). Source unique pour l'aperçu du site et pour la génération des sections FigJam.
- `preview.js` : le renderer SVG des layouts (aperçu dans la page, version autonome pour le presse-papier).

## Ajouter un atelier

1. Dans `data.js`, ajouter une entrée dans `T` avec un `id` unique, la `phase`, le tableau `fit` (5 valeurs de 0 à 3 : idée, pré-PMF, post-PMF, scale-up, mature), `goals`, `triggers`, `desc`, `why`, `dur` (heures), `who`, `out`.
2. Dans `layouts.js`, ajouter une entrée `LAYOUTS[id]` avec le même `id`.
3. Quand la section FigJam existe, ajouter son node-id dans `FIGJAM.nodes[id]`.

Pas de build : ouvrir `index.html` suffit en local.

## Déploiement

Vercel, projet `boussole-ateliers`, déploiement automatique à chaque push sur `main`.
