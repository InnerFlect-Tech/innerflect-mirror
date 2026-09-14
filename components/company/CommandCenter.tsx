'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { Command, useCommandState } from 'cmdk';
import { ArrowRight, Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { commandIntents } from '@/lib/operations/commands';
import { useCockpitStore } from '@/lib/store/cockpit';

export function CommandCenter() {
  const router = useRouter();
  const open = useCockpitStore((state) => state.commandOpen);
  const setOpen = useCockpitStore((state) => state.setCommandOpen);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen(!open);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, setOpen]);

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="command" aria-label="Open Command Centre">
          <Search size={15} aria-hidden="true" />
          <span>Ask anything about the company</span>
          <kbd>⌘ K</kbd>
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="command-overlay" />
        <Dialog.Content
          className="command-dialog"
          aria-describedby="command-description"
        >
          <Dialog.Title>Command Centre</Dialog.Title>
          <Dialog.Description id="command-description">
            Navigate, investigate and govern the company from one place.
          </Dialog.Description>
          <Dialog.Close
            className="command-close"
            aria-label="Close Command Centre"
          >
            <X />
          </Dialog.Close>
          <Command label="Company commands" loop>
            <div className="command-input-row">
              <Search aria-hidden="true" />
              <Command.Input placeholder="Search pages, records and actions…" />
            </div>
            <CommandStatus />
            <Command.List>
              <Command.Empty>
                No matching command. Try a page, risk or decision.
              </Command.Empty>
              {(['Navigate', 'Investigate', 'Govern'] as const).map((group) => (
                <Command.Group key={group} heading={group}>
                  {commandIntents
                    .filter((item) => item.group === group)
                    .map((item) => (
                      <Command.Item
                        key={item.id}
                        value={`${item.label} ${item.description} ${item.keywords.join(' ')}`}
                        onSelect={() => go(item.href)}
                      >
                        <span>
                          <b>{item.label}</b>
                          <small>{item.description}</small>
                        </span>
                        <ArrowRight aria-hidden="true" />
                      </Command.Item>
                    ))}
                </Command.Group>
              ))}
            </Command.List>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function CommandStatus() {
  const selected = useCommandState((state) => state.value);
  const count = useCommandState((state) => state.filtered.count);
  return (
    <output className="sr-only" aria-live="polite">
      {count === 0
        ? 'No matching commands.'
        : `${count} commands. ${selected ? `${selected} selected.` : ''}`}
    </output>
  );
}
