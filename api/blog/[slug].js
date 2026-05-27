const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

module.exports = (req, res) => {
    const { slug } = req.query;
    const filePath = path.join(process.cwd(), 'public', 'blogs', `${slug}.md`);
    const templatePath = path.join(process.cwd(), 'public', 'views', 'blog.html');

    if (!fs.existsSync(filePath)) {
        res.status(404).send('Post not found');
        return;
    }

    try {
        const data = fs.readFileSync(filePath, 'utf-8');
        
        // 配置 marked 渲染选项
        marked.setOptions({
            breaks: true,
            gfm: true,
            headerIds: true,
            mangle: false
        });
        
        // 自定义图片渲染器，添加懒加载和 alt 属性
        const renderer = new marked.Renderer();
        renderer.image = function(href, title, text) {
            return `<img src="${href}" alt="${text || title || '文章配图'}" loading="lazy" title="${title || ''}">`;
        };
        
        const content = marked.parse(data, { renderer: renderer });
        const title = (data.match(/^# (.+)/m) || [])[1] || slug.replace(/-/g, ' ');
        const template = fs.readFileSync(templatePath, 'utf-8');
        
        // 提取描述（取第一段非标题文字，最多 160 字符）
        const lines = data.split('\n').filter(line => line.trim() && !line.startsWith('#'));
        let description = '';
        for (const line of lines) {
            if (line.trim()) {
                description = line.trim().replace(/[*_\[\]]/g, ''); // 去除 Markdown 符号
                break;
            }
        }
        description = description.length > 160 ? description.substring(0, 157) + '...' : description;
        
        // 添加文章元信息
        const stat = fs.statSync(filePath);
        const date = stat.mtime.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        const fullContent = `
            <article>
                <nav aria-label="Breadcrumb" style="margin-bottom: 1rem; font-size: 0.9rem;">
                    <a href="/" style="color: rgba(255, 255, 255, 0.7);">首页</a> &gt; 
                    <a href="/blog" style="color: rgba(255, 255, 255, 0.7);">博客</a> &gt; 
                    <span style="color: #fff;">${title}</span>
                </nav>
                <div style="margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 2px solid rgba(255, 255, 255, 0.2);">
                    <div style="font-size: 0.9rem; color: rgba(255, 255, 255, 0.7); margin-bottom: 0.5rem;">📅 ${date}</div>
                </div>
                ${content}
                <div style="margin-top: 3rem; padding-top: 2rem; border-top: 2px solid rgba(255, 255, 255, 0.2);">
                    <h3>🔗 相关阅读</h3>
                    <ul style="list-style: none; padding: 0;">
                        <li><a href="/blog">← 返回博客列表查看更多</a></li>
                    </ul>
                    <p style="text-align: center; font-size: 0.9rem; color: rgba(255, 255, 255, 0.7); margin-top: 2rem;">
                        感谢您的阅读！如果觉得这篇文章有帮助，欢迎分享给更多人。
                    </p>
                </div>
            </article>
        `;
        
        const html = template
            .replace(/{{title}}/g, title + ' - mdxpress')
            .replace('{{content}}', fullContent)
            .replace('<head>', `<head>
    <meta name="description" content="${description}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:type" content="article">
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": "${title}",
      "datePublished": "${stat.mtime.toISOString()}",
      "dateModified": "${stat.mtime.toISOString()}",
      "author": {
        "@type": "Person",
        "name": "Eshan Singh"
      }
    }
    </script>`);

        res.setHeader('Content-Type', 'text/html');
        res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
        res.status(200).send(html);
        
    } catch (error) {
        console.error('Blog rendering error:', error);
        res.status(500).send('Error rendering blog post');
    }
};
