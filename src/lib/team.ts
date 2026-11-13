export type TeamMember = {
  name: string;
  // Beneficiary.name as migrated from the legacy DB — ASCII, no diacritics — used to match
  // a course's author to this team member. Kept separate from `name` (the display spelling)
  // since the two differ for everyone whose name has diacritics.
  dbName: string;
  title: string;
  subject: string;
  bio: string;
  photo?: string;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
};

export const TEAM: TeamMember[] = [
  {
    name: "Paul-Ioan Someșan",
    dbName: "Paul-Ioan Somesan",
    title: "Manager & Coordonator Informatică",
    subject: "INFORMATICA",
    bio: "Absolvent al Facultății de Matematică și Informatică, UBB Cluj-Napoca, și fondator al platformelor Zece la Examene și Zece la Grile. A pregătit mii de elevi pentru Bacalaureat și admitere prin explicații clare și structurate — comunitatea lui de YouTube a trecut de 10.000 de abonați.",
    photo: "/team/paul.png",
    facebook: "https://www.facebook.com/PaulSomesan02/",
    instagram: "https://www.instagram.com/paul.somesan/",
    linkedin: "https://www.linkedin.com/in/somesanpaulioan/",
  },
  {
    name: "Rareș-Andrei Cotoi",
    dbName: "Rares-Andrei Cotoi",
    title: "Coordonator Matematică",
    subject: "MATEMATICA",
    bio: "Olimpic la Matematică, admis cu media 10.00 și absolvent al Facultății de Matematică și Informatică, UBB Cluj-Napoca. A obținut media 9.80 la Bacalaureat (10 la Matematică M1) la Colegiul Național „Mihai Viteazul” Turda și a susținut un TEDx Talk despre educație.",
    photo: "/team/rares.png",
    facebook: "https://www.facebook.com/profile.php?id=100008559437580",
    instagram: "https://www.instagram.com/cotoirares/",
    linkedin: "https://www.linkedin.com/in/crares/",
  },
  {
    name: "Diana Găbureac",
    dbName: "Diana Gabureac",
    title: "Coordonator Limba Română",
    subject: "ROMANA",
    bio: "Dublă campioană națională la Limba Română — la olimpiada de limbă și la cea de lectură — cu media 9.9 la Bacalaureat și 10 la proba de Limba Română. Studiază Litere la UBB Cluj-Napoca și a pregătit deja zeci de elevi pentru Bacalaureat.",
    photo: "/team/diana.png",
    facebook: "https://www.facebook.com/diana.gabureac",
    instagram: "https://www.instagram.com/dianagabureac/",
    linkedin: "https://www.linkedin.com/in/diana-g%C4%83bureac-7b8389234/",
  },
  {
    name: "Mihnea David",
    dbName: "Mihnea David",
    title: "Coordonator Fizică",
    subject: "FIZICA",
    bio: "Olimpic național atât la Fizică, cât și la Informatică în liceu, cu nota 10 la Bacalaureat la Matematică și Fizică și locul II la National Space Society Contest (SUA). Este student la ETH Zürich, una dintre cele mai prestigioase universități tehnice din lume, unde a devenit asistent universitar la Algoritmică și Structuri de Date după doar un semestru.",
    photo: "/team/mihnea.png",
    facebook: "https://www.facebook.com/mihnea.david.313",
    instagram: "https://www.instagram.com/david_mihnea/",
  },
  {
    name: "Aurelia-Mariana Dan",
    dbName: "Aurelia-Mariana Dan",
    title: "Coordonator Istorie",
    subject: "ISTORIE",
    bio: "Profesor de istorie la Colegiul Național „Liviu Rebreanu” Bistrița, cu 25 de ani de experiență în sistemul de învățământ — ca inspector școlar, director, formator și mentor. Membră în grupuri naționale de lucru pentru disciplina Istorie.",
    photo: "/team/aurelia.png",
  },
  {
    name: "Romelia-Valeria Cosma",
    dbName: "Romelia-Valeria Cosma",
    title: "Coordonator Biologie",
    subject: "BIOLOGIE",
    bio: "Profesor de Biologie și metodist în cadrul Inspectoratului Școlar Județean Bistrița-Năsăud, cu peste 30 de ani de experiență. A pregătit sute de elevi pentru admiterea la Facultățile de Medicină din țară și este autoarea cărților de Biologie de pe platformă.",
    photo: "/team/romelia.png",
  },
];

export function findTeamMember(dbName: string | undefined | null): TeamMember | undefined {
  if (!dbName) return undefined;
  return TEAM.find((m) => m.dbName === dbName);
}
