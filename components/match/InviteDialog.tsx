'use client';

import * as React from 'react';
import { User, MatchBreakdown } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { UserAvatar } from '@/components/ui/avatar';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';
import { Send, Sparkles } from 'lucide-react';

export interface InviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate: User | null;
  breakdown: MatchBreakdown | null;
}

export function InviteDialog({
  open,
  onOpenChange,
  candidate,
  breakdown,
}: InviteDialogProps) {
  const [message, setMessage] = React.useState('');
  const { currentUserId, users, sendInvite } = useAppStore();
  const currentUser = users.find((u) => u.id === currentUserId);

  if (!candidate || !breakdown || !currentUser) return null;

  const handleSend = () => {
    const finalMsg = message.trim() || `Hey ${candidate.name}, let's team up for Innovate India 2026! Our skills complement well.`;
    sendInvite(currentUser.id, candidate.id, currentUser.teamId, finalMsg, breakdown.total);
    toast.success(`Invitation sent to ${candidate.name}!`, {
      description: 'You can monitor outbound requests in your Invite Inbox.',
    });
    setMessage('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-bold">
            <Send className="h-4 w-4 text-primary" />
            Invite {candidate.name} to Team
          </DialogTitle>
          <DialogDescription className="text-xs">
            Send a collaborative invitation. A snapshot of your compatibility score ({breakdown.total} pts) will be included.
          </DialogDescription>
        </DialogHeader>

        <div className="py-3 space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border/60">
            <UserAvatar seed={candidate.avatarSeed} name={candidate.name} size="md" />
            <div>
              <span className="font-semibold text-sm block">{candidate.name}</span>
              <span className="text-xs text-muted-foreground block line-clamp-1">{candidate.headline}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Personalized Note (Optional)
            </label>
            <Textarea
              placeholder={`Hi ${candidate.name}, noticed your strong ${candidate.preferredRoles[0]} experience! We need someone to cover our gaps...`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="text-xs resize-none"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} className="text-xs">
            Cancel
          </Button>
          <Button size="sm" onClick={handleSend} className="text-xs font-semibold gap-1.5">
            <Send className="h-3.5 w-3.5" />
            Send Invitation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
