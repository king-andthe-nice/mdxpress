import fs from 'fs';
import path from 'path';
import { marked } from 'marked';

export default function handler(req, res) {
    const filePath = path.join(process.cwd(), 'public', 'blogs', 'privacy-policy.md');
    const templatePath = path.join(process.cwd(), 'public', 'views', 'privacy.html');

    if (!fs.existsSync(filePath)) {
        res.status(404).send('Privacy policy not found');
        return;
    }

    const data = fs.readFileSync(filePath, 'utf-8');
    const template = fs.readFileSync(templatePath, 'utf-8');

    marked.setOptions({
        breaks: true,
        gfm: true,
        headerIds: true,
        mangle: false
    });

    const content = marked.parse(data);
    const html = template.replace(/{{title}}/g, '隐私政策 - mdxpress').replace(/{{content}}/g, content);

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
}
