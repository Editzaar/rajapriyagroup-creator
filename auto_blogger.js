/**
 * RAJA PRIYA GROUP — AUTOMATED AI ARTICLE GENERATOR & PUBLISHER
 * Node.js script that converts a topic into a complete SEO HTML article with cover images & meta tags.
 */

const fs = require('fs');
const path = require('path');

const CATEGORIES = {
  'real estate': ['Real Estate', 'Hyderabad', 'Properties', 'Investment'],
  'video': ['Video Editing', 'Reels', 'Motion Graphics', 'Branding'],
  'web': ['Website Development', 'Web Design', 'SEO', 'Digital'],
  'branding': ['Brand Growth', 'Digital Marketing', 'Social Media', 'Lead Generation']
};

function generateArticle(topic, summary = '') {
  console.log(`\n🚀 Generating Article for Topic: "${topic}"...`);

  const topicLower = topic.toLowerCase();
  let labels = ['Raja Priya Group', 'Insights'];
  
  for (const [key, tags] of Object.entries(CATEGORIES)) {
    if (topicLower.includes(key)) {
      labels = labels.concat(tags);
      break;
    }
  }

  let imgUrl = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80';
  if (topicLower.includes('video') || topicLower.includes('reel')) {
    imgUrl = 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80';
  } else if (topicLower.includes('web') || topicLower.includes('site')) {
    imgUrl = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80';
  } else if (topicLower.includes('brand') || topicLower.includes('market')) {
    imgUrl = 'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?auto=format&fit=crop&w=1200&q=80';
  }

  const title = topic.trim().replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  const metaDescription = `Discover expert insights on ${topic} from Raja Priya Group in Hyderabad. Complete guide, market trends, and growth strategies.`;

  const htmlContent = `
<div class="article-content">
  <p class="lead" style="font-size:1.15rem; line-height:1.75; color:#f5f5f7; font-weight:500;">
    ${summary ? summary : `In today's fast-evolving market, understanding ${topic} is crucial for long-term growth and high ROI. Raja Priya Group brings you an in-depth analysis and expert guide.`}
  </p>

  <div style="margin:24px 0; border-radius:16px; overflow:hidden; border:1px solid rgba(212,175,55,0.35);">
    <img src="${imgUrl}" alt="${title}" style="width:100%; height:auto; display:block;" />
  </div>

  <h2 style="font-family:'Outfit', sans-serif; font-size:1.8rem; color:#d4af37; margin:32px 0 16px;">
    1. Key Market Trends & Strategic Advantages
  </h2>
  <p style="line-height:1.75; color:#e3e3e8; margin-bottom:16px;">
    Navigating ${topic} requires a structured approach. Whether you are looking to scale your business presence or invest strategically in Hyderabad, timing and execution are paramount.
  </p>
  <ul style="margin-left:20px; line-height:1.8; color:#86868b; margin-bottom:24px;">
    <li><strong style="color:#ffffff;">Targeted Reach:</strong> Tailored strategies designed for maximum engagement.</li>
    <li><strong style="color:#ffffff;">Professional Execution:</strong> High-grade production and execution standards.</li>
    <li><strong style="color:#ffffff;">Long-Term Value:</strong> Built to generate sustainable returns and brand equity.</li>
  </ul>

  <h2 style="font-family:'Outfit', sans-serif; font-size:1.8rem; color:#d4af37; margin:32px 0 16px;">
    2. How Raja Priya Group Delivers Results
  </h2>
  <p style="line-height:1.75; color:#e3e3e8; margin-bottom:16px;">
    At Raja Priya Group, we integrate real estate development expertise with cutting-edge digital media services (Video Editing, Web Development, and Brand Growth) to deliver seamless end-to-end solutions.
  </p>

  <div style="background:rgba(212,175,55,0.08); border:1px solid rgba(212,175,55,0.4); padding:24px; border-radius:16px; margin:32px 0;">
    <h3 style="color:#ffffff; margin-bottom:8px; font-size:1.3rem;">💡 Ready to Transform Your Growth?</h3>
    <p style="color:#86868b; margin-bottom:16px;">Get expert consultation for real estate, construction, video editing, or digital brand promotion in Hyderabad.</p>
    <a href="https://editzaar.github.io/rajapriyagroup-creator/contact.html" style="background:linear-gradient(135deg, #c59b27, #e6c867); color:#07080a; font-weight:700; padding:12px 24px; border-radius:24px; text-decoration:none; display:inline-block;">Get Free Consultation &rarr;</a>
  </div>
</div>
`;

  const payload = {
    title,
    labels,
    metaDescription,
    imageUrl: imgUrl,
    content: htmlContent,
    createdAt: new Date().toISOString()
  };

  const outputPath = path.join(__dirname, 'latest_generated_article.json');
  fs.writeFileSync(outputPath, JSON.stringify(payload, null, 2));

  console.log(`✅ Article Generated Successfully!`);
  printPayloadSummary(payload);

  return payload;
}

function printPayloadSummary(payload) {
  console.log(`📌 Title: ${payload.title}`);
  console.log(`🏷️ Category Labels: ${payload.labels.join(', ')}`);
  console.log(`🖼️ Cover Image Attached: ${payload.imageUrl}`);
  console.log(`💾 Saved Payload File: ${path.join(__dirname, 'latest_generated_article.json')}`);
}

// CLI Execution
const args = process.argv.slice(2);
const topicInput = args[0] || 'High ROI Real Estate Plot Ventures in Hyderabad 2026';
const summaryInput = args[1] || '';

generateArticle(topicInput, summaryInput);
