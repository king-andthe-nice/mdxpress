import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
    const templatePath = path.join(process.cwd(), 'public', 'views', 'contact.html');
    const template = fs.readFileSync(templatePath, 'utf-8');

    const content = `
        <h1> 联系方式</h1>
        
        <p style="font-size: 1.1rem; margin-bottom: 2rem;">
            我们很乐意听到您的声音！无论是问题、建议还是合作意向，都欢迎联系我们。
        </p>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem;">
            <div>
                <h2>📧 联系方式</h2>
                <ul style="list-style: none; margin-left: 0;">
                    <li style="margin-bottom: 1rem; padding: 1rem; background: rgba(255, 255, 255, 0.1); border-radius: 8px;">
                        <strong>电子邮件：</strong><br>
                        <a href="mailto:contact@mdxpress.dev">contact@mdxpress.dev</a>
                    </li>
                    <li style="margin-bottom: 1rem; padding: 1rem; background: rgba(255, 255, 255, 0.1); border-radius: 8px;">
                        <strong>GitHub：</strong><br>
                        <a href="#">github.com/mdxpress</a>
                    </li>
                    <li style="margin-bottom: 1rem; padding: 1rem; background: rgba(255, 255, 255, 0.1); border-radius: 8px;">
                        <strong>Twitter：</strong><br>
                        <a href="#">@mdxpress</a>
                    </li>
                </ul>
            </div>

            <div>
                <h2>💬 发送消息</h2>
                <form onsubmit="handleSubmit(event)">
                    <div class="form-group">
                        <label>姓名</label>
                        <input type="text" placeholder="您的姓名" required>
                    </div>
                    <div class="form-group">
                        <label>邮箱</label>
                        <input type="email" placeholder="your@email.com" required>
                    </div>
                    <div class="form-group">
                        <label>消息内容</label>
                        <textarea rows="5" placeholder="请输入您的消息..." required></textarea>
                    </div>
                    <button type="submit" class="btn">发送消息</button>
                </form>
            </div>
        </div>

        <h2>⏰ 工作时间</h2>
        <div style="padding: 1.5rem; background: rgba(255, 255, 255, 0.1); border-radius: 12px;">
            <p style="margin: 0.5rem 0;"><strong>周一至周五：</strong> 9:00 - 18:00 (UTC+8)</p>
            <p style="margin: 0.5rem 0;"><strong>周末：</strong> 10:00 - 16:00 (UTC+8)</p>
            <p style="margin: 0.5rem 0; color: rgba(255, 255, 255, 0.7);">
                我们通常会在 24-48 小时内回复您的消息。
            </p>
        </div>

        <script>
            function handleSubmit(event) {
                event.preventDefault();
                alert('感谢您的留言！我们会尽快回复您。');
                event.target.reset();
            }
        </script>
    `;

    const html = template.replace(/{{title}}/g, '联系方式 - mdxpress').replace(/{{content}}/g, content);

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
}
