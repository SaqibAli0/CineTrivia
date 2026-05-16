/**
 * Blog posts for CineTrivia.
 *
 * Each article targets a search keyword and links to movie pages.
 * Add new posts to the array below — they auto-appear on /blog.
 */

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt?: string;
  author: string;
  category: string;
  tags: string[];
  relatedMovies: string[];
  content: BlogSection[];
  coverImage?: string;
}

export interface BlogSection {
  heading?: string;
  body: string;
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'best-movie-recommendations-2025',
    title: 'Best Movie Recommendations for 2025: What to Watch Right Now',
    description: 'Looking for movie recommendations? Here are the best films to watch in 2025 — from blockbusters to hidden gems, curated by film lovers.',
    publishedAt: '2025-05-20',
    updatedAt: '2025-05-20',
    author: 'CineTrivia Team',
    category: 'Recommendations',
    tags: ['movie recommendations', 'what to watch', 'best movies 2025', 'new movies', 'movie suggestions'],
    relatedMovies: ['nosferatu-2024', 'dune-part-two-2024', 'the-substance-2024', 'interstellar-2014', 'inception-2010', 'the-dark-knight-2008'],
    content: [
      { body: 'Finding the right movie to watch shouldn\'t take longer than actually watching it. Whether you\'re looking for something new, a classic you missed, or a hidden gem nobody talks about — we\'ve got you covered. These are our top movie recommendations for 2025, organized by what you\'re in the mood for.' },
      { heading: 'How We Pick Our Recommendations', body: 'CineTrivia combines real film knowledge with smart technology to suggest movies. We look at ratings, genre trends, what\'s streaming right now, and what actual viewers are loving — not just what studios are pushing. Every recommendation here has been vetted by our team.' },
      { heading: 'Best New Movies to Watch in 2025', body: 'The year has already delivered some incredible films. Nosferatu brought gothic horror back with style, Dune: Part Two proved sequels can surpass originals, and The Substance showed that body horror can be smart social commentary. If you haven\'t caught up on these yet, start here.' },
      { heading: 'Best Movies for a Chill Night', body: 'Not every night calls for a three-hour epic. For something lighter, try The Grand Budapest Hotel for whimsy, Chef for feel-good vibes, or The Secret Life of Walter Mitty for gentle inspiration. These are the movies that feel like a warm blanket.' },
      { heading: 'Best Movies That Make You Think', body: 'Want something that sticks with you for days? Inception plays with reality in ways that reward rewatching. Arrival redefines what a sci-fi movie can be. And Parasite — if you somehow haven\'t seen it — is a masterclass in storytelling that shifts genres three times.' },
      { heading: 'Best Action Movies Right Now', body: 'For pure adrenaline, Mad Max: Fury Road is still unmatched. The John Wick series redefined action choreography. And if you want something newer, Furiosa expands the Mad Max universe in unexpected ways.' },
      { heading: 'How to Get Personalized Recommendations', body: 'Everyone\'s taste is different. That\'s why CineTrivia offers personalized recommendations — just tell us your mood and preferred genres, and we\'ll find the perfect movie for you. No account needed, completely free, and it takes about 5 seconds.' },
      { heading: 'What to Watch Tonight', body: 'Still can\'t decide? Here\'s the quick version: If you want thrills, watch Se7en. If you want laughs, watch The Grand Budapest Hotel. If you want to cry, watch Good Will Hunting. If you want your mind blown, watch Interstellar. Or just use our recommender — it\'s faster than reading this list.' },
    ],
  },
  {
    slug: 'what-to-watch-tonight',
    title: 'What to Watch Tonight: Smart Movie Picks for Every Mood',
    description: 'Can\'t decide what to watch? Use our mood-based guide to find the perfect movie tonight — whether you want thrills, laughs, tears, or something totally unexpected.',
    publishedAt: '2025-05-18',
    updatedAt: '2025-05-18',
    author: 'CineTrivia Team',
    category: 'Mood',
    tags: ['what to watch tonight', 'movie picker', 'movie suggestions', 'what movie should I watch', 'tonight'],
    relatedMovies: ['the-shawshank-redemption-1994', 'inception-2010', 'the-grand-budapest-hotel-2014', 'get-out-2017', 'parasite-2019', 'whiplash-2014'],
    content: [
      { body: 'It\'s the eternal question: what should I watch tonight? You\'ve scrolled through Netflix for 20 minutes, nothing looks good, and now you\'re frustrated. We get it. Here\'s a no-nonsense guide based on your mood right now.' },
      { heading: 'Feeling Stressed? Watch Something Light', body: 'When your brain is fried, you don\'t need a complex plot. The Grand Budapest Hotel is pure visual candy with enough humor to distract you. Paddington 2 is genuinely one of the most charming movies ever made (seriously). Or try Ratatouille — it\'s comfort food in movie form.' },
      { heading: 'Want to Feel Something Deep?', body: 'Sometimes you need a movie that hits you in the chest. The Shawshank Redemption is about hope when everything seems hopeless. Moonlight is quiet and devastating. And if you want a good cry that leaves you feeling better, watch Inside Out.' },
      { heading: 'Need an Adrenaline Rush?', body: 'For edge-of-your-seat tension, Sicario will have you holding your breath. Mad Max: Fury Road is two hours of pure chaos. And if you want smart action, Inception delivers spectacle with substance.' },
      { heading: 'In the Mood for Something Weird?', body: 'Everything Everywhere All at Once is the wildest movie of the decade — multiverse chaos that somehow makes you cry. The Lobster is darkly funny and completely bizarre. And Swiss Army Man... just trust us on this one.' },
      { heading: 'Date Night?', body: 'La La Land is the safe romantic pick that actually delivers. But if you want something with more edge, try Eternal Sunshine of the Spotless Mind — it\'s a love story that\'s honest about how messy relationships are. For laughs, The Big Sick is based on a true story and it\'s wonderful.' },
      { heading: 'Can\'t Decide? Let Us Pick', body: 'Seriously — our movie recommender takes 5 seconds. Pick a genre, pick a mood, and get a personalized suggestion instantly. No signup, no algorithm tracking your data, just a good movie recommendation. Try it at the top of our homepage.' },
    ],
  },
  {
    slug: 'how-cinetrivia-recommendations-work',
    title: 'How CineTrivia Finds Your Perfect Film',
    description: 'How does CineTrivia recommend movies? Learn how our recommendation engine works and why it gives better suggestions than Netflix or streaming algorithms.',
    publishedAt: '2025-05-16',
    updatedAt: '2025-05-16',
    author: 'CineTrivia Team',
    category: 'Features',
    tags: ['movie recommendations', 'how it works', 'movie algorithm', 'personalized recommendations', 'CineTrivia'],
    relatedMovies: ['the-matrix-1999', 'her-2013', 'ex-machina-2014', 'interstellar-2014'],
    content: [
      { body: 'Streaming platforms recommend movies based on what keeps you watching — not necessarily what you\'ll love. Their algorithms optimize for engagement time, not satisfaction. CineTrivia takes a different approach: we understand what you actually want to feel, then find the movie that delivers it.' },
      { heading: 'The Problem with Netflix Recommendations', body: 'Netflix\'s algorithm knows what you\'ve watched, but it doesn\'t know why you watched it. Did you finish that thriller because it was great, or because you fell asleep? Did you rewatch that comedy because it\'s your favorite, or because nothing else looked good? Streaming algorithms can\'t tell the difference.' },
      { heading: 'How CineTrivia Works', body: 'Our approach is simple: you tell us what you want. Pick genres you\'re in the mood for, select how you want to feel (excited, relaxed, thoughtful, scared), and we search through thousands of films to find the best match. We consider ratings, genre combinations, tone, pacing, and critical reception.' },
      { heading: 'Why Mood Matters More Than History', body: 'Your movie taste isn\'t static. Monday night you might want a mindless action movie. Friday you might want an art film. Sunday afternoon calls for something the whole family can watch. CineTrivia doesn\'t lock you into a profile — every recommendation starts fresh based on how you feel right now.' },
      { heading: 'Beyond the Algorithm', body: 'We also provide context that algorithms don\'t: fun facts about the movie, where to watch it, similar films if you want more, cast information, and honest descriptions. It\'s like having a film-obsessed friend who always knows what to suggest.' },
      { heading: 'Try It Yourself', body: 'The best way to understand how it works is to try it. Head to our homepage, pick a genre and mood, and see what comes up. It takes about 5 seconds and you might discover your new favorite movie. No account needed, no data collected, just good recommendations.' },
    ],
  },
  {
    slug: 'best-sci-fi-movies-of-all-time',
    title: '10 Best Sci-Fi Movies of All Time That Will Blow Your Mind',
    description: 'From mind-bending time travel to dystopian futures — these are the greatest science fiction films ever made, ranked by a lifelong fan.',
    publishedAt: '2025-05-01',
    author: 'CineTrivia Team',
    category: 'Lists',
    tags: ['sci-fi', 'best movies', 'recommendations'],
    relatedMovies: ['inception-2010', 'interstellar-2014', 'blade-runner-2049-2017', 'the-matrix-1999', 'arrival-2016', '2001-a-space-odyssey-1968', 'dune-part-two-2024', 'ex-machina-2014', 'alien-1979', 'the-terminator-1984'],
    content: [
      { body: 'I\'ve been obsessed with sci-fi since I was a kid watching reruns of The Twilight Zone. There\'s something about the genre that just hits different — it takes our biggest fears and wildest dreams and turns them into stories that stick with you for years. After way too many rewatches and late-night debates, here are my ten favorites.' },
      { heading: '1. Inception (2010)', body: 'Nolan basically made a heist movie inside a dream inside another dream, and somehow it all makes sense. The rotating hallway fight is still jaw-dropping, and that ending — I\'ve had arguments about that spinning top that lasted longer than the movie itself.' },
      { heading: '2. Interstellar (2014)', body: 'This one wrecked me emotionally. The scene where Cooper watches decades of messages from his kids? I wasn\'t ready. Nolan brought in actual physicist Kip Thorne to make the black hole accurate, and the docking sequence had me holding my breath in the theater.' },
      { heading: '3. Blade Runner 2049 (2017)', body: 'Villeneuve had no business making a sequel this good. Roger Deakins shot every single frame like a painting — the orange Las Vegas sequence alone deserved the Oscar. It\'s slow, it\'s meditative, and it rewards patience like few blockbusters do.' },
      { heading: '4. The Matrix (1999)', body: 'Hard to overstate how much this changed movies. Bullet-time, the leather trench coats, "there is no spoon" — it all entered the cultural vocabulary overnight. And underneath the action, there\'s genuinely interesting philosophy about free will and perception.' },
      { heading: '5. Arrival (2016)', body: 'A first contact movie where the weapon is linguistics. Amy Adams carries the whole thing on her shoulders, and the twist recontextualizes everything you\'ve watched. I immediately started it over when it ended.' },
      { heading: '6. 2001: A Space Odyssey (1968)', body: 'Look, I\'ll be honest — the first time I watched this I fell asleep during the stargate sequence. But on rewatch? It\'s unreal. Kubrick made this in 1968 and the effects still look better than half of what comes out today. HAL 9000 is still the scariest AI in cinema.' },
      { heading: '7. Dune: Part Two (2024)', body: 'Villeneuve finally got to make the movie he wanted. The scale is absurd — IMAX was basically mandatory. The sandworm riding scene gave me actual goosebumps, and Austin Butler\'s Feyd-Rautha is terrifying in the best way.' },
      { heading: '8. Ex Machina (2014)', body: 'Alex Garland made this for like $15 million and it\'s tighter than most $200M blockbusters. Three characters, one location, and by the end you\'re questioning everything about consciousness. Oscar Isaac dancing is a bonus.' },
      { heading: '9. Alien (1979)', body: 'Technically horror, but it\'s set in space so it counts. Ridley Scott understood that what you don\'t see is scarier than what you do. The chestburster scene apparently shocked the actual cast — their reactions are real. And Ripley is still the blueprint for strong female leads.' },
      { heading: '10. The Terminator (1984)', body: 'Cameron made this on a shoestring budget and it launched one of the biggest franchises ever. Arnold barely speaks and he\'s terrifying. The time-travel logic actually holds up, which is more than you can say for most of the sequels.' },
      { heading: 'Honorable Mentions', body: 'Eternal Sunshine, Children of Men, District 9, Annihilation — all could\'ve made this list on a different day. Sci-fi keeps delivering year after year, and honestly that\'s what makes ranking them so hard.' },
    ],
  },
  {
    slug: 'movies-like-interstellar',
    title: 'Movies Like Interstellar: 8 Mind-Bending Space Films',
    description: 'Loved Interstellar? Here are 8 movies that capture the same cosmic wonder, emotional weight, and scientific ambition.',
    publishedAt: '2025-05-05',
    author: 'CineTrivia Team',
    category: 'Recommendations',
    tags: ['interstellar', 'space movies', 'similar movies', 'christopher nolan'],
    relatedMovies: ['interstellar-2014', 'gravity-2013', 'the-martian-2015', 'arrival-2016', 'ad-astra-2019', 'contact-1997', 'moon-2009', 'sunshine-2007'],
    content: [
      { body: 'Interstellar is one of those movies that leaves a void when it ends. You want more — more of that scale, that emotion, that feeling of being tiny against the universe. I went looking for films that scratch the same itch, and these eight come closest.' },
      { heading: '1. Gravity (2013)', body: 'Cuarón opens with a 13-minute unbroken shot and never lets up. Sandra Bullock is alone in orbit, debris is shredding everything around her, and you feel every second of it. It\'s only 90 minutes but it\'ll exhaust you in the best way.' },
      { heading: '2. The Martian (2015)', body: 'Where Interstellar is heavy and emotional, The Martian is fun. Matt Damon grows potatoes on Mars using his own waste and cracks jokes about it. It\'s a survival movie that actually makes you feel good about humanity for once.' },
      { heading: '3. Arrival (2016)', body: 'This shares Interstellar\'s emotional DNA — it\'s really about parenthood and time and loss, just wrapped in an alien contact story. The less you know going in, the better. Trust me on this one.' },
      { heading: '4. Ad Astra (2019)', body: 'Brad Pitt goes to Neptune looking for his dad. It\'s quieter and more introspective than Interstellar — some people find it too slow, but if you vibe with it, the emotional payoff is real. The moon buggy chase is unexpectedly great.' },
      { heading: '5. Contact (1997)', body: 'Based on Carl Sagan\'s book, and you can feel his fingerprints everywhere. Jodie Foster is a scientist who picks up an alien signal, and the movie takes the "what would actually happen" approach seriously. The ending is divisive but I love it.' },
      { heading: '6. Moon (2009)', body: 'Sam Rockwell, alone on a moon base, slowly realizing something is very wrong. Duncan Jones made this for almost nothing and it\'s one of the best sci-fi films of the 2000s. Rockwell deserved an Oscar nomination and I\'ll die on that hill.' },
      { heading: '7. Sunshine (2007)', body: 'Danny Boyle\'s crew is flying into the sun to restart it. The first two-thirds are incredible hard sci-fi — then it takes a sharp turn that divides people. I think it works, but even if you disagree, the visuals alone are worth your time.' },
      { heading: '8. First Man (2018)', body: 'Chazelle shot the spacecraft interiors so tight and shaky that you feel claustrophobic. It\'s not a triumphant space movie — it\'s about what the space race cost the people involved. The moon landing scene in IMAX was transcendent.' },
    ],
  },
  {
    slug: 'best-movies-to-watch-when-sad',
    title: 'Movies to Watch When You\'re Sad: 10 Films That Get It',
    description: 'Feeling down? These movies won\'t just distract you — they\'ll meet you where you are and maybe help a little.',
    publishedAt: '2025-05-10',
    author: 'CineTrivia Team',
    category: 'Mood',
    tags: ['sad movies', 'comfort movies', 'emotional', 'feel-good'],
    relatedMovies: ['inside-out-2015', 'good-will-hunting-1997', 'the-shawshank-redemption-1994', 'up-2009', 'eternal-sunshine-of-the-spotless-mind-2004', 'its-a-wonderful-life-1946', 'soul-2020', 'the-secret-life-of-walter-mitty-2013'],
    content: [
      { body: 'When I\'m having a rough day, I don\'t want some forced comedy trying to cheer me up. I want a movie that understands what I\'m feeling — something that sits with the sadness but doesn\'t leave me there. These are my go-to picks for those days.' },
      { heading: '1. Inside Out (2015)', body: 'Pixar made a kids\' movie that explains emotions better than most therapy sessions. The core message — that you need sadness, that suppressing it makes everything worse — hit me harder at 30 than it would have at 10. Bring tissues.' },
      { heading: '2. Good Will Hunting (1997)', body: 'Robin Williams saying "it\'s not your fault" over and over until Matt Damon breaks down. That scene alone is worth watching the whole movie for. It\'s about a brilliant guy who\'s terrified of letting anyone close, and it\'s more relatable than it should be.' },
      { heading: '3. The Shawshank Redemption (1994)', body: 'I\'ve seen this probably fifteen times and it still works. Andy Dufresne\'s patience, his quiet refusal to give up — there\'s something deeply comforting about watching someone endure the worst and come out the other side.' },
      { heading: '4. Up (2009)', body: 'Those first ten minutes are devastating. But the rest of the movie is about Carl finding reasons to keep going, finding new people to care about. It earns its emotional moments because it doesn\'t shy away from the grief.' },
      { heading: '5. Eternal Sunshine of the Spotless Mind (2004)', body: 'Would you erase someone from your memory to stop the pain? Kaufman\'s answer is basically: no, because the pain is part of what made it real. It\'s messy and non-linear and achingly human.' },
      { heading: '6. It\'s a Wonderful Life (1946)', body: 'Yeah, it\'s old. Yeah, it\'s sentimental. But George Bailey realizing that his boring, frustrating life actually mattered to people? That hits different when you\'re feeling invisible.' },
      { heading: '7. Soul (2020)', body: 'Pixar asking "what\'s the point of life?" and answering with "just... living it." The pizza scene, the leaf scene — they\'re so simple but they reframe everything. I watched this during a rough patch and it genuinely helped.' },
      { heading: '8. The Secret Life of Walter Mitty (2013)', body: 'Ben Stiller daydreams about adventure until he finally goes on one. It\'s gentle and beautiful and the Iceland scenes make you want to quit your job and just go somewhere. Sometimes that fantasy is exactly what you need.' },
      { heading: 'Why This Works', body: 'There\'s actual research showing that emotional movies trigger oxytocin — the bonding hormone. Crying during a film is basically your brain processing feelings in a safe space. So if you need to cry, let it happen. That\'s the whole point.' },
    ],
  },
  {
    slug: 'best-horror-movies-2024-2025',
    title: 'Best Horror Movies of 2024-2025: The Scariest Films Right Now',
    description: 'From gothic vampires to body horror satire — these are the horror films that actually delivered in 2024 and 2025.',
    publishedAt: '2025-05-12',
    author: 'CineTrivia Team',
    category: 'Lists',
    tags: ['horror', 'best movies 2024', 'scary movies', 'new releases'],
    relatedMovies: ['a-quiet-place-day-one-2024', 'longlegs-2024', 'the-substance-2024', 'nosferatu-2024', 'alien-romulus-2024', 'late-night-with-the-devil-2023', 'talk-to-me-2022', 'hereditary-2018'],
    content: [
      { body: 'Horror has been on an incredible run lately. Studios are giving real directors real budgets, and the results speak for themselves. Here\'s what stood out over the past year — the stuff that actually scared me, not just startled me.' },
      { heading: 'Nosferatu (2024)', body: 'Eggers took his sweet time making this and it shows. Bill Skarsgård is barely recognizable under the makeup, and the whole thing feels like a fever dream from the 1800s. It\'s not fast, it\'s not loud — it just creeps under your skin and stays there.' },
      { heading: 'Longlegs (2024)', body: 'The marketing for this was brilliant — they showed almost nothing. Nicolas Cage is doing something completely unhinged with his performance and it works. The whole movie has this suffocating dread that doesn\'t let up. Perkins is the real deal.' },
      { heading: 'The Substance (2024)', body: 'This is disgusting in the best possible way. Fargeat made a body horror movie about Hollywood\'s obsession with youth and Demi Moore went all in. It\'s funny, it\'s gross, it\'s angry — and it makes Cronenberg look restrained by comparison.' },
      { heading: 'Alien: Romulus (2024)', body: 'Finally, an Alien movie that remembers what made the original work — tight spaces, limited resources, and a creature you can\'t fight. Álvarez strips it back to basics and it\'s exactly what the franchise needed.' },
      { heading: 'A Quiet Place: Day One (2024)', body: 'The prequel nobody asked for that turned out to be genuinely great. Lupita Nyong\'o carries it with a performance that\'s more sad than scary, and seeing Day One in New York adds a scale the other films lacked.' },
      { heading: 'Late Night with the Devil (2023)', body: 'A 70s talk show goes wrong on live TV. The found-footage format feels fresh here because the setting is so specific — the period details, the TV production style, all of it sells the premise. Clever and effective.' },
      { heading: 'Why Horror Is Thriving', body: 'The best horror right now isn\'t just about scares — it\'s about something. Aging, grief, bodily autonomy, isolation. Directors are using the genre to talk about real stuff, and audiences are responding. We\'re in a golden age and I don\'t think it\'s slowing down.' },
    ],
  },
  {
    slug: 'movies-like-the-dark-knight',
    title: 'Movies Like The Dark Knight: 7 Intense Crime Thrillers',
    description: 'The Dark Knight isn\'t really a superhero movie — it\'s a crime thriller. Here are 7 films that match its intensity.',
    publishedAt: '2025-05-15',
    author: 'CineTrivia Team',
    category: 'Recommendations',
    tags: ['the dark knight', 'thriller', 'similar movies', 'action'],
    relatedMovies: ['the-dark-knight-2008', 'heat-1995', 'se7en-1995', 'no-country-for-old-men-2007', 'sicario-2015', 'prisoners-2013', 'zodiac-2007', 'the-departed-2006'],
    content: [
      { body: 'Let\'s be real — The Dark Knight works because it\'s barely a superhero movie. Take away the cape and it\'s a Michael Mann crime epic with one of the greatest villains ever put on screen. If you want more of that energy, these seven films deliver.' },
      { heading: '1. Heat (1995)', body: 'Nolan has openly said Heat influenced The Dark Knight, and you can feel it. De Niro and Pacino on opposite sides of the law, that downtown shootout, the coffee shop scene — it\'s a three-hour masterclass in tension. Mann shot on real LA streets and it shows.' },
      { heading: '2. Se7en (1995)', body: 'Fincher\'s serial killer movie shares TDK\'s oppressive, rain-soaked atmosphere. The villain has a plan, the detectives are always one step behind, and the ending... well. If you haven\'t seen it, I genuinely envy you watching it for the first time.' },
      { heading: '3. No Country for Old Men (2007)', body: 'Chigurh is the Joker without the makeup — an unstoppable force with his own twisted moral code. The Coens strip away all the usual thriller safety nets. No score, no easy answers, no comfort. It\'s relentless.' },
      { heading: '4. Sicario (2015)', body: 'Villeneuve\'s cartel thriller had me white-knuckling my armrest. The border crossing scene is maybe the tensest five minutes I\'ve ever sat through in a theater. Benicio del Toro is terrifying in the quietest possible way.' },
      { heading: '5. Prisoners (2013)', body: 'Hugh Jackman\'s daughter goes missing and he loses his mind trying to find her. It asks the same questions as TDK — how far is too far? When does the hero become the villain? Villeneuve doesn\'t give you easy answers.' },
      { heading: '6. Zodiac (2007)', body: 'Fincher\'s three-hour procedural about obsession. Jake Gyllenhaal can\'t let the case go, even as it destroys his life. Like Batman, he\'s consumed by the pursuit of someone he might never catch. The basement scene is pure dread.' },
      { heading: '7. The Departed (2006)', body: 'Scorsese doing a Boston crime epic with a stacked cast. A cop pretending to be a criminal, a criminal pretending to be a cop — both slowly closing in on each other. The tension ratchets up until it explodes. Multiple times.' },
    ],
  },
  {
    slug: 'best-movies-on-netflix-right-now',
    title: 'Best Movies on Netflix Right Now (Updated Weekly)',
    description: 'Looking for something to watch on Netflix? Here are the best movies streaming right now — from new releases to hidden gems worth your time.',
    publishedAt: '2025-05-22',
    updatedAt: '2025-05-22',
    author: 'CineTrivia Team',
    category: 'Streaming',
    tags: ['netflix', 'streaming', 'best movies', 'what to watch on netflix', 'new on netflix'],
    relatedMovies: ['the-shawshank-redemption-1994', 'inception-2010', 'parasite-2019', 'the-dark-knight-2008'],
    content: [
      { body: 'Netflix\'s library changes constantly, and the homepage algorithm doesn\'t always surface the best stuff. We cut through the noise to highlight movies actually worth your time — whether you want a quick 90-minute watch or a sprawling epic.' },
      { heading: 'Top Picks This Week', body: 'The best movies on Netflix rotate frequently, but right now there are some standout options across every genre. Check our movie pages for real-time streaming availability — we update links so you always know exactly where to watch.' },
      { heading: 'Best Thrillers on Netflix', body: 'For edge-of-your-seat tension, Netflix has a solid thriller collection. Look for films with tight pacing, unexpected twists, and performances that keep you guessing. Our genre pages break these down with ratings and reviews.' },
      { heading: 'Best Comedies on Netflix', body: 'When you need a laugh, Netflix delivers. From sharp satires to feel-good rom-coms, there\'s something for every sense of humor. The best ones have replay value — you\'ll want to watch them again with friends.' },
      { heading: 'Hidden Gems You Missed', body: 'The best Netflix movies aren\'t always the ones on the trending list. Some of the platform\'s strongest films fly under the radar because they don\'t have massive marketing budgets. These are the ones that show up in "why didn\'t anyone tell me about this?" conversations.' },
      { heading: 'How to Find Good Movies Faster', body: 'Instead of scrolling endlessly, try our movie recommender. Tell us your mood and genre preference, and we\'ll point you to something great — whether it\'s on Netflix or another platform. Every movie page shows current streaming availability.' },
    ],
  },
  {
    slug: 'movies-to-watch-with-friends',
    title: 'Best Movies to Watch with Friends: Group Movie Night Picks',
    description: 'Planning a movie night? These are the best films to watch with friends — crowd-pleasers that everyone will enjoy, from comedies to thrillers.',
    publishedAt: '2025-05-24',
    updatedAt: '2025-05-24',
    author: 'CineTrivia Team',
    category: 'Mood',
    tags: ['movie night', 'watch with friends', 'group movies', 'party movies', 'crowd pleasers'],
    relatedMovies: ['superbad-2007', 'knives-out-2019', 'the-grand-budapest-hotel-2014', 'mad-max-fury-road-2015', 'get-out-2017', 'parasite-2019'],
    content: [
      { body: 'The hardest part of movie night isn\'t the snacks — it\'s getting everyone to agree on what to watch. You need something that works for different tastes, keeps everyone engaged, and ideally sparks conversation after. These picks have been tested in the field.' },
      { heading: 'Comedies Everyone Loves', body: 'Superbad still kills in a group setting. The Grand Budapest Hotel is visually stunning enough that even non-comedy fans get pulled in. Game Night is underrated and works perfectly for a crowd — it\'s funny, it\'s tense, and nobody sees the twists coming.' },
      { heading: 'Thrillers That Keep the Room Quiet', body: 'Knives Out is the perfect group thriller — everyone becomes a detective. Get Out works because the tension builds so gradually that the whole room is leaning forward by the end. And Parasite? The genre shifts will have everyone talking for hours.' },
      { heading: 'Action Movies for Maximum Energy', body: 'Mad Max: Fury Road is pure cinema — no phone-checking allowed. John Wick is stylish enough for the film buffs and action-packed enough for everyone else. Top Gun: Maverick proved that blockbusters can still deliver genuine thrills.' },
      { heading: 'Movies That Start Conversations', body: 'If your group likes to debate after, go with Inception (the ending alone is worth 30 minutes of argument), Interstellar (will make someone cry and someone else confused), or Everything Everywhere All at Once (will make everyone feel something different).' },
      { heading: 'Quick Picks by Group Size', body: 'Small group (2-3): Go weird — The Lobster, Swiss Army Man, or Midsommar. Medium group (4-6): Crowd-pleasers like Knives Out or The Nice Guys. Large group (7+): Big spectacle — Avengers: Endgame, Lord of the Rings, or any heist movie.' },
    ],
  },
  {
    slug: 'best-feel-good-movies',
    title: 'Best Feel-Good Movies: Films That Will Brighten Your Day',
    description: 'Need a mood boost? These feel-good movies are guaranteed to leave you smiling — from heartwarming comedies to inspiring true stories.',
    publishedAt: '2025-05-25',
    updatedAt: '2025-05-25',
    author: 'CineTrivia Team',
    category: 'Mood',
    tags: ['feel good movies', 'happy movies', 'uplifting films', 'comfort movies', 'mood boost'],
    relatedMovies: ['the-grand-budapest-hotel-2014', 'soul-2020', 'the-secret-life-of-walter-mitty-2013', 'paddington-2-2017', 'chef-2014', 'ratatouille-2007'],
    content: [
      { body: 'Sometimes you just need a movie that makes everything feel okay. Not mindless — just warm. These are the films that consistently deliver that feeling of walking out of the theater (or closing your laptop) with a genuine smile.' },
      { heading: 'Animated Comfort', body: 'Ratatouille is about following your passion against all odds, and it\'s gorgeous. Soul asks what makes life worth living and answers it beautifully. And Paddington 2 — yes, the bear movie — is genuinely one of the most joyful films ever made. Don\'t fight it.' },
      { heading: 'Comedies with Heart', body: 'The Grand Budapest Hotel is Wes Anderson at his most playful. Chef is a love letter to food and family that\'ll make you hungry and happy. Little Miss Sunshine proves that dysfunction can be beautiful when a family actually shows up for each other.' },
      { heading: 'Inspiring True Stories', body: 'The Pursuit of Happyness earns every emotional beat. Hidden Figures is triumphant without being preachy. And The Secret Life of Walter Mitty turns a simple premise — a daydreamer finally takes action — into something genuinely moving.' },
      { heading: 'Romance That Actually Works', body: 'About Time isn\'t just a rom-com — it\'s about appreciating ordinary days. Crazy Rich Asians is pure fun with real emotional stakes. And The Big Sick proves that the best love stories are the messy, real ones.' },
      { heading: 'When You Need It Most', body: 'Bad day? Start with Paddington 2 or Chef. Existential crisis? Soul or The Secret Life of Walter Mitty. Need to believe in people again? It\'s a Wonderful Life still works, every single time. Or just tell our recommender you want something "heartwarming" — we\'ll handle the rest.' },
    ],
  },
];

/**
 * Get all posts, newest first.
 */
export function getAllPosts(): BlogPost[] {
  return [...blogPosts].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

/**
 * Find a post by its URL slug.
 */
export function getPostBySlug(slug: string): BlogPost | null {
  return blogPosts.find((p) => p.slug === slug) ?? null;
}

/**
 * Filter posts by category name.
 */
export function getPostsByCategory(category: string): BlogPost[] {
  return getAllPosts().filter((p) => p.category.toLowerCase() === category.toLowerCase());
}

/**
 * List all unique category names.
 */
export function getAllCategories(): string[] {
  const cats = new Set(blogPosts.map((p) => p.category));
  return Array.from(cats).sort();
}
