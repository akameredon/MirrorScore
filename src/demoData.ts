/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface DemoProfile {
  id: string;
  name: string;
  tagline: string;
  avatarColor: string;
  platforms: ('x' | 'reddit' | 'linkedin' | 'facebook')[];
  description: string;
  corpusText: string;
  approxItems: number;
}

export const demoProfiles: DemoProfile[] = [
  {
    id: 'dater',
    name: 'John - "The Self-Aware Dater"',
    tagline: 'Reflective, mature, relationship-oriented, slight self-confidence struggles.',
    avatarColor: 'from-emerald-400 to-teal-500',
    platforms: ['x', 'reddit'],
    description: 'Frequently writes in relationship forums. Demonstrates high empathy and reflection, but occasionally gets defensive when his communication style is directly criticized in comment threads.',
    approxItems: 240,
    corpusText: `
[Reddit Post - r/relationships - Feb 12, 2024]
I've been thinking a lot about how my past relationships ended. Honestly, I think a big issue was my inability to express my needs early on. I would stay quiet to avoid "making a scene," but that just led to hidden resentment. I'm trying to be more upfront now. It's scary but feels much healthier. What are some ways you guys practiced stating boundaries without sounding demanding?

[Reddit Comment - r/datingoverthirty - Mar 5, 2024]
I completely agree with the advice here. Sometimes we think we are being helpful by sacrificing our comfort, but we're actually just depriving our partners of the chance to know the real us. Thanks for sharing this perspective.

[X Post - Mar 18, 2024]
Vulnerability isn't about dumping all your baggage on someone on day one. It's about slowly showing who you are, cracks included, and seeing if they treat those parts with respect.

[Reddit Comment - r/relationships - Apr 22, 2024]
Wait, you're saying I'm being selfish? No, I disagree. If you read my post, I explicitly said I offered to pay. I don't appreciate being labeled as self-centered just because I wanted to split the driving distance. Let's stick to what I actually wrote instead of inventing motivations.

[X Post - May 10, 2024]
Had a great conversation today with a friend about communication. It's amazing how much friction can be avoided by simply asking, "Are you looking for a solution, or do you just want to feel heard right now?"

[Reddit Post - r/datingoverthirty - Jul 14, 2024]
Update: I had the boundary talk on the third date. It went surprisingly well! She actually thanked me for being so clear about where I stood. It felt like a weight off my chest. I used to think being easygoing was a virtue, but clarity is so much kinder.

[X Post - Aug 3, 2024]
Sometimes we hold onto versions of people that don't exist anymore. Growth means accepting who they are today, even if that means letting them go.

[Reddit Comment - r/relationships - Oct 19, 2024]
Look, I hear what you're saying about her side of things. I can understand why she would feel overwhelmed by my enthusiasm. That's a fair point I hadn't fully considered. Maybe my constant texting was too much. I'll take a step back and apologize to her for crowding her space.

[X Post - Nov 29, 2024]
Highly recommend checking out books on attachment theory. Learning about anxious-preoccupied attachment was like reading a biography of my twenties. Awareness is the first step to rewiring those defaults.

[Reddit Comment - r/datingoverthirty - Dec 15, 2024]
I was wrong about this. I used to think spark was everything. Now I realize peace and consistency are 100x more valuable for long-term happiness. Thank you to everyone who corrected me on this thread last month.
    `
  },
  {
    id: 'professional',
    name: 'Sarah - "The Career-Conscious Climber"',
    tagline: 'LinkedIn-optimized, highly structured, polite but prone to passive-aggression.',
    avatarColor: 'from-blue-400 to-indigo-500',
    platforms: ['linkedin', 'x'],
    description: 'Writes clean, professional, highly formatted industry content. Extremely stable and values-aligned, but communication has a polished, slightly detached tone and she rarely shares vulnerable or raw emotions.',
    approxItems: 180,
    corpusText: `
[LinkedIn Post - Jan 15, 2024]
Delighted to share that our quarterly engineering goals were met with 104% efficiency! Huge shoutout to the entire team for their relentless dedication. Success isn't about individual heroics; it's about building scalable, collaborative systems that empower everyone to thrive. #Leadership #Teamwork #EngineeringExcellence

[LinkedIn Post - Feb 28, 2024]
One of the most important lessons I've learned as a manager is the difference between intent and impact. We can have the best intentions, but if our communication doesn't land correctly, the impact is lost. I am constantly working to refine my clarity and deliver feedback that builds up rather than tears down.

[X Post - Mar 12, 2024]
Unpopular opinion: "Always-on" hustle culture is actually a symptom of poor operational planning. High performers need structured rest.

[LinkedIn Comment - Mar 22, 2024]
That is an interesting viewpoint, David. However, in our experience, implementing that framework without a dedicated project manager usually results in standard scope creep. Perhaps a more measured approach is preferable for teams of our size? Just a thought.

[LinkedIn Post - May 3, 2024]
True leadership is about accountability. When things go wrong, a leader looks in the mirror first. When things go right, they look out the window to praise others. Extremely proud of our design sprint results this week.

[X Post - Jun 14, 2024]
Interesting how people expect high-quality results but refuse to invest in basic project scoping. Clear inputs = clear outputs. It's not rocket science.

[LinkedIn Post - Aug 20, 2024]
Had the pleasure of speaking at the TechLeadership Summit today. My key takeaway: adaptability is the ultimate competitive advantage. The tools we use today will change, but a growth mindset is evergreen.

[LinkedIn Comment - Sep 15, 2024]
I appreciate your perspective, Susan. It must be nice to have the budget to run 3-month discovery phases. For those of us in high-velocity startups, we have to make decisions with 70% data density. Both approaches have merits.

[X Post - Oct 22, 2024]
Active listening is a super power. The best negotiators aren't the loudest in the room; they are the ones who can synthesize what everyone else actually wants.

[LinkedIn Post - Nov 15, 2024]
As we enter annual planning, my focus is on cognitive diversity. Surrounding yourself with people who agree with you is comfortable, but surrounding yourself with respectful dissent is how you build robust systems. Grateful for my team's constructive pushback this week.
    `
  },
  {
    id: 'volatile',
    name: 'Alex - "The Evolving Debater"',
    tagline: 'High-intensity, argument-prone history, showing an impressive growth pivot.',
    avatarColor: 'from-orange-400 to-rose-500',
    platforms: ['x', 'reddit'],
    description: 'Perfect for demonstrating longitudinal growth. Has a clear history of hostile, reactive arguing in 2024, but undergoes a noticeable shift in 2025-2026, adopting de-escalation tactics and showing high self-awareness.',
    approxItems: 310,
    corpusText: `
[X Post - Feb 10, 2024]
Are you seriously this dense? It's literally in the first paragraph of the article. Maybe try reading before spewing garbage takes on here. Unbelievable.

[Reddit Comment - r/politics - Mar 2, 2024]
Your entire argument is a massive strawman. Classic bad faith arguing. I'm not even going to bother explaining why you're wrong because it's completely obvious to anyone with a brain. Downvoted and moving on.

[X Post - May 14, 2024]
If you disagree with me on this, feel free to unfollow. I have zero patience for idiots who think they can lecture me about tech policy.

[Reddit Comment - r/movies - Jun 18, 2024]
That movie was absolute trash and your review is laughable. Did we even watch the same film? Your taste is in your mouth.

[X Post - Sep 1, 2024]
Honestly, taking a break from this place. Everyone is so angry and combative. It's draining.

--- LONGITUDINAL TRAJECTORY SHIFT (2025) ---

[Reddit Post - r/decidebetter - Jan 15, 2025]
Looking back at my history on Reddit, I'm honestly embarrassed. I used to be so combative, jumping into debates just to "win" and tear others down. It was toxic and it was making me miserable. I'm actively trying to change my online posture. I want to learn to disagree without being a jerk. Has anyone else gone through this shift? What helped you stay calm when someone baits you?

[X Post - Feb 28, 2025]
Working on a new rule: if a reply makes my blood boil, I close the app for 15 minutes. 99% of the time, I realize it's not worth my peace of mind.

[Reddit Comment - r/technology - Apr 10, 2025]
Hey, I apologize for my aggressive tone in my last reply. You made some valid points about decentralized hosting. I got defensive because I've spent so much time on the alternative, but you're right to point out the trade-offs. Let's keep chatting about this, I want to learn more.

[X Post - Jun 22, 2025]
It is incredibly freeing to say "I don't know enough about that to have an opinion." We don't have to take a side on everything immediately.

[Reddit Comment - r/movies - Aug 5, 2025]
I actually can see why people enjoyed that movie, even if it didn't click for me. The cinematography was objectively gorgeous. Thanks for explaining what resonated with you — makes me appreciate those elements more!

[X Post - Nov 12, 2025]
Evolving as a person means looking back at your past self and cringey posts with compassion, but being glad you're not that person anymore.

[Reddit Comment - r/politics - Feb 18, 2026]
That is a complex issue and we clearly see it from different angles. I respect your stance, especially your concern about implementation costs. For me, the human impact makes the investment worth it, but I totally understand why budget sustainability is a major concern. Thanks for a respectful exchange.
    `
  }
];
