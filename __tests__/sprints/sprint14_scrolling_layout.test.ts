import { cn } from '../../lib/utils';

describe('Sprint 14: Vertical Scrolling & Layout Overhaul', () => {
  it('should correctly join layout classes using cn utility', () => {
    const layoutClasses = cn(
      'flex h-full overflow-hidden bg-slate-50',
      true && 'min-h-0',
      false && 'overflow-visible'
    );
    expect(layoutClasses).toContain('flex');
    expect(layoutClasses).toContain('h-full');
    expect(layoutClasses).toContain('overflow-hidden');
    expect(layoutClasses).toContain('min-h-0');
    expect(layoutClasses).not.toContain('overflow-visible');
  });

  it('should merge scrollbar and overflow classes properly', () => {
    const mainClass = cn(
      'flex-1 min-h-0 overflow-y-auto p-6',
      'space-y-6'
    );
    expect(mainClass).toContain('overflow-y-auto');
    expect(mainClass).toContain('flex-1');
    expect(mainClass).toContain('min-h-0');
  });
});
