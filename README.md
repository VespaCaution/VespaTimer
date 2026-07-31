# 🐝 VespaTimer v1.3

**Assistant digital pour relevés Pot-à-Mèche et triangulation de nids de frelons asiatiques**

![Version](https://img.shields.io/badge/version-1.3-gold)
![License](https://img.shields.io/badge/license-MIT-green)
![Platform](https://img.shields.io/badge/platform-GitHub%20Pages-blue)

---

## 📋 Description

VespaTimer est une application web progressive (PWA) conçue pour faciliter le travail des apiculteurs et des chasseurs de frelons asiatiques utilisant la méthode du **Pot-à-Mèche**.

L'application permet de :
- ⏱️ Chronométrer les vols de retour des frelons vers leur nid
- 🧭 Enregistrer les directions de vol (0-359°)
- 🗺️ Estimer la position du nid par triangulation sur une carte interactive
- 📊 Calculer automatiquement les moyennes et distances estimées
- 💾 Sauvegarder et exporter les données (JSON, GPX, KML,PDF)
- 📱 Fonctionner sur mobile et ordinateur 
- support multilingue
---

## 🚀 Déploiement sur GitHub Pages

### Méthode 1 : Déploiement automatique (recommandé)

1. **Créez un nouveau dépôt** sur GitHub
2. **Uploadez tous les fichiers** (index.html, manifest.json, service-worker.js, README.md)
3. Allez dans **Settings > Pages**
4. Sous "Source", sélectionnez **"main"** (ou "master")
5. Cliquez sur **Save**
6. Votre site sera disponible à l'adresse : `https://[votre-username].github.io/[nom-du-depot]/`

### Méthode 2 : Déploiement manuel

```bash
# Clonez votre dépôt
git clone https://github.com/[votre-username]/[nom-du-depot].git
cd [nom-du-depot]

# Copiez tous les fichiers dans le dossier
# Puis commitez et poussez
git add .
git commit -m "Initial VespaTimer deployment"
git push origin main
