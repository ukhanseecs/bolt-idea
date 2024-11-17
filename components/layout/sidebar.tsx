'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Home, Server, Settings, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMediaQuery } from '@/hooks/use-media-query';

const sidebarItems = [
  { icon: Home, label: 'Dashboard', href: '/' },
  { icon: Server, label: 'Clusters', href: '/clusters' },
  { icon: Settings, label: 'Settings', href: '/settings' },
];

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isMobile) {
      setIsOpen(false);
    }
  }, [isMobile, setIsOpen]);

  if (!mounted) {
    return null;
  }

  return (
    <>
      {isOpen && isMobile && (
        <div
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen bg-card transition-all duration-300 ease-in-out',
          isOpen ? 'w-64' : 'w-20',
          isMobile && !isOpen && '-translate-x-full'
        )}
        aria-label="Sidebar navigation"
      >
        <div className="flex h-16 items-center justify-between px-4">
          <h2
            className={cn(
              'text-lg font-semibold transition-opacity duration-200',
              !isOpen && 'opacity-0 hidden'
            )}
          >
            Admin Panel
          </h2>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <ChevronLeft
              className={cn('h-4 w-4 transition-all', !isOpen && 'rotate-180')}
            />
          </Button>
        </div>

        <ScrollArea className="h-[calc(100vh-4rem)] px-4">
          <nav className="space-y-2 py-4">
            <TooltipProvider delayDuration={0}>
              {sidebarItems.map((item) => (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    <Link href={item.href}>
                      <Button
                        variant={pathname === item.href ? 'secondary' : 'ghost'}
                        className={cn(
                          'w-full justify-start',
                          !isOpen && 'justify-center px-2'
                        )}
                        aria-current={pathname === item.href ? 'page' : undefined}
                      >
                        <item.icon
                          className={cn('h-4 w-4', isOpen && 'mr-2')}
                          aria-hidden="true"
                        />
                        {isOpen && <span>{item.label}</span>}
                        {!isOpen && (
                          <span className="sr-only">{item.label}</span>
                        )}
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" className={cn(isOpen && 'hidden')}>
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              ))}
            </TooltipProvider>
          </nav>
        </ScrollArea>
      </aside>
    </>
  );
}