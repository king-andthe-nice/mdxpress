import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
    const blogDir = path.join(process.cwd(), 'public', 'blogs');
    
    // 获取所有 .md 文件
    const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.md'));
    
    // 获取网站基础 URL (建议从环境变量读取，这里先写死或根据 req 判断)
    const baseUrl = 'https://mdxpress.techpanda.qzz.io'; // 请替换为你实际的域名

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // 添加首页
    xml += `<url><loc>${baseUrl}/</loc><priority>1.0</priority></url>`;
    xml += `<url><loc>${baseUrl}/blog</loc><priority>0.8</priority></url>`;

    // 添加所有博客文章
    files.forEach(file => {
        const slug = file.replace('.md', '');
        // 排除一些非文章页面（如 privacy-policy 等，按需调整）
        if (!['privacy-policy', 'about-me'].includes(slug)) {
            xml += `<url><loc>${baseUrl}/api/blog/${slug}</loc></url>`;
        }
    });
    
    xml += `</urlset>`;
    
    res.setHeader('Content-Type', 'application/xml');
    res.status(200).send(xml);
}
