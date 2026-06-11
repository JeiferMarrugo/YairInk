/**
 * Valores por defecto del CMS — solo se usan si no hay dato en BD (ver content-merge.ts).
 */
export const contentDefaults = {
  site: {
    name: "YAIRINK",
    tagline: "El Arte en tu Piel",
    artist: {
      name: "Yair",
      fullName: "Yair Ink",
      role: "ARTISTA RESIDENTE",
      bio: "Tatuador especializado en línea fina, blackwork y minimalismo. Cada pieza nace de una conversación entre anatomía, narrativa personal y precisión técnica.",
      experience: "8+ años",
      styles: ["Línea Fina", "Blackwork", "Minimalismo", "Ornamental"],
    },
    contact: {
      email: "hola@yairink.com",
      phone: "+34 612 345 678",
      whatsapp: "+34612345678",
      instagram: "https://instagram.com/yairink",
      instagramHandle: "@yairink",
    },
    location: {
      street: "Calle del Arte 12, Local 3",
      city: "Madrid",
      postalCode: "28004",
      country: "España",
      full: "Calle del Arte 12, Local 3 — Madrid, 28004",
      mapsUrl: "https://maps.google.com/?q=Madrid+28004",
    },
    hours: {
      label: "CITAS CON CITA PREVIA",
      schedule: "Martes a Sábado, 11:00 — 20:00",
    },
    nav: [
      { href: "/portfolio", label: "PORTAFOLIO" },
      { href: "/services", label: "SERVICIOS" },
      { href: "/about", label: "NOSOTROS" },
      { href: "/reviews", label: "RESEÑAS" },
      { href: "/booking", label: "RESERVAS" },
    ],
    pricing: [
      { title: "CONSULTA", desc: "Diseño, ubicación y dirección artística", price: "40€" },
      { title: "TARIFA HORARIA", desc: "Sesión estándar en estudio", price: "120€" },
      { title: "MÍNIMO", desc: "Por sesión", price: "80€" },
      { title: "KIT POST-CUIDADO", desc: "Productos premium de curación", price: "15€" },
    ],
    process: [
      "REVISIÓN DE CONSULTA (2-3 DÍAS)",
      "CONSULTA DE DISEÑO",
      "SEÑAL Y RESERVA",
      "LA SESIÓN",
    ],
    philosophy:
      "Creemos que el cuerpo es una galería viva, que merece únicamente los trazos más intencionados.",
    copyrightTemplate: "© {{year}} YAIRINK. TODOS LOS DERECHOS RESERVADOS.",
    seo: {
      title: "YAIRINK — Estudio de Tatuaje Fine Line",
      description:
        "Estudio de tatuaje de Yair. Fine line, blackwork y minimalismo con precisión editorial en Madrid.",
    },
  },
  images: {
    hero: "/images/portfolio/hero-floral.jpg",
    studio: "/images/studio/workstation.jpg",
    login: "/images/portfolio/artist-at-work.jpg",
    services: {
      fineline: "/images/portfolio/hero-floral.jpg",
      ornamental: "/images/portfolio/geometric-shoulder.jpg",
      microRealism: "/images/portfolio/micro-realism-eye.jpg",
      hero: "/images/portfolio/artist-at-work.jpg",
    },
    home: {
      geometric: "/images/portfolio/geometric-shoulder.jpg",
      botanical: "/images/portfolio/botanical-forearm.jpg",
      minimal: "/images/portfolio/hero-floral.jpg",
    },
    quote: "/images/studio/workstation.jpg",
    alts: {
      hero: "Tatuaje fine line de {{artistName}}",
      studio: "Interior del estudio {{siteName}}",
      quote: "Estación de trabajo del estudio {{siteName}}",
      homeGeometric: "Tatuaje geométrico en hombro",
      homeBotanical: "Tatuaje botánico en antebrazo",
      homeMinimal: "Tatuaje minimalista",
      aboutArtist: "{{artistFullName}} tatuando",
      servicesHero: "{{artistFullName}} trabajando",
    },
  },
  portfolioFilters: ["TODOS", "LÍNEA FINA", "BLACKWORK", "MINIMALISMO"],
  pages: {
    home: {
      heroDescription:
        "Línea fina, blackwork y minimalismo con detalle meticuloso. Transformamos narrativas personales en formas físicas atemporales a través de un tatuaje editorial de alto contraste.",
      heroCta: "AGENDAR CONSULTA",
      philosophyLabel: "FILOSOFÍA",
      portfolioTitle: "Portafolio",
      portfolioDescription:
        "Una selección curada de trabajos recientes con énfasis en geometría, detalle botánico y composiciones etéreas.",
      portfolioLink: "VER TODO EL TRABAJO",
      investmentLabel: "Inversión",
      ctaTitle: "¿Listo para el próximo capítulo de tu piel?",
      ctaDescription:
        "Abrimos agenda trimestralmente. Las citas confirmadas requieren señal no reembolsable.",
      ctaButton: "SOLICITAR CITA",
    },
    about: {
      label: "NOSOTROS",
      title: "Donde la intención se vuelve permanente.",
      introTemplate:
        "{{siteName}} es el estudio de {{artistName}}, dedicado al tatuaje editorial de alto contraste. Cada pieza es una colaboración entre artista y lienzo — diseñada para honrar la anatomía y la narrativa personal.",
      experienceLabel: "EXPERIENCIA",
      stylesLabel: "ESTILOS",
      cta: "AGENDAR CONSULTA",
      locationTitle: "Ubicación",
      contactTitle: "Contacto",
      socialTitle: "Redes",
    },
    services: {
      heroTitle: "Crear permanencia a través de la intención artística.",
      heroDescription:
        "El estudio de {{artistName}} se especializa en tatuaje editorial de alto contraste que honra la permanencia de la tinta y la naturaleza efímera de cada narrativa personal.",
      services: [
        {
          number: "01",
          title: "Fineline",
          description:
            "Trabajo delicado de aguja única que enfatiza precisión y sutileza. Cada composición etérea complementa los contornos naturales del cuerpo.",
          bullets: ["PRECISIÓN DE AGUJA ÚNICA", "MÍNIMO TRAUMA EN LA PIEL", "GROSOR DE LÍNEA DELICADO"],
          imageKey: "fineline",
          imageAlt: "Tatuaje floral fineline",
          imageLeft: false,
        },
        {
          number: "02",
          title: "Ornamental",
          description:
            "Diseños geométricos e inspirados en mandalas que fluyen con la estructura anatómica. Cada pieza es una meditación sobre simetría y geometría sagrada.",
          bullets: ["FLUJO ANATÓMICO", "GEOMETRÍA SAGRADA", "COMPOSICIÓN SIMÉTRICA"],
          imageKey: "ornamental",
          imageAlt: "Tatuaje ornamental mandala",
          imageLeft: true,
        },
        {
          number: "03",
          title: "Micro-realismo",
          description:
            "Obras miniatura hiperdetalladas que capturan realismo fotográfico a escala reducida. Requieren dominio técnico excepcional y paciencia.",
          bullets: [],
          imageKey: "microRealism",
          imageAlt: "Tatuaje micro-realismo",
          imageLeft: false,
          showButton: true,
          buttonLabel: "VER TRABAJOS RECIENTES",
        },
      ],
      philosophyLabel: "02 / FILOSOFÍA",
      philosophyTitle: "El ritual de transformación en la piel.",
      philosophyDescription:
        "Tatuar es una práctica ancestral de marcar significado en el cuerpo. Cada sesión es un ritual colaborativo que honra la confianza depositada en nuestras manos.",
      philosophyCards: [
        {
          title: "DISEÑO CURADO",
          description:
            "Cada diseño es a medida, creado en diálogo con tu anatomía y narrativa.",
        },
        {
          title: "ENFOQUE ATEMPORAL",
          description:
            "Diseñamos pensando en cómo envejece la tinta, asegurando claridad por décadas.",
        },
      ],
      hygieneLabel: "PROTOCOLO DE HIGIENE",
      hygieneTitle: "Precisión de grado médico en un entorno de galería.",
      hygieneDescription:
        "Tu seguridad es lo primero. El estudio supera los estándares del sector en esterilización y prevención de contaminación cruzada.",
      hygieneItems: [
        { icon: "✚", title: "ESTERILIZACIÓN", desc: "Autoclave de grado hospitalario para todo el material reutilizable." },
        { icon: "◎", title: "ENTORNO", desc: "Aire filtrado HEPA y desinfección profunda diaria del estudio." },
        { icon: "◆", title: "CERTIFICACIÓN", desc: "Artista certificado en patógenos sanguíneos y primeros auxilios." },
      ],
      ctaTitle: "¿Listo para comenzar tu viaje?",
      ctaPrimary: "FORMULARIO DE CONSULTA",
      ctaSecondary: "VER LA GALERÍA",
      serviceSectionLabel: "SERVICIOS",
    },
    portfolio: {
      title: "La intersección entre piel y arte.",
      subtitle:
        "Un cruce de narrativas permanentes, especializado en precisión anatómica y estética monocromática de alto contraste.",
      quote: "El arte es la firma de las civilizaciones.",
      filterAllLabel: "TODOS",
      ctaTitle: "Comienza tu viaje.",
      ctaDescription:
        "Las consultas son solo con cita previa. Nos enfocamos en narrativas a medida adaptadas a tu anatomía.",
      ctaLink: "CONSULTAR AHORA →",
    },
    booking: {
      title: "Solicitud de Consulta.",
      description:
        "Cada pieza empieza con una conversación. Comparte tu visión y te contactaremos para hablar de dirección artística y disponibilidad.",
      locationTitle: "UBICACIÓN",
      mapLink: "VER EN MAPA",
      contactTitle: "CONTACTO",
      scheduleTitle: "HORARIO",
      processTitle: "PROCESO",
    },
    reviews: {
      label: "RESEÑAS",
      titleTemplate: "Lo que dicen quienes confiaron en {{artistName}}.",
      description:
        "Cada pieza es una colaboración. Explora el trabajo real y las experiencias de clientes que han llevado su narrativa a la piel con YAIRINK.",
      starsAriaLabel: "{{count}} de 5 estrellas",
      verifiedLabel: "RESEÑAS VERIFICADAS",
      clientPromptLabel: "¿YA ERES CLIENTE?",
      clientPromptDescription: "Comparte tu experiencia directamente por WhatsApp.",
      clientPromptCta: "DEJAR MI RESEÑA",
      footerTitle: "¿Listo para tu próxima pieza?",
      footerDescription: "Agenda una consulta y conversemos sobre tu proyecto.",
      footerPrimaryCta: "SOLICITAR CONSULTA",
      footerSecondaryCta: "WHATSAPP",
    },
  },
  components: {
    header: { ctaLabel: "RESERVAR" },
    footer: {
      links: [
        { href: "{{instagramUrl}}", label: "INSTAGRAM", external: true },
        { href: "/about", label: "PRIVACIDAD", external: false },
        { href: "/about", label: "TÉRMINOS", external: false },
        { href: "/booking", label: "CONTACTO", external: false },
      ],
    },
    bookingForm: {
      successMessage:
        "Consulta enviada correctamente. Revisaremos tu propuesta y te contactaremos en 2-3 días hábiles.",
      connectionError: "Error de conexión. Comprueba tu red e inténtalo de nuevo.",
      submitLabel: "ENVIAR CONSULTA",
      submittingLabel: "ENVIANDO...",
      timeOptions: [
        "MAÑANA (10:00 - 13:00)",
        "TARDE (14:00 - 17:00)",
        "NOCHE (18:00 - 20:00)",
      ],
      fields: {
        fullName: { label: "NOMBRE COMPLETO", placeholder: "TU NOMBRE" },
        email: { label: "EMAIL", placeholder: "EMAIL@EJEMPLO.COM" },
        phone: {
          label: "WHATSAPP / TELÉFONO",
          placeholder: "300 123 4567",
          hint: "Selecciona tu país e ingresa tu número móvil.",
        },
        concept: {
          label: "DESCRIPCIÓN DEL CONCEPTO",
          placeholder: "DESCRIBE TU VISIÓN, TEMAS Y TONO EMOCIONAL...",
        },
        size: { label: "TAMAÑO ESTIMADO (CM)", placeholder: "EJ. 15CM X 10CM" },
        placement: { label: "ZONA DEL CUERPO", placeholder: "EJ. ANTEBRAZO INTERIOR" },
        timePreference: { label: "HORARIO PREFERIDO" },
        preferredMonth: { label: "MES PREFERIDO" },
      },
    },
  },
  portfolioItems: [
    {
      title: "Estudio Botánico No. 14",
      meta: "LÍNEA FINA • 2024",
      category: "LÍNEA FINA",
      src: "/images/portfolio/hero-floral.jpg",
      alt: "Tatuaje floral de línea fina en brazo",
      images: [
        { src: "/images/portfolio/hero-floral.jpg", alt: "Tatuaje floral de línea fina en brazo" },
        { src: "/images/portfolio/botanical-forearm.jpg", alt: "Detalle botánico en antebrazo" },
      ],
      layout_size: "large",
      sort_order: 1,
    },
    {
      title: "Forma Arquitectónica",
      meta: "BLACKWORK • 2023",
      category: "BLACKWORK",
      src: "/images/portfolio/geometric-shoulder.jpg",
      alt: "Tatuaje geométrico en hombro",
      images: [
        { src: "/images/portfolio/geometric-shoulder.jpg", alt: "Tatuaje geométrico en hombro" },
        { src: "/images/portfolio/mandala-back.jpg", alt: "Vista posterior del blackwork geométrico" },
      ],
      layout_size: "small",
      sort_order: 2,
    },
    {
      title: "L'Esprit",
      meta: "MINIMALISMO • 2023",
      category: "MINIMALISMO",
      src: "/images/portfolio/minimal-face.jpg",
      alt: "Tatuaje minimalista de rostro en muñeca",
      images: [{ src: "/images/portfolio/minimal-face.jpg", alt: "Tatuaje minimalista de rostro en muñeca" }],
      layout_size: "grid",
      sort_order: 3,
    },
    {
      title: "Flor de Obsidiana",
      meta: "BLACKWORK • 2023",
      category: "BLACKWORK",
      src: "/images/portfolio/botanical-forearm.jpg",
      alt: "Mandala ornamental en antebrazo",
      images: [{ src: "/images/portfolio/botanical-forearm.jpg", alt: "Mandala ornamental en antebrazo" }],
      layout_size: "grid",
      sort_order: 4,
    },
    {
      title: "Atlas Celestial",
      meta: "LÍNEA FINA • 2023",
      category: "LÍNEA FINA",
      src: "/images/portfolio/mandala-back.jpg",
      alt: "Tatuaje celestial en torso",
      images: [
        { src: "/images/portfolio/mandala-back.jpg", alt: "Tatuaje celestial en torso" },
        { src: "/images/portfolio/geometric-shoulder.jpg", alt: "Detalle de línea fina en hombro" },
        { src: "/images/portfolio/hero-floral.jpg", alt: "Composición floral complementaria" },
      ],
      layout_size: "grid",
      sort_order: 5,
    },
    {
      title: "Ascenso Eólico",
      meta: "MINIMALISMO • 2023",
      category: "MINIMALISMO",
      src: "/images/portfolio/bird-shoulder.jpg",
      alt: "Tatuaje de ave en hombro",
      images: [{ src: "/images/portfolio/bird-shoulder.jpg", alt: "Tatuaje de ave en hombro" }],
      layout_size: "bottom-left",
      sort_order: 6,
    },
    {
      title: "Estudio Anatómico II",
      meta: "LÍNEA FINA • 2024",
      category: "LÍNEA FINA",
      src: "/images/portfolio/anatomical-heart.jpg",
      alt: "Tatuaje de corazón anatómico",
      images: [
        { src: "/images/portfolio/anatomical-heart.jpg", alt: "Tatuaje de corazón anatómico" },
        { src: "/images/portfolio/micro-realism-eye.jpg", alt: "Detalle micro-realismo" },
      ],
      layout_size: "bottom-right",
      sort_order: 7,
    },
  ],
  reviews: [
    { name: "María G.", piece: "Línea Fina — Floral", rating: 5, review_date: "Enero 2024", text: "Yair entendió exactamente lo que quería desde la primera consulta. El resultado superó cualquier expectativa: líneas impecables y un diseño que fluye con mi brazo.", image: "/images/portfolio/hero-floral.jpg", image_alt: "Tatuaje floral fine line de María G.", client_phone: "34611223344", sort_order: 1 },
    { name: "Carlos R.", piece: "Blackwork — Geométrico", rating: 5, review_date: "Noviembre 2023", text: "Profesionalismo total. El estudio es impecable y el proceso de diseño fue muy colaborativo. Repetiría sin dudarlo.", image: "/images/portfolio/geometric-shoulder.jpg", image_alt: "Tatuaje geométrico blackwork de Carlos R.", client_phone: "34622334455", sort_order: 2 },
    { name: "Laura M.", piece: "Minimalismo — Línea fina", rating: 5, review_date: "Octubre 2023", text: "Buscaba algo delicado y atemporal. Yair tiene un ojo increíble para la composición. Mi tatuaje curó perfectamente.", image: "/images/portfolio/minimal-face.jpg", image_alt: "Tatuaje minimalista de Laura M.", client_phone: "34633445566", sort_order: 3 },
    { name: "Diego S.", piece: "Ornamental — Espalda", rating: 5, review_date: "Agosto 2023", text: "Una pieza grande y compleja ejecutada con precisión milimétrica. La atención al detalle durante toda la sesión fue excepcional.", image: "/images/portfolio/botanical-forearm.jpg", image_alt: "Tatuaje ornamental en espalda de Diego S.", client_phone: "34644556677", sort_order: 4 },
    { name: "Ana P.", piece: "Línea Fina — Constelación", rating: 5, review_date: "Junio 2023", text: "La consulta previa marcó la diferencia. Me ayudó a refinar la idea y el resultado final es exactamente lo que imaginaba, pero mejor.", image: "/images/portfolio/mandala-back.jpg", image_alt: "Tatuaje celestial de Ana P.", client_phone: "34655667788", sort_order: 5 },
    { name: "Javier L.", piece: "Micro-realismo", rating: 5, review_date: "Abril 2023", text: "Increíble nivel de detalle en un formato pequeño. Yair es paciente, explica cada paso y el ambiente del estudio transmite mucha confianza.", image: "/images/portfolio/micro-realism-eye.jpg", image_alt: "Tatuaje micro-realismo de Javier L.", client_phone: "34666778899", sort_order: 6 },
  ],
};
