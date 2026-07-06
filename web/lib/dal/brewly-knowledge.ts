import "server-only";

import { prisma } from "@/lib/prisma";

/**
 * Centre de connaissances Brewly — DAL du futur module RAG (Advanced ++).
 *
 * ⚠️ Atelier : ces fonctions sont FOURNIES. La base documentaire (politiques,
 * FAQ, guides, fiches origine, notes internes) est la matière première du
 * RAG : c'est elle qu'on découpera en chunks, vectorisera et interrogera.
 *
 * Le seed est volontairement « réaliste » : articles qui se recoupent
 * (KB-01 retours vs KB-20 ancienne politique), note interne sensible (KB-19)
 * et article non publié — autant de cas d'école pour le module (filtrage,
 * fraîcheur, périmètre de la récupération).
 */

/** Un article de connaissance, tel qu'exposé au RAG et à la sandbox (DTO). */
export type KnowledgeArticle = {
  reference: string;
  titre: string;
  categorie: "politique" | "faq" | "guide" | "produit" | "interne";
  contenu: string;
  tags: string[];
  publie: boolean;
};

/** Ligne complète (DTO + id), telle qu'utilisée par la sandbox. */
export type KnowledgeRow = KnowledgeArticle & { id: string };

/** Entrée de création / mise à jour (sans id ni horodatage). */
export type KnowledgeInput = KnowledgeArticle;

/** Données d'amorçage : les 20 articles canoniques (source du seeder). */
export const KNOWLEDGE_SEED: KnowledgeArticle[] = [
  {
    reference: "KB-01",
    titre: "Politique de retours et remboursements",
    categorie: "politique",
    tags: ["retours", "remboursement", "rétractation"],
    publie: true,
    contenu: `Vous disposez de 30 jours après réception pour retourner un article. Les machines et accessoires doivent être renvoyés complets, dans leur emballage d'origine, avec la preuve d'achat. Les cafés en grains ou moulus ne sont repris que si le paquet est scellé : un paquet ouvert n'est ni repris ni remboursé, pour des raisons d'hygiène.

Le remboursement est émis sur le moyen de paiement d'origine sous 5 jours ouvrés après réception et contrôle du retour. Les frais de retour sont offerts pour les machines ; pour les autres articles, ils restent à la charge du client sauf erreur de notre part ou produit défectueux.

Pour lancer un retour : rubrique « Mes commandes », bouton « Retourner un article », ou contact du support avec le numéro de commande. Une étiquette de retour prépayée est générée quand les frais sont pris en charge par Brewly.`,
  },
  {
    reference: "KB-02",
    titre: "Livraison : délais, transporteurs et frais",
    categorie: "politique",
    tags: ["livraison", "délais", "transporteur", "frais de port"],
    publie: true,
    contenu: `Les commandes passées avant 13 h sont expédiées le jour même (jours ouvrés). Délais indicatifs : 2 à 3 jours ouvrés en France métropolitaine avec Colissimo, 1 à 2 jours en express avec Chronopost, 3 à 5 jours pour la Belgique et le Luxembourg.

Les frais de port sont de 4,90 € en standard et 9,90 € en express. La livraison standard est offerte dès 39 € d'achat. Les machines sont toujours expédiées en colis suivi avec remise contre signature.

Le café est torréfié chaque semaine : une commande contenant du café fraîchement torréfié peut partir avec 1 à 2 jours de décalage pour laisser le café dégazer — c'est volontaire et gage de qualité. Un email avec numéro de suivi est envoyé à l'expédition.`,
  },
  {
    reference: "KB-03",
    titre: "Garantie des machines espresso",
    categorie: "politique",
    tags: ["garantie", "machine", "SAV", "réparation"],
    publie: true,
    contenu: `Toutes les machines vendues par Brewly bénéficient de la garantie légale de conformité de 2 ans. La Silvia Pro et l'Auto Barista incluent en plus une extension constructeur d'un an, soit 3 ans au total, activée automatiquement à l'enregistrement de la machine sur l'espace client.

La garantie couvre les pannes électriques et mécaniques en usage domestique normal. Elle ne couvre pas : l'entartrage lié à un défaut de détartrage régulier (voir le guide d'entretien KB-14), les joints et pièces d'usure après 12 mois, ni les dommages liés à un usage professionnel intensif.

En cas de panne : contacter le support avec le numéro de série. Selon le diagnostic, Brewly envoie un transporteur pour un passage en atelier (délai moyen 10 jours ouvrés) ou expédie la pièce détachée avec un tutoriel.`,
  },
  {
    reference: "KB-04",
    titre: "Programme de fidélité BrewPoints",
    categorie: "politique",
    tags: ["fidélité", "points", "réduction", "avantages"],
    publie: true,
    contenu: `Chaque euro dépensé rapporte 1 BrewPoint. Les points sont crédités à l'expédition de la commande et restent valables 18 mois glissants.

Paliers de récompense : 200 points = 10 € de réduction, 450 points = 25 €, 800 points = 50 €. Les bons se génèrent depuis l'espace client et sont cumulables avec la livraison offerte, mais pas entre eux ni avec un code promo.

Statut Barista : à partir de 600 points cumulés sur 12 mois, le client passe Barista et gagne des avantages permanents — accès en avant-première aux cafés de saison, +10 % de points sur les abonnements et une dégustation offerte par trimestre. Les points ne sont jamais convertibles en espèces et sont perdus en cas de suppression du compte.`,
  },
  {
    reference: "KB-05",
    titre: "Abonnement café : formules, pause et résiliation",
    categorie: "politique",
    tags: ["abonnement", "récurrent", "pause", "résiliation"],
    publie: true,
    contenu: `L'abonnement Brewly livre du café fraîchement torréfié à la fréquence choisie : toutes les 2, 3 ou 4 semaines. Trois formules : Découverte (1 paquet de 250 g, 11 €/livraison), Passion (2 paquets, 20 €), Maison (1 kg, 36 €). La livraison est toujours incluse et chaque livraison rapporte des BrewPoints majorés de 10 %.

L'abonné peut changer de café, de formule ou de fréquence jusqu'à 3 jours avant la prochaine échéance, depuis l'espace client. La pause est possible à tout moment, pour 1 à 3 cycles (vacances par exemple).

La résiliation est sans engagement et prend effet immédiatement pour les échéances non facturées ; il n'y a aucun remboursement partiel d'une livraison déjà expédiée. Après 6 livraisons consécutives, la 7e est remise à -50 %.`,
  },
  {
    reference: "KB-06",
    titre: "FAQ — Modifier ou annuler une commande",
    categorie: "faq",
    tags: ["commande", "annulation", "modification"],
    publie: true,
    contenu: `Puis-je modifier ma commande après validation ? Oui, tant qu'elle n'est pas passée en préparation (statut visible dans « Mes commandes »). Adresse, articles et mode de livraison restent modifiables en ligne. Une fois en préparation, plus aucune modification n'est possible : il faut attendre la réception puis, si besoin, faire un retour (voir la politique de retours).

Puis-je annuler ? Oui, gratuitement et intégralement tant que la commande n'est pas expédiée. L'annulation se fait en un clic depuis l'espace client et le remboursement part sous 48 h.

Ma commande est bloquée en « en préparation » depuis plusieurs jours : c'est souvent lié au dégazage d'un café tout juste torréfié (1 à 2 jours) ou à une rupture partielle. Au-delà de 4 jours ouvrés, contactez le support avec le numéro de commande.`,
  },
  {
    reference: "KB-07",
    titre: "FAQ — Paiement, facturation et 3x sans frais",
    categorie: "faq",
    tags: ["paiement", "facture", "3x", "carte bancaire"],
    publie: true,
    contenu: `Moyens de paiement acceptés : cartes Visa, Mastercard et American Express, Apple Pay, Google Pay et PayPal. Les paiements sont traités par un prestataire certifié PCI-DSS ; Brewly ne stocke jamais les numéros de carte.

Le paiement en 3 fois sans frais est proposé dès 150 € d'achat (machines principalement) : la première échéance est débitée à la commande, les deux suivantes à 30 et 60 jours. Il nécessite une carte valable encore 3 mois.

Les factures PDF sont disponibles dans l'espace client, rubrique « Mes commandes », dès l'expédition. Pour une facture au nom d'une entreprise avec numéro de TVA intracommunautaire, renseignez les informations société dans le profil avant de commander — une facture ne peut pas être rééditée à un autre nom après coup.`,
  },
  {
    reference: "KB-08",
    titre: "FAQ — Compte client et données personnelles (RGPD)",
    categorie: "faq",
    tags: ["compte", "RGPD", "données personnelles", "suppression"],
    publie: true,
    contenu: `Quelles données Brewly conserve-t-elle ? Les informations de profil (nom, email, adresses), l'historique de commandes et les préférences café. Elles servent uniquement au traitement des commandes, au programme de fidélité et — avec consentement explicite — à la newsletter. Aucune donnée n'est vendue à des tiers.

Comment exercer mes droits ? Export des données (portabilité) et rectification se font directement depuis l'espace client. La suppression du compte s'effectue via « Profil → Supprimer mon compte » : elle est définitive, efface les données personnelles sous 30 jours et entraîne la perte des BrewPoints. Les factures sont conservées 10 ans pour obligation légale, sous forme anonymisée du point de vue marketing.

Le délégué à la protection des données est joignable à privacy@brewly.example ; réponse sous 30 jours maximum.`,
  },
  {
    reference: "KB-09",
    titre: "FAQ — Colis endommagé, incomplet ou perdu",
    categorie: "faq",
    tags: ["colis", "endommagé", "litige", "perte"],
    publie: true,
    contenu: `Colis endommagé à la réception : émettez des réserves auprès du livreur si possible, puis signalez l'incident sous 48 h depuis « Mes commandes → Signaler un problème », photos du colis et des produits à l'appui. Après validation (sous 1 jour ouvré), Brewly réexpédie les articles touchés ou rembourse, au choix du client. Un paquet de café percé ou ouvert est toujours réexpédié sans frais.

Article manquant : vérifiez d'abord si la commande a été scindée en plusieurs colis (visible dans le suivi). Sinon, même procédure de signalement sous 48 h.

Colis perdu : si le suivi n'évolue plus pendant 7 jours (10 jours en période de fêtes), Brewly ouvre une enquête transporteur et réexpédie sans attendre son issue dès lors que l'adresse était correcte. Aucune démarche du client auprès du transporteur n'est nécessaire.`,
  },
  {
    reference: "KB-10",
    titre: "FAQ — Fraîcheur, DLUO et conservation du café",
    categorie: "faq",
    tags: ["fraîcheur", "conservation", "DLUO", "torréfaction"],
    publie: true,
    contenu: `Chaque paquet Brewly indique la date de torréfaction — c'est elle qui compte, plus que la DLUO (12 mois). Le café en grains exprime le meilleur de son profil entre 7 et 60 jours après torréfaction ; il reste tout à fait consommable ensuite, mais perd progressivement en arômes.

Conservation : dans son paquet d'origine refermé (la valve unidirectionnelle évacue le CO₂ sans laisser entrer l'oxygène), à l'abri de la lumière, de la chaleur et de l'humidité. Ni au réfrigérateur ni au congélateur : la condensation dégrade les arômes et le café capte les odeurs.

Achetez moulu seulement si nécessaire : le café moulu s'oxyde en quelques jours, contre plusieurs semaines pour le grain. D'où notre conseil récurrent : un moulin, même d'entrée de gamme, transforme davantage la tasse qu'une machine plus chère.`,
  },
  {
    reference: "KB-11",
    titre: "Guide — Régler sa mouture selon la méthode",
    categorie: "guide",
    tags: ["mouture", "moulin", "réglage", "extraction"],
    publie: true,
    contenu: `La mouture est le premier levier du goût. Règle générale : plus le temps de contact entre l'eau et le café est court, plus la mouture doit être fine.

Repères par méthode : espresso → fine (proche du sel fin, écoulement de 25 à 30 s) ; moka italienne → fine à moyenne ; V60 et filtre → moyenne (sucre en poudre) ; Chemex → moyenne à grosse ; french press et cold brew → grosse (gros sel).

Diagnostic en tasse : amertume, astringence et écoulement trop lent signalent une sur-extraction → desserrez la mouture d'un cran. Acidité agressive, tasse aqueuse et écoulement rapide signalent une sous-extraction → resserrez d'un cran. Ne changez qu'un paramètre à la fois, et re-goûtez. Après chaque changement de café, comptez 2 ou 3 tasses d'ajustement : chaque origine et chaque degré de torréfaction se comporte différemment.`,
  },
  {
    reference: "KB-12",
    titre: "Guide — Réussir son espresso : ratio, temps, température",
    categorie: "guide",
    tags: ["espresso", "ratio", "recette", "extraction"],
    publie: true,
    contenu: `La recette de référence Brewly : ratio 1:2 — par exemple 18 g de café moulu pour 36 g de boisson en tasse — extraits en 25 à 30 secondes, eau entre 92 et 94 °C. C'est le point de départ, pas un dogme.

Étapes : doser au gramme près (la balance ACC-BAL est faite pour ça), répartir la mouture dans le porte-filtre, tasser à plat et d'une pression ferme et régulière, lancer l'extraction et arrêter au poids cible.

Ajustements : tasse trop amère → mouture plus grosse ou température plus basse ; tasse trop acide → mouture plus fine, dose légèrement réduite ou température plus haute. Pour les torréfactions claires, un ratio 1:2,5 ouvre les arômes ; pour les assemblages corsés type Espresso Bar Italiano, un ratio 1:1,5 à 1:2 donne un résultat plus rond et sirupeux.`,
  },
  {
    reference: "KB-13",
    titre: "Guide — Café filtre et V60 : la recette 60 g/L",
    categorie: "guide",
    tags: ["filtre", "V60", "slow coffee", "recette"],
    publie: true,
    contenu: `Le standard du café filtre : 60 g de café par litre d'eau, soit 15 g pour une tasse de 250 ml. Mouture moyenne, eau à 92-96 °C (idéalement filtrée : le calcaire écrase les arômes).

Méthode V60 pas à pas : rincer le filtre papier à l'eau chaude (élimine le goût de papier et préchauffe), verser le café, créer un petit puits. Pré-infusion : verser 2 fois le poids du café en eau (30 g pour 15 g), attendre 30 à 45 s que le café « fleurisse ». Poursuivre en versements circulaires lents jusqu'au poids cible. Temps total : 2 min 30 à 3 min 30.

Écoulement trop rapide et tasse légère → mouture plus fine. Écoulement au-delà de 4 min et tasse amère → mouture plus grosse. Les cafés floraux comme l'Éthiopie Sidamo brillent particulièrement dans cette méthode.`,
  },
  {
    reference: "KB-14",
    titre: "Guide — Entretenir sa machine espresso",
    categorie: "guide",
    tags: ["entretien", "détartrage", "nettoyage", "machine"],
    publie: true,
    contenu: `Un entretien régulier garde la machine performante et conditionne la garantie (voir KB-03).

Quotidien : purger la buse vapeur après chaque usage, rincer le porte-filtre, vider le bac égouttoir. Hebdomadaire : brosser la douchette, laver panier et porte-filtre à l'eau chaude ; sur les machines à porte-filtre comme la Silvia Pro, effectuer un backflush à l'eau claire avec le filtre aveugle fourni.

Mensuel : backflush avec détergent espresso, dégraissage du panier. Détartrage : tous les 2 à 3 mois en eau dure, tous les 4 à 6 mois en eau douce ou filtrée — uniquement avec un détartrant à base d'acide citrique ; jamais de vinaigre blanc, qui attaque les joints et laisse un goût persistant. L'Auto Barista signale d'elle-même ses cycles de détartrage et de nettoyage du groupe ; il ne faut jamais les interrompre en cours.`,
  },
  {
    reference: "KB-15",
    titre: "Guide — Le lait : température et micro-mousse",
    categorie: "guide",
    tags: ["lait", "latte art", "mousse", "cappuccino"],
    publie: true,
    contenu: `Une bonne mousse de lait est brillante, sans grosses bulles, avec la texture d'une peinture satinée : c'est la micro-mousse.

Technique à la buse vapeur : lait froid dans un pichet inox rempli au tiers. Phase d'étirement : buse juste sous la surface pour incorporer de l'air (bruit de papier déchiré), 3 à 5 s pour un latte, 8 à 10 s pour un cappuccino. Phase de texturage : plonger la buse pour créer un tourbillon qui casse les bulles. Arrêter entre 55 et 65 °C — la paroi du pichet devient difficile à tenir. Au-delà de 70 °C, les protéines cuisent, le sucré disparaît.

Lait entier = mousse la plus stable et la plus sucrée. En végétal, les boissons « barista » (avoine en tête) moussent bien ; les versions classiques se dissocient à la chaleur. Toujours purger la buse avant et après.`,
  },
  {
    reference: "KB-16",
    titre: "Guide — Choisir son café : intensité, origine, torréfaction",
    categorie: "guide",
    tags: ["choix", "intensité", "torréfaction", "profil"],
    publie: true,
    contenu: `L'intensité affichée sur nos paquets (1 à 10) décrit la puissance et l'amertume en tasse — pas la caféine ni la qualité. Un café doux d'intensité 4 comme l'Éthiopie Sidamo n'est pas « moins bon » qu'un 9 : il est plus délicat.

Par goût : vous aimez les cafés fruités, floraux, avec une acidité vive → origines d'Afrique de l'Est, torréfaction claire, méthodes douces (V60, filtre). Vous cherchez l'équilibre chocolat-noisette → Amérique latine, torréfaction moyenne, à l'aise partout. Vous voulez un espresso puissant avec du corps et une crema dense → assemblages à torréfaction foncée, éventuellement avec une part de robusta.

Par méthode : les torréfactions claires s'expriment mieux en filtre, les foncées en espresso et avec le lait. En cas de doute, l'abonnement Découverte (KB-05) permet d'explorer un profil différent chaque mois.`,
  },
  {
    reference: "KB-17",
    titre: "Fiche origine — Éthiopie Sidamo",
    categorie: "produit",
    tags: ["Éthiopie", "Sidamo", "origine", "arabica"],
    publie: true,
    contenu: `L'Éthiopie est le berceau de l'arabica, et la région du Sidamo, au sud du pays, l'un de ses terroirs les plus réputés. Notre Sidamo (référence catalogue CAF-ETH) pousse entre 1 800 et 2 200 m d'altitude, cueilli à la main par de petites coopératives, puis traité par voie lavée — un profil de tasse net et éclatant.

En tasse : notes florales de jasmin, fruits jaunes (abricot, pêche), finale citronnée sur une acidité fine. Corps léger à moyen, intensité 4/10. Torréfaction claire pour préserver ce bouquet aromatique.

Conseils de préparation : c'est en méthode douce qu'il s'exprime le mieux — V60 avec la recette 60 g/L (voir KB-13) ou filtre. En espresso, allonger le ratio vers 1:2,5 pour éviter une acidité trop marquée. Récolte d'octobre à janvier ; nos lots arrivent torréfiés chaque semaine.`,
  },
  {
    reference: "KB-18",
    titre: "Fiche origine — Colombie Supremo",
    categorie: "produit",
    tags: ["Colombie", "Supremo", "origine", "arabica"],
    publie: true,
    contenu: `« Supremo » désigne le plus gros calibre de grain colombien (tamis 17-18) — un gage de tri, pas une variété. Notre lot (référence catalogue CAF-COL) provient de la région de Huila, cultivé entre 1 500 et 1 900 m sur des sols volcaniques, traité en voie lavée puis séché au soleil.

En tasse : chocolat au lait, noisette, une touche de caramel, acidité douce et corps rond. Intensité 6/10, torréfaction moyenne. C'est le café « qui met tout le monde d'accord » — le plus polyvalent du catalogue.

Conseils de préparation : excellent partout. En espresso, ratio 1:2 classique pour un résultat gourmand, parfait avec le lait (cappuccino, latte). En filtre, il donne une tasse ronde et réconfortante. C'est aussi le café que nous recommandons par défaut aux nouveaux abonnés de la formule Découverte.`,
  },
  {
    reference: "KB-19",
    titre: "Note interne — Gestes commerciaux autorisés (support)",
    categorie: "interne",
    tags: ["interne", "geste commercial", "support", "escalade"],
    publie: true,
    contenu: `Document réservé à l'équipe support — ne pas communiquer les plafonds aux clients.

Gestes autorisés sans validation du manager : renvoi d'un paquet de café (colis endommagé, erreur de préparation) ; bon d'achat jusqu'à 15 € pour un retard de livraison supérieur à 5 jours ouvrés ; 200 BrewPoints en dédommagement d'un incident mineur. Un seul geste par commande.

Avec validation du manager : remboursement partiel jusqu'à 30 % sur une machine (défaut esthétique accepté par le client), bon d'achat de 16 à 50 €, extension de garantie de 6 mois.

Escalade obligatoire : toute demande d'un client mentionnant une association de consommateurs ou une action en justice, tout litige supérieur à 200 €, toute demande de dérogation à la politique de retours (KB-01). Tracer chaque geste dans l'outil de ticketing avec le motif.`,
  },
  {
    reference: "KB-20",
    titre: "[Obsolète] Ancienne politique de retours (avant 2026)",
    categorie: "politique",
    tags: ["retours", "obsolète", "archive"],
    publie: false,
    contenu: `⚠️ Document archivé le 1er janvier 2026 — remplacé par la politique de retours en vigueur (KB-01). Conservé pour référence interne uniquement.

Ancien texte : vous disposez de 14 jours après réception pour retourner un article. Tous les retours sont à la charge du client, y compris pour les machines. Les cafés ne sont jamais repris, même scellés. Le remboursement est émis sous 14 jours ouvrés après réception du retour, sous forme d'avoir utilisable sur la boutique ; le remboursement sur le moyen de paiement d'origine n'est possible que sur demande écrite.

Note pour le module RAG : ce document contredit volontairement KB-01. Un pipeline naïf qui l'indexe sans tenir compte du champ « publié » ou de sa date répondra 14 jours au lieu de 30 — c'est le cas d'école à faire échouer puis corriger.`,
  },
];

const SELECT = {
  id: true,
  reference: true,
  titre: true,
  categorie: true,
  contenu: true,
  tags: true,
  publie: true,
} as const;

type Raw = {
  id: string;
  reference: string;
  titre: string;
  categorie: string;
  contenu: string;
  tags: string;
  publie: boolean;
};

function toRow(raw: Raw): KnowledgeRow {
  return {
    ...raw,
    categorie: raw.categorie as KnowledgeArticle["categorie"],
    tags: parseTags(raw.tags),
  };
}

function parseTags(serialized: string): string[] {
  try {
    const parsed = JSON.parse(serialized);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function toData(input: KnowledgeInput) {
  return { ...input, tags: JSON.stringify(input.tags) };
}

/** Nombre d'articles actuellement en base. */
export async function countKnowledge(): Promise<number> {
  return prisma.brewlyKnowledge.count();
}

/**
 * Vide puis réinsère les articles canoniques (`KNOWLEDGE_SEED`). Idempotent :
 * appelé par le seeder centralisé. Renvoie le nombre d'articles insérés.
 */
export async function resetKnowledge(): Promise<number> {
  await prisma.brewlyKnowledge.deleteMany();
  await prisma.brewlyKnowledge.createMany({
    data: KNOWLEDGE_SEED.map(toData),
  });
  return KNOWLEDGE_SEED.length;
}

/** Liste tous les articles (éventuellement filtrés par catégorie). */
export async function listKnowledge(
  categorie?: KnowledgeArticle["categorie"]
): Promise<KnowledgeRow[]> {
  const rows = await prisma.brewlyKnowledge.findMany({
    where: categorie ? { categorie } : undefined,
    orderBy: { reference: "asc" },
    select: SELECT,
  });
  return rows.map(toRow);
}

/**
 * Recherche naïve par mots-clés dans les articles PUBLIÉS (titre, contenu,
 * tags) — la baseline « avant RAG » du module : suffisante pour des termes
 * exacts, aveugle aux synonymes et reformulations.
 */
export async function searchKnowledge(
  query: string,
  limit = 3
): Promise<KnowledgeRow[]> {
  const needle = normalize(query);
  if (!needle) {
    return [];
  }
  const terms = needle.split(/\s+/).filter((term) => term.length > 2);
  const rows = await prisma.brewlyKnowledge.findMany({
    where: { publie: true },
    select: SELECT,
  });
  return rows
    .map(toRow)
    .map((row) => {
      const haystack = normalize(
        `${row.titre} ${row.contenu} ${row.tags.join(" ")}`
      );
      const score = terms.filter((term) => haystack.includes(term)).length;
      return { row, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ row }) => row);
}

/** Crée un article (sandbox CRUD). */
export async function createKnowledge(input: KnowledgeInput): Promise<void> {
  await prisma.brewlyKnowledge.create({ data: toData(input) });
}

/** Met à jour un article par id (sandbox CRUD). */
export async function updateKnowledge(
  id: string,
  input: KnowledgeInput
): Promise<void> {
  await prisma.brewlyKnowledge.update({
    where: { id },
    data: { ...toData(input), updatedAt: new Date() },
  });
}

/** Supprime un article par id (sandbox CRUD). */
export async function deleteKnowledge(id: string): Promise<void> {
  await prisma.brewlyKnowledge.delete({ where: { id } }).catch(() => {
    // Déjà supprimé : rien à faire.
  });
}

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}
