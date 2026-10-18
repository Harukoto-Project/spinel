import { PluginSettingsForm } from '@/components/plugins/PluginSettingsForm';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import type { Plugin, PluginSettingsUpdate } from '@/types/plugin';

type PluginSettingsDialogProps = {
  plugin: Plugin;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (values: PluginSettingsUpdate) => Promise<void>;
};

export function PluginSettingsDialog({ plugin, open, onOpenChange, onSave }: PluginSettingsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <PluginSettingsForm plugin={plugin} onSave={onSave} onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
