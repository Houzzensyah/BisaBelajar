<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Skill;
use App\Models\Course;
use App\Models\Post;
use App\Models\Swap;
use App\Models\Message;
use App\Models\Meeting;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UpdatedDatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Run the database seeds with updated structure including comprehensive posts.
     */
    public function run(): void
    {
        // Users
        $alice = User::firstOrCreate(
            ['email' => 'alice@example.com'],
            ['name' => 'Alice', 'bio' => 'Guitar teacher and self-taught musician. I love teaching beginners.', 'password' => bcrypt('password'), 'latitude' => 37.7749, 'longitude' => -122.4194]
        );
        $bob = User::firstOrCreate(
            ['email' => 'bob@example.com'],
            ['name' => 'Bob', 'bio' => 'Frontend developer and JavaScript enthusiast. I make short tutorials.', 'password' => bcrypt('password'), 'latitude' => 37.7810, 'longitude' => -122.4110]
        );
        $carol = User::firstOrCreate(
            ['email' => 'carol@example.com'],
            ['name' => 'Carol', 'bio' => 'Home cook who experiments with flavors and shares recipes.', 'password' => bcrypt('password'), 'latitude' => 37.7680, 'longitude' => -122.4312]
        );

        $david = User::firstOrCreate(
            ['email' => 'david@example.com'],
            ['name' => 'David Chen', 'bio' => 'Data scientist and AI enthusiast. Passionate about Python and ML.', 'password' => bcrypt('password'), 'latitude' => 37.7700, 'longitude' => -122.4200]
        );
        $emma = User::firstOrCreate(
            ['email' => 'emma@example.com'],
            ['name' => 'Emma Thompson', 'bio' => 'Yoga instructor and wellness coach. Teaching peace and mindfulness.', 'password' => bcrypt('password'), 'latitude' => 37.7760, 'longitude' => -122.4150]
        );
        $frank = User::firstOrCreate(
            ['email' => 'frank@example.com'],
            ['name' => 'Frank Rodriguez', 'bio' => 'Photography enthusiast and visual storyteller. Capturing moments.', 'password' => bcrypt('password'), 'latitude' => 37.7650, 'longitude' => -122.4280]
        );

        // Skills - Enhanced
        $guitarSkill = Skill::factory()->create(['user_id' => $alice->id, 'name' => 'Guitar', 'category' => 'music', 'description' => 'Beginner to intermediate guitar lessons']);
        $frenchSkill = Skill::factory()->create(['user_id' => $alice->id, 'name' => 'French 101', 'category' => 'language', 'description' => 'Basic French conversation']);

        $jsSkill = Skill::factory()->create(['user_id' => $bob->id, 'name' => 'Javascript', 'category' => 'programming', 'description' => 'Modern JavaScript and React']);
        $webDesignSkill = Skill::factory()->create(['user_id' => $bob->id, 'name' => 'Web Design', 'category' => 'design', 'description' => 'UI/UX principles and practices']);

        $cookingSkill = Skill::factory()->create(['user_id' => $carol->id, 'name' => 'Cooking', 'category' => 'cooking', 'description' => 'International cuisine and meal prep']);
        $bakingSkill = Skill::factory()->create(['user_id' => $carol->id, 'name' => 'Baking', 'category' => 'cooking', 'description' => 'Artisan bread and pastries']);

        $pythonSkill = Skill::factory()->create(['user_id' => $david->id, 'name' => 'Python', 'category' => 'programming', 'description' => 'Data science with Python']);
        $mlSkill = Skill::factory()->create(['user_id' => $david->id, 'name' => 'Machine Learning', 'category' => 'programming', 'description' => 'ML algorithms and TensorFlow']);

        $yogaSkill = Skill::factory()->create(['user_id' => $emma->id, 'name' => 'Yoga', 'category' => 'fitness', 'description' => 'Hatha and Vinyasa yoga']);
        $meditationSkill = Skill::factory()->create(['user_id' => $emma->id, 'name' => 'Meditation', 'category' => 'wellness', 'description' => 'Mindfulness and stress relief']);

        $photoSkill = Skill::factory()->create(['user_id' => $frank->id, 'name' => 'Photography', 'category' => 'arts', 'description' => 'Portrait and landscape photography']);
        $photoEditSkill = Skill::factory()->create(['user_id' => $frank->id, 'name' => 'Photo Editing', 'category' => 'arts', 'description' => 'Adobe Lightroom and Photoshop basics']);

        // Courses - Enhanced with image_url and skills relationships
        $course1 = Course::factory()->create([
            'owner_id' => $alice->id,
            'title' => 'Beginner Guitar',
            'description' => 'Learn guitar from scratch with step-by-step lessons',
            'image_url' => 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=640&h=480&fit=crop'
        ]);
        $course1->students()->attach([$bob->id, $carol->id]);
        // Attach skills to course
        $course1->skills()->attach([$guitarSkill->id, $frenchSkill->id]);

        $course2 = Course::factory()->create([
            'owner_id' => $bob->id,
            'title' => 'JavaScript Fundamentals',
            'description' => 'Master JavaScript basics and modern frameworks',
            'image_url' => 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=640&h=480&fit=crop'
        ]);
        $course2->students()->attach([$alice->id, $david->id]);
        $course2->skills()->attach([$jsSkill->id, $webDesignSkill->id]);

        $course3 = Course::factory()->create([
            'owner_id' => $carol->id,
            'title' => 'International Cooking',
            'description' => 'Learn cuisines from around the world',
            'image_url' => 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=640&h=480&fit=crop'
        ]);
        $course3->students()->attach([$alice->id, $emma->id]);
        $course3->skills()->attach([$cookingSkill->id, $bakingSkill->id]);

        $course4 = Course::factory()->create([
            'owner_id' => $david->id,
            'title' => 'Python for Data Science',
            'description' => 'Data analysis and visualization with Python',
            'image_url' => 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=640&h=480&fit=crop'
        ]);
        $course4->students()->attach([$bob->id]);
        $course4->skills()->attach([$pythonSkill->id, $mlSkill->id]);

        $course5 = Course::factory()->create([
            'owner_id' => $emma->id,
            'title' => 'Yoga Basics',
            'description' => 'Start your yoga journey with foundational poses',
            'image_url' => 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=640&h=480&fit=crop'
        ]);
        $course5->students()->attach([$alice->id, $frank->id]);
        $course5->skills()->attach([$yogaSkill->id, $meditationSkill->id]);

        // Additional courses showcasing multiple skills
        $course6 = Course::factory()->create([
            'owner_id' => $frank->id,
            'title' => 'Photography Masterclass',
            'description' => 'Complete photography course from basics to advanced techniques',
            'image_url' => 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=640&h=480&fit=crop'
        ]);
        $course6->students()->attach([$emma->id, $carol->id]);
        $course6->skills()->attach([$photoSkill->id, $photoEditSkill->id]);

        // Swaps
        Swap::factory()->create([
            'requester_id' => $alice->id,
            'responder_id' => $bob->id,
            'requester_skill_id' => $guitarSkill->id,
            'responder_skill_id' => $jsSkill->id,
            'status' => 'accepted',
        ]);

        Swap::factory()->create([
            'requester_id' => $carol->id,
            'responder_id' => $david->id,
            'requester_skill_id' => $cookingSkill->id,
            'responder_skill_id' => $pythonSkill->id,
            'status' => 'pending',
        ]);

        Swap::factory()->create([
            'requester_id' => $emma->id,
            'responder_id' => $frank->id,
            'requester_skill_id' => $yogaSkill->id,
            'responder_skill_id' => $photoSkill->id,
            'status' => 'accepted',
        ]);

        // Messages
        Message::factory()->create(['sender_id' => $alice->id, 'receiver_id' => $bob->id, 'content' => 'Hi Bob! Interested in swapping skills?']);
        Message::factory()->create(['sender_id' => $bob->id, 'receiver_id' => $alice->id, 'content' => 'Sure! I\'d love to learn guitar from you.']);
        Message::factory()->create(['sender_id' => $carol->id, 'receiver_id' => $emma->id, 'content' => 'Your yoga classes sound amazing! Can we collaborate?']);
        Message::factory()->create(['sender_id' => $david->id, 'receiver_id' => $frank->id, 'content' => 'Great portfolio! Let\'s discuss a project.']);

        // Meetings
        Meeting::factory()->create(['host_id' => $alice->id, 'guest_id' => $bob->id, 'scheduled_at' => now()->addDays(3), 'platform' => 'jitsi']);
        Meeting::factory()->create(['host_id' => $carol->id, 'guest_id' => $emma->id, 'scheduled_at' => now()->addDays(5), 'platform' => 'zoom']);
        Meeting::factory()->create(['host_id' => $david->id, 'guest_id' => $frank->id, 'scheduled_at' => now()->addDays(7), 'platform' => 'jitsi']);

        // Comprehensive posts with course associations and standalone content
        // Course-related posts
        Post::create([
            'user_id' => $alice->id,
            'title' => '🎸 My First Complete Song on Guitar!',
            'content' => 'Today marks a huge milestone in my guitar journey! After 3 months of consistent practice, I finally played my first complete song - "Wonderwall" by Oasis! 🎉

The feeling of playing all the chords together and hearing a recognizable melody come out was absolutely magical. Here\'s what helped me get here:

1. **Daily Practice**: Even 15 minutes a day made a huge difference
2. **Patience**: I was so frustrated at first, but I kept going
3. **Good Teacher**: Having a structured learning path was crucial
4. **Fun Songs**: Learning songs I actually loved kept me motivated

To anyone just starting out: don\'t give up! The progress might be slow at first, but every small improvement adds up. What\'s the first song you want to learn?

#GuitarJourney #Music #Learning',
            'photo_url' => 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=640&h=480&fit=crop',
            'video_url' => null,
            'course_id' => $course1->id,
        ]);

        Post::create([
            'user_id' => $bob->id,
            'title' => 'React Hooks Deep Dive: When to Use useCallback',
            'content' => 'Let\'s talk about `useCallback` - one of the most misunderstood React hooks. After seeing countless performance issues, I want to clarify when and why to use it.

**When you SHOULD use useCallback:**

1. **Passing functions to optimized child components**
```javascript
const handleClick = useCallback(() => {
  setCount(count + 1);
}, [count]);

<ExpensiveComponent onClick={handleClick} />
```

2. **Functions used in useEffect dependencies**
```javascript
const fetchData = useCallback(async () => {
  const result = await api.get(\'/data\');
  setData(result);
}, []);

useEffect(() => {
  fetchData();
}, [fetchData]);
```

**When you should NOT use useCallback:**
- Functions that change on every render anyway
- Simple event handlers that don\'t cause re-renders
- Functions passed to non-memoized components

Remember: useCallback is a performance optimization, not a requirement. Profile first, optimize second!

What\'s your experience with useCallback? 🤔',
            'photo_url' => null,
            'video_url' => 'https://example.com/react-hooks-tutorial',
            'course_id' => $course2->id,
        ]);

        Post::create([
            'user_id' => $carol->id,
            'title' => '🍝 Perfect Homemade Pasta: My Family Recipe',
            'content' => 'There\'s something magical about making pasta from scratch. The texture, the flavor, the satisfaction of creating something so fundamental to Italian cuisine. Let me share my nonna\'s recipe that\'s been passed down for generations.

**Ingredients (for 4 people):**
- 400g "00" flour (or all-purpose flour)
- 4 large eggs
- Pinch of salt
- Semolina flour for dusting

**The Method:**
1. **Make the dough**: Create a well in the flour, crack eggs into the center, add salt, and gradually incorporate flour using a fork
2. **Knead**: Work the dough for 8-10 minutes until smooth and elastic
3. **Rest**: Wrap in plastic and let rest for 30 minutes
4. **Roll**: Use a pasta machine or rolling pin to get paper-thin sheets
5. **Cut**: For fettuccine, cut into ¼ inch strips

**Pro Tips:**
- Don\'t add water - the eggs provide all the moisture needed
- Room temperature ingredients are crucial
- Resting allows gluten to develop properly
- Cook immediately in boiling salted water for just 2-3 minutes

The result? Pasta that\'s infinitely better than anything you can buy. The difference is night and day! What\'s your favorite pasta shape to make from scratch?',
            'photo_url' => 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=640&h=480&fit=crop',
            'video_url' => null,
            'course_id' => $course3->id,
        ]);

        Post::create([
            'user_id' => $david->id,
            'title' => 'From Excel to Python: My Data Journey',
            'content' => 'I used to spend hours in Excel creating pivot tables and charts. Now, with Python and pandas, I can automate everything and handle datasets 100x larger. Here\'s my transformation story.

**Before Python (6 months ago):**
- Manual data cleaning in Excel
- Hours spent on repetitive tasks
- Limited to Excel\'s row limits
- No version control for analyses

**After Python:**
- Automated data pipelines
- Reproducible analyses
- Handle millions of rows effortlessly
- Beautiful visualizations with matplotlib/seaborn

**My Learning Path:**
1. **Python basics** (2 weeks) - variables, loops, functions
2. **Pandas** (2 weeks) - data manipulation powerhouse
3. **NumPy** (1 week) - numerical computing
4. **Matplotlib/Seaborn** (1 week) - data visualization
5. **Jupyter Notebooks** - interactive development

**Key Skills That Changed Everything:**
- DataFrame operations (.groupby, .merge, .pivot)
- Vectorized operations (no more loops!)
- Method chaining for readable code
- Exporting results to multiple formats

The investment in learning Python paid for itself within a month. If you work with data and haven\'t learned Python yet, what\'s holding you back?

#DataScience #Python #CareerGrowth',
            'photo_url' => 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=640&h=480&fit=crop',
            'video_url' => null,
            'course_id' => $course4->id,
        ]);

        Post::create([
            'user_id' => $emma->id,
            'title' => '🧘‍♀️ 5-Minute Breathing Exercise for Instant Calm',
            'content' => 'Life gets overwhelming sometimes. Between work deadlines, family responsibilities, and endless notifications, it\'s easy to feel constantly stressed. Here\'s a simple breathing technique that takes just 5 minutes and works wonders.

**The 4-7-8 Breathing Method:**

1. **Find a comfortable position** - sitting or lying down
2. **Close your eyes** and relax your body
3. **Inhale quietly** through your nose for 4 seconds
4. **Hold your breath** for 7 seconds
5. **Exhale completely** through your mouth for 8 seconds (make a "whoosh" sound)
6. **Repeat** 4 times (or more if you have time)

**Why it works:**
- The 4-second inhale oxygenates your blood
- The 7-second hold allows oxygen to reach all cells
- The 8-second exhale releases carbon dioxide and tension
- The extended exhale activates your parasympathetic nervous system (rest & digest)

I use this technique before important meetings, when I\'m feeling anxious, or just need a quick reset during a busy day. It\'s become my secret weapon for maintaining calm and focus.

Try it now! Set a timer for 5 minutes and see how you feel afterward. The first time might feel awkward, but it gets easier with practice.

What breathing techniques do you use for stress relief? 🌸',
            'photo_url' => 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=640&h=480&fit=crop',
            'video_url' => null,
            'course_id' => $course5->id,
        ]);

        Post::create([
            'user_id' => $frank->id,
            'title' => '📸 Golden Hour Photography: My Complete Guide',
            'content' => 'Golden hour is every photographer\'s favorite time to shoot. The soft, warm light creates magic that\'s nearly impossible to replicate in post-processing. Here\'s everything you need to know to master golden hour photography.

**When is Golden Hour?**
- Starts 1 hour after sunrise
- Ends 1 hour before sunset
- The "sweet spot" is usually the first 10-15 minutes

**Camera Settings:**
- **ISO**: 100-400 (keep it low for clean images)
- **Aperture**: f/2.8-f/5.6 (wide for portraits, narrower for landscapes)
- **Shutter Speed**: 1/125s or faster to avoid camera shake
- **White Balance**: Daylight or Auto (the warmth comes naturally)

**Composition Tips:**
- **Rule of Thirds**: Place subjects off-center for more dynamic shots
- **Leading Lines**: Use roads, rivers, or fences to guide the eye
- **Silhouettes**: Position subjects between you and the sun
- **Backlighting**: Let the sun create beautiful rim lighting

**My Golden Hour Checklist:**
□ Scout location beforehand
□ Arrive 20 minutes early
□ Use a tripod for stability
□ Bring reflectors for fill light
□ Shoot in RAW format
□ Bracket exposures (just in case)

**Post-Processing:**
- Don\'t over-edit! Golden hour light is already beautiful
- Slight warmth boost if needed
- Dodge and burn to enhance dimension
- Sharpen selectively

Golden hour transforms ordinary scenes into extraordinary photographs. Plan your shoots around it, and your photography will instantly improve!

What\'s your favorite time of day to shoot? 🌅',
            'photo_url' => 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=640&h=480&fit=crop',
            'video_url' => null,
            'course_id' => $course6->id,
        ]);

        // Standalone posts (not course-related)
        Post::create([
            'user_id' => $alice->id,
            'title' => 'Music Theory for Beginners: Understanding Scales',
            'content' => 'Let\'s demystify music theory! Scales are the foundation of all music, but they don\'t have to be intimidating. Here\'s a simple breakdown for beginners.

**What is a Scale?**
A scale is simply a sequence of notes played in order. Think of it as a musical alphabet that repeats.

**The Major Scale Pattern:**
Every major scale follows the same pattern: W-W-H-W-W-W-H
- W = Whole step (2 frets on guitar)
- H = Half step (1 fret on guitar)

**C Major Scale (easiest to learn):**
C - D - E - F - G - A - B - C

**Why Learn Scales?**
1. **Improvisation**: Scales give you notes to play over songs
2. **Songwriting**: Understanding scales helps you create melodies
3. **Music Appreciation**: You\'ll hear patterns in songs you love
4. **Technique**: Scales build finger strength and coordination

**Practice Tip:**
Start with C major (all white keys on piano, open strings on guitar). Play it forwards, backwards, and in different rhythms. Make it musical - don\'t just robotically play the notes!

Remember: Music theory exists to serve your creativity, not restrict it. Learn the rules, then break them! 🎵

What musical concept confuses you the most?',
            'photo_url' => null,
            'video_url' => null,
            'course_id' => null,
        ]);

        Post::create([
            'user_id' => $bob->id,
            'title' => 'Building My First Full-Stack App: Lessons Learned',
            'content' => 'After 6 months of learning JavaScript, I finally built and deployed my first full-stack application! Here are the biggest lessons from my journey.

**Tech Stack:**
- Frontend: React + TypeScript
- Backend: Node.js + Express
- Database: PostgreSQL
- Deployment: Heroku

**Biggest Challenges:**
1. **State Management**: Figuring out when to use local state vs global state vs server state
2. **Authentication**: JWT tokens, refresh tokens, secure storage - so many moving parts!
3. **Database Design**: Planning schemas that work for both current and future features
4. **Deployment**: Environment variables, build processes, CORS issues

**Key Lessons:**
- **Start Small**: Build a minimal viable product first, then iterate
- **Test Everything**: Unit tests, integration tests, end-to-end tests
- **Security First**: Never trust user input, always validate on server
- **Documentation**: Write code that future-you can understand
- **Version Control**: Commit often, write meaningful commit messages

**Resources That Helped:**
- FreeCodeCamp for fundamentals
- MDN Web Docs for reference
- Stack Overflow for debugging
- Dev.to for inspiration

The feeling of seeing your app live on the internet is indescribable! If you\'re thinking about building your first app, just start. The journey is worth every frustration.

What\'s your first project going to be? 🚀',
            'photo_url' => 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=640&h=480&fit=crop',
            'video_url' => null,
            'course_id' => null,
        ]);

        Post::create([
            'user_id' => $carol->id,
            'title' => '🌱 My Zero-Waste Kitchen Journey',
            'content' => 'One year ago, I decided to make my kitchen zero-waste. What started as a challenge has become a lifestyle that saves money and reduces environmental impact. Here\'s what I\'ve learned.

**Before Zero-Waste:**
- Plastic wrap for everything
- Disposable containers
- Food waste from poor planning
- Single-use items everywhere

**My Zero-Waste Solutions:**
1. **Food Storage**: Glass jars, beeswax wraps, reusable silicone bags
2. **Produce Bags**: Cotton produce bags instead of plastic
3. **Bulk Shopping**: Buy grains, nuts, and spices from bulk bins
4. **Meal Planning**: Reduces food waste by 70%
5. **Composting**: Turns scraps into garden gold

**Unexpected Benefits:**
- **Cost Savings**: Buying bulk saves 30-50% on staples
- **Healthier Eating**: Less processed food, more whole foods
- **Cooking Creativity**: Use up ingredients before they spoil
- **Mindfulness**: More conscious about consumption

**Challenges:**
- Finding zero-waste alternatives takes research
- Some items still come in plastic (looking for alternatives)
- Social situations where zero-waste isn\'t possible

**Tips for Beginners:**
1. Start with one category (I started with food storage)
2. Join zero-waste communities for support and tips
3. Be patient with yourself - progress over perfection
4. Focus on reducing waste rather than eliminating it entirely

The environmental impact is real, but the personal satisfaction of living more consciously is even better. Small changes add up to big impact!

What zero-waste practice have you tried? 🌍',
            'photo_url' => 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=640&h=480&fit=crop',
            'video_url' => null,
            'course_id' => null,
        ]);

        // Threaded discussion - Question and replies
        $questionPost = Post::create([
            'user_id' => $david->id,
            'title' => 'Question: Best Practices for Data Visualization?',
            'content' => 'I\'m working on a dashboard for a client and want to make sure my data visualizations are both beautiful and effective. What are your go-to principles for data viz?

Specific questions:
1. Color schemes - when to use single color vs multiple?
2. Chart types - how do you decide between bar, line, scatter?
3. Interactivity - essential vs nice-to-have?
4. Accessibility - what standards do you follow?

Looking forward to hearing your approaches! 📊',
            'photo_url' => null,
            'video_url' => null,
            'course_id' => null,
        ]);

        // Replies to the question
        Post::create([
            'user_id' => $bob->id,
            'title' => 'Re: Best Practices for Data Visualization',
            'content' => 'Great questions! Here\'s my approach:

1. **Color**: Single color with varying intensity for most charts. Multiple colors only when comparing distinct categories.

2. **Chart Types**:
   - Trends over time → Line charts
   - Comparisons → Bar charts
   - Relationships → Scatter plots
   - Parts of whole → Pie charts (sparingly)

3. **Interactivity**: Depends on the audience. For executives, keep it simple. For analysts, add filtering and drill-down.

4. **Accessibility**: Always use sufficient color contrast, add alt text for images, and ensure keyboard navigation works.

My golden rule: The data should tell the story, not the fancy visuals! 🎨',
            'photo_url' => null,
            'video_url' => null,
            'course_id' => null,
            'thread_id' => $questionPost->id,
        ]);

        Post::create([
            'user_id' => $emma->id,
            'title' => 'Re: Best Practices for Data Visualization',
            'content' => 'Adding to Bob\'s excellent points - don\'t forget about the user experience!

**Context Matters**: A chart that works for a mobile dashboard might not work for a printed report.

**Testing**: Always show your visualizations to someone unfamiliar with the data and see if they understand the key insights.

**Tools I Love**:
- Tableau for complex dashboards
- D3.js for custom visualizations
- ColorBrewer for accessible color palettes

What tool do you use most for data viz? 🤔',
            'photo_url' => null,
            'video_url' => null,
            'course_id' => null,
            'thread_id' => $questionPost->id,
        ]);

        // Achievement/Milestone posts
        Post::create([
            'user_id' => $emma->id,
            'title' => '🏆 500 Students Later: Reflections on Teaching Yoga',
            'content' => 'Today marks a special milestone - I\'ve now taught yoga to over 500 students! From my first nervous class in a community center to leading retreats and workshops, this journey has been incredible.

**What I\'ve Learned:**
1. **Every Body is Different**: What works for one student might not work for another. Adapt, don\'t force.
2. **Consistency Creates Results**: Students who practice regularly see transformation, not just the ones who come once a week.
3. **Community Matters**: The yoga community I\'ve built is more valuable than any certification.
4. **Self-Practice is Essential**: I can\'t teach what I don\'t practice myself.

**Student Transformations That Inspire Me:**
- The corporate executive who found peace through meditation
- The teenager who built confidence through challenging poses
- The senior who regained mobility and independence
- The busy parent who finally prioritized self-care

Teaching yoga isn\'t just about physical postures - it\'s about helping people connect with their inner strength and find peace in the present moment.

To my students: Thank you for trusting me with your practice. To fellow teachers: Keep showing up, your impact is immeasurable.

What milestone are you celebrating today? 🙏',
            'photo_url' => 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=640&h=480&fit=crop',
            'video_url' => null,
            'course_id' => null,
        ]);

        Post::create([
            'user_id' => $frank->id,
            'title' => '📷 Featured in Photography Magazine!',
            'content' => 'I still can\'t believe this happened! My photo series "Urban Solitude" was just featured in Contemporary Photography Magazine! 🏆

**The Series:**
"Urban Solitude" explores the quiet moments in bustling cities - a businessman taking a break on a park bench, a street musician lost in their melody, a lone figure watching the sunset from a rooftop.

**The Journey:**
- Shot over 18 months across 5 cities
- 200+ hours of editing and curation
- Countless rejections before this acceptance
- Self-funded and self-taught

**Lessons Learned:**
1. **Consistency Pays Off**: I posted daily on Instagram for 2 years before getting noticed
2. **Authenticity Matters**: Stay true to your vision, don\'t chase trends
3. **Networking Works**: Magazine editors follow photographers on social media
4. **Patience is Key**: Success rarely happens overnight

**Advice for Aspiring Photographers:**
- Shoot what moves you, not what\'s popular
- Learn editing, but don\'t over-edit
- Share your work consistently
- Don\'t compare yourself to others
- Invest in yourself (gear, education, travel)

This feature validates years of hard work and reminds me why I fell in love with photography. To anyone pursuing their creative passion: keep going, your breakthrough might be closer than you think!

What creative goal are you working toward? 📸',
            'photo_url' => 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=640&h=480&fit=crop',
            'video_url' => null,
            'course_id' => null,
        ]);

        $this->command->info('Created ' . Post::count() . ' posts successfully!');

        // Specialties
        $specialties = [
            'Guitar' => \App\Models\Specialty::firstOrCreate(['name' => 'Guitar']),
            'Javascript' => \App\Models\Specialty::firstOrCreate(['name' => 'Javascript']),
            'Cooking' => \App\Models\Specialty::firstOrCreate(['name' => 'Cooking']),
            'Python' => \App\Models\Specialty::firstOrCreate(['name' => 'Python']),
            'Yoga' => \App\Models\Specialty::firstOrCreate(['name' => 'Yoga']),
            'Photography' => \App\Models\Specialty::firstOrCreate(['name' => 'Photography']),
            'Design' => \App\Models\Specialty::firstOrCreate(['name' => 'Design']),
            'Business' => \App\Models\Specialty::firstOrCreate(['name' => 'Business']),
            'Teaching' => \App\Models\Specialty::firstOrCreate(['name' => 'Teaching']),
            'Wellness' => \App\Models\Specialty::firstOrCreate(['name' => 'Wellness']),
        ];

        // Attach specialties to users
        $alice->specialties()->syncWithoutDetaching([$specialties['Guitar']->id, $specialties['Teaching']->id]);
        $bob->specialties()->syncWithoutDetaching([$specialties['Javascript']->id, $specialties['Design']->id]);
        $carol->specialties()->syncWithoutDetaching([$specialties['Cooking']->id, $specialties['Teaching']->id]);
        $david->specialties()->syncWithoutDetaching([$specialties['Python']->id, $specialties['Design']->id]);
        $emma->specialties()->syncWithoutDetaching([$specialties['Yoga']->id, $specialties['Wellness']->id]);
        $frank->specialties()->syncWithoutDetaching([$specialties['Photography']->id, $specialties['Design']->id]);

        // Seed chat messages
        // Alice & Bob conversation - Skill swapping (Guitar ↔ JavaScript)
        Message::create([
            'sender_id' => $alice->id,
            'receiver_id' => $bob->id,
            'content' => 'Hi Bob! I saw you\'re interested in learning guitar. Would you like to swap some skills?',
            'created_at' => now()->subDays(2)->addHours(2)->addMinutes(30),
        ]);

        Message::create([
            'sender_id' => $bob->id,
            'receiver_id' => $alice->id,
            'content' => 'Sure! I\'d love to learn guitar from you. I can teach you JavaScript and React in return.',
            'created_at' => now()->subDays(2)->addHours(2)->addMinutes(35),
        ]);

        Message::create([
            'sender_id' => $alice->id,
            'receiver_id' => $bob->id,
            'content' => 'That sounds perfect! What level are you at with JavaScript?',
            'created_at' => now()->subDays(2)->addHours(2)->addMinutes(40),
        ]);

        Message::create([
            'sender_id' => $bob->id,
            'receiver_id' => $alice->id,
            'content' => 'I\'m intermediate level. I work with React daily at my job. What about you with guitar?',
            'created_at' => now()->subDays(2)->addHours(2)->addMinutes(45),
        ]);

        Message::create([
            'sender_id' => $alice->id,
            'receiver_id' => $bob->id,
            'content' => 'I\'ve been playing for 8 years and teaching for 5. I think we\'ll make a great team!',
            'created_at' => now()->subDays(2)->addHours(2)->addMinutes(50),
        ]);

        Message::create([
            'sender_id' => $bob->id,
            'receiver_id' => $alice->id,
            'content' => 'Awesome! When are you available for our first exchange?',
            'created_at' => now()->subDays(2)->addHours(2)->addMinutes(55),
        ]);

        Message::create([
            'sender_id' => $alice->id,
            'receiver_id' => $bob->id,
            'content' => 'I\'m free this Saturday at 2 PM. Does that work for you?',
            'created_at' => now()->subDays(2)->addHours(3)->addMinutes(0),
        ]);

        Message::create([
            'sender_id' => $bob->id,
            'receiver_id' => $alice->id,
            'content' => 'Perfect! Saturday at 2 PM it is. Looking forward to it!',
            'created_at' => now()->subDays(2)->addHours(3)->addMinutes(5),
        ]);

        // Carol & David conversation - Cooking course inquiry
        Message::create([
            'sender_id' => $carol->id,
            'receiver_id' => $david->id,
            'content' => 'Hi David! I loved your Python course. Would you be interested in learning Italian cooking?',
            'created_at' => now()->subDays(3)->addHours(10)->addMinutes(15),
        ]);

        Message::create([
            'sender_id' => $david->id,
            'receiver_id' => $carol->id,
            'content' => 'Hi Carol! That sounds amazing. I\'ve been wanting to learn more about Italian cuisine.',
            'created_at' => now()->subDays(3)->addHours(10)->addMinutes(20),
        ]);

        Message::create([
            'sender_id' => $carol->id,
            'receiver_id' => $david->id,
            'content' => 'Great! I can teach you how to make authentic pasta from scratch. What day works for you?',
            'created_at' => now()->subDays(3)->addHours(10)->addMinutes(25),
        ]);

        Message::create([
            'sender_id' => $david->id,
            'receiver_id' => $carol->id,
            'content' => 'I\'m free on Wednesday evenings. How does 7 PM sound?',
            'created_at' => now()->subDays(3)->addHours(10)->addMinutes(30),
        ]);

        Message::create([
            'sender_id' => $carol->id,
            'receiver_id' => $david->id,
            'content' => 'Perfect! I\'ll send you the ingredient list. Can\'t wait to teach you!',
            'created_at' => now()->subDays(3)->addHours(10)->addMinutes(35),
        ]);

        // Emma & Frank conversation - Skill swapping (Yoga ↔ Photography)
        Message::create([
            'sender_id' => $emma->id,
            'receiver_id' => $frank->id,
            'content' => 'Hi Frank! Your photography portfolio is stunning. Interested in some skill swapping?',
            'created_at' => now()->subDays(1)->addHours(16)->addMinutes(0),
        ]);

        Message::create([
            'sender_id' => $frank->id,
            'receiver_id' => $emma->id,
            'content' => 'Thanks Emma! I\'d love to. What do you teach?',
            'created_at' => now()->subDays(1)->addHours(16)->addMinutes(5),
        ]);

        Message::create([
            'sender_id' => $emma->id,
            'receiver_id' => $frank->id,
            'content' => 'I teach yoga and meditation. You could help me improve my photography skills!',
            'created_at' => now()->subDays(1)->addHours(16)->addMinutes(10),
        ]);

        Message::create([
            'sender_id' => $frank->id,
            'receiver_id' => $emma->id,
            'content' => 'That sounds like a great exchange! I can teach you composition and lighting.',
            'created_at' => now()->subDays(1)->addHours(16)->addMinutes(15),
        ]);

        Message::create([
            'sender_id' => $emma->id,
            'receiver_id' => $frank->id,
            'content' => 'Perfect! Let\'s meet at the park this weekend for some outdoor photography.',
            'created_at' => now()->subDays(1)->addHours(16)->addMinutes(20),
        ]);

        // Alice & Emma conversation - Course discussion
        Message::create([
            'sender_id' => $alice->id,
            'receiver_id' => $emma->id,
            'content' => 'Hi Emma! I just finished your Yoga Basics course. It was amazing!',
            'created_at' => now()->subDays(4)->addHours(9)->addMinutes(0),
        ]);

        Message::create([
            'sender_id' => $emma->id,
            'receiver_id' => $alice->id,
            'content' => 'Thank you Alice! I\'m so glad you enjoyed it. How was the meditation practice?',
            'created_at' => now()->subDays(4)->addHours(9)->addMinutes(5),
        ]);

        Message::create([
            'sender_id' => $alice->id,
            'receiver_id' => $emma->id,
            'content' => 'Life-changing! I\'ve been practicing daily. The stress relief is incredible.',
            'created_at' => now()->subDays(4)->addHours(9)->addMinutes(10),
        ]);

        Message::create([
            'sender_id' => $emma->id,
            'receiver_id' => $alice->id,
            'content' => 'That\'s wonderful to hear! Consistency is key. Keep it up! 🧘‍♀️',
            'created_at' => now()->subDays(4)->addHours(9)->addMinutes(15),
        ]);

        // Bob & David conversation - Technical discussion
        Message::create([
            'sender_id' => $bob->id,
            'receiver_id' => $david->id,
            'content' => 'Hey David! I saw you\'re teaching Python. Any tips for React developers?',
            'created_at' => now()->subDays(5)->addHours(14)->addMinutes(0),
        ]);

        Message::create([
            'sender_id' => $david->id,
            'receiver_id' => $bob->id,
            'content' => 'Absolutely! Python is great for data analysis in React apps. Pandas can handle your API data processing.',
            'created_at' => now()->subDays(5)->addHours(14)->addMinutes(5),
        ]);

        Message::create([
            'sender_id' => $bob->id,
            'receiver_id' => $david->id,
            'content' => 'Interesting! How would you approach data visualization in a React app?',
            'created_at' => now()->subDays(5)->addHours(14)->addMinutes(10),
        ]);

        Message::create([
            'sender_id' => $david->id,
            'receiver_id' => $bob->id,
            'content' => 'I recommend D3.js with React. It gives you full control. Or Chart.js for simpler needs.',
            'created_at' => now()->subDays(5)->addHours(14)->addMinutes(15),
        ]);

        Message::create([
            'sender_id' => $bob->id,
            'receiver_id' => $david->id,
            'content' => 'Thanks! I\'ll check those out. Maybe we can collaborate on a project.',
            'created_at' => now()->subDays(5)->addHours(14)->addMinutes(20),
        ]);

        // Frank & Carol conversation - Photography tips
        Message::create([
            'sender_id' => $frank->id,
            'receiver_id' => $carol->id,
            'content' => 'Hi Carol! Saw your cooking posts. Want some food photography tips?',
            'created_at' => now()->subDays(6)->addHours(11)->addMinutes(0),
        ]);

        Message::create([
            'sender_id' => $carol->id,
            'receiver_id' => $frank->id,
            'content' => 'That would be amazing! My food photos never look professional.',
            'created_at' => now()->subDays(6)->addHours(11)->addMinutes(5),
        ]);

        Message::create([
            'sender_id' => $frank->id,
            'receiver_id' => $carol->id,
            'content' => 'Natural light is key! Shoot near windows during golden hour. Use a reflector for fill light.',
            'created_at' => now()->subDays(6)->addHours(11)->addMinutes(10),
        ]);

        Message::create([
            'sender_id' => $carol->id,
            'receiver_id' => $frank->id,
            'content' => 'Thanks! I\'ll try that. Any lens recommendations?',
            'created_at' => now()->subDays(6)->addHours(11)->addMinutes(15),
        ]);

        Message::create([
            'sender_id' => $frank->id,
            'receiver_id' => $carol->id,
            'content' => '50mm prime lens is perfect for food. It\'s sharp and creates beautiful bokeh.',
            'created_at' => now()->subDays(6)->addHours(11)->addMinutes(20),
        ]);

        // General community messages
        Message::create([
            'sender_id' => $alice->id,
            'receiver_id' => $david->id,
            'content' => 'Thanks for the data science recommendations! The Python resources were spot on.',
            'created_at' => now()->subDays(7)->addHours(13)->addMinutes(0),
        ]);

        Message::create([
            'sender_id' => $david->id,
            'receiver_id' => $alice->id,
            'content' => 'Glad they helped! Let me know if you need help with any Python concepts.',
            'created_at' => now()->subDays(7)->addHours(13)->addMinutes(5),
        ]);

        $this->command->info('Created chat messages successfully!');
    }
}
