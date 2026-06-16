export const siteConfig = {
  name: "RibbitTalk",
  description: "Learn English vocabulary smartly through AI Flashcards. Automatically generate vivid images and accurate pronunciation. Create and share your own vocabulary decks completely free.",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://ribbittalk.com",
  ogImage: "https://ribbittalk.com/rabbit-mascot.png",
  links: {
    facebook: "https://facebook.com/ribbittalk",
  },
  keywords: [
    "Learn English",
    "English Flashcards",
    "TOEIC vocabulary",
    "IELTS vocabulary",
    "AI language learning",
    "AI flashcard generator",
    "RibbitTalk",
  ],
};

export type SiteConfig = typeof siteConfig;
