# Application de Gestion des Tickets & Notifications  

## Description

Cette application permet de gérer des **tickets** avec des priorités et de notifier les utilisateurs via **Discord et notifications desktop** lorsqu’un ticket atteint sa **deadline**.  
Elle inclut également un **système de filtres collants**, des boutons de navigation rapide et un suivi en temps réel des tickets.


---

## Fonctionnalités

✔ **Création de tickets** avec une priorité et une date de création  
✔ **Calcul intelligent des deadlines** basé sur les priorités et les horaires de travail  
✔ **Notifications automatiques** (Desktop + Discord) lorsque la deadline approche  
✔ **Filtres collants** pour toujours voir les critères de recherche  
✔ **Boutons de navigation rapide** (flèches pour remonter et descendre la page)  
✔ **Suppression de tickets** directement depuis l’interface  

---

## Technologies utilisées

- **Frontend** : React, Tailwind CSS  
- **Backend** : Node.js, Express  
- **Base de données** : MongoDB  
- **Notifications** : Notifications Web API, Discord Bot  

---

## Installation et configuration

### Prérequis
- **Node.js** installé  
- **MongoDB** installé ou accessible via un service cloud  
- Un **serveur Discord** avec un bot configuré  

### Étapes d'installation

1. Clonez le dépôt :
   ```bash
   git clone https://github.com/RomainMarcelli/App_Collab.git
   cd votre-repo
