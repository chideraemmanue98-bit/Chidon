import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const imagesDir = path.join(__dirname, '../src/assets/images');
const publicBlogDir = path.join(__dirname, '../public/blog');

const mapping = [
  { prefix: 'what_is_ai', target: 'blog-01-what-is-ai.png' },
  { prefix: 'ai_vs_human', target: 'blog-02-ai-vs-human.png' },
  { prefix: 'top_free_tools', target: 'blog-03-top-10-tools.png' },
  { prefix: 'students_study', target: 'blog-04-students-study.png' },
  { prefix: 'small_business_ai', target: 'blog-05-small-business.png' },
  { prefix: 'ai_dangerous', target: 'blog-06-ai-dangerous.png' },
  { prefix: 'llm_comparison', target: 'blog-07-chatgpt-vs-claude.png' },
  { prefix: 'ai_prompts', target: 'blog-08-ai-prompts.png' },
  { prefix: 'image_gen_guide', target: 'blog-09-image-generation.png' },
  { prefix: 'future_of_jobs', target: 'blog-10-future-jobs-world.png' },
  { prefix: 'content_creators', target: 'blog-11-content-creators.png' },
  { prefix: 'make_money_online', target: 'blog-12-make-money-online.png' },
  { prefix: 'coding_tools', target: 'blog-13-coding-tools.png' },
  { prefix: 'ai_education', target: 'blog-14-ai-education.png' },
  { prefix: 'viral_prompts', target: 'blog-15-viral-prompts.png' },
  { prefix: 'ai_ethics', target: 'blog-16-ai-ethics.png' },
  { prefix: 'detect_ai_content', target: 'blog-17-detect-ai-content.png' },
  { prefix: 'ai_marketing', target: 'blog-18-ai-marketing.png' },
  { prefix: 'machine_learning', target: 'blog-19-machine-learning.png' },
  { prefix: 'nigeria_ai', target: 'blog-20-nigeria-ai.png' },
];

console.log('🔄 Checking generated files inside assets directory...');

const files = fs.readdirSync(imagesDir);

mapping.forEach(({ prefix, target }) => {
  const matchedFile = files.find(f => f.startsWith(prefix) && f.endsWith('.png'));
  if (matchedFile) {
    const srcPath = path.join(imagesDir, matchedFile);
    const destPath = path.join(publicBlogDir, target);
    
    // Clear the original if exists to ensure overwrite works flawlessly
    if (fs.existsSync(destPath)) {
      fs.unlinkSync(destPath);
    }
    
    fs.copyFileSync(srcPath, destPath);
    console.log(`✅ Co-copied image [${matchedFile}] -> [/public/blog/${target}] successfully.`);
  } else {
    console.log(`⚠️ Warning: No generated file found with prefix: [${prefix}]`);
  }
});

console.log('🎉 Done! All 20 beautiful high-fidelity post featured illustrations copied successfully!');
