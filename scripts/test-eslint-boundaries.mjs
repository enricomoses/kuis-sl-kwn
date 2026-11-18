import assert from 'node:assert/strict';
import path from 'node:path';
import { ESLint } from 'eslint';

const rootDir = process.cwd();
const eslint = new ESLint({ cwd: rootDir });

const negativeCases = [
  {
    name: 'Client component cannot import services',
    filePath: 'src/components/ui/bad-example.tsx',
    code: "import { playService } from '@/services/play.service';\nexport function BadExample() { return String(Boolean(playService)); }\n",
    expectedRule: 'app/boundaries',
  },
  {
    name: 'Client component cannot use export default',
    filePath: 'src/components/ui/bad-default.tsx',
    code: 'export default function BadDefault() { return null; }\n',
    expectedRule: 'no-restricted-syntax',
  },
  {
    name: 'ADR-1: Component cannot import @/realtime/*',
    filePath: 'src/app/(site)/play/_components/bad-rt.tsx',
    code: "import { subscribeLobbyChannel } from '@/realtime/lobby.channel';\nexport function BadRt() { return String(Boolean(subscribeLobbyChannel)); }\n",
    expectedRule: 'app/boundaries',
  },
  {
    name: 'ADR-1: Realtime adapter cannot import @tanstack/react-query',
    filePath: 'src/realtime/bad.channel.ts',
    code: "import { useQuery } from '@tanstack/react-query';\nexport const bad = useQuery;\n",
    expectedRule: 'app/boundaries',
  },
  {
    name: 'ADR-1: Realtime adapter cannot call fetch()',
    filePath: 'src/realtime/bad-fetch.channel.ts',
    code: "export function badFetch() { return fetch('/api/play/state'); }\n",
    expectedRule: 'app/boundaries',
  },
  {
    name: 'ADR-2: Service-role client cannot be imported outside repository.server.ts',
    filePath: 'src/features/game/service.server.ts',
    code: "import { createServiceRoleClient } from '@/lib/supabase/service-role.server';\nexport const bad = createServiceRoleClient;\n",
    expectedRule: 'app/boundaries',
  },
  {
    name: 'ADR-2: Route handler cannot import service-role.server.ts directly',
    filePath: 'src/app/api/play/state/route.ts',
    code: "import { createServiceRoleClient } from '@/lib/supabase/service-role.server';\nexport const bad = createServiceRoleClient;\n",
    expectedRule: 'app/boundaries',
  },
  {
    name: 'Hook cannot import @supabase/supabase-js directly',
    filePath: 'src/hooks/use-bad.ts',
    code: "import { createClient } from '@supabase/supabase-js';\nexport const bad = createClient;\n",
    expectedRule: 'app/boundaries',
  },
  {
    name: 'RSC page cannot import services or call fetch()',
    filePath: 'src/app/(site)/bad/page.tsx',
    code: "import { playService } from '@/services/play.service';\nexport default function Page() { void fetch('/api/play/me'); return String(Boolean(playService)); }\n",
    expectedRule: 'app/boundaries',
  },
  {
    name: 'Barrel file cannot re-export server-only module',
    filePath: 'src/config/index.ts',
    code: "export * from './environment.server';\n",
    expectedRule: 'app/boundaries',
  },
];

const positiveCases = [
  {
    name: 'ADR-1: Controller hook may import @/realtime/*',
    filePath: 'src/hooks/use-session-realtime.ts',
    code: "import { subscribeLobbyChannel } from '@/realtime/lobby.channel';\nexport function useCheck() { return subscribeLobbyChannel; }\n",
  },
  {
    name: 'ADR-2: Feature repository.server.ts may import service-role.server.ts',
    filePath: 'src/features/game/repository.server.ts',
    code: "import 'server-only';\nimport { createServiceRoleClient } from '@/lib/supabase/service-role.server';\nexport function repo() { return createServiceRoleClient; }\n",
  },
  {
    name: 'ADR-1: Realtime adapter may import realtime-client and validations',
    filePath: 'src/realtime/lobby.channel.ts',
    code: "import { getRealtimeClient } from '@/lib/supabase/realtime-client';\nimport { realtimeHintSchema } from '@/validations/realtime.schema';\nexport function adapter() { return { getRealtimeClient, realtimeHintSchema }; }\n",
  },
];

async function run() {
  for (const testCase of negativeCases) {
    const [result] = await eslint.lintText(testCase.code, {
      filePath: path.join(rootDir, testCase.filePath),
    });
    const matched = result.messages.some(
      (msg) => msg.ruleId === testCase.expectedRule && msg.severity === 2,
    );
    assert.ok(
      matched,
      `Expected rule "${testCase.expectedRule}" error for case "${testCase.name}", got: ${JSON.stringify(result.messages)}`,
    );
  }

  for (const testCase of positiveCases) {
    const [result] = await eslint.lintText(testCase.code, {
      filePath: path.join(rootDir, testCase.filePath),
    });
    const boundaryErrors = result.messages.filter(
      (msg) => msg.ruleId === 'app/boundaries' && msg.severity === 2,
    );
    assert.equal(
      boundaryErrors.length,
      0,
      `Expected no boundary errors for case "${testCase.name}", got: ${JSON.stringify(boundaryErrors)}`,
    );
  }

  console.log(
    `ESLint boundary checks passed (${negativeCases.length} negative + ${positiveCases.length} positive cases).`,
  );
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
