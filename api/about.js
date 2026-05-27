import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
    const templatePath = path.join(process.cwd(), 'public', 'views', 'about.html');
    const template = fs.readFileSync(templatePath, 'utf-8');

    const content = `
        <h1> 关于我们</h1>
        
        <p style="font-size: 1.1rem; margin-bottom: 2rem;">
            欢迎来到 <strong>mdxpress</strong>！我们致力于为您提供简洁、高效的博客写作体验。
        </p>

        <h2>🎯 我们的使命</h2>
        <p>
            mdxpress 的创立初衷是为开发者和内容创作者提供一个轻量级、无干扰的博客平台。
            我们相信，写作应该是一件简单而纯粹的事情。通过 Markdown 的力量，
            您可以专注于内容创作，而不必被复杂的工具所困扰。
        </p>

        <h2>✨ 核心特性</h2>
        <ul>
            <li><strong>简洁易用：</strong>无需复杂的配置，上传 Markdown 文件即可发布</li>
            <li><strong>快速部署：</strong>支持 Vercel 等平台的一键部署</li>
            <li><strong>主题切换：</strong>内置亮色和暗色主题，保护您的阅读体验</li>
            <li><strong>响应式设计：</strong>在任何设备上都能完美显示</li>
            <li><strong>开源免费：</strong>完全开源，可以自由使用和修改</li>
        </ul>

        <h2>‍💻 技术栈</h2>
        <p>
            mdxpress 采用现代 Web 技术构建，确保性能和可靠性：
        </p>
        <ul>
            <li><strong>Node.js：</strong>服务器端运行时环境</li>
            <li><strong>Vercel：</strong>全球边缘网络部署</li>
            <li><strong>Marked：</strong>快速可靠的 Markdown 解析器</li>
            <li><strong>CSS3：</strong>现代化的玻璃拟态设计</li>
        </ul>

        <h2>📈 发展历程</h2>
        <p>
            从最初的简单博客想法，到现在成为一个功能完整的平台，
            mdxpress 一直在不断进化。我们倾听用户的反馈，持续改进和添加新功能。
        </p>

        <h2>🤝 加入我们</h2>
        <p>
            如果您对我们的项目感兴趣，欢迎：
        </p>
        <ul>
            <li>在 GitHub 上给我们 Star ⭐</li>
            <li>提交 Issue 报告问题或建议</li>
            <li>贡献代码，成为我们的贡献者</li>
            <li>分享给您的朋友和同事</li>
        </ul>

        <div style="margin-top: 2rem; padding: 1.5rem; background: rgba(255, 255, 255, 0.1); border-radius: 12px;">
            <p style="margin: 0; font-style: italic;">
                "简化写作，释放创造力" —— 这是 mdxpress 永恒的追求。
            </p>
        </div>
    `;

    const html = template.replace(/{{title}}/g, '关于我们 - mdxpress').replace(/{{content}}/g, content);

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
}
