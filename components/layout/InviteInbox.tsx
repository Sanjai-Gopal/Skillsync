'use client';

import * as React from 'react';
import { useAppStore } from '@/lib/store';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserAvatar } from '@/components/ui/avatar';
import { Bell, Check, X, Undo2, ArrowUpRight, MessageSquare, Mail, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export function InviteInbox() {
  const [open, setOpen] = React.useState(false);
  const { invites, currentUserId, users, teams, respondToInvite, withdrawInvite } = useAppStore();

  const receivedInvites = invites.filter((inv) => inv.toUserId === currentUserId);
  const pendingReceived = receivedInvites.filter((inv) => inv.status === 'pending');
  const sentInvites = invites.filter((inv) => inv.fromUserId === currentUserId);

  const handleAccept = (inviteId: string, fromName: string) => {
    respondToInvite(inviteId, 'accepted');
    toast.success(`You joined forces with ${fromName}! Team Nexus formed.`, {
      description: 'Head over to My Team to inspect complementary capabilities and radar.',
    });
  };

  const handleDecline = (inviteId: string, fromName: string) => {
    respondToInvite(inviteId, 'declined');
    toast.info(`Declined invite from ${fromName}.`);
  };

  const handleWithdraw = (inviteId: string) => {
    withdrawInvite(inviteId);
    toast.info('Invite withdrawn.');
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative h-9 w-9 rounded-full border-border/80 bg-background/80"
          aria-label="Open invites inbox"
        >
          <Bell className="h-4 w-4 text-foreground" />
          {pendingReceived.length > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-extrabold text-primary-foreground shadow">
              {pendingReceived.length}
            </span>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-md p-6 overflow-y-auto">
        <SheetHeader className="text-left pb-4 border-b border-border/60">
          <SheetTitle className="text-lg font-bold flex items-center gap-2">
            <Mail className="h-4 w-4 text-primary" />
            Team Invites & Requests
          </SheetTitle>
          <SheetDescription className="text-xs">
            Manage your incoming invitations and track outbound team requests
          </SheetDescription>
        </SheetHeader>

        <div className="py-5 space-y-6">
          {/* Received Invites Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Received Invites ({pendingReceived.length} pending)
              </h4>
            </div>

            {receivedInvites.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/80 p-6 text-center text-xs text-muted-foreground">
                No incoming invites received yet. Discover and invite teammates from the match feed!
              </div>
            ) : (
              <div className="space-y-3">
                {receivedInvites.map((inv) => {
                  const sender = users.find((u) => u.id === inv.fromUserId);
                  if (!sender) return null;

                  return (
                    <div
                      key={inv.id}
                      className="rounded-xl border border-border/80 bg-card/70 p-4 space-y-3 shadow-sm transition-all"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <UserAvatar seed={sender.avatarSeed} name={sender.name} size="md" />
                          <div>
                            <span className="font-semibold text-sm text-foreground block">
                              {sender.name}
                            </span>
                            <span className="text-xs text-muted-foreground block">
                              {sender.preferredRoles[0]} • {sender.headline}
                            </span>
                          </div>
                        </div>

                        <Badge
                          variant={inv.status === 'pending' ? 'default' : 'secondary'}
                          className="text-[10px] capitalize"
                        >
                          {inv.status}
                        </Badge>
                      </div>

                      {inv.message && (
                        <div className="rounded-lg bg-muted/60 p-2.5 text-xs text-foreground/90 italic flex items-start gap-2">
                          <MessageSquare className="h-3.5 w-3.5 mt-0.5 text-primary shrink-0" />
                          <span>"{inv.message}"</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                        <span className="font-mono text-[11px]">
                          Match Score: <strong className="text-primary">{inv.matchScoreSnapshot} pts</strong>
                        </span>

                        {inv.status === 'accepted' && sender.contact && (
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                            Contact: {sender.contact}
                          </span>
                        )}
                      </div>

                      {inv.status === 'pending' && (
                        <div className="flex items-center gap-2 pt-1">
                          <Button
                            size="sm"
                            className="flex-1 h-8 text-xs font-semibold gap-1.5"
                            onClick={() => handleAccept(inv.id, sender.name)}
                          >
                            <Check className="h-3.5 w-3.5" /> Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 h-8 text-xs font-medium gap-1.5 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDecline(inv.id, sender.name)}
                          >
                            <X className="h-3.5 w-3.5" /> Decline
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Outbound Sent Invites Section */}
          <div className="space-y-3 pt-4 border-t border-border/50">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Sent Invites ({sentInvites.length})
            </h4>

            {sentInvites.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/80 p-4 text-center text-xs text-muted-foreground">
                You haven't sent any invitations yet.
              </div>
            ) : (
              <div className="space-y-2.5">
                {sentInvites.map((inv) => {
                  const recipient = users.find((u) => u.id === inv.toUserId);
                  if (!recipient) return null;

                  return (
                    <div
                      key={inv.id}
                      className="rounded-lg border border-border/60 bg-muted/30 p-3 text-xs flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <UserAvatar seed={recipient.avatarSeed} name={recipient.name} size="sm" />
                        <div className="truncate">
                          <span className="font-semibold text-foreground truncate block">
                            {recipient.name}
                          </span>
                          <span className="text-[11px] text-muted-foreground capitalize">
                            Status: {inv.status}
                          </span>
                        </div>
                      </div>

                      {inv.status === 'pending' ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-muted-foreground hover:text-destructive px-2"
                          onClick={() => handleWithdraw(inv.id)}
                        >
                          <Undo2 className="h-3.5 w-3.5 mr-1" /> Withdraw
                        </Button>
                      ) : (
                        <Badge variant="outline" className="text-[10px] capitalize">
                          {inv.status}
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
