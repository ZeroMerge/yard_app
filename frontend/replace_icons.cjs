const fs = require('fs');
const path = require('path');

const map = {
  'Activity': 'ChartBarIcon',
  'ArrowLeft': 'ArrowLeftIcon',
  'ArrowRight': 'ArrowRightIcon',
  'Bell': 'BellIcon',
  'Building2': 'BuildingOffice2Icon',
  'Calendar': 'CalendarIcon',
  'Camera': 'CameraIcon',
  'Check': 'CheckIcon',
  'CheckCircle': 'CheckCircleIcon',
  'CheckCircle2': 'CheckCircleIcon',
  'ChevronDown': 'ChevronDownIcon',
  'ChevronLeft': 'ChevronLeftIcon',
  'ChevronRight': 'ChevronRightIcon',
  'ChevronUp': 'ChevronUpIcon',
  'Circle': 'ArrowPathIcon', // Fallback, handled manually if needed
  'Compass': 'GlobeAltIcon',
  'Dot': 'StopIcon', // Fallback
  'Download': 'ArrowDownTrayIcon',
  'ExternalLink': 'ArrowTopRightOnSquareIcon',
  'FileText': 'DocumentTextIcon',
  'FileUp': 'ArrowUpTrayIcon',
  'Film': 'FilmIcon',
  'GripVertical': 'Bars3Icon',
  'Home': 'HomeIcon',
  'LayoutDashboard': 'Squares2X2Icon',
  'Loader2': 'ArrowPathIcon',
  'LogOut': 'ArrowRightOnRectangleIcon',
  'MailCheck': 'EnvelopeOpenIcon',
  'MapPin': 'MapPinIcon',
  'Megaphone': 'MegaphoneIcon',
  'Moon': 'MoonIcon',
  'MoreHorizontal': 'EllipsisHorizontalIcon',
  'PanelLeft': 'Bars3BottomLeftIcon',
  'Paperclip': 'PaperClipIcon',
  'Plus': 'PlusIcon',
  'RefreshCw': 'ArrowPathIcon',
  'Search': 'MagnifyingGlassIcon',
  'Send': 'PaperAirplaneIcon',
  'ShieldAlert': 'ShieldExclamationIcon',
  'ShieldCheck': 'ShieldCheckIcon',
  'Sparkles': 'SparklesIcon',
  'Sun': 'SunIcon',
  'Upload': 'ArrowUpTrayIcon',
  'User': 'UserIcon',
  'UserCheck': 'UserPlusIcon',
  'Users': 'UsersIcon',
  'UserX': 'UserMinusIcon',
  'Video': 'VideoCameraIcon',
  'Wallet': 'WalletIcon',
  'X': 'XMarkIcon'
};

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('src', function(filePath) {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;

  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Regex to find lucide-react imports
  const importRegex = /import\s+\{([^}]+)\}\s+from\s+["']lucide-react["'];?/g;
  let match;
  let hasChanges = false;
  
  while ((match = importRegex.exec(content)) !== null) {
    const importStr = match[0];
    const namedImports = match[1].split(',').map(s => s.trim()).filter(s => s);
    
    let heroImports = [];
    let customTypes = [];
    
    namedImports.forEach(imp => {
      // Handle aliases like "Activity as ActivityIcon"
      let originalName = imp;
      let alias = imp;
      if (imp.includes(' as ')) {
        const parts = imp.split(' as ').map(s => s.trim());
        originalName = parts[0];
        alias = parts[1];
      }
      
      if (originalName === 'type LucideIcon' || originalName === 'LucideIcon') {
        customTypes.push('type ComponentType', 'type SVGProps');
        // We will manually inject the type later in the file
        content = content.replace(importStr, importStr.replace(imp, ''));
        return;
      }
      
      const heroName = map[originalName];
      if (heroName) {
        if (originalName !== alias) {
           // We mapped e.g. Activity -> ChartBarIcon. But they used it as ActivityIcon
           // So we import ChartBarIcon as ActivityIcon
           heroImports.push(`${heroName} as ${alias}`);
        } else {
           // They used 'Search'. But heroicons is 'MagnifyingGlassIcon'.
           // To avoid changing all JSX tags (<Search />), we can alias it!
           // import { MagnifyingGlassIcon as Search } from '@heroicons/react/24/outline'
           heroImports.push(`${heroName} as ${originalName}`);
        }
      } else {
        console.warn(`No mapping for ${originalName} in ${filePath}`);
        heroImports.push(`${originalName} /* UNMAPPED */`);
      }
    });
    
    if (heroImports.length > 0) {
      const newImport = `import { ${heroImports.join(', ')} } from '@heroicons/react/24/outline';`;
      content = content.replace(importStr, newImport);
      hasChanges = true;
    } else {
      // Remove empty import if only LucideIcon was there
      content = content.replace(importStr, '');
      hasChanges = true;
    }
  }

  // Handle LucideIcon type definition fallback
  if (originalContent.includes('LucideIcon') && hasChanges) {
    if (!content.includes('import { ComponentType, SVGProps }')) {
      content = `import type { ComponentType, SVGProps } from 'react';\ntype LucideIcon = ComponentType<SVGProps<SVGSVGElement>>;\n` + content;
    }
  }

  // Fix circle in radio-group and dot in carousel (they use raw lucide icons sometimes)
  if (hasChanges) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
});
