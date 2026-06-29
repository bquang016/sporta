const fs = require('fs');
const files = [
  { path: 'src/main.tsx', from: /from '\.\/App\.tsx'/g, to: "from '@/App'" },
  { path: 'src/main.tsx', from: /from '\.\/components\/ui\/Toast'/g, to: "from '@/components/ui/Toast'" },
  { path: 'src/App.tsx', from: /from "\.\/components\/layout\/AdminLayout"/g, to: "from \"@/components/layout/AdminLayout\"" },
  { path: 'src/App.tsx', from: /from "\.\/pages\/Dashboard\/Dashboard"/g, to: "from \"@/pages/Dashboard/Dashboard\"" },
  { path: 'src/App.tsx', from: /from "\.\/pages\/Facilities\/FacilityAuditing"/g, to: "from \"@/pages/Facilities/FacilityAuditing\"" },
  { path: 'src/App.tsx', from: /from "\.\/pages\/Users\/UserManagement"/g, to: "from \"@/pages/Users/UserManagement\"" },
  { path: 'src/components/layout/AdminLayout.tsx', from: /from '\.\.\/ui\/Tooltip'/g, to: "from '@/components/ui/Tooltip'" },
  { path: 'src/components/layout/AdminLayout.tsx', from: /from '\.\.\/ui\/ConfirmModal'/g, to: "from '@/components/ui/ConfirmModal'" },
  { path: 'src/components/layout/AdminLayout.tsx', from: /from '\.\.\/\.\.\/assets\/logo\/light\/logo-horizontal_1600x400px\.svg'/g, to: "from '@/assets/logo/light/logo-horizontal_1600x400px.svg'" },
  { path: 'src/components/layout/AdminLayout.tsx', from: /from '\.\.\/\.\.\/assets\/logo\/light\/logo-main_40x40px_small\.svg'/g, to: "from '@/assets/logo/light/logo-main_40x40px_small.svg'" },
  { path: 'src/pages/Dashboard/Dashboard.tsx', from: /from '\.\.\/\.\.\/components\/ui\/Card'/g, to: "from '@/components/ui/Card'" },
  { path: 'src/pages/Facilities/FacilityAuditing.tsx', from: /from '\.\.\/\.\.\/components\/ui\/Card'/g, to: "from '@/components/ui/Card'" },
  { path: 'src/pages/Facilities/FacilityAuditing.tsx', from: /from '\.\.\/\.\.\/components\/ui\/Badge'/g, to: "from '@/components/ui/Badge'" },
  { path: 'src/pages/Facilities/FacilityAuditing.tsx', from: /from '\.\.\/\.\.\/components\/ui\/Button'/g, to: "from '@/components/ui/Button'" },
  { path: 'src/pages/Users/UserManagement.tsx', from: /from '\.\.\/\.\.\/components\/ui\/Card'/g, to: "from '@/components/ui/Card'" },
  { path: 'src/pages/Users/UserManagement.tsx', from: /from '\.\.\/\.\.\/components\/ui\/Badge'/g, to: "from '@/components/ui/Badge'" },
  { path: 'src/pages/Users/UserManagement.tsx', from: /from '\.\.\/\.\.\/components\/ui\/Button'/g, to: "from '@/components/ui/Button'" },
  { path: 'src/components/ui/ConfirmModal.tsx', from: /from '\.\/Modal'/g, to: "from '@/components/ui/Modal'" },
  { path: 'src/components/ui/ConfirmModal.tsx', from: /from '\.\/Button'/g, to: "from '@/components/ui/Button'" },
  { path: 'src/components/ui/LoadingSpinner.tsx', from: /from '\.\.\/\.\.\/assets\/logo\/light\/logo-main_40x40px_small\.svg'/g, to: "from '@/assets/logo/light/logo-main_40x40px_small.svg'" },
];

files.forEach(f => {
  if (fs.existsSync(f.path)) {
    let content = fs.readFileSync(f.path, 'utf8');
    content = content.replace(f.from, f.to);
    fs.writeFileSync(f.path, content);
  }
});
