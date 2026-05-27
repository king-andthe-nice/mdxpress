const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
    try {
        const blogDir = path.join(process.cwd(), 'public', 'blogs');
        
        // 检查目录是否存在
        if (!fs.existsSync(blogDir)) {
            console.error('Blogs directory not found:', blogDir);
            res.status(500).send('Server configuration error');
            return;
        }
        
        const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.md'));
        const baseUrl = 'https://mdxpress.techpanda.qzz.io';

        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

        // 添加首页
        xml += `<url><loc>${baseUrl}/</loc><priority>1.0</priority></url>`;
        xml += `<url><loc>${baseUrl}/blog</loc><priority>0.8</priority></url>`;

        // 添加所有博客文章 - 使用 /blog/slug 规范路径
        files.forEach(file => {
            const slug = file.replace('.md', '');
            // 排除非文章页面
            if (!['privacy-policy', 'about-me'].includes(slug)) {
                xml += `<url><loc>${baseUrl}/blog/${slug}</loc></url>`;
            }
        });
        
        xml += `</urlset>`;
        
        res.setHeader('Content-Type', 'application/xml');
        res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
        res.status(200).send(xml);
        
    } catch (error) {
        console.error('Sitemap generation error:', error);
        res.status(500).send('Error generating sitemap');
    }
};
