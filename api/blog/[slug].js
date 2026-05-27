import fs from 'fs';
import path from 'path';
import { marked } from 'marked';

export default function handler(req, res) {
    const { slug } = req.query;
    const filePath = path.join(process.cwd(), 'public', 'blogs', `${slug}.md`);
    const templatePath = path.join(process.cwd(), 'public', 'views', 'blog.html');

    if (!fs.existsSync(filePath)) {
        res.status(404).send('Post not found');
        return;
    }

    const data = fs.readFileSync(filePath, 'utf-8');
    
    // 配置 marked 渲染选项
    marked.setOptions({
        breaks: true,
        gfm: true,
        headerIds: true,
        mangle: false
    });
    
    const content = marked.parse(data);
    const title = (data.match(/^# (.+)/m) || [])[1] || slug.replace(/-/g, ' ');
    const template = fs.readFileSync(templatePath, 'utf-8');
    
    // 添加文章元信息
    const stat = fs.statSync(filePath);
    const date = stat.mtime.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const fullContent = `
        <article>
            <div style="margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 2px solid rgba(255, 255, 255, 0.2);">
                <div style="font-size: 0.9rem; color: rgba(255, 255, 255, 0.7); margin-bottom: 0.5rem;">📅 ${date}</div>
            </div>
            ${content}
            <div style="margin-top: 3rem; padding-top: 2rem; border-top: 2px solid rgba(255, 255, 255, 0.2);">
                <p style="text-align: center; font-size: 0.9rem; color: rgba(255, 255, 255, 0.7);">
                    感谢您的阅读！如果觉得这篇文章有帮助，欢迎分享给更多人。
                </p>
                <div style="text-align: center; margin-top: 1rem;">
                    <a href="/blog" class="btn">← 返回博客列表</a>
                </div>
            </div>
        </article>
    `;
    
    const html = template.replace(/{{title}}/g, title + ' - mdxpress').replace(/{{content}}/g, fullContent);

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
}
