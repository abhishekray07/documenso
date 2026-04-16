import { msg } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { InboxIcon } from 'lucide-react';

import { OrganisationInvitations } from '~/components/general/organisations/organisation-invitations';
import { InboxTable } from '~/components/tables/inbox-table';
import { appMetaTags } from '~/utils/meta';

export function meta() {
  return appMetaTags(msg`Personal Inbox`);
}

export default function InboxPage() {
  return (
    <div className="mx-auto w-full max-w-screen-xl px-4 md:px-8">
      <div className="mb-8">
        <h1 className="flex flex-row items-center gap-2 text-3xl font-bold">
          <InboxIcon className="h-8 w-8 text-muted-foreground" />

          <Trans>Personal Inbox</Trans>
        </h1>
        <p className="mt-1 text-muted-foreground">
          <Trans>
            Manage your pending documents and signature requests below.
          </Trans>
        </p>

        <div className="mt-4 rounded-md border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <Trans>
              Tip: You can use keyboard shortcut <kbd className="rounded border border-blue-300 bg-blue-100 px-1.5 py-0.5 font-mono text-xs dark:border-blue-800 dark:bg-blue-900">?</kbd> anywhere to view all available shortcuts.
            </Trans>
          </p>
        </div>

        <OrganisationInvitations className="mt-4" />
      </div>

      <InboxTable />
    </div>
  );
}
