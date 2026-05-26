import { Product, User, CartItem, Order, Review, APILog } from "../src/types.ts";

// Pre-seeded products (toys, clothes, accessories, books)
export let productsDb: Product[] = [
  {
    id: "toy_1",
    name: "Magic Wooden Sensory Castle",
    category: "toys",
    price: 49.99,
    rating: 4.9,
    reviewCount: 18,
    image: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=500&auto=format&fit=crop&q=60",
    description: "An heirloom-grade handcrafted modular wood activity castle designed to promote spatial reasoning, fine motor skill discovery, and hours of screen-free imaginative play.",
    sparklyIntro: "🏰 Certified Magical Sensory Fortress!",
    ageGroup: "2 - 5 Years",
    features: [
      "100% sustainably harvested birch wood",
      "Organic child-safe plant dyes",
      "8 interactive modular drawbridges and turrets",
      "Includes 4 cute wooden royal dolls"
    ],
    stock: 25
  },
  {
    id: "toy_2",
    name: "Nebula Retro Space Explorer Rocket",
    category: "toys",
    price: 34.50,
    rating: 4.7,
    reviewCount: 12,
    image: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=500&auto=format&fit=crop&q=60",
    description: "Retro-modern double-decker wooden spaceship equipped with real sliding landing doors, sleeping bunks, an elevator crane, and responsive spring launching landing gears.",
    sparklyIntro: "🚀 Rocketing into deep orbit of child wonderment!",
    ageGroup: "4 - 8 Years",
    features: [
      "Heavy-duty solid maple construction",
      "Includes 2 astronaut figurines and 1 friendly alien friend",
      "Magnetic docking capsule cabin",
      "Glow-in-the-dark galaxy thruster decals"
    ],
    stock: 14
  },
  {
    id: "cloth_1",
    name: "Cozy Bear Pastel Dungarees Set",
    category: "clothes",
    price: 28.00,
    rating: 4.8,
    reviewCount: 32,
    image: "https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=500&auto=format&fit=crop&q=60",
    description: "An incredibly sweet organic cotton fleece overall paired with a soft long-sleeve knit shirt. Features friendly bear embroidery, tactile ears on the pockets, and easy-snap crotches.",
    sparklyIntro: "🐻 100% Fluffy organic double-knit cotton hug!",
    ageGroup: "0 - 24 Months",
    features: [
      "GOTS Certified 100% organic cotton fabric",
      "Lead-free sturdy metal push snaps",
      "Elasticized inner foot cuffs to prevent draft",
      "Includes matching scratch-proof mittens"
    ],
    stock: 40
  },
  {
    id: "cloth_2",
    name: "Iridescent Sparkle Rainbow Cape",
    category: "clothes",
    price: 32.00,
    rating: 4.9,
    reviewCount: 22,
    image: "https://images.unsplash.com/photo-1518887570146-0612132dd618?w=500&auto=format&fit=crop&q=60",
    description: "A whimsical princess playground-proof cape lined with comfortable soft satin and covered in a shimmering iridescent mesh. Staggered starry glitter prints make play dynamic.",
    sparklyIntro: "✨ Spreading shimmering stardust joy on every playground!",
    ageGroup: "3 - 7 Years",
    features: [
      "Multi-layered breathable mesh tulle",
      "Soft metallic velcro neck clasp for safety release",
      "Will not snag or shed glitter flakes",
      "Comes with a matching metallic golden crown headband"
    ],
    stock: 18
  },
  {
    id: "access_1",
    name: "Chubby Spiked Dino Corduroy Backpack",
    category: "accessories",
    price: 24.90,
    rating: 4.6,
    reviewCount: 15,
    image: "https://images.unsplash.com/photo-1543087903-1ac2ec7aa8c5?w=500&auto=format&fit=crop&q=60",
    description: "A lovable spiky-tail dinosaur backpack crafted with ultra-sturdy wide-wale cotton corduroy. Designed to hold tiny snack jars, storybooks, crayons, and park treasures safely.",
    sparklyIntro: "🦖 Perfect companion for preschool expeditions!",
    ageGroup: "1 - 4 Years",
    features: [
      "Breathable mesh padded back panels",
      "Adjustable ergonomic shoulder harnesses",
      "Cute soft plush spikes and a swingy tail zipper",
      "Interior leak-proof water bottle sleeve"
    ],
    stock: 30
  },
  {
    id: "access_2",
    name: "Cozy Dreamy Star Knit Beanie Set",
    category: "accessories",
    price: 19.50,
    rating: 4.8,
    reviewCount: 8,
    image: "https://images.unsplash.com/photo-1576243301015-4181f2452a7e?w=500&auto=format&fit=crop&q=60",
    description: "Merino wool knit beanie with cozy double fleece lining. Adorned with a fluffy faux-fur cloud puff and matched with touch-screen friendly mittens featuring non-slip cute paw grips.",
    sparklyIntro: "⭐ Warmest ears under the winter solar system!",
    ageGroup: "3 - 8 Years",
    features: [
      "Non-scratchy premium wool & synthetic fiber blend",
      "Windbreaker inner microfleece layer",
      "High thermal retention rated",
      "Stretched fit allows room for growth"
    ],
    stock: 50
  },
  {
    id: "book_1",
    name: "The Kind Dragon Who Forgot His Spark",
    category: "books",
    price: 14.99,
    rating: 5.0,
    reviewCount: 45,
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&auto=format&fit=crop&q=60",
    description: "A wonderfully written bedtime lesson about Barnaby, a tiny velvet dragon who loses his fire spark but discovers that his true glow comes from his warm acts of playground generosity.",
    sparklyIntro: "🐉 Explores empathy, heart, and true friendship!",
    ageGroup: "3 - 6 Years",
    features: [
      "Sturdy heavy-grade eco board book pages",
      "Vivid gold-foil textures on the cover",
      "Large, high-contrast dyslexic-friendly type",
      "Written by acclaimed child-health expert Dr. Amy Bloom"
    ],
    stock: 35
  },
  {
    id: "book_2",
    name: "Leo's Magical Galactic Sandbox Journey",
    category: "books",
    price: 12.90,
    rating: 4.7,
    reviewCount: 29,
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&auto=format&fit=crop&q=60",
    description: "Join Leo as he pours galactic blue sand into his favorite backyard bucket and suddenly is scooped up by a dreamship. Great storybook to transition active minds into peaceful dreams.",
    sparklyIntro: "💤 Ideal gentle cosmic bedtime wind-down fable",
    ageGroup: "5 - 9 Years",
    features: [
      "Hand-painted whimsical gouache artwork",
      "Interactive sky-gaze map in the endpapers",
      "Certified carbon-neutral high-grade paper prints",
      "Set includes a cute small glow-in-the-dark star decal"
    ],
    stock: 19
  }
];

export let usersDb: User[] = [
  {
    id: "user_admin",
    name: "TinyTreasure Caretaker",
    email: "saigoutham700@gmail.com",
    isAdmin: true,
    avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=AdminCare",
    createdAt: "2026-01-01T00:00:00Z"
  },
  {
    id: "user_parent",
    name: "Emily Watson (Parent)",
    email: "emily.parent@gmail.com",
    isAdmin: false,
    avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=Emily",
    createdAt: "2026-05-15T12:30:00Z"
  }
];

export let reviewsDb: Review[] = [
  {
    id: "rev_1",
    productId: "toy_1",
    productName: "Magic Wooden Sensory Castle",
    userName: "David Cole",
    userEmail: "david.c@outlook.com",
    rating: 5,
    comment: "Absolutely gorgeous craftsmanship! My 3-year-old hasn't stopped exploring the drawbridges. Well worth every penny, highly recommend for screen-free sensory growth.",
    createdAt: "2026-05-24T08:14:00Z"
  },
  {
    id: "rev_2",
    productId: "book_1",
    productName: "The Kind Dragon Who Forgot His Spark",
    userName: "Clara Adams",
    userEmail: "clara.adams@yahoo.com",
    rating: 5,
    comment: "This has quickly become my daughter's absolute favorite bedtime book. The lessons are incredibly tender, and the gold-foil illustration is sparkling under her bedside lamp.",
    createdAt: "2026-05-25T20:45:00Z"
  }
];

export let ordersDb: Order[] = [
  {
    id: "order_1001",
    userId: "user_parent",
    customerName: "Emily Watson (Parent)",
    customerEmail: "emily.parent@gmail.com",
    items: [
      {
        productId: "toy_2",
        product: productsDb[1],
        quantity: 1
      },
      {
        productId: "book_1",
        product: productsDb[6],
        quantity: 2
      }
    ],
    totalAmount: 64.48,
    status: "shipped",
    shippingAddress: "42 Sweetpea Lane, Merrywood, CA 90210",
    createdAt: "2026-05-20T14:15:00Z"
  }
];

// In-Memory Logs for REST API Playground
export let apiLogsDb: APILog[] = [];

// Helper to push logs safely
export function addApiLog(method: APILog["method"], path: string, status: number, reqBody?: any, resBody?: any) {
  const log: APILog = {
    id: "log_" + Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString(),
    method,
    path,
    status,
    requestBody: reqBody ? JSON.parse(JSON.stringify(reqBody)) : undefined,
    responseBody: resBody ? JSON.parse(JSON.stringify(resBody)) : undefined
  };
  apiLogsDb.unshift(log); // newest first
  if (apiLogsDb.length > 50) apiLogsDb.pop(); // clamp to 50 logs
}
