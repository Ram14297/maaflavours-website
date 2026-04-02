// src/lib/constants/blog.ts
// Maa Flavours — Blog / Recipes Content
// 6 rich posts: recipes, culture, health, pairing guide, behind-the-scenes
// When Supabase CMS is added, these static posts become the seed data

export type PostCategory =
  | "recipe"
  | "culture"
  | "health"
  | "tips"
  | "behind-the-scenes";

export interface PostAuthor {
  name: string;
  role: string;
  initials: string;
}

export type ContentBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "quote"; text: string; attribution?: string }
  | { type: "tip"; icon: string; title: string; text: string }
  | { type: "image"; emoji: string; caption: string }
  | { type: "recipe"; title: string; serves: string; prepTime: string; cookTime: string; ingredients: string[]; steps: string[] }
  | { type: "divider" }
  | { type: "productCta"; slug: string; name: string; emoji: string; tagline: string };

export interface BlogPost {
  slug: string;
  title: string;
  subtitle: string;
  excerpt: string;
  category: PostCategory;
  categoryLabel: string;
  emoji: string;
  readTime: string;
  publishedAt: string;
  author: PostAuthor;
  tags: string[];
  isFeatured: boolean;
  relatedSlugs: string[];
  body: ContentBlock[];
}

const FOUNDER: PostAuthor = {
  name: "Maa Flavours Kitchen",
  role: "Ongole, Andhra Pradesh",
  initials: "MF",
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "drumstick-pickle-andhra-recipe",
    title: "The Secret Behind Andhra's Best Drumstick Pickle",
    subtitle: "A generational recipe, finally put into words",
    excerpt:
      "Murungakkai Pachadi — Andhra-style drumstick pickle — smells like someone's grandmother's kitchen. Here's the story and the full recipe.",
    category: "recipe",
    categoryLabel: "Recipe",
    emoji: "🥢",
    readTime: "7 min read",
    publishedAt: "2025-06-15T09:00:00Z",
    author: FOUNDER,
    tags: ["Drumstick Pickle", "Andhra Recipe", "Murungakkai", "Traditional"],
    isFeatured: true,
    relatedSlugs: ["lemon-pickle-without-preservatives", "perfect-rice-pairings"],
    body: [
      { type: "paragraph", text: "There's a peculiar thing about drumstick pickle. It's one of those flavours that instantly transports you — to a grandmother's kitchen, a clay pot on a wood fire, the smell of sesame oil heating in a heavy iron kadai. No one forgets their first taste of proper Andhra drumstick pickle." },
      { type: "image", emoji: "🥢", caption: "Fresh drumsticks ready for pickling — sourced from local Ongole markets" },
      { type: "heading", level: 2, text: "Why Drumstick Pickle is Different" },
      { type: "paragraph", text: "Unlike mango or lemon pickle, drumstick pickle (Murungakkai Pachadi in Telugu) is deeply regional — and that's what makes it special. The drumstick absorbs the pickling spices in a way no other vegetable quite does. The fibrous texture creates pockets that hold oil and masala, so every bite is layered." },
      { type: "quote", text: "Maa never measured anything. She'd taste, adjust, taste again. The recipe lived in her hands, not in a notebook.", attribution: "Our founder" },
      { type: "heading", level: 2, text: "Selecting the Right Drumsticks" },
      { type: "paragraph", text: "The most important step happens at the market. You want young, tender drumsticks — the ones that snap cleanly without bending. Older drumsticks become stringy inside the pickle. Look for drumsticks that are uniformly green, firm to the touch, and about the thickness of your thumb." },
      { type: "tip", icon: "💡", title: "The Fresh Test", text: "Snap the drumstick in the middle. A fresh one breaks with a crisp sound and has a bright green interior. If it bends without breaking, it's too old for pickling." },
      {
        type: "recipe",
        title: "Andhra Drumstick Pickle (Murungakkai Pachadi)",
        serves: "Fills 1 × 500g pack",
        prepTime: "30 minutes",
        cookTime: "15 minutes + 2 days maturing",
        ingredients: [
          "500g fresh young drumsticks",
          "3 tbsp red chilli powder (Byadgi or Kashmiri)",
          "1 tsp turmeric powder",
          "2 tbsp salt (non-iodised rock salt preferred)",
          "1 tsp mustard seeds",
          "½ tsp fenugreek seeds (methi)",
          "½ tsp asafoetida (hing)",
          "1 tbsp lemon juice (for acidity balance)",
          "6–8 tbsp cold-pressed sesame oil (gingelly oil)",
          "1 sprig fresh curry leaves",
        ],
        steps: [
          "Wash drumsticks thoroughly, pat completely dry. Moisture is the enemy of a long-lasting pickle.",
          "Cut into 2-inch pieces. Score each piece lightly with a knife along one side to aid flavour absorption.",
          "Dry-roast mustard seeds and fenugreek seeds separately until fragrant. Cool and grind to a coarse powder.",
          "Heat oil until it just starts to smoke. Add curry leaves and asafoetida. Remove from heat and cool slightly.",
          "Toss drumstick pieces with salt and turmeric. Let sit 15 minutes to release moisture.",
          "Add red chilli powder and the ground mustard-fenugreek powder. Mix thoroughly, coating every piece.",
          "Pour warm (not hot) oil mixture over the drumsticks. Add lemon juice. Mix one final time.",
          "Pack tightly into a clean, dry glass pack. Press down so oil covers the top. Seal and store for at least 2 days before eating.",
        ],
      },
      { type: "heading", level: 2, text: "Storing Your Pickle" },
      { type: "paragraph", text: "Homemade drumstick pickle, made properly without moisture, stays fresh for 2–3 months at room temperature and up to 6 months refrigerated. The golden rule: always use a dry spoon. Water contamination is the fastest way to spoil a pickle." },
      { type: "tip", icon: "🫙", title: "Can't make it yourself?", text: "Our Drumstick Pickle is made following exactly this recipe — same spice ratios, same cold-pressed sesame oil, same Ongole kitchen." },
      { type: "productCta", slug: "drumstick-pickle", name: "Drumstick Pickle", emoji: "🥢", tagline: "Authentic Andhra Taste · Medium Spicy · No Preservatives" },
    ],
  },
  {
    slug: "perfect-rice-pairings",
    title: "5 Rice Pairings That Will Change Your Meals Forever",
    subtitle: "The right pickle with the right rice is a revelation",
    excerpt:
      "Not all pickles go with all rice dishes. Here's the definitive Andhra pairing guide — dal rice, curd rice, sambar rice, dosa, and more.",
    category: "tips",
    categoryLabel: "Pairing Guide",
    emoji: "🍚",
    readTime: "5 min read",
    publishedAt: "2025-06-22T09:00:00Z",
    author: FOUNDER,
    tags: ["Rice Pairings", "Andhra Food", "Pickle Pairings", "Meal Ideas"],
    isFeatured: true,
    relatedSlugs: ["drumstick-pickle-andhra-recipe", "gongura-andhra-wedding"],
    body: [
      { type: "paragraph", text: "In Andhra homes, the question isn't whether to eat pickle with rice. The question is always: which pickle? The right pairing is instinctive for those who grew up with it — but a revelation for everyone else. Here's what three generations of Andhra cooking has taught us." },
      { type: "heading", level: 2, text: "1. Dal Rice → Drumstick Pickle" },
      { type: "paragraph", text: "Dal rice is mild, earthy, slightly sweet. Drumstick pickle brings exactly what it's missing: medium heat, an oil-forward richness, and that distinctive drumstick flavour. The fibrous texture of the drumstick pieces gives you something to chew between spoonfuls of dal. This is the pairing that appears at almost every Andhra household lunch." },
      { type: "image", emoji: "🍚", caption: "Dal rice with drumstick pickle — the Andhra lunch that never gets old" },
      { type: "heading", level: 2, text: "2. Curd Rice → Lemon Pickle" },
      { type: "paragraph", text: "Curd rice is cooling, creamy, and neutral by design — the palate-cleanser at the end of a South Indian meal. Pair it with lemon pickle and you get a bright, tangy, citrus-forward bite that cuts through the creaminess beautifully. Sour-and-spicy lemon pickle with cool curd rice is one of the most balanced flavour pairings in any cuisine." },
      { type: "tip", icon: "🍋", title: "The Lemon Rule", text: "Use lemon pickle sparingly with curd rice — about ½ tsp per bite. It's intense, and the goal is contrast, not overwhelm." },
      { type: "heading", level: 2, text: "3. Dosa → Maamidi Allam" },
      { type: "paragraph", text: "Plain dosa — no sambar, no chutney — with Maamidi Allam on the side is a breakfast generations of Andhra people have eaten. The pickle's sweet-spicy-sour combination is complex enough that you don't need anything else. Tear a piece of dosa, scoop a small amount of Maamidi Allam, fold, eat. That's breakfast." },
      { type: "heading", level: 2, text: "4. Sambar Rice → Gongura Pickle" },
      { type: "paragraph", text: "Sambar rice is already acidic from tamarind. Gongura pickle is acidic from sorrel leaves. Pairing two sour things sounds counterintuitive — but it works because they're sour in completely different ways. Sambar gives a warm, spiced sourness. Gongura gives a sharp, herbal, almost raw sourness. The contrast makes both taste more complex." },
      { type: "heading", level: 2, text: "5. Plain Rice + Ghee → Red Chilli Pickle" },
      { type: "paragraph", text: "The simplest pairing, and arguably the most satisfying. Hot steamed rice, a teaspoon of ghee, and a small amount of red chilli pickle. The ghee softens the heat just enough that you can taste the complexity — the garlic, the mustard, the oil — without being overwhelmed. This is the meal Andhra grandmothers feed you when you're sick and when you're celebrating. Both occasions call for the same thing." },
      { type: "quote", text: "In Andhra, no meal is complete without pickle on the plate. It's not a condiment — it's the punctuation.", attribution: "Traditional Andhra saying" },
    ],
  },
  {
    slug: "amla-pickle-health-benefits",
    title: "Amla Pickle: The Most Underrated Health Food in Your Pantry",
    subtitle: "What science and Andhra tradition agree on",
    excerpt:
      "Indian gooseberry has been part of Ayurvedic tradition for centuries. Fermented into pickle, its benefits become even more concentrated.",
    category: "health",
    categoryLabel: "Health & Wellness",
    emoji: "🫙",
    readTime: "6 min read",
    publishedAt: "2025-07-01T09:00:00Z",
    author: FOUNDER,
    tags: ["Amla", "Health Benefits", "Vitamin C", "Ayurveda", "Traditional"],
    isFeatured: false,
    relatedSlugs: ["drumstick-pickle-andhra-recipe", "perfect-rice-pairings"],
    body: [
      { type: "paragraph", text: "Amla — Indian gooseberry — is one of the most nutritionally dense fruits in the world. Per 100 grams, it contains more Vitamin C than almost any other commonly eaten food. Ayurvedic tradition has used it for thousands of years to support digestion, immunity, and hair health. And yet, in the modern pantry, it goes unnoticed — overshadowed by imported superfoods that cost ten times as much and do a fraction of the work." },
      { type: "heading", level: 2, text: "What Pickling Does to Amla" },
      { type: "paragraph", text: "When amla is pickled, a natural fermentation process begins. The beneficial acids from the amla, combined with salt, create an environment where good bacteria can thrive. Traditional Andhra-style amla pickle — made without any vinegar, relying only on the natural acidity of the fruit — acts as a natural probiotic." },
      { type: "tip", icon: "🌿", title: "A Note on Vitamin C Retention", text: "Unlike cooking, which destroys water-soluble Vitamin C, pickling preserves much of it. The oil coating each piece acts as a barrier, slowing oxidation. Properly made amla pickle retains a significant portion of the fruit's original Vitamin C content." },
      { type: "heading", level: 2, text: "The Digestive Connection" },
      { type: "paragraph", text: "In Andhra tradition, amla pickle was always eaten after the main meal — a small piece with the final bite of rice. Amla is well-documented in both traditional medicine and modern research as supporting digestive enzyme function. The combination of amla's natural tannins with fenugreek seeds commonly used in Andhra pickle recipes creates what grandmothers called the 'settling' effect — that comfortable feeling after a heavy meal." },
      { type: "quote", text: "We eat amla pickle at the end of the meal, not the beginning. It's the full stop, not the comma.", attribution: "Traditional Andhra eating wisdom" },
      { type: "heading", level: 2, text: "How to Eat Amla Pickle for Maximum Benefit" },
      { type: "paragraph", text: "A small amount — just 1–2 pieces — with lunch or dinner is all that's needed. The pickle is intensely flavoured and its benefits are concentrated. Think of it less like a condiment and more like a supplement that happens to taste extraordinary." },
      { type: "productCta", slug: "amla-pickle", name: "Amla Pickle", emoji: "🫙", tagline: "Rich in Vitamin C · Sour & Spicy · No Preservatives" },
    ],
  },
  {
    slug: "gongura-andhra-wedding",
    title: "How Gongura Found Its Way to Every Andhra Wedding",
    subtitle: "The cultural story of Andhra's most beloved leaf",
    excerpt:
      "Gongura is so central to Andhra identity that it appears at weddings, festivals, and on the plates of Andhra people living across the world.",
    category: "culture",
    categoryLabel: "Food & Culture",
    emoji: "🍃",
    readTime: "8 min read",
    publishedAt: "2025-07-10T09:00:00Z",
    author: FOUNDER,
    tags: ["Gongura", "Andhra Culture", "Cultural Food", "Wedding Food"],
    isFeatured: true,
    relatedSlugs: ["perfect-rice-pairings", "amla-pickle-health-benefits"],
    body: [
      { type: "paragraph", text: "If you ask an Andhra person what food makes them most homesick, a significant number will say gongura. Not biryani, not pesarattu — gongura. The sharp, herbal, deeply sour flavour of this red-stemmed leaf is more than a taste preference. It's an identity." },
      { type: "image", emoji: "🍃", caption: "Freshly harvested gongura leaves — the foundation of Pulihora Gongura Pickle" },
      { type: "heading", level: 2, text: "What Is Gongura?" },
      { type: "paragraph", text: "Gongura (Hibiscus sabdariffa) is a leafy green also known as sorrel or Roselle. In Andhra and Telangana, it grows abundantly through the monsoon season. There are two main varieties — green-stemmed, which is milder, and red-stemmed, which is the one Andhra cooks prefer for its more intense sourness." },
      { type: "quote", text: "Gongura is Andhra's answer to anything. Feeling sad? Gongura. Celebrating? Gongura. Leaving for America? Pack three bags of gongura.", attribution: "Common Andhra saying" },
      { type: "heading", level: 2, text: "Gongura at Andhra Weddings" },
      { type: "paragraph", text: "Walk into any traditional Andhra wedding feast — the grand multi-course meal served on banana leaves — and you will find gongura in at least one form. Sometimes as Gongura Mutton, sometimes as Gongura Pappu (dal), sometimes as Gongura Pachadi (pickle). At the most traditional weddings in the Krishna and Godavari delta regions, all three appear on the same leaf." },
      { type: "paragraph", text: "The presence of gongura at a wedding isn't casual — it's a statement of regional identity. Andhra people who have moved to Mumbai, Delhi, or Bangalore often have gongura shipped to them specifically for important occasions. The diaspora in the US and UK sustains entire import businesses purely on the demand for gongura." },
      { type: "heading", level: 2, text: "How Gongura Pickle Is Made" },
      { type: "paragraph", text: "Gongura pickle — Pulihora Gongura — is the most concentrated form of gongura flavour. Fresh leaves are wilted, then cooked down with oil, chilli, and pickling spices until the moisture is mostly gone and the flavour intensifies into something almost jam-like in its richness." },
      { type: "tip", icon: "🍃", title: "The Leaf-to-Pickle Ratio", text: "It takes roughly 3–4 times the volume of fresh gongura leaves to produce the equivalent volume of finished pickle. This is why good gongura pickle is never cheap — and why shortcuts in quality are immediately obvious." },
      { type: "productCta", slug: "pulihora-gongura", name: "Pulihora Gongura", emoji: "🍃", tagline: "Rare & Traditional · Spicy · No Preservatives" },
    ],
  },
  {
    slug: "lemon-pickle-without-preservatives",
    title: "The Art of Making Lemon Pickle Without Preservatives",
    subtitle: "Nature already did the preserving — you just need to trust it",
    excerpt:
      "Commercial lemon pickle uses citric acid and sodium benzoate. Traditional Andhra lemon pickle uses none of that — and lasts just as long. Here's why.",
    category: "behind-the-scenes",
    categoryLabel: "Behind the Scenes",
    emoji: "🍋",
    readTime: "6 min read",
    publishedAt: "2025-07-18T09:00:00Z",
    author: FOUNDER,
    tags: ["Lemon Pickle", "No Preservatives", "Traditional Process", "Nimbu Achar"],
    isFeatured: false,
    relatedSlugs: ["drumstick-pickle-andhra-recipe", "perfect-rice-pairings"],
    body: [
      { type: "paragraph", text: "Walk into any supermarket and pick up a commercial lemon pickle. Turn it over and read the ingredients. You'll find: lemon, salt, oil, spices, citric acid, sodium benzoate, potassium sorbate. The last three are preservatives — added because the manufacturer can't control every variable in a mass-production facility. Traditional Andhra lemon pickle contains exactly none of those." },
      { type: "heading", level: 2, text: "Citric Acid: Already in the Lemon" },
      { type: "paragraph", text: "Lemon juice is naturally 5–8% citric acid by volume — enough acidity to inhibit the growth of most bacteria that cause food spoilage. Commercial manufacturers add extra citric acid because they're working with lower-quality lemons and want standardised acidity. Traditional pickling uses whole lemons at peak ripeness, which already contain sufficient natural citric acid." },
      { type: "image", emoji: "🍋", caption: "Whole lemons before pickling — freshness is the only preservative that matters" },
      { type: "heading", level: 2, text: "The Role of Salt" },
      { type: "paragraph", text: "Salt is one of the oldest food preservation methods in human history. Traditional Andhra lemon pickle uses non-iodised rock salt at a ratio that creates an environment hostile to harmful bacteria. The salt draws moisture out of the lemon, which combines with the natural lemon juice to create the brine in which the pickle matures." },
      { type: "tip", icon: "🧂", title: "Why Non-Iodised Salt?", text: "Iodine in table salt can inhibit the fermentation process and cause pickle to darken over time. Traditional pickling always uses rock salt (sendha namak) or sea salt without additives." },
      { type: "heading", level: 2, text: "Oil as a Protective Barrier" },
      { type: "paragraph", text: "Cold-pressed sesame oil — the traditional choice — is poured over the top of the pickle, ensuring lemon pieces are never exposed to air. Oxygen is what allows mould to grow. Eliminate oxygen contact and you eliminate the primary mechanism of spoilage. This is why the first instruction in any traditional pickle recipe is: always use a dry spoon." },
      { type: "quote", text: "The recipe is the preservative. If you follow the recipe faithfully, you don't need chemistry.", attribution: "Our founder's grandmother" },
      { type: "productCta", slug: "lemon-pickle", name: "Lemon Pickle", emoji: "🍋", tagline: "Classic Andhra Staple · Sour & Spicy · No Preservatives" },
    ],
  },
  {
    slug: "maamidi-allam-the-sweet-spicy-pickle",
    title: "Maamidi Allam: The Sweet-Spicy Pickle That Goes with Everything",
    subtitle: "Mango meets ginger in one of Andhra's most versatile condiments",
    excerpt:
      "Raw mango and ginger might seem like an unlikely combination — but Maamidi Allam pickle is one of the most versatile condiments in the Andhra kitchen.",
    category: "recipe",
    categoryLabel: "Product Spotlight",
    emoji: "🥭",
    readTime: "5 min read",
    publishedAt: "2025-07-28T09:00:00Z",
    author: FOUNDER,
    tags: ["Maamidi Allam", "Mango Ginger", "Andhra Pickle", "Sweet Spicy"],
    isFeatured: false,
    relatedSlugs: ["perfect-rice-pairings", "gongura-andhra-wedding"],
    body: [
      { type: "paragraph", text: "Maamidi Allam — a compound Telugu word combining mango (maamidi) and ginger (allam) — is exactly what it sounds like: a pickle made from raw mango and ginger together. What isn't immediately obvious is just how well these two ingredients work together, and how many different dishes this single pickle can accompany." },
      { type: "heading", level: 2, text: "The Flavour Profile" },
      { type: "paragraph", text: "Raw mango gives a sharp, fruity sourness with subtle sweetness. Ginger adds warmth, spiciness, and a clean aromatic quality. Together, in a base of chilli, mustard, and sesame oil, they create something with four distinct flavour notes simultaneously: sour, sweet, spicy, and warm. This complexity is why Maamidi Allam works as a pairing for so many different dishes." },
      { type: "image", emoji: "🥭", caption: "Raw mangoes and fresh ginger — the two-ingredient foundation of Maamidi Allam" },
      { type: "heading", level: 2, text: "What Maamidi Allam Goes With" },
      { type: "paragraph", text: "In Andhra cooking, Maamidi Allam is the most versatile pickle because its sweet-sour-spicy profile complements a wider range of dishes than most other pickles. It works with: plain dosa (where it replaces chutney), idli, plain rice with ghee, curd rice, upma, pesarattu, and — less well-known — as a spread on bread with butter. The mango-ginger combination translates across cuisines in a way that purely spicy pickles don't." },
      { type: "tip", icon: "🥭", title: "The Seasonal Window", text: "The best Maamidi Allam is made in April–June, when raw mangoes are at their firmest. Our pickle is made during peak season and stored properly to preserve that fresh mango character." },
      { type: "quote", text: "If you have Maamidi Allam in the house, you always have a complete meal. Just add rice.", attribution: "Our founder" },
      { type: "productCta", slug: "maamidi-allam", name: "Maamidi Allam", emoji: "🥭", tagline: "Best with Rice & Dosa · Medium Spicy & Sweet · No Preservatives" },
    ],
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
export function getFeaturedPosts(): BlogPost[] {
  return BLOG_POSTS.filter((p) => p.isFeatured);
}
export function getRelatedPosts(slug: string): BlogPost[] {
  const post = getPostBySlug(slug);
  if (!post) return [];
  return post.relatedSlugs.map((s) => getPostBySlug(s)).filter(Boolean) as BlogPost[];
}
export function formatBlogDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

export const CATEGORY_CONFIG: Record<PostCategory, { label: string; emoji: string; color: string; bg: string }> = {
  recipe:              { label: "Recipe",             emoji: "🍳", color: "var(--color-crimson)", bg: "rgba(192,39,45,0.08)" },
  culture:             { label: "Food & Culture",     emoji: "🏺", color: "var(--color-brown)",   bg: "rgba(74,44,10,0.08)"  },
  health:              { label: "Health & Wellness",  emoji: "🌿", color: "#2E7D32",              bg: "rgba(46,125,50,0.08)" },
  tips:                { label: "Pairing Guide",      emoji: "💡", color: "var(--color-gold)",    bg: "rgba(200,150,12,0.10)"},
  "behind-the-scenes": { label: "Behind the Scenes", emoji: "🔍", color: "var(--color-grey)",    bg: "rgba(107,107,107,0.08)"},
};
