// Mock data for Gestreb Landing Page

export const centreInfo = {
  name: "Centre de Gestion de Gagnoa",
  shortName: "CG Gagnoa",
  dateCreation: "1991",
  superficieGeree: "364 292 ha",
  nombreForets: 18,
  description: "Le Centre de Gestion de Gagnoa, créé en 1991, est un acteur majeur de la gestion forestière en Côte d'Ivoire. Nous gérons 18 forêts classées réparties sur une superficie totale de 364 292 hectares.",
  mission: "Notre mission est de préserver, restaurer et valoriser le patrimoine forestier ivoirien à travers des actions de reboisement, d'entretien et de sylviculture durables.",
  zones: [
    "District Autonome de Yamoussoukro",
    "Région du Gôh",
    "Région du Lô-Djiboua",
    "Région de l'Agnéby-Tiassa",
    "Région du Gbôklè"
  ],
  directeur: "Cne ANOUGBA Jean Bertin",
  contact: {
    email: "contact@cggagnoa.ci",
    telephone: "+225 27 32 78 XX XX",
    adresse: "Gagnoa, Côte d'Ivoire"
  }
};

export const unitesGestion = [
  { id: 1, nom: "Téné", icon: "TreePine" },
  { id: 2, nom: "Sangoué", icon: "TreeDeciduous" },
  { id: 3, nom: "Marahoué", icon: "Trees" },
  { id: 4, nom: "Laouda", icon: "TreePine" },
  { id: 5, nom: "Okromodou Nord", icon: "TreeDeciduous" },
  { id: 6, nom: "Okromodou Sud", icon: "Trees" },
  { id: 7, nom: "Niouniourou", icon: "TreePine" }
];

export const activites = [
  {
    id: 1,
    titre: "Production de Plants",
    description: "2 centres de production équipés : un centre de bouturage et un centre de production d'essences locales pour garantir la diversité génétique.",
    icon: "Sprout",
    color: "emerald"
  },
  {
    id: 2,
    titre: "Mise en Place",
    description: "Préparation du terrain, piquetage, trouaison et planting des jeunes plants sur les parcelles forestières selon des méthodes éprouvées.",
    icon: "Shovel",
    color: "sky"
  },
  {
    id: 3,
    titre: "Entretien",
    description: "Suivi régulier des plantations : désherbage, entretien des lignes et interlignes, remplacement des plants morts pour assurer un taux de survie optimal.",
    icon: "Leaf",
    color: "lime"
  },
  {
    id: 4,
    titre: "Sylviculture",
    description: "Gestion technique des peuplements forestiers : élagage, éclaircie et interventions sylvicoles pour optimiser la croissance des arbres.",
    icon: "TreeDeciduous",
    color: "amber"
  }
];

export const statistiques = [
  { label: "Hectares gérés", value: "364 292", suffix: "ha", icon: "MapPin" },
  { label: "Forêts classées", value: "18", suffix: "", icon: "Trees" },
  { label: "Unités de gestion", value: "7", suffix: "UGF", icon: "Building2" },
  { label: "Années d'expérience", value: "34", suffix: "ans", icon: "Award" }
];

export const actualites = [
  {
    id: 1,
    titre: "Lancement de la campagne de reboisement 2025",
    resume: "Le Centre de Gestion de Gagnoa lance sa nouvelle campagne de reboisement avec un objectif ambitieux de 5 000 hectares pour l'année 2025.",
    date: "15 Janvier 2025",
    image: "https://images.pexels.com/photos/1072824/pexels-photo-1072824.jpeg",
    categorie: "Reboisement"
  },
  {
    id: 2,
    titre: "Formation des agents forestiers",
    resume: "Une session de formation intensive a été organisée pour les agents des 7 Unités de Gestion Forestière sur les nouvelles techniques de sylviculture.",
    date: "08 Janvier 2025",
    image: "https://images.pexels.com/photos/1390371/pexels-photo-1390371.jpeg",
    categorie: "Formation"
  },
  {
    id: 3,
    titre: "Partenariat avec les communautés locales",
    resume: "Signature d'un accord de partenariat avec les communautés riveraines pour la cogestion durable des forêts classées de la région.",
    date: "20 Décembre 2024",
    image: "https://images.pexels.com/photos/1268076/pexels-photo-1268076.jpeg",
    categorie: "Partenariat"
  }
];

export const services = [
  {
    id: 1,
    nom: "Opérations Techniques et Commerciales",
    description: "Coordination des activités de terrain et valorisation des produits forestiers"
  },
  {
    id: 2,
    nom: "Service Administratif et Financier",
    responsable: "Mme COULIBALY Yelet",
    description: "Gestion administrative, comptable et financière du centre"
  }
];
