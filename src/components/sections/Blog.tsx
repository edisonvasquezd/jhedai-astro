import { motion } from "framer-motion";
import { ArrowRight, Clock } from "lucide-react";

import type { BlogPost } from "../../lib/api";

const categoryColors: Record<string, string> = {
  Industria: "bg-jhedai-primary/10 text-jhedai-primary",
  Regulación: "bg-jhedai-secondary/10 text-jhedai-secondary",
  Formación: "bg-jhedai-accent/10 text-jhedai-accent",
  Tendencias: "bg-emerald-500/10 text-emerald-600",
};

const PINNED_POSTS: BlogPost[] = [
  {
    slug: "eficiencia-inteligencia-artificial-lenguaje-cuantico",
    title: "Lenguaje Cuántico para IA: Un Nuevo Paradigma de Eficiencia en la Inteligencia Artificial",
    excerpt: "El desarrollo de un Lenguaje Cuántico para IA representa un salto disruptivo en la eficiencia de los sistemas de inteligencia artificial.",
    category: "Aspectos Técnicos IA Chile",
    readTime: "4 min",
    featuredImage: "https://imagedelivery.net/LUW2n1KCu7npWm7i7NCWng/b20cb1fc-1ff9-4d9e-f76b-ba7f8682d100/public",
    featuredImageAlt: "Lenguaje Cuántico para IA",
    featured: false,
    publishedAt: "",
    updatedAt: "",
    tags: [],
    faqItems: [],
    speakableSelectors: [],
    author: { id: 0, slug: "", name: "JhedAI", type: "Organization", sameAs: [] },
  },
  {
    slug: "jhedai-participa-latam-gpt",
    title: "JhedAI participa en Latam-GPT",
    excerpt: "JhedAI se consolida como actor clave en el desarrollo de inteligencia artificial latinoamericana participando en el primer modelo de IA de LATAM.",
    category: "Aspectos Técnicos IA Chile",
    readTime: "5 min",
    featuredImage: "https://imagedelivery.net/LUW2n1KCu7npWm7i7NCWng/a7de2c67-f89a-44d7-b7ef-869956deb600/public",
    featuredImageAlt: "JhedAI en Latam-GPT",
    featured: false,
    publishedAt: "",
    updatedAt: "",
    tags: [],
    faqItems: [],
    speakableSelectors: [],
    author: { id: 0, slug: "", name: "JhedAI", type: "Organization", sameAs: [] },
  },
  {
    slug: "privacidad-datos-ia-riesgos-empresariales-jhedai",
    title: "Privacidad Datos IA: Los Riesgos Ocultos que Amenazan a las Empresas",
    excerpt: "La privacidad datos IA se ha convertido en una preocupación crítica para empresarios que utilizan herramientas de inteligencia artificial.",
    category: "Aspectos Técnicos IA Chile",
    readTime: "9 min",
    featuredImage: "https://imagedelivery.net/LUW2n1KCu7npWm7i7NCWng/82b3d893-d0fe-4968-c78c-dce8543e5100/public",
    featuredImageAlt: "Privacidad de datos en IA",
    featured: false,
    publishedAt: "",
    updatedAt: "",
    tags: [],
    faqItems: [],
    speakableSelectors: [],
    author: { id: 0, slug: "", name: "JhedAI", type: "Organization", sameAs: [] },
  },
  {
    slug: "capacitaciones-ia-empresas-chile-chilevalora",
    title: "Capacitaciones IA Empresas Chile: JhedAI Pionero Nacional con Evaluadores Oficiales ChileValora",
    excerpt: "Las Capacitaciones IA empresas Chile han alcanzado un hito histórico con la oficialización de los primeros 5 perfiles laborales en IA.",
    category: "Blog IA Chile",
    readTime: "12 min",
    featuredImage: "https://imagedelivery.net/LUW2n1KCu7npWm7i7NCWng/5981d6cd-3dd0-4972-9a09-f282149ce000/public",
    featuredImageAlt: "Capacitaciones IA Chile ChileValora",
    featured: false,
    publishedAt: "",
    updatedAt: "",
    tags: [],
    faqItems: [],
    speakableSelectors: [],
    author: { id: 0, slug: "", name: "JhedAI", type: "Organization", sameAs: [] },
  },
];

const Blog = () => {
  const posts = PINNED_POSTS;
  const [featured, ...secondary] = posts;

  return (
    <section id="blog" className="py-24 relative bg-white">
      <div className="container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-[14px] text-jhedai-secondary font-bold tracking-widest mb-4">
            BLOG
          </p>
          <h2 className="text-3xl lg:text-4xl font-bold text-jhedai-primary mb-4">
            Insights de IA Industrial
          </h2>
          <p className="text-jhedai-primary/60 text-[16px] max-w-2xl mx-auto leading-relaxed">
            Artículos, análisis y casos de estudio sobre inteligencia artificial
            aplicada a la industria chilena.
          </p>
        </motion.div>

        {/* Featured article */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <a
            href={`/blog/${featured.slug}`}
            className="group block relative rounded-2xl overflow-hidden"
          >
            {featured.featuredImage && (
              <img
                src={featured.featuredImage}
                alt={featured.featuredImageAlt || featured.title}
                width={800}
                height={450}
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-jhedai-primary/85" />
            <div className="absolute inset-0 bg-gradient-to-r from-jhedai-primary via-jhedai-primary/80 to-jhedai-secondary/30" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:30px_30px]" />

            <div className="relative z-10 p-10 lg:p-16">
              <div className="flex items-center gap-3 mb-4">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-white">
                  {featured.category}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-white/50">
                  <Clock size={12} />
                  {featured.readTime} lectura
                </span>
              </div>
              <h3 className="text-2xl lg:text-3xl font-bold text-white mb-4 max-w-2xl group-hover:text-jhedai-secondary transition-colors">
                {featured.title}
              </h3>
              <p className="text-white/60 text-[16px] max-w-xl leading-relaxed mb-6">
                {featured.excerpt}
              </p>
              <span className="inline-flex items-center gap-2 text-[14px] font-semibold text-jhedai-secondary group-hover:text-white transition-colors">
                Leer artículo{" "}
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </span>
            </div>
          </a>
        </motion.div>

        {/* Secondary articles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {secondary.slice(0, 3).map((article, i) => (
            <motion.div
              key={article.slug}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <a
                href={`/blog/${article.slug}`}
                className="group block glass-card overflow-hidden cursor-pointer hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
              >
                {article.featuredImage && (
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={article.featuredImage}
                      alt={article.featuredImageAlt || article.title}
                      width={400}
                      height={225}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${categoryColors[article.category] ?? "bg-jhedai-primary/10 text-jhedai-primary"}`}
                    >
                      {article.category}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-jhedai-primary/40">
                      <Clock size={12} />
                      {article.readTime}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-jhedai-primary mb-3 group-hover:text-jhedai-secondary transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-[15px] text-jhedai-primary/60 leading-relaxed mb-4 line-clamp-2">
                    {article.excerpt}
                  </p>
                  <span className="inline-flex items-center gap-2 text-[14px] font-semibold text-jhedai-primary/40 group-hover:text-jhedai-secondary transition-colors">
                    Leer{" "}
                    <ArrowRight
                      size={14}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </span>
                </div>
              </a>
            </motion.div>
          ))}
        </div>

        {/* Ver todos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <a
            href="/blog"
            className="boton-secundario inline-flex items-center gap-2 text-[14px]"
          >
            Ver todos los artículos <ArrowRight size={16} />
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default Blog;
