/**
 * One-time script to fill remaining team narratives with static fallback data.
 * Run: node scripts/fill-static-narratives.js
 */
const fs = require('fs');

const existing = JSON.parse(fs.readFileSync('src/data/team-narratives.json', 'utf-8'));

const staticNarratives = {
  SUI: {
    name: 'Switzerland', nameEs: 'Suiza', elo: 1889,
    style: 'Defensively disciplined with a high press and quick transitions on the counter.',
    styleEs: 'Disciplina defensiva con presión alta y rápidas transiciones al contraataque.',
    strengths: ['Tactical solidity', 'Set pieces', 'Experience in knockout rounds'],
    strengthsEs: ['Solidez táctica', 'Pelotas paradas', 'Experiencia en rondas eliminatorias'],
    keyPlayers: ['Granit Xhaka', 'Yann Sommer', 'Xherdan Shaqiri'],
    analysis: 'Switzerland are perennial overachievers, combining tactical discipline with individual quality. At WC2026 they can realistically target the quarterfinals.',
    analysisEs: 'Suiza es un equipo que habitualmente supera las expectativas, combinando disciplina táctica con calidad individual. En el Mundial 2026 pueden aspirar realísticamente a los cuartos de final.'
  },
  KOR: {
    name: 'South Korea', nameEs: 'Corea del Sur', elo: 1752,
    style: 'High-tempo pressing football with quick vertical passing and energetic midfield runners.',
    styleEs: 'Fútbol de alta intensidad con pressing, pases verticales y mediocampistas dinámicos.',
    strengths: ['Work rate and pressing', 'Son Heung-min leadership', 'Tournament experience'],
    strengthsEs: ['Trabajo y presión colectiva', 'Liderazgo de Son Heung-min', 'Experiencia en torneos'],
    keyPlayers: ['Son Heung-min', 'Lee Kang-in', 'Kim Min-jae'],
    analysis: 'South Korea will rely heavily on the brilliance of Son Heung-min to progress from a competitive group. A round of 16 appearance would be considered a success.',
    analysisEs: 'Corea del Sur dependerá en gran medida del brillante Son Heung-min para avanzar de una difícil fase de grupos. Llegar a octavos de final sería considerado un éxito.'
  },
  AUS: {
    name: 'Australia', nameEs: 'Australia', elo: 1783,
    style: 'Physical and direct with strong aerial presence and determined pressing throughout the pitch.',
    styleEs: 'Físico y directo, con presencia aérea y presión constante en todo el campo.',
    strengths: ['Physical intensity', 'Team spirit', 'Set-piece threat'],
    strengthsEs: ['Intensidad física', 'Espíritu de equipo', 'Peligro en jugadas de pelota parada'],
    keyPlayers: ['Mathew Ryan', 'Martin Boyle', 'Riley McGree'],
    analysis: 'The Socceroos qualified via the AFC pathway and bring physicality and passion to the tournament. Reaching the knockout rounds would repeat their heroic 2022 run.',
    analysisEs: 'Los Socceroos clasificaron por la ruta de la AFC y traen físico y pasión al torneo. Alcanzar la fase eliminatoria repetiría su heroica campaña de 2022.'
  },
  EGY: {
    name: 'Egypt', nameEs: 'Egipto', elo: 1689,
    style: 'Organized defensive block built around protecting Mohamed Salah and exploiting pace on the break.',
    styleEs: 'Bloque defensivo organizado centrado en proteger a Mohamed Salah y explotar la velocidad al contragolpe.',
    strengths: ['Mohamed Salah match-winning ability', 'Defensive organization', 'Counter-attacking pace'],
    strengthsEs: ['Capacidad goleadora de Mohamed Salah', 'Organización defensiva', 'Velocidad al contrataque'],
    keyPlayers: ['Mohamed Salah', 'Mohamed El-Shenawy', 'Mostafa Mohamed'],
    analysis: 'Egypt are entirely dependent on Mohamed Salah form and fitness for their World Cup hopes. If Salah fires, Egypt can surprise anyone on a given day.',
    analysisEs: 'Egipto depende enteramente de la forma y estado físico de Mohamed Salah para sus esperanzas mundialistas. Si Salah está en forma, Egipto puede sorprender a cualquiera.'
  },
  PAR: {
    name: 'Paraguay', nameEs: 'Paraguay', elo: 1833,
    style: 'Compact and aggressive defensively with fast, direct counter-attacks through a physical midfield.',
    styleEs: 'Compactos y agresivos en defensa con contraataques rápidos y directos a través de un mediocampo físico.',
    strengths: ['Defensive resilience', 'Set pieces', 'Fighting spirit'],
    strengthsEs: ['Resiliencia defensiva', 'Pelotas paradas', 'Espíritu combativo'],
    keyPlayers: ['Miguel Almirón', 'Antonio Sanabria', 'Gustavo Gómez'],
    analysis: 'Paraguay earned their place through a tough CONMEBOL qualifying campaign and will be a difficult opponent for any team. Their defensive discipline makes them dangerous at this level.',
    analysisEs: 'Paraguay se ganó su lugar tras una dura campaña de clasificación de la CONMEBOL y será un rival difícil para cualquier equipo. Su disciplina defensiva los hace peligrosos.'
  },
  ALG: {
    name: 'Algeria', nameEs: 'Argelia', elo: 1743,
    style: 'Technical possession-based game with creative midfielders and clinical finishing on the break.',
    styleEs: 'Juego técnico de posesión con mediocampistas creativos y remate clínico al contrataque.',
    strengths: ['Technical quality', 'Riyad Mahrez inspiration', 'African tournament pedigree'],
    strengthsEs: ['Calidad técnica', 'Inspiración de Riyad Mahrez', 'Trayectoria en torneos africanos'],
    keyPlayers: ['Riyad Mahrez', 'Islam Slimani', 'Yacine Adli'],
    analysis: 'Algeria qualified through the CAF pathway and bring genuine quality, particularly with Riyad Mahrez. They will aim to replicate or exceed their 2014 round of 16 finish.',
    analysisEs: 'Argelia clasificó por la ruta de la CAF y trae calidad real, especialmente con Riyad Mahrez. Buscarán replicar o superar su octavos de final de 2014.'
  },
  AUT: {
    name: 'Austria', nameEs: 'Austria', elo: 1827,
    style: 'High press and gegenpressing with quick transitions and technically gifted attacking players.',
    styleEs: 'Alta presión y gegenpressing con transiciones rápidas y jugadores atacantes técnicamente dotados.',
    strengths: ['High press system', 'Midfield creativity', 'Goal threat from multiple positions'],
    strengthsEs: ['Sistema de alta presión', 'Creatividad en el mediocampo', 'Peligro de gol desde múltiples posiciones'],
    keyPlayers: ['Marcel Sabitzer', 'David Alaba', 'Christoph Baumgartner'],
    analysis: 'Austria are an improving side and will compete fiercely in their group. A first knockout-stage appearance since 1982 is within reach.',
    analysisEs: 'Austria es un equipo en progreso y competirá ferozmente en su grupo. Una primera aparición en fase eliminatoria desde 1982 está al alcance.'
  },
  TUR: {
    name: 'Turkey', nameEs: 'Turquía', elo: 1902,
    style: 'Tactically flexible with a solid defensive base and technically skilled attacking players.',
    styleEs: 'Tácticamente flexible con una base defensiva sólida y jugadores atacantes técnicamente hábiles.',
    strengths: ['Tactical adaptability', 'Offensive talent', 'Set-piece efficiency'],
    strengthsEs: ['Adaptabilidad táctica', 'Talento ofensivo', 'Eficiencia en jugadas a balón parado'],
    keyPlayers: ['Hakan Çalhanoğlu', 'Arda Güler', 'Kenan Yıldız'],
    analysis: 'Turkey comes into the tournament with a talented new generation led by Arda Güler and Kenan Yıldız. They have the quality to reach the quarterfinals if their core stays fit.',
    analysisEs: 'Turquía llega al torneo con una talentosa nueva generación liderada por Arda Güler y Kenan Yıldız. Tienen calidad para llegar a cuartos de final si su núcleo se mantiene sano.'
  },
  CIV: {
    name: "Côte d'Ivoire", nameEs: 'Costa de Marfil', elo: 1676,
    style: 'Physical and technical blend with powerful forwards and energetic midfielders.',
    styleEs: 'Mezcla física y técnica con delanteros poderosos y mediocampistas energéticos.',
    strengths: ['Physical power', 'Individual talent', 'Recent AFCON success'],
    strengthsEs: ['Poder físico', 'Talento individual', 'Éxito reciente en la AFCON'],
    keyPlayers: ['Sébastien Haller', 'Franck Kessié', 'Nicolas Pépé'],
    analysis: 'Fresh from AFCON glory, Côte d\'Ivoire carry momentum and talent into the World Cup. They could spring a surprise in the knockout rounds.',
    analysisEs: 'Frescos de la gloria de la AFCON, Costa de Marfil llega con impulso y talento al Mundial. Podrían dar una sorpresa en la fase eliminatoria.'
  },
  TUN: {
    name: 'Tunisia', nameEs: 'Túnez', elo: 1636,
    style: 'Organized and disciplined defensively, built on a solid block with rapid counter-attacks.',
    styleEs: 'Organizado y disciplinado defensivamente, construido sobre un bloque sólido con contraataques rápidos.',
    strengths: ['Defensive organization', 'Collective discipline', 'Counter-attacking threat'],
    strengthsEs: ['Organización defensiva', 'Disciplina colectiva', 'Peligro al contrataque'],
    keyPlayers: ['Wahbi Khazri', 'Ellyes Skhiri', 'Montassar Talbi'],
    analysis: 'Tunisia are a reliable defensive unit that can make life difficult for any opponent. Progress beyond the group stage remains their primary and achievable target.',
    analysisEs: 'Túnez es una unidad defensiva fiable que puede complicarle la vida a cualquier rival. Avanzar de la fase de grupos sigue siendo su objetivo principal y alcanzable.'
  },
  NOR: {
    name: 'Norway', nameEs: 'Noruega', elo: 1912,
    style: 'Direct and physical with an emphasis on feeding Erling Haaland and exploiting set-pieces.',
    styleEs: 'Directo y físico, con énfasis en encontrar a Erling Haaland y explotar balones parados.',
    strengths: ['Erling Haaland', 'Physical presence', 'Set-piece danger'],
    strengthsEs: ['Erling Haaland', 'Presencia física', 'Peligro en pelotas paradas'],
    keyPlayers: ['Erling Haaland', 'Martin Ødegaard', 'Alexander Sörloth'],
    analysis: 'Norway built their WC2026 campaign around the unstoppable force of Erling Haaland. With Ødegaard orchestrating and Haaland finishing, they are a dark horse for the semifinals.',
    analysisEs: 'Noruega construyó su campaña del Mundial 2026 en torno a la fuerza imparable de Erling Haaland. Con Ødegaard orquestando y Haaland definiendo, son candidatos oscuros para las semifinales.'
  },
  SWE: {
    name: 'Sweden', nameEs: 'Suecia', elo: 1719,
    style: 'Compact and well-organized with an emphasis on set-pieces and disciplined defensive shape.',
    styleEs: 'Compacto y bien organizado, con énfasis en pelota parada y una forma defensiva disciplinada.',
    strengths: ['Collective organization', 'Set-piece threat', 'Experienced squad'],
    strengthsEs: ['Organización colectiva', 'Peligro en pelotas paradas', 'Plantel experimentado'],
    keyPlayers: ['Victor Nilsson Lindelöf', 'Dejan Kulusevski', 'Emil Forsberg'],
    analysis: 'Sweden qualified through a competitive UEFA playoff and will look to replicate their 2018 quarterfinal run. A cohesive unit that is difficult to break down.',
    analysisEs: 'Suecia clasificó a través de un repechaje UEFA competitivo y buscará replicar su cuartos de final de 2018. Una unidad cohesionada difícil de batir.'
  },
  SCO: {
    name: 'Scotland', nameEs: 'Escocia', elo: 853,
    style: 'Combative and high-energy with a direct approach and strong aerial play.',
    styleEs: 'Combativo y de alta energía con un enfoque directo y juego aéreo fuerte.',
    strengths: ['Passion and determination', 'Set pieces', 'North American diaspora support'],
    strengthsEs: ['Pasión y determinación', 'Pelotas paradas', 'Apoyo de la diáspora norteamericana'],
    keyPlayers: ['Andrew Robertson', 'Scott McTominay', 'Che Adams'],
    analysis: 'Scotland return to the World Cup stage for the first time in generations and will be emotional participants. Surpassing the group stage would be a historic achievement.',
    analysisEs: 'Escocia regresa al escenario mundialista por primera vez en generaciones. Superar la fase de grupos sería un logro histórico para la nación.'
  },
  CAN: {
    name: 'Canada', nameEs: 'Canadá', elo: 1784,
    style: 'Athletic and direct with technical midfielders and a pressing game, backed by passionate home support.',
    styleEs: 'Atlético y directo con mediocampistas técnicos y un juego de presión, respaldado por el apasionado apoyo local.',
    strengths: ['Home advantage', 'Athletic profile', 'Alphonso Davies pace and creativity'],
    strengthsEs: ['Ventaja local', 'Perfil atlético', 'Velocidad y creatividad de Alphonso Davies'],
    keyPlayers: ['Alphonso Davies', 'Jonathan David', 'Cyle Larin'],
    analysis: 'Canada hosts the World Cup and carries immense home pressure but also tremendous home advantage. With Davies, David and Larin, they have the firepower to reach the knockout rounds.',
    analysisEs: 'Canadá es coanfitrión del Mundial con una inmensa presión y una enorme ventaja de local. Con Davies, David y Larin, tienen el poder ofensivo para llegar a la fase eliminatoria.'
  },
  CZE: {
    name: 'Czech Republic', nameEs: 'República Checa', elo: 1726,
    style: 'Technically sound with a creative midfield and an emphasis on quick passing and movement.',
    styleEs: 'Técnicamente sólido con un mediocampo creativo y énfasis en el pase rápido y el movimiento.',
    strengths: ['Technical midfield', 'European experience', 'Tactical structure'],
    strengthsEs: ['Mediocampo técnico', 'Experiencia europea', 'Estructura táctica'],
    keyPlayers: ['Patrik Schick', 'Tomáš Souček', 'Vladimír Coufal'],
    analysis: 'The Czech Republic qualified through a competitive European playoff and will look to be competitive in their group. Reaching the last 16 would exceed expectations.',
    analysisEs: 'República Checa clasificó a través de un repechaje europeo competitivo y buscará ser competitiva en su grupo. Llegar a los dieciseisavos superaría las expectativas.'
  },
  BIH: {
    name: 'Bosnia & Herzegovina', nameEs: 'Bosnia y Herzegovina', elo: 1594,
    style: 'Technically gifted attacking players with a defensive setup built for resilience.',
    styleEs: 'Jugadores atacantes técnicamente dotados con un sistema defensivo construido para la resiliencia.',
    strengths: ['Individual technical quality', 'Attacking creativity', 'Fighting spirit'],
    strengthsEs: ['Calidad técnica individual', 'Creatividad ofensiva', 'Espíritu combativo'],
    keyPlayers: ['Edin Džeko', 'Miralem Pjanić', 'Sead Kolašinac'],
    analysis: 'Bosnia & Herzegovina make a long-awaited return to the World Cup stage. Their attacking talent can trouble any defense, but inconsistency may limit their progress.',
    analysisEs: 'Bosnia y Herzegovina regresa al escenario mundialista tras una larga espera. Su talento ofensivo puede incomodar a cualquier defensa, pero la inconsistencia puede limitar su progreso.'
  },
  GHA: {
    name: 'Ghana', nameEs: 'Ghana', elo: 1505,
    style: 'Athletic and direct with pacey forwards and a hard-working midfield block.',
    styleEs: 'Atlético y directo con delanteros veloces y un mediocampo trabajador.',
    strengths: ['Athletic ability', 'Pace in attack', 'Passionate support'],
    strengthsEs: ['Capacidad atlética', 'Velocidad en ataque', 'Apoyo apasionado'],
    keyPlayers: ['Jordan Ayew', 'Thomas Partey', 'Tariq Lamptey'],
    analysis: 'Ghana return to the World Cup hoping to recapture the magic of their 2010 quarterfinal run. They will need their experienced players to perform on the big stage.',
    analysisEs: 'Ghana regresa al Mundial esperando recuperar la magia de su cuartos de final de 2010. Necesitarán que sus jugadores experimentados rindan en el gran escenario.'
  },
  QAT: {
    name: 'Qatar', nameEs: 'Catar', elo: 1425,
    style: 'Organized and disciplined with a focus on collective defensive solidity and quick transitions.',
    styleEs: 'Organizado y disciplinado con foco en solidez defensiva colectiva y transiciones rápidas.',
    strengths: ['Collective discipline', 'Investment in football', 'Asian football growth'],
    strengthsEs: ['Disciplina colectiva', 'Inversión en el fútbol', 'Crecimiento del fútbol asiático'],
    keyPlayers: ['Akram Afif', 'Almoez Ali', 'Hassan Al-Haydos'],
    analysis: 'Qatar looks to improve on their 2022 home World Cup exit, but the quality gap against top nations remains significant. Avoiding a group stage exit would be progress.',
    analysisEs: 'Catar busca mejorar su eliminación en el Mundial 2022, pero la brecha de calidad contra las naciones top sigue siendo significativa. Evitar salir en grupos sería un progreso.'
  },
  KSA: {
    name: 'Saudi Arabia', nameEs: 'Arabia Saudita', elo: 1568,
    style: 'Defensively compact with organized pressing and quick counter-attacks using athletic forwards.',
    styleEs: 'Defensivamente compacto con presión organizada y contraataques rápidos usando delanteros atléticos.',
    strengths: ['Collective discipline', 'Physical conditioning', 'Giant-killing ability'],
    strengthsEs: ['Disciplina colectiva', 'Condición física', 'Capacidad de dar sorpresas'],
    keyPlayers: ['Salem Al-Dawsari', 'Mohammed Al-Owais', 'Firas Al-Buraikan'],
    analysis: 'Saudi Arabia shocked Argentina in 2022 and will look to create similar upsets. Their defensive organization and physicality make them dangerous opponents in the group stage.',
    analysisEs: 'Arabia Saudita sorprendió a Argentina en 2022 y buscará crear revulsas similares. Su organización defensiva y físico los convierte en rivales peligrosos en la fase de grupos.'
  },
  RSA: {
    name: 'South Africa', nameEs: 'Sudáfrica', elo: 1524,
    style: 'Energetic and direct with strong home continent advantage and a passionate collective effort.',
    styleEs: 'Energético y directo con fuerte ventaja del continente anfitrión y un esfuerzo colectivo apasionado.',
    strengths: ['Athletic ability', 'Home continent motivation', 'Resilience'],
    strengthsEs: ['Capacidad atlética', 'Motivación del continente anfitrión', 'Resiliencia'],
    keyPlayers: ['Percy Tau', 'Themba Zwane', 'Ronwen Williams'],
    analysis: 'South Africa return to the World Cup after a long absence and will play with immense pride. Competing hard in the group stage is the realistic target for Bafana Bafana.',
    analysisEs: 'Sudáfrica regresa al Mundial tras una larga ausencia y jugará con enorme orgullo. Competir duro en la fase de grupos es el objetivo realista para Bafana Bafana.'
  },
  COD: {
    name: 'DR Congo', nameEs: 'RD del Congo', elo: 1655,
    style: 'Physical and technical with powerful midfielders and pace in the wide areas.',
    styleEs: 'Físico y técnico con mediocampistas poderosos y velocidad por las bandas.',
    strengths: ['Physical power', 'Individual talent', 'Pace and athleticism'],
    strengthsEs: ['Poder físico', 'Talento individual', 'Velocidad y atletismo'],
    keyPlayers: ['Chancel Mbemba', 'Arthur Masuaku', 'Cédric Bakambu'],
    analysis: 'DR Congo qualified for their first World Cup in decades through a dramatic playoff. Their physical profile and talent make them a genuine threat to progress from their group.',
    analysisEs: 'RD del Congo clasificó a su primer Mundial en décadas a través de un dramático repechaje. Su perfil físico y talento los convierte en una amenaza real para avanzar de su grupo.'
  },
  UZB: {
    name: 'Uzbekistan', nameEs: 'Uzbekistán', elo: 1727,
    style: 'Technical possession-based game with a strong midfield core and patient buildup from the back.',
    styleEs: 'Juego técnico de posesión con un sólido núcleo de mediocampo y construcción paciente desde atrás.',
    strengths: ['Midfield quality', 'Tactical discipline', 'Young talent emerging'],
    strengthsEs: ['Calidad en el mediocampo', 'Disciplina táctica', 'Surgimiento de jóvenes talentos'],
    keyPlayers: ['Eldor Shomurodov', 'Jasur Yaxshiboev', 'Otabek Shukurov'],
    analysis: 'Uzbekistan make their World Cup debut as a major surprise from AFC qualifying. Their technical style could trouble opponents, but the step up in quality will be enormous.',
    analysisEs: 'Uzbekistán debuta en el Mundial como una gran sorpresa de la clasificación AFC. Su estilo técnico podría incomodar rivales, pero el salto de calidad será enorme.'
  },
  JOR: {
    name: 'Jordan', nameEs: 'Jordania', elo: 1690,
    style: 'Defensively solid with a direct attacking approach and strong team cohesion.',
    styleEs: 'Defensivamente sólido con un enfoque atacante directo y fuerte cohesión de equipo.',
    strengths: ['Defensive organization', 'Team spirit', 'Counter-attacking threat'],
    strengthsEs: ['Organización defensiva', 'Espíritu de equipo', 'Peligro al contrataque'],
    keyPlayers: ['Musa Al-Taamari', 'Yazan Al-Naimat', 'Baha Faisal'],
    analysis: 'Jordan qualify for just their second World Cup as representatives of Asian football. Competing hard in what will be a tough group is their primary goal.',
    analysisEs: 'Jordania se clasifica para solo su segundo Mundial como representante del fútbol asiático. Competir con fuerza en lo que será un grupo difícil es su objetivo principal.'
  },
  IRQ: {
    name: 'Iraq', nameEs: 'Iraq', elo: 1607,
    style: 'Physical and competitive with a solid defensive foundation and direct forward play.',
    styleEs: 'Físico y competitivo con una sólida base defensiva y juego directo hacia adelante.',
    strengths: ['Physical resilience', 'Team cohesion', 'Determination'],
    strengthsEs: ['Resiliencia física', 'Cohesión del equipo', 'Determinación'],
    keyPlayers: ['Aymen Hussein', 'Amjad Attwan', 'Ahmed Yasin'],
    analysis: 'Iraq return to the World Cup stage after a long absence and will bring passion and determination. Competing for points in their group is the achievable benchmark.',
    analysisEs: 'Iraq regresa al escenario mundialista tras una larga ausencia con pasión y determinación. Competir por puntos en su grupo es el objetivo alcanzable.'
  },
  CPV: {
    name: 'Cabo Verde', nameEs: 'Cabo Verde', elo: 1549,
    style: 'Energetic and tenacious with a direct approach and strong team unity.',
    styleEs: 'Enérgico y tenaz con un enfoque directo y fuerte unidad de equipo.',
    strengths: ['Work ethic', 'Set pieces', 'Team spirit'],
    strengthsEs: ['Ética de trabajo', 'Pelotas paradas', 'Espíritu de equipo'],
    keyPlayers: ['Julio Tavares', 'Kenny Rocha Santos', 'Stopira'],
    analysis: 'Cabo Verde make their World Cup debut after stunning performances in AFCON. The islanders will be overjoyed to participate and will give everything to compete.',
    analysisEs: 'Cabo Verde debuta en el Mundial tras destacadas actuaciones en la AFCON. Los isleños estarán encantados de participar y darán todo para competir.'
  },
  CUW: {
    name: 'Curaçao', nameEs: 'Curazao', elo: 1436,
    style: 'Technical and direct with European-trained players giving them quality above their FIFA ranking.',
    styleEs: 'Técnico y directo, con jugadores entrenados en Europa que les dan calidad por encima de su ranking FIFA.',
    strengths: ['European-based talent', 'Individual quality', 'Passion and identity'],
    strengthsEs: ['Talento con base europea', 'Calidad individual', 'Pasión e identidad'],
    keyPlayers: ['Leandro Bacuna', 'Cuco Martina', 'Rangelo Janga'],
    analysis: 'Curaçao are a debutant nation at the World Cup, qualifying through the CONCACAF pathway. Their goal is to be competitive and show what small Caribbean nations can achieve.',
    analysisEs: 'Curazao debuta en el Mundial clasificando por la ruta CONCACAF. Su objetivo es ser competitivo y mostrar lo que las pequeñas naciones del Caribe pueden lograr.'
  },
  NZL: {
    name: 'New Zealand', nameEs: 'Nueva Zelanda', elo: 1585,
    style: 'Organized and collective with a direct approach and strong set-piece work.',
    styleEs: 'Organizado y colectivo con un enfoque directo y sólido trabajo en pelotas paradas.',
    strengths: ['Collective discipline', 'Set-piece threat', 'Passionate support'],
    strengthsEs: ['Disciplina colectiva', 'Peligro en pelotas paradas', 'Apoyo apasionado'],
    keyPlayers: ['Chris Wood', 'Clayton Lewis', 'Bill Tuiloma'],
    analysis: 'New Zealand qualified through the OFC intercontinental playoff and will compete with discipline and pride. Like 2010, competing hard in the group stage is their benchmark.',
    analysisEs: 'Nueva Zelanda clasificó mediante el repechaje OFC intercontinental y competirá con disciplina y orgullo. Como en 2010, competir bien en la fase de grupos es su referente.'
  },
  PAN: {
    name: 'Panama', nameEs: 'Panamá', elo: 1737,
    style: 'Compact and disciplined defensively with direct counter-attacks and set-piece threats.',
    styleEs: 'Compacto y disciplinado defensivamente con contraataques directos y peligro en jugadas de pelota parada.',
    strengths: ['Defensive solidity', 'CONCACAF experience', 'Set pieces'],
    strengthsEs: ['Solidez defensiva', 'Experiencia en CONCACAF', 'Pelotas paradas'],
    keyPlayers: ['Roman Torres', 'Ricardo Avila', 'Rolando Blackburn'],
    analysis: 'Panama are CONCACAF regulars who qualified strongly and will be a physical, difficult opponent. Advancing from the group would match their best-ever World Cup showing.',
    analysisEs: 'Panamá es habitual de la CONCACAF que clasificó con fuerza y será un rival físico y difícil. Avanzar de la fase de grupos igualaría su mejor actuación mundialista.'
  },
  HAI: {
    name: 'Haiti', nameEs: 'Haití', elo: 1532,
    style: 'Athletic and direct with individual flair and a never-say-die attitude throughout the pitch.',
    styleEs: 'Atlético y directo con destellos individuales y una actitud de nunca rendirse.',
    strengths: ['Individual flair', 'Pace and athleticism', 'Passionate collective effort'],
    strengthsEs: ['Destellos individuales', 'Velocidad y atletismo', 'Esfuerzo colectivo apasionado'],
    keyPlayers: ['Duckens Nazon', 'Frantz Pierrot', 'Steeven Saba'],
    analysis: 'Haiti make a historic World Cup appearance as CONCACAF representatives. Their passionate play and physical profile can trouble opponents, but the quality gap at this level is significant.',
    analysisEs: 'Haití hace una histórica aparición en el Mundial como representante de la CONCACAF. Su juego apasionado y perfil físico puede incomodar rivales, pero la brecha de calidad es significativa.'
  }
};

const merged = Object.assign({}, existing, staticNarratives);
fs.writeFileSync('src/data/team-narratives.json', JSON.stringify(merged, null, 2));
console.log('Total narratives saved:', Object.keys(merged).length, '/ 48');
