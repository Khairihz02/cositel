# Cositel — Code source et hébergement

Export du 21 octobre 2026, version source :
`063304c67b799a3fdd854bb5ae36daa71df2a16f`

Site de référence : https://cositel-maison.neondeer13.chatgpt.site

## Ce que contient cette archive

Le code source complet de cette version, le logo Cositel validé, les cinq visuels des packagings, les styles, le catalogue, le panier, la commande, le personnalisateur de chaussons, le tableau de bord, la préparation des fichiers d’impression, les migrations SQL, les tests, les dépendances déclarées et leur fichier de verrouillage.

Les visuels de packaging sont des maquettes illustratives. Les licences fournies avec les fontes et composants restent incluses.

L’archive est un export du dépôt Git, sans dossier .git, sans node_modules, sans jeton Git ni fichier de secrets. Les sources d’origine sont conservées. Ce document complète le README technique du projet.

## Ce qui doit être transféré séparément

Cette archive de code ne constitue pas une sauvegarde des données de production. Elle ne contient pas :
- la base D1 actuelle : commandes, clients, prix et stocks saisis, réglages et personnalisations ;
- les objets R2 importés : photos réelles, logos des clients, simulations et motifs d’impression ;
- les secrets d’exécution, les comptes, le nom de domaine et les réglages d’accès de la plateforme d’origine.

Pour retrouver exactement les données du site hébergé, il faut exporter puis importer la base D1 ET le stockage R2, en conservant les clés des fichiers et les identifiants. Ne pas remplacer cette base par des données de test. Le catalogue d’initialisation n’est pas une copie des derniers prix de production.

## Architecture

- TypeScript / JavaScript, HTML et CSS.
- Vinext et Vite ; structure de routes compatible avec Next.js.
- Cloudflare Workers pour le serveur ; D1 pour la base SQL ; R2 pour les fichiers.
- Paiement à la livraison. Aucun paiement bancaire ou envoi automatique d’e-mail n’est configuré.

Ce projet n’est pas un site PHP/WordPress ni un ensemble HTML statique. Un simple dépôt des fichiers dans public_html ne permet pas de faire fonctionner le panier serveur, les commandes et la gestion. L’hébergement externe doit fournir le runtime et les stockages prévus, ou faire l’objet d’une adaptation par le développeur.

## Démarrage local pour le développeur

1. Installer une version de Node.js compatible avec package.json (Node 24 conseillé pour retrouver l’environnement d’export) et la version de pnpm déclarée dans package.json.
2. Ouvrir le dossier cositel dans un terminal.
3. Installer les dépendances : `pnpm install --frozen-lockfile`.
4. Configurer les ressources locales D1/R2 et appliquer les migrations SQL du dossier drizzle dans l’ordre, une seule fois par base neuve.
5. Lancer `pnpm dev`. Le mode portable prévoit le port 5173 ; suivre l’adresse affichée.
6. Construire avec `pnpm build`.

Ces commandes correspondent aux scripts livrés. Les identifiants de ressources présents dans vite.config.ts sont des valeurs de prévisualisation et doivent être remplacés pour une nouvelle infrastructure. La configuration d’origine .openai/hosting.json identifie le site existant ; elle n’accorde aucun accès à ses données.

## Mise en production externe : points à adapter

### Infrastructure Cloudflare
Créer dans le compte du propriétaire un Worker, une base D1 et un bucket R2. Fournir les bindings exacts `DB` et `BUCKET`, ainsi que la variable `ADMIN_EMAIL`. Renseigner les noms et identifiants des nouvelles ressources dans la configuration Cloudflare du projet. Vérifier la configuration produite par le build avant déploiement ; ne pas déployer les identifiants de prévisualisation.

Appliquer les migrations sur une base neuve, ou restaurer un export cohérent de la base existante. Transférer les objets R2 avec leurs clés d’origine si des données sont migrées. Les fichiers de personnalisation doivent rester privés.

### Authentification du tableau de bord
La version d’origine reçoit son identité gestionnaire depuis la plateforme Sites. Le contrôle se trouve dans `lib/commerce.mjs` (`isAdmin`) et utilise `oai-authenticated-user-id`, `oai-authenticated-user-email` et `ADMIN_EMAIL`.

Hors de cette plateforme, le développeur doit brancher une authentification réelle côté serveur, remplacer ou adapter ce contrôle et la route de connexion. Protéger ensemble `/admin`, `/api/admin/*` et `/admin/print/*`. Ne jamais considérer comme fiables des en-têtes d’identité envoyés librement par un navigateur. Ne pas retirer les contrôles pour contourner la connexion ; la simulation de connexion locale n’est pas une authentification de production.

### Vérification avant ouverture aux clients
Vérifier : connexion gestionnaire, prix/stock, panier, frais de livraison, commande avec référence, commande personnalisée avec fichiers, accès privé aux téléchargements et impression. La règle fonctionnelle demandée est 8 DT de livraison, gratuite dès 150 DT après remises ; les réglages effectifs proviennent de la base. Les chaussons personnalisés se commandent à partir de 100 paires.

Le transfert sur un compte d’hébergement externe n’a pas été effectué ni testé lors de cet export. Aucun compte d’hébergement, achat de domaine ou ressource payante n’a été créé.

## Repères dans les fichiers

- `lib/storefront-html.ts` : boutique, HTML et scripts intégrés.
- `lib/admin-html.ts` : interface de gestion.
- `lib/api.ts` et `lib/commerce.mjs` : API et règles commerciales.
- `public/assets/cositel.css` : charte graphique.
- `public/assets/cositel-*.png` : logo et nouveaux packagings.
- `public/assets/customizer.js`, `design-renderer.js`, `print-editor.js` : personnalisation et fichiers d’impression.
- `app/admin/print/[id]/route.ts` : préparation de l’impression.
- `db/schema.ts`, `drizzle/` : modèle et migrations SQL.
- `vite.config.ts`, `worker/index.ts`, `scripts/` : environnement et compilation.

Des noms internes « Lobby » restent volontairement pour les anciennes polices, clés de panier et migrations ; ils permettent de conserver les personnalisations et historiques. L’identité visible est Cositel.

## Contrôles de l’export

L’export provient du commit indiqué en tête de ce document. L’intégrité ZIP a été contrôlée. Les 10 tests unitaires de commerce et de préparation PNG ont passé dans l’environnement d’export :
`node --test tests/commerce.test.mjs tests/print-artwork.test.mjs`

Autres tests livrés : `node tests/integration.mjs` (nécessite les dépendances) et `node tests/shipping-ui.mjs`. Les dépendances et le build complet n’ont pas été réinstallés pour cet export de source ; les tests d’intégration et le build avaient réussi lors de la mise en ligne de cette même version.
