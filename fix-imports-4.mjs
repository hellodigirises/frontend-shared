import fs from 'fs';
import path from 'path';

function traverse(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            traverse(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;

            // Fix API imports that are 4 levels deep up to 3 levels deep
            if (content.match(/['"]\.\.\/\.\.\/\.\.\/\.\.\/api\/axios['"]/)) {
                content = content.replace(/['"]\.\.\/\.\.\/\.\.\/\.\.\/api\/axios['"]/g, "'../../../api/axios'");
                modified = true;
            }
            if (content.match(/['"]\.\.\/\.\.\/\.\.\/\.\.\/redux\/store['"]/)) {
                content = content.replace(/['"]\.\.\/\.\.\/\.\.\/\.\.\/redux\/store['"]/g, "'../../../redux/store'");
                modified = true;
            }
            if (content.match(/['"]\.\.\/\.\.\/\.\.\/\.\.\/redux\/hooks['"]/)) {
                content = content.replace(/['"]\.\.\/\.\.\/\.\.\/\.\.\/redux\/hooks['"]/g, "'../../../redux/hooks'");
                modified = true;
            }

            if (modified) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log('Fixed imports in', fullPath);
            }
        }
    }
}

traverse('c:/Users/harsh/OneDrive/Desktop/realesso/frontend/src/modules');
