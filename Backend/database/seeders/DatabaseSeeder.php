<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Skill;
use App\Models\Course;
use App\Models\Swap;
use App\Models\Message;
use App\Models\Meeting;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
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

        // Additional users for more realistic demo
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
        $grace = User::firstOrCreate(
            ['email' => 'grace@example.com'],
            ['name' => 'Grace Lee', 'bio' => 'Product designer with 5+ years experience. Building beautiful interfaces.', 'password' => bcrypt('password'), 'latitude' => 37.7820, 'longitude' => -122.4050]
        );
        $henry = User::firstOrCreate(
            ['email' => 'henry@example.com'],
            ['name' => 'Henry Clark', 'bio' => 'Business coach and entrepreneur mentor. Let\'s grow together!', 'password' => bcrypt('password'), 'latitude' => 37.7780, 'longitude' => -122.4250]
        );

        // Skills - Enhanced
        Skill::factory()->create(['user_id' => $alice->id, 'name' => 'Guitar', 'category' => 'music', 'description' => 'Beginner to intermediate guitar lessons']);
        Skill::factory()->create(['user_id' => $alice->id, 'name' => 'French 101', 'category' => 'language', 'description' => 'Basic French conversation']);
        Skill::factory()->create(['user_id' => $bob->id, 'name' => 'Javascript', 'category' => 'programming', 'description' => 'Modern JavaScript and React']);
        Skill::factory()->create(['user_id' => $bob->id, 'name' => 'Web Design', 'category' => 'design', 'description' => 'UI/UX principles and practices']);
        Skill::factory()->create(['user_id' => $carol->id, 'name' => 'Cooking', 'category' => 'cooking', 'description' => 'International cuisine and meal prep']);
        Skill::factory()->create(['user_id' => $carol->id, 'name' => 'Baking', 'category' => 'cooking', 'description' => 'Artisan bread and pastries']);
        Skill::factory()->create(['user_id' => $david->id, 'name' => 'Python', 'category' => 'programming', 'description' => 'Data science with Python']);
        Skill::factory()->create(['user_id' => $david->id, 'name' => 'Machine Learning', 'category' => 'programming', 'description' => 'ML algorithms and TensorFlow']);
        Skill::factory()->create(['user_id' => $emma->id, 'name' => 'Yoga', 'category' => 'fitness', 'description' => 'Hatha and Vinyasa yoga']);
        Skill::factory()->create(['user_id' => $emma->id, 'name' => 'Meditation', 'category' => 'wellness', 'description' => 'Mindfulness and stress relief']);
        Skill::factory()->create(['user_id' => $frank->id, 'name' => 'Photography', 'category' => 'arts', 'description' => 'Portrait and landscape photography']);
        Skill::factory()->create(['user_id' => $frank->id, 'name' => 'Photo Editing', 'category' => 'arts', 'description' => 'Adobe Lightroom and Photoshop basics']);
        Skill::factory()->create(['user_id' => $grace->id, 'name' => 'UI Design', 'category' => 'design', 'description' => 'User interface and interaction design']);
        Skill::factory()->create(['user_id' => $grace->id, 'name' => 'Figma', 'category' => 'design', 'description' => 'Figma design tool mastery']);
        Skill::factory()->create(['user_id' => $henry->id, 'name' => 'Business Strategy', 'category' => 'business', 'description' => 'Startup and growth strategies']);
        Skill::factory()->create(['user_id' => $henry->id, 'name' => 'Networking', 'category' => 'business', 'description' => 'Building professional networks']);

        // Courses - Enhanced
        $course1 = Course::factory()->create(['owner_id' => $alice->id, 'title' => 'Beginner Guitar', 'description' => 'Learn guitar from scratch']);
        $course1->students()->attach([$bob->id, $carol->id]);

        $course2 = Course::factory()->create(['owner_id' => $bob->id, 'title' => 'JavaScript Fundamentals', 'description' => 'Master JavaScript basics']);
        $course2->students()->attach([$alice->id, $david->id]);

        $course3 = Course::factory()->create(['owner_id' => $carol->id, 'title' => 'International Cooking', 'description' => 'Learn cuisines from around the world']);
        $course3->students()->attach([$alice->id, $emma->id]);

        $course4 = Course::factory()->create(['owner_id' => $david->id, 'title' => 'Python for Data Science', 'description' => 'Data analysis and visualization']);
        $course4->students()->attach([$bob->id]);

        $course5 = Course::factory()->create(['owner_id' => $emma->id, 'title' => 'Yoga Basics', 'description' => 'Start your yoga journey']);
        $course5->students()->attach([$alice->id, $frank->id]);

        $course6 = Course::factory()->create(['owner_id' => $frank->id, 'title' => 'Portrait Photography Mastery', 'description' => 'Advanced portrait photography techniques']);
        $course6->students()->attach([$grace->id, $henry->id]);

        $course7 = Course::factory()->create(['owner_id' => $grace->id, 'title' => 'UX/UI Design Principles', 'description' => 'Create beautiful and intuitive user interfaces']);
        $course7->students()->attach([$bob->id, $david->id]);

        $course8 = Course::factory()->create(['owner_id' => $henry->id, 'title' => 'Startup Growth Strategies', 'description' => 'Scale your startup from zero to hero']);
        $course8->students()->attach([$alice->id, $carol->id]);

        // Swaps - More interactions
        Swap::factory()->create([
            'requester_id' => $alice->id,
            'responder_id' => $bob->id,
            'requester_skill_id' => Skill::where('user_id', $alice->id)->where('name', 'Guitar')->first()->id,
            'responder_skill_id' => Skill::where('user_id', $bob->id)->where('name', 'Javascript')->first()->id,
            'status' => 'accepted',
        ]);

        Swap::factory()->create([
            'requester_id' => $carol->id,
            'responder_id' => $david->id,
            'requester_skill_id' => Skill::where('user_id', $carol->id)->where('name', 'Cooking')->first()->id,
            'responder_skill_id' => Skill::where('user_id', $david->id)->where('name', 'Python')->first()->id,
            'status' => 'pending',
        ]);

        Swap::factory()->create([
            'requester_id' => $emma->id,
            'responder_id' => $frank->id,
            'requester_skill_id' => Skill::where('user_id', $emma->id)->where('name', 'Yoga')->first()->id,
            'responder_skill_id' => Skill::where('user_id', $frank->id)->where('name', 'Photography')->first()->id,
            'status' => 'accepted',
        ]);

        // Messages - More interactions including self-chat
        Message::factory()->create(['sender_id' => $alice->id, 'receiver_id' => $bob->id, 'content' => 'Hi Bob! Interested in swapping skills?']);
        Message::factory()->create(['sender_id' => $bob->id, 'receiver_id' => $alice->id, 'content' => 'Sure! I\'d love to learn guitar from you.']);
        Message::factory()->create(['sender_id' => $carol->id, 'receiver_id' => $emma->id, 'content' => 'Your yoga classes sound amazing! Can we collaborate?']);
        Message::factory()->create(['sender_id' => $david->id, 'receiver_id' => $grace->id, 'content' => 'Great portfolio! Let\'s discuss a project.']);
        Message::factory()->create(['sender_id' => $frank->id, 'receiver_id' => $henry->id, 'content' => 'I\'m interested in business coaching. When are you available?']);

        // Self-chat messages (notes to self)
        Message::factory()->create(['sender_id' => $alice->id, 'receiver_id' => $alice->id, 'content' => 'Remember to prepare guitar lesson for tomorrow!']);
        Message::factory()->create(['sender_id' => $alice->id, 'receiver_id' => $alice->id, 'content' => 'Buy new guitar strings and picks this weekend.']);
        Message::factory()->create(['sender_id' => $bob->id, 'receiver_id' => $bob->id, 'content' => 'Code review notes: refactor authentication module']);
        Message::factory()->create(['sender_id' => $david->id, 'receiver_id' => $david->id, 'content' => 'ML model ideas: try ensemble methods for better accuracy']);

        // Meetings
        Meeting::factory()->create(['host_id' => $alice->id, 'guest_id' => $bob->id, 'scheduled_at' => now()->addDays(3), 'platform' => 'jitsi']);
        Meeting::factory()->create(['host_id' => $carol->id, 'guest_id' => $emma->id, 'scheduled_at' => now()->addDays(5), 'platform' => 'zoom']);
        Meeting::factory()->create(['host_id' => $david->id, 'guest_id' => $grace->id, 'scheduled_at' => now()->addDays(7), 'platform' => 'jitsi']);

        // Posts - Enhanced with variety and longer content
        if (class_exists(\App\Models\Post::class)) {
            \App\Models\Post::factory()->create([
                'user_id' => $alice->id,
                'title' => 'My Guitar Journey: From Zero to Hero',
                'content' => 'I started learning guitar at age 10, and it was the best decision I ever made. Here are some comprehensive tips for beginners that I wish someone had told me:

1. **Start with the right mindset**: Don\'t expect to sound great immediately. Your fingers will hurt, and that\'s completely normal. The pain goes away after about 2 weeks of consistent practice.

2. **Practice daily**: Even 15-30 minutes of focused practice is better than 3 hours once a week. Consistency is key to building muscle memory.

3. **Learn simple chords first**: Start with A, E, and D major chords. Master these before moving to barre chords or more complex shapes.

4. **Be patient with yourself**: Learning guitar is a marathon, not a sprint. Celebrate small wins like playing your first song or mastering a new technique.

5. **Find songs you love**: Choose songs that inspire you to keep practicing. If you love the music, you\'ll stay motivated.

The best part? There\'s a huge community of guitarists ready to help. Don\'t hesitate to ask questions and share your progress!',
                'video_url' => null,
                'course_id' => $course1->id
            ]);

            \App\Models\Post::factory()->create([
                'user_id' => $bob->id,
                'title' => 'Deep Dive: Understanding JavaScript Closures',
                'content' => 'Understanding closures is crucial for becoming a proficient JavaScript developer. Many beginners find this concept confusing, so let me break it down for you.

**What is a Closure?**
A closure is a function that has access to the outer function\'s scope, even after the outer function has finished executing. This is one of the most powerful features in JavaScript.

**Simple Example:**
```
function outer() {
  let count = 0;

  function inner() {
    count++;
    console.log(count);
  }

  return inner;
}

const counter = outer();
counter(); // 1
counter(); // 2
counter(); // 3
```

**Why Are Closures Useful?**
1. **Data Privacy**: You can create private variables that can only be accessed through inner functions.
2. **Function Factories**: You can create multiple instances of functions with different states.
3. **Callbacks**: Closures are essential for callbacks and event handlers.

**Common Patterns:**
- Module Pattern: Create private and public methods
- Factory Functions: Create objects with specific configurations
- Event Handlers: Remember state when handling events

Practice creating your own closures and experiment with different scenarios. The more you use them, the more natural they\'ll become!',
                'video_url' => null,
                'course_id' => $course2->id
            ]);

            \App\Models\Post::factory()->create([
                'user_id' => $carol->id,
                'title' => 'Authentic Pasta Carbonara: The Right Way',
                'content' => 'Pasta Carbonara is one of my favorite Italian dishes to teach. Despite its simplicity, most people get it wrong. Here\'s how to make authentic carbonara that will impress anyone.

**The Authentic Ingredients:**
- Fresh pasta (spaghetti or rigatoni)
- Guanciale (cured pork jowl - or bacon as substitute)
- Eggs (whole eggs, not just yolks)
- Pecorino Romano cheese (not Parmesan!)
- Black pepper
- Salt for pasta water

**Step-by-Step Instructions:**

1. **Cook the guanciale**: Cut into small cubes and cook until crispy (5-7 minutes). Save the fat!

2. **Boil pasta**: Use heavily salted water - it should taste like the sea. Cook until al dente (usually 1-2 minutes less than package suggests).

3. **Prepare the egg mixture**: Whisk whole eggs with grated cheese and black pepper. No cream!

4. **Combine everything**: This is crucial - do NOT add eggs directly to heat or they\'ll scramble. Instead, reserve 1 cup pasta water, then drain pasta. Add hot pasta to guanciale (off heat), then quickly add egg mixture while tossing constantly and adding pasta water as needed.

5. **Season to taste**: Add more cheese and pepper if needed.

**Pro Tips:**
- Never use cream - it\'s not traditional and makes it heavy
- Keep everything at moderate temperature to avoid scrambling eggs
- The pasta water starch helps create a creamy sauce naturally
- Eat immediately while hot

This dish is all about technique and timing. Once you master it, you\'ll make it regularly!',
                'video_url' => null,
                'course_id' => $course3->id
            ]);

            \App\Models\Post::factory()->create([
                'user_id' => $david->id,
                'title' => 'Getting Started with Pandas: A Complete Guide for Data Scientists',
                'content' => 'Pandas is absolutely essential for data science work in Python. Whether you\'re cleaning data, exploring datasets, or transforming information, pandas makes it incredibly efficient.

**What is Pandas?**
Pandas is a powerful Python library for data manipulation and analysis. Its two main data structures are Series (1D) and DataFrames (2D), which are similar to columns and tables respectively.

**Key Concepts:**

1. **DataFrames**: Think of them as Excel spreadsheets in Python.
   - Rows and columns with labels
   - Can contain different data types
   - Easily filter, group, and aggregate

2. **Series**: One-dimensional arrays with labels
   - Similar to a column in a DataFrame
   - Can perform mathematical operations

3. **Indexing**: Multiple ways to access data
   - .loc[] for label-based indexing
   - .iloc[] for position-based indexing
   - Boolean indexing for conditions

**Useful Operations:**

- **Loading data**: `pd.read_csv(\'file.csv\')`
- **Viewing data**: `.head()`, `.tail()`, `.info()`, `.describe()`
- **Filtering**: `df[df[\'column\'] > 100]`
- **Grouping**: `df.groupby(\'category\').sum()`
- **Merging**: `pd.merge()` to combine DataFrames
- **Handling missing data**: `.fillna()`, `.dropna()`

**Real-World Example:**
Imagine analyzing customer sales data. You\'d load the CSV, explore the structure, filter for specific regions, group by product category, calculate totals, and generate reports - all with just a few lines of pandas code!

Start with small datasets to build intuition, then gradually work with larger ones. Pandas will become your best friend in data science!',
                'video_url' => null,
                'course_id' => $course4->id
            ]);

            \App\Models\Post::factory()->create([
                'user_id' => $emma->id,
                'title' => 'Transform Your Life: Stress Relief Through Advanced Breathwork Techniques',
                'content' => 'Breathwork is one of the most powerful tools for managing stress and anxiety. I\'ve seen incredible transformations in my students who practice regularly. Let me share my favorite techniques with you.

**Understanding Your Nervous System:**
Your breath directly controls your nervous system. Fast breathing activates the "fight or flight" response, while slow breathing activates the "rest and digest" response. By controlling your breath, you can control your stress levels.

**Three Essential Techniques:**

1. **Box Breathing (4-4-4-4):**
   - Inhale for 4 counts
   - Hold for 4 counts
   - Exhale for 4 counts
   - Hold for 4 counts
   - Repeat 5-10 times
   - Best for: Immediate stress relief and focus

2. **4-7-8 Technique:**
   - Inhale for 4 counts
   - Hold for 7 counts
   - Exhale for 8 counts
   - Repeat 5-8 times
   - Best for: Relaxation and better sleep

3. **Alternate Nostril Breathing:**
   - Close right nostril, inhale left
   - Close left nostril, exhale right
   - Inhale right, exhale left
   - Continue for 5 minutes
   - Best for: Balancing energy and calming anxiety

**When to Practice:**
- Morning: Energizing breath for a great start
- Afternoon: Box breathing for focus and energy
- Evening: 4-7-8 technique to wind down
- Before bed: Alternate nostril breathing for deep sleep

**Tips for Success:**
- Find a quiet, comfortable place
- Sit with good posture
- Practice consistently for best results
- Don\'t force anything - it should feel natural
- Start small (2-3 minutes) and gradually increase

The beautiful thing about breathwork is that you can do it anywhere, anytime. At your desk, during a commute, or before an important meeting. Your breath is always with you - use it as your superpower!',
                'video_url' => null,
                'course_id' => $course5->id
            ]);

            \App\Models\Post::factory()->create([
                'user_id' => $frank->id,
                'title' => 'Master Golden Hour Photography: Professional Tips and Tricks',
                'content' => 'Golden hour is a photographer\'s dream time. Those warm, soft rays of light create magic that\'s nearly impossible to replicate in other conditions. Whether you\'re a beginner or intermediate photographer, here\'s how to maximize golden hour.

**What is Golden Hour?**
Golden hour occurs during the first hour after sunrise and the last hour before sunset. The low angle of the sun creates warm, diffused light that\'s incredibly flattering for portraits and landscapes.

**Camera Settings for Golden Hour:**

1. **ISO**: Start with 400 if using natural light only
   - Increase if it\'s overcast or dimmer than usual
   - Helps you maintain faster shutter speeds

2. **Aperture**: Typically f/2.8 - f/5.6
   - Wide apertures (f/2.8) for portraits with background blur
   - Narrower apertures (f/5.6) for landscapes

3. **Shutter Speed**: At least 1/250s
   - Prevents motion blur
   - Ensure sharp, crisp images

4. **Shoot in RAW format**: This is crucial!
   - Gives you maximum flexibility in post-processing
   - Recover blown highlights and crushed shadows
   - Adjust white balance perfectly in editing

**Composition Tips:**

- Use the rule of thirds: Place subjects off-center for more interesting compositions
- Incorporate leading lines: Paths, rivers, or fences leading into the scene
- Silhouettes: Position subjects between you and the sun for dramatic effect
- Backlighting: Use the warm light behind subjects for a halo effect

**Practical Workflow:**

1. Scout locations beforehand
2. Arrive 15-20 minutes early to set up
3. Take test shots to adjust settings
4. Communicate with your subject (if portrait)
5. Capture multiple angles and compositions
6. Review and adjust as needed

**Pro Tips:**
- Bring a reflector to bounce warm light back on subjects
- Use filters to enhance the golden tones
- Take your best shots in the first 10-15 minutes when light is warmest
- Don\'t wait until the last minute - arrive early!

The warm light of golden hour has saved countless photos. Dedicate time to mastering this magic hour and your photography will immediately level up!',
                'video_url' => null
            ]);

            \App\Models\Post::factory()->create([
                'user_id' => $grace->id,
                'title' => 'Core Design Principles Every Designer Must Master',
                'content' => 'Design is everywhere - from the apps on your phone to the buildings you walk into. Understanding core design principles separates great designs from mediocre ones. After 5+ years in the industry, I\'ve identified the five principles that matter most.

**1. Balance**
Balance creates visual stability and harmony. There are two types:

- **Symmetrical Balance**: Objects arranged equally around a central axis. Creates formality and order.
- **Asymmetrical Balance**: Objects of different weights arranged off-center. More dynamic and interesting.

Try creating a design with both types to see the difference in emotional response.

**2. Contrast**
Contrast draws attention and creates visual interest. Without it, designs feel flat and boring.

Examples of contrast:
- Color: Dark vs. light
- Size: Large vs. small
- Shape: Curved vs. angular
- Texture: Rough vs. smooth

Use contrast strategically to guide users\' eyes to important elements.

**3. Emphasis**
Emphasis is about creating a focal point - what should users look at first?

Techniques:
- Size: Make important elements bigger
- Color: Use bright or contrasting colors
- White space: Isolate elements
- Positioning: Place at unusual locations

Every design should have a clear visual hierarchy.

**4. Movement**
Movement guides the viewer\'s eye through the design. Think of it as the flow of information.

Create movement through:
- Lines and arrows pointing to specific areas
- Arranged elements suggesting motion
- Repeated elements creating rhythm
- Gradients and dynamic shapes

Good movement feels natural, not forced.

**5. Unity**
Unity ties all elements together to create cohesion. Without it, designs feel chaotic.

Achieve unity through:
- Consistent color palettes
- Related fonts and typography
- Aligned elements
- Repeated patterns and shapes
- Consistent style

**Putting It Together:**
The best designs balance all five principles. Too much emphasis becomes chaotic. Too much unity becomes boring. Practice applying these principles in your daily work, and you\'ll notice immediate improvement in your designs.

Remember: These aren\'t rules to follow blindly, but tools to use consciously. Once you understand them deeply, you\'ll know when and how to break them for maximum impact!',
                'video_url' => null
            ]);

            \App\Models\Post::factory()->create([
                'user_id' => $henry->id,
                'title' => 'Networking Strategies That Actually Work: Build Real Relationships',
                'content' => 'Networking gets a bad reputation, but it\'s simply about building genuine relationships. I\'ve built my entire business through authentic networking. Here are the strategies that actually work.

**Stop Thinking Transactionally**
This is the biggest mistake people make. They approach networking as "What can I get?" instead of "What can I give?" The irony is that being genuinely helpful leads to better business opportunities than any transactional approach ever could.

**Before the Event:**

1. **Research**: Know who\'ll be there and what they care about
2. **Set Intentions**: Don\'t aim to collect business cards - aim to meet 2-3 genuine people
3. **Prepare Your Story**: Have a 20-second elevator pitch ready (not a sales pitch!)
4. **Dress Appropriately**: First impressions matter

**During the Event:**

1. **Listen More Than You Talk**: Ask genuine questions and listen to the answers. People love talking about their work when someone genuinely cares.

2. **Body Language**:
   - Make eye contact
   - Stand open (not crossed arms)
   - Smile genuinely
   - Face people directly

3. **Quality Over Quantity**: Have meaningful 10-minute conversations with 5 people instead of surface 1-minute chats with 20 people.

4. **Ask Follow-Up Questions**: If someone mentions a challenge, ask about it. Show genuine interest in their problems and opportunities.

5. **Find Common Ground**: You\'d be surprised how many mutual interests you\'ll discover with deeper conversation.

**After the Event:**

1. **Follow Up Within 24 Hours**: Send a personalized message referencing something specific you discussed.

2. **Provide Value First**: Share an article relevant to their interest, introduce them to someone useful, or offer help with a challenge they mentioned.

3. **Stay in Touch**: Check in every few months with a thoughtful message or relevant content.

**Advanced Strategies:**

- **Organize Your Own Events**: Host small dinners, workshops, or discussions. You\'ll become known as a connector.
- **Be a Connector**: Introduce people who should know each other. You\'ll build deep trust and goodwill.
- **Volunteer**: Get involved in causes you care about. You\'ll meet like-minded people naturally.
- **Online Networking**: Engage thoughtfully on platforms like LinkedIn. Share insights, comment meaningfully, and direct message people you admire.

**Common Mistakes to Avoid:**

- Pitching immediately (people can sense desperation)
- Checking your phone (so disrespectful)
- Dominating conversations (no one cares that much about you)
- Collecting business cards and never following up
- Being inauthentic (people spot fakes immediately)

**The Real Secret:**
The best networkers genuinely care about people. They remember details, follow up, help without expecting immediate returns, and build true relationships. The business success is just a byproduct of that genuine approach.

Start today: Identify someone in your network and send them a thoughtful message. No agenda, just appreciation. Watch how it opens doors over time. That\'s real networking!',
                'video_url' => null
            ]);

            // Additional posts for more content
            \App\Models\Post::factory()->create([
                'user_id' => $alice->id,
                'title' => '🎸 New Student Milestone!',
                'content' => 'One of my students just played their first complete song today! I\'m so proud of the progress they\'ve made in just 8 weeks. From not knowing how to hold a guitar to playing a full song - that\'s incredible!

Their dedication and practice paid off. If you want to learn guitar but think you\'re too old or don\'t have talent, this student proves you wrong. Age is just a number, and talent is built through practice.

Who else is learning an instrument? Let me know in the comments! 🎵',
                'photo_url' => null,
                'course_id' => $course1->id
            ]);

            \App\Models\Post::factory()->create([
                'user_id' => $bob->id,
                'title' => 'React Hooks Tips & Tricks',
                'content' => 'Just shared some advanced React Hooks patterns with my team. Here are my top 3 patterns that make code cleaner:

1. **Custom Hooks**: Extract logic into reusable functions. Less code duplication, easier testing.

2. **useCallback + useMemo**: Optimize performance by memoizing functions and values. Game changer for large apps.

3. **useReducer**: For complex state logic. Makes it easier to manage multiple related state updates.

Modern React is so powerful. If you\'re still using class components, it\'s time to level up!

Which pattern do you use most? 🚀',
                'photo_url' => null,
                'course_id' => $course2->id
            ]);

            \App\Models\Post::factory()->create([
                'user_id' => $carol->id,
                'title' => 'Weekend Cooking Challenge Complete! 🍝',
                'content' => 'I just finished a weekend of intensive cooking - made 10 different cuisines in 3 days! From Italian to Thai to Indian, each dish had its own story.

The highlight? Homemade pasta from scratch. Rolling out dough, cutting tagliatelle, and tossing with fresh sauce - pure joy!

Cooking isn\'t just about the food. It\'s about the experience, the culture, and the love you put into every dish. That\'s what I try to teach my students.

What\'s your favorite cuisine to cook? 👨‍🍳',
                'photo_url' => null,
                'course_id' => $course3->id
            ]);

            \App\Models\Post::factory()->create([
                'user_id' => $david->id,
                'title' => 'Machine Learning Model Deployed! 🚀',
                'content' => 'After months of training and testing, my ML model is finally in production!

The model predicts customer churn with 94% accuracy. We\'ve already identified 150+ customers at risk of leaving, and the business is taking action to retain them.

This is why I love data science - it\'s not just theory and code. It\'s about real impact on business decisions.

For anyone interested in ML: Start with Python, understand the math (linear algebra, statistics), then practice on Kaggle competitions. The journey is challenging but rewarding! 📊',
                'photo_url' => null,
                'course_id' => $course4->id
            ]);

            \App\Models\Post::factory()->create([
                'user_id' => $emma->id,
                'title' => 'Yoga Retreat Success! 🧘‍♀️',
                'content' => 'Our weekend yoga retreat was absolutely transformative! 30 participants, beautiful outdoor setting, and so much positive energy.

We started each day with sunrise poses, did breathwork sessions, and ended with guided meditation. I loved seeing people disconnect from their phones and connect with their bodies.

One participant told me: "I feel like I finally understand what yoga really is - not just stretching, but a path to inner peace."

That\'s exactly why I do this. Yoga changed my life, and I\'m honored to help others discover it too.

Are you interested in yoga? Try our Yoga Basics course - perfect for beginners! 🕉️',
                'photo_url' => null,
                'course_id' => $course5->id
            ]);

            \App\Models\Post::factory()->create([
                'user_id' => $frank->id,
                'title' => 'Behind the Scenes: Photo Shoot Day 📸',
                'content' => 'Today was an amazing photo shoot day! Shot 200+ images for a local brand\'s new campaign. The energy on set was incredible.

**What I learned today:**
- Communication with the team is key
- The best shots come when subjects feel comfortable
- Lighting is everything (yes, even in post-production!)
- Have fun with it - your joy translates to the photos

Photography is about capturing moments and emotions, not just technical skills. Yes, master your camera, but remember to see with your heart, not just your lens.

Follow my Instagram @frankrodriguez_photos for behind-the-scenes content! 📷',
                'photo_url' => null
            ]);

            \App\Models\Post::factory()->create([
                'user_id' => $grace->id,
                'title' => 'Design Thinking Workshop Recap 🎨',
                'content' => 'Just finished leading a design thinking workshop with a startup team. We went from problem definition to prototype in just 2 days!

The process is magical when you follow it:
1. Empathize - truly understand the user
2. Define - clearly state the problem
3. Ideate - brainstorm without judgment
4. Prototype - make it real (even if rough)
5. Test - get feedback and iterate

What amazed me most? When they tested their prototype with actual users, they discovered they were solving the wrong problem! That\'s the power of design thinking - fail fast, learn faster.

Any designers want to chat about process? DM me! 💬',
                'photo_url' => null
            ]);

            \App\Models\Post::factory()->create([
                'user_id' => $henry->id,
                'title' => 'Mentored 5 New Entrepreneurs This Week 🚀',
                'content' => 'Had the privilege of mentoring 5 amazing entrepreneurs this week. Their ideas are fresh, their energy is contagious, and their commitment is inspiring.

What struck me most? The fear. Every single one mentioned imposter syndrome or doubt. You know what I told them?

"The doubt never goes away. The difference between successful and unsuccessful entrepreneurs isn\'t the absence of fear - it\'s what they do despite it."

If you\'re thinking about starting something, here\'s my advice: Start before you\'re ready. Learn by doing. Build in public. Connect with others.

Your first version doesn\'t need to be perfect. It needs to exist.

Who\'s working on their startup idea right now? 💪',
                'photo_url' => null
            ]);
        }

        // Specialties - More comprehensive
        $specialties = [
            'Guitar' => $guitar = \App\Models\Specialty::firstOrCreate(['name' => 'Guitar']),
            'Javascript' => $javascript = \App\Models\Specialty::firstOrCreate(['name' => 'Javascript']),
            'Cooking' => $cooking = \App\Models\Specialty::firstOrCreate(['name' => 'Cooking']),
            'Python' => $python = \App\Models\Specialty::firstOrCreate(['name' => 'Python']),
            'Yoga' => $yoga = \App\Models\Specialty::firstOrCreate(['name' => 'Yoga']),
            'Photography' => $photo = \App\Models\Specialty::firstOrCreate(['name' => 'Photography']),
            'Design' => $design = \App\Models\Specialty::firstOrCreate(['name' => 'Design']),
            'Business' => $business = \App\Models\Specialty::firstOrCreate(['name' => 'Business']),
            'Teaching' => $teaching = \App\Models\Specialty::firstOrCreate(['name' => 'Teaching']),
            'Wellness' => $wellness = \App\Models\Specialty::firstOrCreate(['name' => 'Wellness']),
            'Music' => $music = \App\Models\Specialty::firstOrCreate(['name' => 'Music']),
            'Art' => $art = \App\Models\Specialty::firstOrCreate(['name' => 'Art']),
            'Language' => $language = \App\Models\Specialty::firstOrCreate(['name' => 'Language']),
            'Fitness' => $fitness = \App\Models\Specialty::firstOrCreate(['name' => 'Fitness']),
            'Marketing' => $marketing = \App\Models\Specialty::firstOrCreate(['name' => 'Marketing']),
            'Writing' => $writing = \App\Models\Specialty::firstOrCreate(['name' => 'Writing']),
            'Video Production' => $video = \App\Models\Specialty::firstOrCreate(['name' => 'Video Production']),
            'Data Science' => $datascience = \App\Models\Specialty::firstOrCreate(['name' => 'Data Science']),
        ];

        // Attach specialties to users
        $alice->specialties()->syncWithoutDetaching([$specialties['Guitar']->id, $specialties['Teaching']->id]);
        $bob->specialties()->syncWithoutDetaching([$specialties['Javascript']->id, $specialties['Design']->id]);
        $carol->specialties()->syncWithoutDetaching([$specialties['Cooking']->id, $specialties['Teaching']->id]);
        $david->specialties()->syncWithoutDetaching([$specialties['Python']->id, $specialties['Design']->id]);
        $emma->specialties()->syncWithoutDetaching([$specialties['Yoga']->id, $specialties['Wellness']->id]);
        $frank->specialties()->syncWithoutDetaching([$specialties['Photography']->id, $specialties['Design']->id]);
        $grace->specialties()->syncWithoutDetaching([$specialties['Design']->id, $specialties['Teaching']->id]);
        $henry->specialties()->syncWithoutDetaching([$specialties['Business']->id, $specialties['Teaching']->id]);
    }
}
