import { AppShell } from '../components/layout/AppShell';
import { Analytics } from '../components/analytics/Analytics';
import { useWorkspace } from '../context/WorkspaceContext';

export function AnalyticsPage() {
  const { workspaceName } = useWorkspace();

  return (
    <AppShell title="Analytics" subtitle={workspaceName}>
      <Analytics />
    </AppShell>
  );
}
