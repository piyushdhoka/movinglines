import { docs } from 'fumadocs-mdx:collections/server';
import { loader } from 'fumadocs-core/source';
import { BookOpen, Rocket, ShieldCheck, Database, Layout, Brain, Code2 } from 'lucide-react';

const icons = {
    BookOpen: <BookOpen />,
    Rocket: <Rocket />,
    ShieldCheck: <ShieldCheck />,
    Database: <Database />,
    Layout: <Layout />,
    Brain: <Brain />,
    Code2: <Code2 />,
};

export const source = loader({
    baseUrl: '/docs',
    source: docs.toFumadocsSource(),
    icon(icon) {
        if (icon && icon in icons) {
            return icons[icon as keyof typeof icons];
        }
        return undefined;
    },
});
