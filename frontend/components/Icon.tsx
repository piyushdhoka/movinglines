import * as Lucide from 'lucide-react';
import React from 'react';

// Use a safer way to extend Lucide props if LucideProps is problematic
interface IconProps extends React.SVGProps<SVGSVGElement> {
    name: keyof typeof Lucide;
    size?: string | number;
    color?: string;
    strokeWidth?: string | number;
}

export function Icon({ name, ...props }: IconProps) {
    const Component = Lucide[name] as React.FC<any>;

    if (!Component) {
        console.warn(`Icon "${String(name)}" not found in lucide-react`);
        return null;
    }

    return <Component {...props} />;
}
