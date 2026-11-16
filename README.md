# Cositel — Boutique et gestion

La boutique utilise le catalogue D1. Le tableau de bord est disponible sur `/admin`, protégé par le mot de passe du secret Cloudflare `ADMIN_PASSWORD` (12 caractères minimum). Hébergement et mise en ligne : voir `DEPLOY-CLOUDFLARE.md`.

## Première utilisation

1. Ouvrir `/admin` et se connecter avec le mot de passe gestionnaire. Le catalogue initial est importé une seule fois.
2. Compléter les noms, descriptions, contenus, prix en DT et stocks. Les stocks correspondent au nombre de packs, sauf les slippers personnalisés suivis en paires.
3. Importer les photos réelles (JPG/PNG/WebP, 5 Mo maximum). Les fichiers sont stockés dans Workers KV (`lib/file-store.mjs`).
4. Définir un tarif unique de livraison en Tunisie et les informations de livraison dans Réglages.
5. Activer les commandes après validation de l’offre. L’accès public est un réglage Sites séparé ; cette version conserve l’accès privé existant.
6. Consulter Commandes pour confirmer, préparer, expédier et marquer les livraisons. Les statuts finaux sont définitifs ; l’annulation rétablit le stock suivi.

## Périmètre

- Paiement à la livraison ; pas de paiement bancaire en ligne.
- Pas d’e-mail automatique de notification. Les commandes sont dans le tableau de bord.
- Trois gammes : chaussons hôtel (packs 10 et 20, personnalisé dès 100 paires), linge de bain (Invité et Duo), coffret accueil bambou. Les nouveaux tarifs ne sont jamais inventés ; les prix déjà saisis sont conservés. Les articles sans tarif ne sont pas commandables.
- Jusqu’aux 500 commandes les plus récentes dans l’interface de gestion.
- Les photos initiales sont illustratives et signalées sur les fiches. Les images importées par le gestionnaire remplacent ces visuels.

## Vérifications

`node --test tests/commerce.test.mjs`

`node tests/integration.mjs`

La deuxième commande utilise un stockage D1/KV isolé, sans toucher aux données hébergées. Elle vérifie les droits, l’origine, le catalogue initial idempotent, les modifications, les totaux, les doublons de commandes, le stock concurrent et l’annulation.

Le site utilise le starter Sites Vinext et ses scripts de build, migrations et publication. Ne pas appliquer manuellement une migration déjà appliquée.

## Personnalisation Cositel
Les packs de 5 et 25 paires sont supprimés des listes et non commandables. Leurs références internes restent uniquement pour préserver les anciennes commandes. Les packs standards sont 10 et 20 paires, avec visuels illustratifs de boîtes kraft.

Le personnalisateur accepte un logo PNG/JPG/WebP et génère un aperçu local sur les deux slippers. Deux modes : logo importé ou texte saisi en direct, avec police, couleur, taille et position. Prix à la paire, minimum 100 paires, total immédiat et ajout au panier. Le panier permet de saisir les coordonnées et de valider une commande avec paiement à la livraison, à condition que le prix et la livraison soient configurés et les commandes activées. Les prix et promotions sont calculés côté serveur. Chaque création est liée à une seule ligne de commande et ses fichiers R2 restent privés ; ils sont consultables depuis le détail de la commande dans le tableau de bord. Les anciennes demandes de devis sont conservées dans une archive uniquement si elles existent. Aucun email automatique n’est envoyé.

La mise à jour du catalogue est idempotente. Les anciens articles remplacés restent en interne pour préserver les commandes historiques ; les articles supplémentaires sont masqués et leurs données conservées. Aucun tarif de test n’est appliqué en production. Les seules valeurs de test sont dans les tests isolés ou la base locale.

## Livraison
Règle demandée : 8 DT en dessous de 150 DT de sous-total articles, offerte dès 150 DT inclus, après réductions. Le montant est calculé au serveur et enregistré dans chaque commande. Le tarif et le seuil sont modifiables dans Réglages sans recalcul des anciennes commandes. La mise à jour initialise cette règle une seule fois et active les commandes si aucun choix d’activation n’avait été enregistré ; une désactivation explicite reste respectée. Les articles sans prix restent non commandables.

## Charte cosy et personnalisation élargie
Interface ivoire, lin et brun, accents cuivre, titres à empattements et logo existant recoloré en brun par masque CSS. Le module propose 11 styles d’écriture (dont 8 fontes locales), 16 nuances et un sélecteur de couleur libre. La taille maximale passe de 190 à 320 pixels sur le canevas de 1000 pixels ; la hauteur du logo passe de 150 à 240 pixels. Les marges vides du logo importé sont recadrées pour l’aperçu ; le fichier original est conservé. Le texte se répartit sur trois lignes au maximum et sa taille suit le curseur. Les fontes sont chargées avant de joindre l’aperçu à une commande.

## Atelier et fichiers de fabrication
Le personnalisateur s’ouvre dans un dialogue dédié : aperçu et réglages côte à côte, ou aperçu fixe au-dessus des réglages défilants sur mobile. Les cinq packagings illustratifs partagent kraft, ivoire et brun foncé, avec logos et textes agrandis. Les photos importées par le gestionnaire ne sont pas remplacées.

Chaque nouvelle création conserve le logo original si fourni, la simulation JPEG et un motif PNG isolé, transparent hors des pixels du logo, à 300 dpi avec métadonnées pHYs. Sa largeur se règle entre 2 et 10 cm, sans déformation. Dans Commandes → Ouvrir, télécharger ces fichiers ou choisir Préparer / imprimer le motif. La préparation permet de régénérer le motif, y compris pour les commandes anciennes, de régler sa largeur et de lancer une impression à 100 %. Les fonds opaques du fichier original restent conservés. La qualité des détails dépend du fichier importé et du procédé de fabrication.

Les fichiers clients et la préparation d’impression sont réservés au gestionnaire authentifié. Les fichiers sont rattachés à la commande et servis en privé avec nom de téléchargement. Aucun fichier client n’est publié dans le catalogue.

Vérification additionnelle : `node --test tests/print-artwork.test.mjs` (métadonnées PNG et proportions). Les tests API vérifient le stockage, le téléchargement protégé, les fichiers anciens sans motif, et le refus des dimensions ou formats non valides.

## Identité Cositel
Charte validée : logo sans empattements avec chaussons dans le o, bleu nuit #15264f, ivoire #faf7f0 et kraft naturel. Les cinq packagings sont présentés dans des visuels individuels et restent signalés comme illustratifs. La charte couvre boutique, filtres, panier, coordonnées, confirmation, personnalisateur, gestion et préparation d’impression.

Les alias des anciens visuels fournis sont résolus vers les nouvelles images sans réécrire les photos importées, les prix, le stock ni les commandes. Les anciens identifiants de polices et de panier restent internes pour préserver les créations et paniers existants.
