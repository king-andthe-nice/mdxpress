import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
    const blogDir = path.join(process.cwd(), 'public', 'blogs');
    const templatePath = path.join(process.cwd(), 'public', 'views', 'blog.html');
    const template = fs.readFileSync(templatePath, 'utf-8');

    const files = fs.readdirSync(blogDir)
        .filter(f => f.endsWith('.md'))
        .sort((a, b) => {
            // 按文件修改时间倒序排列
            const statA = fs.statSync(path.join(blogDir, a));
            const statB = fs.statSync(path.join(blogDir, b));
            return statB.mtime.getTime() - statA.mtime.getTime();
        });

    // 生成文章卡片
    const articleCards = files.map(f => {
        const slug = f.replace('.md', '');
        const filePath = path.join(blogDir, f);
        const content = fs.readFileSync(filePath, 'utf-8');
        
        // 提取标题
        const titleMatch = content.match(/^# (.+)/m);
        const title = titleMatch ? titleMatch[1] : slug.replace(/-/g, ' ');
        
        // 提取摘要（取第一段文字，最多150字符）
        const lines = content.split('\n').filter(line => 
            line.trim() && !line.startsWith('#') && !line.startsWith('```')
        );
        let excerpt = '';
        for (const line of lines) {
            if (line.trim()) {
                excerpt = line.trim();
                break;
            }
        }
        excerpt = excerpt.length > 150 ? excerpt.substring(0, 150) + '...' : excerpt;
        
        // 获取文件修改时间
        const stat = fs.statSync(filePath);
        const date = stat.mtime.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        return `
            <div class="article-card">
                <div class="article-meta">📅 ${date}</div>
                <h2><a href="/api/blog/${slug}">${title}</a></h2>
                <p class="article-excerpt">${excerpt}</p>
                <a href="/api/blog/${slug}" class="btn" style="margin-top: 1rem; display: inline-block;">阅读全文 →</a>
            </div>
        `;
    }).join('\n');

    const content = `
        <h1>📝 博客文章</h1>
        <p style="margin-bottom: 2rem;">探索我们的最新文章和教程</p>
        ${articleCards}
    `;
    
    const html = template.replace(/{{title}}/g, '博客 - mdxpress').replace(/{{content}}/g, content);

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
}
